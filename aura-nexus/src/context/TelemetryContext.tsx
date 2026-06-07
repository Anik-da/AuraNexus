"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";

export interface LogMessage {
  id: string;
  timestamp: string;
  type: "info" | "warning" | "error" | "success";
  text: string;
}

export interface Detection {
  id: string;
  label: string;
  confidence: number;
  box: [number, number, number, number]; // [x, y, w, h] in percentages
  timestamp: string;
}

export interface Mission {
  id: string;
  name: string;
  status: "completed" | "in-progress" | "failed";
  duration: string;
  efficiency: number;
  date: string;
}

interface TelemetryState {
  isDeviceConnected: boolean;
  batteryLevel: number;
  connectivity: "connected" | "reconnecting" | "offline";
  signalStrength: number; // 0-100
  robotMode: "manual" | "autonomous" | "agriculture" | "navigation" | "surveillance";
  coordinates: { x: number; y: number; z: number; lat: number; lng: number };
  heading: number;
  speed: number;
  sensors: {
    temp: number;
    humidity: number;
    soilMoisture: number;
    obstacleDistance: number;
    lightLevel: number;
    methane: number;
  };
  camera: {
    pan: number;
    tilt: number;
    zoom: number;
    streamActive: boolean;
    feedType: "optical" | "thermal" | "night";
  };
  logs: LogMessage[];
  detections: Detection[];
  missions: Mission[];
}

interface TelemetryContextType extends TelemetryState {
  toggleDeviceConnection: (connected: boolean) => void;
  moveRobot: (direction: "forward" | "backward" | "left" | "right" | "stop") => void;
  setRobotMode: (mode: TelemetryState["robotMode"]) => void;
  adjustCamera: (action: "pan-left" | "pan-right" | "tilt-up" | "tilt-down" | "zoom-in" | "zoom-out") => void;
  setFeedType: (type: TelemetryState["camera"]["feedType"]) => void;
  setStreamActive: (active: boolean) => void;
  addLog: (text: string, type?: LogMessage["type"]) => void;
  clearLogs: () => void;
  runAICommand: (cmd: string) => string;
}

const TelemetryContext = createContext<TelemetryContextType | undefined>(undefined);

const INITIAL_MISSIONS: Mission[] = [
  { id: "M-7012", name: "Alpha Sector Scan", status: "completed", duration: "1h 45m", efficiency: 94.2, date: "2026-06-03" },
  { id: "M-7011", name: "Weed Control Run 4", status: "completed", duration: "2h 10m", efficiency: 89.8, date: "2026-06-02" },
  { id: "M-7010", name: "Night Border Patrol", status: "completed", duration: "4h 00m", efficiency: 97.5, date: "2026-06-02" },
  { id: "M-7009", name: "Main Greenhouse Pathing", status: "failed", duration: "22m", efficiency: 12.0, date: "2026-06-01" },
  { id: "M-7008", name: "Soil Sampling Beta", status: "completed", duration: "1h 15m", efficiency: 91.4, date: "2026-05-31" },
];

