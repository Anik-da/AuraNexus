"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import { ShieldAlert, Zap, Radio, Power, RefreshCw, Cpu, Volume2 } from "lucide-react";

export default function AuraCockpit() {
  const { isDeviceConnected, toggleDeviceConnection, connectivity, batteryLevel, sensors } = useTelemetry();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(1.5);
  const [hyperjumpEngaged, setHyperjumpEngaged] = useState(false);
  const [waveformBars, setWaveformBars] = useState<number[]>([]);
  const [commsBeaconOn, setCommsBeaconOn] = useState(true);
  const [radarEchoOn, setRadarEchoOn] = useState(false);
  const [aiSyncOn, setAiSyncOn] = useState(false);

  // Initialize randomized waveform heights and run update loop
  useEffect(() => {
    const barsCount = 24;
    setWaveformBars(Array.from({ length: barsCount }, () => Math.floor(Math.random() * 50) + 10));

    const interval = setInterval(() => {
      setWaveformBars(prev =>
        prev.map(h => {
          const change = Math.floor(Math.random() * 20) - 10;
          return Math.max(10, Math.min(90, h + change));
        })
      );
    }, 120);

    return () => clearInterval(interval);
  }, []);

  // HTML5 Starfield Space Warp Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 220);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 220);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    const starsCount = 100;
    const stars: { x: number; y: number; z: number; color: string }[] = [];

    for (let i = 0; i < starsCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        z: Math.random() * 1000,
        color: Math.random() > 0.4 ? "#ff3344" : "#ff8899",
      });
    }

    const render = () => {
      // Create motion blur fade-out trail effect
      ctx.fillStyle = "rgba(3, 4, 12, 0.25)";
      ctx.fillRect(0, 0, width, height);

      // Speed configuration based on hyperjump or throttle setting
      const currentSpeed = hyperjumpEngaged ? 32 : 1.5 * speedMultiplier;
      
      stars.forEach((star) => {
        star.z -= currentSpeed;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * 800;
          star.y = (Math.random() - 0.5) * 800;
        }

        const k = 128.0 / star.z;
        const px = star.x * k + width / 2;
        const py = star.y * k + height / 2;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = (1 - star.z / 1000) * 3.5;
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.6, size), 0, Math.PI * 2);
          ctx.fillStyle = star.color;
          ctx.shadowBlur = hyperjumpEngaged ? 12 : 0;
          ctx.shadowColor = "#ff3344";
          ctx.fill();
        }
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
    };
  }, [speedMultiplier, hyperjumpEngaged]);

  const handleTriggerLink = () => {
    setHyperjumpEngaged(true);
    setTimeout(() => {
      toggleDeviceConnection(true);
      setHyperjumpEngaged(false);
      setAiSyncOn(true);
      setRadarEchoOn(true);
    }, 1200);
  };

  // Convert speed multiplier (0.5 to 5) to rotation degrees (around -120 to +120) for gauge needle
  const needleRotation = -120 + ((speedMultiplier - 0.5) / 4.5) * 240;

  // Generate 8 Chrome Rivets absolutely positioned around the porthole
  const rivets = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i * 360) / 8;
    const radius = 50; // offset percentage
    const style: React.CSSProperties = {
      position: "absolute",
      top: `${50 + radius * Math.sin((angle * Math.PI) / 180)}%`,
      left: `${50 + radius * Math.cos((angle * Math.PI) / 180)}%`,
      transform: "translate(-50%, -50%)",
    };
    return (
      <div
        key={i}
        style={style}
        className="w-2 h-2 rounded-full bg-gradient-to-tr from-zinc-700 via-zinc-400 to-zinc-200 border border-zinc-800 shadow-[0_1px_1px_rgba(0,0,0,0.6)]"
      />
    );
  });

  return (
    <div className="cockpit-panel p-8 w-full max-w-4xl mx-auto select-none">
      {/* 4 Corner Heavy Metal Screws */}
      <div className="cockpit-screw top-3 left-3"></div>
      <div className="cockpit-screw top-3 right-3"></div>
      <div className="cockpit-screw bottom-3 left-3"></div>
      <div className="cockpit-screw bottom-3 right-3"></div>

      {/* Main Grid: split into cockpit left monitoring system and controls right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-2">
        
        {/* Left Column: Starfield View & Analog Telemetry Gauges (span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Beveled top cockpit title status */}
          <div className="cockpit-bezel-slit p-4 rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              <div>
                <h2 className="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">
                  OPERATIONAL COCKPIT OVERRIDE
                </h2>
                <p className="text-[9px] font-mono text-zinc-500 uppercase mt-0.5">
                  SYSTEM CORE: LATTICE-TX // CHANNEL: SECURE-BETA // STATUS: {connectivity.toUpperCase()}
                </p>
              </div>
            </div>

            {/* Spacecraft LEDs status */}
            <div className="flex items-center gap-3 bg-black/60 px-3 py-1.5 rounded border border-zinc-800">
              <div className="flex items-center gap-1.5">
                <span className={`led-status ${!isDeviceConnected ? "led-red" : "opacity-20 bg-red-950"}`}></span>
                <span className="text-[8px] font-mono text-zinc-400">OFFLINE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`led-status ${commsBeaconOn ? "led-amber" : "opacity-20 bg-amber-950"}`}></span>
                <span className="text-[8px] font-mono text-zinc-400">BEACON</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className={`led-status ${isDeviceConnected ? "led-green" : "opacity-20 bg-emerald-950"}`}></span>
                <span className="text-[8px] font-mono text-zinc-400">ONLINE</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            
            {/* Concentric Starfield Porthole with Chrome Rivets */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-44 h-44 cockpit-porthole">
                {/* Canvas Starfield inside circular window */}
                <canvas ref={canvasRef} className="w-full h-full block rounded-full"></canvas>
                
                {/* Radial Glass Reflection Highlights */}
                <div className="absolute inset-0 rounded-full pointer-events-none bg-gradient-to-tr from-white/0 via-white/5 to-white/10 mix-blend-overlay"></div>
                <div className="absolute inset-0 rounded-full border border-black/80 pointer-events-none shadow-[inset_0_8px_16px_rgba(0,0,0,0.95)]"></div>
                
                {/* Positioned Rivets */}
                {rivets}
              </div>
              <span className="text-[9px] font-mono text-zinc-400 mt-2 uppercase tracking-wider">
                {hyperjumpEngaged ? "!! WARPING SPACE !!" : "STARFIELD VISUAL FEED"}
              </span>
            </div>

            {/* Custom SVG Analog Dial Speedometer */}
            <div className="flex flex-col items-center justify-center p-4 rounded cockpit-inset-panel">
              <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-widest mb-1">
                VELOCITY DIAL FACTOR
              </span>
              <div className="relative w-40 h-32 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 100 80" className="w-full h-full">
                  {/* Gauge Arc Background */}
                  <path
                    d="M 15 70 A 40 40 0 1 1 85 70"
                    fill="none"
                    stroke="#1a202c"
                    strokeWidth="8"
                    strokeLinecap="round"
                  />
                  {/* Gauge Active Arc */}
                  <path
                    d="M 15 70 A 40 40 0 1 1 85 70"
                    fill="none"
                    stroke="url(#dialGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="200"
                    strokeDashoffset={200 - ((speedMultiplier - 0.5) / 4.5) * 140}
                    className="transition-all duration-300"
                  />
                  {/* Gradients */}
                  <defs>
                    <linearGradient id="dialGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ff8899" />
                      <stop offset="70%" stopColor="#ff4466" />
                      <stop offset="100%" stopColor="#ff3b30" />
                    </linearGradient>
                  </defs>

                  {/* Tick Marks */}
                  {[0, 1, 2, 3, 4, 5].map((val, idx) => {
                    const angle = -120 + idx * 48;
                    const rad = (angle * Math.PI) / 180;
                    const x1 = 50 + 34 * Math.cos(rad);
                    const y1 = 45 + 34 * Math.sin(rad);
                    const x2 = 50 + 38 * Math.cos(rad);
                    const y2 = 45 + 38 * Math.sin(rad);
                    return (
                      <line
                        key={val}
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="#4a5568"
                        strokeWidth="1.5"
                      />
                    );
                  })}

                  {/* Dial Center Pin */}
                  <circle cx="50" cy="45" r="4" fill="#8a9099" stroke="#13151b" strokeWidth="1" />
                  
                  {/* Rotating Dial Needle */}
                  <line
                    x1="50"
                    y1="45"
                    x2={50 + 34 * Math.cos((needleRotation * Math.PI) / 180)}
                    y2={45 + 34 * Math.sin((needleRotation * Math.PI) / 180)}
                    stroke="#ff3b30"
                    strokeWidth="2"
                    strokeLinecap="round"
                    className="transition-all duration-300"
                  />
                </svg>

                {/* Digital overlay display */}
                <div className="absolute bottom-2 flex flex-col items-center">
                  <span className="text-sm font-mono font-bold text-red-500 text-shadow">
                    {(speedMultiplier * 25).toFixed(0)} km/h
                  </span>
                  <span className="text-[7px] font-mono text-zinc-500 uppercase">
                    THROTTLE: {speedMultiplier.toFixed(1)}x
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Audio Waveform Analyzer */}
          <div className="p-4 rounded cockpit-inset-panel flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-red-500" />
              <div className="flex flex-col">
                <span className="text-[9px] font-mono text-zinc-300 uppercase tracking-wider">
                  Telemetry Transmit Waveform
                </span>
                <span className="text-[7px] font-mono text-zinc-500">
                  FREQ: 433.92 MHz // ENCRYPTION: SHA-256
                </span>
              </div>
            </div>
            
            <div className="flex items-end justify-center gap-1 h-12 flex-1 px-4 max-w-md bg-black/50 border border-zinc-800 rounded">
              {waveformBars.map((h, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-red-500/60 rounded-t waveform-bar"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.04}s`,
                    animationDuration: `${0.5 + (i % 4) * 0.15}s`,
                  }}
                ></div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Physical Console Toggles & Main Action Triggers (span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Recessed CRT Data Terminal Display */}
          <div className="cockpit-readout p-4 rounded h-32 flex flex-col justify-between">
            <div className="flex justify-between items-start text-[8px] font-mono text-red-500/70">
              <span>SYSTEM COMMS LINK MONITOR</span>
              <span className="animate-pulse">● FEED SECURE</span>
            </div>
            
            <div className="font-mono text-[9px] space-y-1 text-red-500/90">
              <p>{`[SYSTEM] INIT HARDWARE SYNCHRONIZER...`}</p>
              <p>{`[DEVICE] PORT: COM4 // BAUD: 115200`}</p>
              {isDeviceConnected ? (
                <>
                  <p className="text-green-400 font-bold">{`[STATUS] CONNECTION SECURED // ESP32 READY`}</p>
                  <p className="text-green-500/80">{`[DATA] BATTERY: ${batteryLevel}% // TEMP: ${sensors.temp}°C`}</p>
                </>
              ) : (
                <>
                  <p className="text-yellow-500 font-bold">{`[STATUS] OFFLINE // EXPECTING HANDSHAKE`}</p>
                  <p className="text-yellow-600/70">{`[WARN] CLAMPING MOTORS TO SAFETY STOP`}</p>
                </>
              )}
            </div>

            <div className="flex justify-between items-center text-[7px] font-mono text-red-500/40">
              <span>MODEL: LATTICE-TX-V2</span>
              <span>AURA SYSTEM v3.14</span>
            </div>
          </div>

          {/* 3D Skeuomorphic Toggle switches panel */}
          <div className="p-4 rounded cockpit-inset-panel">
            <h3 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2 flex items-center justify-between">
              <span>CONSOLE BEZEL SWITCHES</span>
              <span className="text-[8px] font-normal text-zinc-500">TOGGLE SYSTEM STATES</span>
            </h3>

            <div className="grid grid-cols-3 gap-4 justify-items-center py-2">
              {/* Toggle 1: Comms Beacon */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[7.5px] font-mono text-zinc-400 uppercase tracking-wider">COMMS BEACON</span>
                <div 
                  className={`switch-track ${commsBeaconOn ? "active" : ""}`}
                  onClick={() => setCommsBeaconOn(!commsBeaconOn)}
                >
                  <div className="switch-knob" />
                </div>
                <span className={`text-[7px] font-mono ${commsBeaconOn ? "text-red-500" : "text-zinc-600"}`}>
                  {commsBeaconOn ? "ACTIVE" : "STANDBY"}
                </span>
              </div>

              {/* Toggle 2: Radar Echo */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[7.5px] font-mono text-zinc-400 uppercase tracking-wider">RADAR ECHO</span>
                <div 
                  className={`switch-track ${radarEchoOn ? "active" : ""}`}
                  onClick={() => setRadarEchoOn(!radarEchoOn)}
                >
                  <div className="switch-knob" />
                </div>
                <span className={`text-[7px] font-mono ${radarEchoOn ? "text-red-500" : "text-zinc-600"}`}>
                  {radarEchoOn ? "SCANNING" : "MUTED"}
                </span>
              </div>

              {/* Toggle 3: AI Core Sync */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[7.5px] font-mono text-zinc-400 uppercase tracking-wider">AI CORE SYNC</span>
                <div 
                  className={`switch-track ${aiSyncOn ? "active" : ""}`}
                  onClick={() => setAiSyncOn(!aiSyncOn)}
                >
                  <div className="switch-knob" />
                </div>
                <span className={`text-[7px] font-mono ${aiSyncOn ? "text-red-500" : "text-zinc-600"}`}>
                  {aiSyncOn ? "SYNCD" : "MANUAL"}
                </span>
              </div>
            </div>
          </div>

          {/* Warp speed throttle slider */}
          <div className="p-4 rounded cockpit-inset-panel space-y-3">
            <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400 uppercase font-bold">
              <span>Warp Speed Multiplier</span>
              <span className="text-red-500">{(speedMultiplier * 25).toFixed(0)} km/h ({speedMultiplier.toFixed(1)}X)</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.1"
              value={speedMultiplier}
              onChange={(e) => setSpeedMultiplier(parseFloat(e.target.value))}
              className="w-full accent-red-500 cursor-pointer bg-zinc-900 h-1 rounded"
            />
            <div className="flex justify-between text-[7px] font-mono text-zinc-600">
              <span>0.5X (DRIFT)</span>
              <span>2.5X (PATROL)</span>
              <span>5.0X (LIMIT)</span>
            </div>
          </div>

          {/* 3D red button launcher */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleTriggerLink}
              disabled={hyperjumpEngaged}
              className="w-full py-4 rounded launch-btn-3d text-white font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 shadow-lg"
            >
              <Zap className={`w-4 h-4 ${hyperjumpEngaged ? "animate-bounce" : "animate-pulse"}`} />
              <span>{hyperjumpEngaged ? "ESTABLISHING LINK..." : "ENGAGE COMS HYPERJUMP"}</span>
            </button>
          </div>

        </div>

      </div>

      {/* Warning text */}
      <div className="mt-6 p-4 rounded bg-[#ff3b30]/5 border border-[#ff3b30]/20 text-xs font-mono text-zinc-400 space-y-1">
        <p className="font-bold text-red-500 flex items-center gap-1.5 uppercase">
          <ShieldAlert className="w-3.5 h-3.5" /> Spacecraft System Warning
        </p>
        <p className="leading-relaxed text-[10px]">
          Handshake protocols require active synchronizations on port ESP32-S3. All robotics sensor widgets, digital twins, gimbals, camera scopes, and SLAM maps will remain locked in offline simulation mode until the link button is fully engaged.
        </p>
      </div>
    </div>
  );
}