export function TelemetryProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TelemetryState>({
    isDeviceConnected: false,
    batteryLevel: 0,
    connectivity: "offline",
    signalStrength: 0,
    robotMode: "manual",
    coordinates: { x: 0, y: 0, z: 0, lat: 0, lng: 0 },
    heading: 0,
    speed: 0,
    sensors: {
      temp: 0,
      humidity: 0,
      soilMoisture: 0,
      obstacleDistance: 0,
      lightLevel: 0,
      methane: 0,
    },
    camera: {
      pan: 0,
      tilt: 0,
      zoom: 1,
      streamActive: false,
      feedType: "optical",
    },
    logs: [
      { id: "L1", timestamp: "00:00:00", type: "error", text: "DEVICE LINK OFFLINE - WAITING FOR LINK BROADCAST..." }
    ],
    detections: [],
    missions: INITIAL_MISSIONS,
  });

  const wsRef = useRef<WebSocket | null>(null);

  const toggleDeviceConnection = (connected: boolean) => {
    if (connected) {
      if (typeof window !== "undefined") {
        const defaultUrl = window.location.hostname === "localhost" 
          ? "ws://localhost:8000/api/v1/ws/telemetry" 
          : "wss://YOUR_NGROK_SUBDOMAIN.ngrok-free.app/api/v1/ws/telemetry";
        
        const url = prompt(
          "Enter your FastAPI WebSocket URL (e.g. ws://localhost:8000/api/v1/ws/telemetry or wss://xxxx.ngrok-free.app/api/v1/ws/telemetry for secure Firebase hosting):",
          localStorage.getItem("aura_ws_url") || defaultUrl
        );
        
        if (!url) return;
        localStorage.setItem("aura_ws_url", url);

        try {
          if (wsRef.current) wsRef.current.close();
          
          const ws = new WebSocket(url);
          wsRef.current = ws;

          setState((prev) => ({
            ...prev,
            connectivity: "reconnecting",
            logs: [
              { id: `L-${Math.random()}`, timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }), type: "info", text: `CONNECTING TO GATEWAY: ${url}...` },
              ...prev.logs
            ]
          }));

          ws.onopen = () => {
            const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
            setState((prev) => ({
              ...prev,
              isDeviceConnected: true,
              connectivity: "connected",
              logs: [
                { id: `L-${Math.random()}`, timestamp: timeStr, type: "success", text: "DEVICE LINK ESTABLISHED: Live gateway channel active." },
                ...prev.logs
              ]
            }));
          };

          ws.onmessage = (event) => {
            try {
              const payload = JSON.parse(event.data);
              setState((prev) => {
                const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
                
                const sensors = payload.sensors ? {
                  temp: payload.sensors.temp ?? prev.sensors.temp,
                  humidity: payload.sensors.humidity ?? prev.sensors.humidity,
                  soilMoisture: payload.sensors.soilMoisture ?? prev.sensors.soilMoisture,
                  obstacleDistance: payload.sensors.obstacleDistance ?? prev.sensors.obstacleDistance,
                  lightLevel: payload.sensors.lightLevel ?? prev.sensors.lightLevel,
                  methane: payload.sensors.methane ?? prev.sensors.methane,
                } : prev.sensors;

                const battery = payload.battery_level ?? prev.batteryLevel;
                const signal = payload.signal_strength ?? prev.signalStrength;
                const speed = payload.speed ?? prev.speed;
                const heading = payload.heading ?? prev.heading;
                const coordinates = payload.coordinates ? {
                  x: payload.coordinates.x ?? prev.coordinates.x,
                  y: payload.coordinates.y ?? prev.coordinates.y,
                  z: payload.coordinates.z ?? prev.coordinates.z,
                  lat: payload.coordinates.lat ?? prev.coordinates.lat,
                  lng: payload.coordinates.lng ?? prev.coordinates.lng,
                } : prev.coordinates;

                let logs = prev.logs;
                if (payload.logs && Array.isArray(payload.logs)) {
                  const newLogs = payload.logs.map((l: any) => ({
                    id: l.id ?? `L-${Math.random()}`,
                    timestamp: l.timestamp ?? timeStr,
                    type: l.type ?? "info",
                    text: l.text
                  }));
                  logs = [...newLogs, ...prev.logs].slice(0, 100);
                }

                let detections = prev.detections;
                if (payload.detections && Array.isArray(payload.detections)) {
                  detections = payload.detections.map((d: any) => ({
                    id: d.id ?? `D-${Math.random()}`,
                    label: d.label,
                    confidence: d.confidence,
                    box: d.box ?? [20, 20, 30, 30],
                    timestamp: d.timestamp ?? timeStr
                  }));
                }

                return {
                  ...prev,
                  batteryLevel: battery,
                  signalStrength: signal,
                  speed,
                  heading,
                  coordinates,
                  sensors,
                  logs,
                  detections,
                };
              });
            } catch (err) {
              console.error("Error parsing WebSocket telemetry payload:", err);
            }
          };

          ws.onerror = () => {
            const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
            setState((prev) => ({
              ...prev,
              isDeviceConnected: false,
              connectivity: "offline",
              logs: [
                { id: `L-${Math.random()}`, timestamp: timeStr, type: "error", text: "DEVICE LINK ERROR: WebSocket handshake failed." },
                ...prev.logs
              ]
            }));
          };

          ws.onclose = () => {
            const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
            setState((prev) => ({
              ...prev,
              isDeviceConnected: false,
              connectivity: "offline",
              logs: [
                { id: `L-${Math.random()}`, timestamp: timeStr, type: "error", text: "DEVICE LINK CLOSED: Gateway terminated socket channel." },
                ...prev.logs
              ]
            }));
          };

        } catch (e: any) {
          console.error(e);
        }
      }
    } else {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setState((prev) => {
        const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
        return {
          ...prev,
          isDeviceConnected: false,
          connectivity: "offline",
          batteryLevel: 0,
          signalStrength: 0,
          sensors: { temp: 0, humidity: 0, soilMoisture: 0, obstacleDistance: 0, lightLevel: 0, methane: 0 },
          detections: [],
          logs: [
            { id: `L-${Math.random()}`, timestamp: timeStr, type: "error", text: "DEVICE LINK CLOSED: Connection terminated by operator." },
            ...prev.logs
          ]
        };
      });
    }
  };

  const addLog = (text: string, type: LogMessage["type"] = "info") => {
    const time = new Date().toLocaleTimeString("en-US", { hour12: false });
    const newLog: LogMessage = {
      id: `L-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: time,
      type,
      text,
    };
    setState((prev) => ({
      ...prev,
      logs: [newLog, ...prev.logs].slice(0, 100), // Keep last 100
    }));
  };

  const clearLogs = () => {
    setState((prev) => ({ ...prev, logs: [] }));
  };

  // Robot motion function
  const moveRobot = (direction: "forward" | "backward" | "left" | "right" | "stop") => {
    if (state.robotMode !== "manual" && direction !== "stop") {
      addLog(`Override rejected: Cannot issue commands while in ${state.robotMode.toUpperCase()} mode. Switch to MANUAL.`, "warning");
      return;
    }

    setState((prev) => {
      let speed = 0;
      let heading = prev.heading;
      let x = prev.coordinates.x;
      let z = prev.coordinates.z;

      if (direction === "stop") {
        speed = 0;
      } else {
        speed = 1.5;
        if (direction === "forward") {
          x += Math.sin((heading * Math.PI) / 180) * 0.5;
          z += Math.cos((heading * Math.PI) / 180) * 0.5;
        } else if (direction === "backward") {
          x -= Math.sin((heading * Math.PI) / 180) * 0.5;
          z -= Math.cos((heading * Math.PI) / 180) * 0.5;
        } else if (direction === "left") {
          heading = (heading - 15 + 360) % 360;
        } else if (direction === "right") {
          heading = (heading + 15) % 360;
        }
      }

      return {
        ...prev,
        speed,
        heading,
        coordinates: { ...prev.coordinates, x, z },
      };
    });

    if (direction !== "stop") {
      addLog(`Robot manual thrust command: ${direction.toUpperCase()}`, "info");
    } else {
      addLog("Robot emergency halt executed.", "success");
    }

    // Transmit command to FastAPI gateway
    if (typeof window !== "undefined") {
      const wsUrl = localStorage.getItem("aura_ws_url");
      if (wsUrl) {
        const httpUrl = wsUrl
          .replace("ws://", "http://")
          .replace("wss://", "https://")
          .replace("/ws/telemetry", "/esp32/navigation-command");
        
        fetch(httpUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ command: direction.toUpperCase() }),
        }).catch((err) => console.error("Failed to transmit robot command:", err));
      }
    }
  };

  const setRobotMode = (mode: TelemetryState["robotMode"]) => {
    setState((prev) => ({ ...prev, robotMode: mode }));
    addLog(`System transition command: Mode updated to ${mode.toUpperCase()}`, "success");
  };

  const adjustCamera = (action: "pan-left" | "pan-right" | "tilt-up" | "tilt-down" | "zoom-in" | "zoom-out") => {
    setState((prev) => {
      let pan = prev.camera.pan;
      let tilt = prev.camera.tilt;
      let zoom = prev.camera.zoom;

      if (action === "pan-left") pan = Math.max(-170, pan - 10);
      else if (action === "pan-right") pan = Math.min(170, pan + 10);
      else if (action === "tilt-up") tilt = Math.min(85, tilt + 5);
      else if (action === "tilt-down") tilt = Math.max(-30, tilt - 5);
      else if (action === "zoom-in") zoom = Math.min(8, zoom + 0.5);
      else if (action === "zoom-out") zoom = Math.max(1, zoom - 0.5);

      return {
        ...prev,
        camera: { ...prev.camera, pan, tilt, zoom },
      };
    });

    // Transmit camera command to FastAPI gateway
    if (typeof window !== "undefined") {
      const wsUrl = localStorage.getItem("aura_ws_url");
      if (wsUrl) {
        const httpUrl = wsUrl
          .replace("ws://", "http://")
          .replace("wss://", "https://")
          .replace("/ws/telemetry", "/esp32/navigation-command");
        
        fetch(httpUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ command: action.toUpperCase() }),
        }).catch((err) => console.error("Failed to transmit camera command:", err));
      }
    }
  };

  const setFeedType = (feedType: TelemetryState["camera"]["feedType"]) => {
    setState((prev) => ({ ...prev, camera: { ...prev.camera, feedType } }));
    addLog(`Optics frequency shifted to: ${feedType.toUpperCase()}`, "info");
  };

  const setStreamActive = (streamActive: boolean) => {
    setState((prev) => ({ ...prev, camera: { ...prev.camera, streamActive } }));
    addLog(`Camera stream feed ${streamActive ? "ENABLED" : "SUSPENDED"}.`, "warning");
  };

  // Run text shell commands
  const runAICommand = (cmd: string): string => {
    const parts = cmd.trim().toLowerCase().split(" ");
    const primary = parts[0];

    if (!primary) return "NO INPUT DETECTED. TYPE '/help' FOR COMMAND DIRECTORY.";

    addLog(`Operator input: ${cmd}`, "info");

    switch (primary) {
      case "/help":
        return `AURA COMMAND COMPILER:
  /help                  Show this directory
  /mode [type]           Set mode (manual, autonomous, agriculture, navigation, surveillance)
  /halt                  Immediate stop
  /clear                 Clear console logs
  /scan                  Trigger high-res telemetry bioscan
  /optics [type]         Set video overlay (optical, thermal, night)
  /battery               Get battery details`;

      case "/mode":
        const m = parts[1];
        if (["manual", "autonomous", "agriculture", "navigation", "surveillance"].includes(m)) {
          setRobotMode(m as TelemetryState["robotMode"]);
          return `TRANSITIONED TO ${m.toUpperCase()} MODE successfully.`;
        }
        return "ERROR: INVALID MODE. USE: manual | autonomous | agriculture | navigation | surveillance";

      case "/halt":
        moveRobot("stop");
        return "HALT SIGNAL COMPILED AND SENT TO SERVO STACKS.";

      case "/clear":
        clearLogs();
        return "SYSTEM CONSOLE LOG BUFFER PURGED.";

      case "/scan":
        addLog("Initiating full-spectrum diagnostic scan...", "info");
        setTimeout(() => {
          addLog("Crop diagnostics: 0.0% disease presence in Greenhouse Area 3.", "success");
          addLog("Soil analytics: Nitrogen level optimal, Moisture level stable.", "success");
        }, 1200);
        return "SCAN STARTED. WATCH SYSTEM FEED FOR LOG OUTPUTS.";

      case "/optics":
        const f = parts[1];
        if (["optical", "thermal", "night"].includes(f)) {
          setFeedType(f as TelemetryState["camera"]["feedType"]);
          return `OPTICAL SENSORS RESET TO ${f.toUpperCase()} FREQUENCY.`;
        }
        return "ERROR: INVALID OPTICAL PROFILE. USE: optical | thermal | night";

      case "/battery":
        return `PRIMARY POWER PACK: ${state.batteryLevel}% remaining.
SYSTEM DRAW: 4.8 Amps.
THERMALS: 38.6°C.
ESTIMATED RUNTIME: ${(state.batteryLevel * 0.15).toFixed(1)} hours.`;

      default:
        // Try to simulate basic conversation
        if (cmd.includes("hello") || cmd.includes("hi")) {
          return "GREETINGS OPERATOR. AURA CORE ONLINE AND STANDING BY FOR COMMANDS.";
        }
        if (cmd.includes("status")) {
          return `AURA SYSTEM STATUS REPORT:
  BATTERY: ${state.batteryLevel}% | SIG: ${state.signalStrength}%
  MODE: ${state.robotMode.toUpperCase()}
  COORDS: X: ${state.coordinates.x.toFixed(2)}, Z: ${state.coordinates.z.toFixed(2)}
  SENSORS: TEMP: ${state.sensors.temp}°C, HUMIDITY: ${state.sensors.humidity}%`;
        }
        return `UNRECOGNIZED INPUT: "${cmd}". TYPE '/help' FOR COMMAND DIRECTORY.`;
    }
  };

  // Simulation Loop
  useEffect(() => {
    const interval = setInterval(() => {
      setState((prev) => {
        if (!prev.isDeviceConnected) return prev;

        // Battery drains slowly and predictably
        let battery = prev.batteryLevel;
        let coords = { ...prev.coordinates };
        let heading = prev.heading;
        let speed = prev.speed;
        let signal = 94; // Stable, non-random signal strength when connection is active
        let newDetections = [...prev.detections];

        // Drain battery slowly and predictably (0.1% equivalent rate)
        if (Math.random() > 0.98) {
          battery = Math.max(1, battery - 1);
        }

        // Auto move robot in autonomous/surveillance/agriculture mode
        if (["autonomous", "surveillance", "agriculture", "navigation"].includes(prev.robotMode)) {
          speed = 1.1;
          const radius = 30; // Radius of patrol circle
          const time = Date.now() * 0.0003;
          
          if (prev.robotMode === "surveillance") {
            coords.x = Math.sin(time) * radius;
            coords.z = Math.cos(time) * radius;
            heading = Math.round((time * 180) / Math.PI + 90) % 360;
          } else if (prev.robotMode === "agriculture") {
            // serpentine grid movement
            coords.x = Math.sin(time) * 15;
            coords.z = (Math.floor(time) % 2 === 0 ? 10 : -10) + Math.cos(time * 0.3) * 5;
            heading = Math.round((Math.sin(time * 0.5) * 45) + 180) % 360;
          } else {
            // normal circle path
            coords.x = Math.sin(time * 0.5) * 20;
            coords.z = Math.cos(time * 0.5) * 20;
            heading = Math.round((time * 0.5 * 180) / Math.PI) % 360;
          }
        } else {
          // Manual mode: maintains values, updates coords on direct operator inputs
          speed = prev.speed;
        }

        // Ensure GPS coordinates correctly translate from local coordinates X/Z in all modes
        coords.lat = 37.774929 + coords.z * 0.0001;
        coords.lng = -122.419416 + coords.x * 0.0001;

        // Accurate, stable nominal values drifting slightly based on time (non-random)
        const timeSecs = Date.now() * 0.001;
        const temp = Number((24.5 + Math.sin(timeSecs * 0.05) * 0.15).toFixed(1));
        const humidity = Number((58.2 + Math.cos(timeSecs * 0.05) * 0.25).toFixed(1));
        const soilMoisture = Number((42.1 + Math.sin(timeSecs * 0.03) * 0.12).toFixed(1));
        const lightLevel = Math.round(680 + Math.sin(timeSecs * 0.04) * 4);
        const methane = Number((0.02 + Math.cos(timeSecs * 0.02) * 0.0008).toFixed(3));
        
        let obstacleDistance = prev.sensors.obstacleDistance;
        if (speed > 0) {
          obstacleDistance = Number((3.4 - Math.sin(timeSecs * 0.1) * 0.8).toFixed(2));
        } else {
          obstacleDistance = 3.4;
        }

        // Inject initial stable crop detections if they are empty
        if (newDetections.length === 0) {
          const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
          newDetections = [
            {
              id: "det-crop-1",
              label: "HEALTHY CROP: MAIZE",
              confidence: 96.8,
              box: [20, 30, 25, 40],
              timestamp: timeStr,
            }
          ];
        }

        return {
          ...prev,
          batteryLevel: battery,
          connectivity: battery < 5 ? "offline" : prev.connectivity,
          signalStrength: signal,
          coordinates: coords,
          heading,
          speed: speed,
          sensors: { temp, humidity, soilMoisture, obstacleDistance, lightLevel, methane },
          detections: newDetections,
        };
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <TelemetryContext.Provider
      value={{
        ...state,
        toggleDeviceConnection,
        moveRobot,
        setRobotMode,
        adjustCamera,
        setFeedType,
        setStreamActive,
        addLog,
        clearLogs,
        runAICommand,
      }}
    >
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
}
