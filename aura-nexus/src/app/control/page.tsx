"use client";

import React, { useEffect, useRef, useState } from "react";
import AuraShell from "@/components/AuraShell";
import { useTelemetry } from "@/context/TelemetryContext";
import DigitalTwin3D from "@/components/DigitalTwin3D";
import {
  Radio,
  Play,
  Pause,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Target,
  Sliders,
  Maximize2
} from "lucide-react";

export default function RobotControlPage() {
  const {
    isDeviceConnected,
    toggleDeviceConnection,
    connectivity,
    batteryLevel,
    sensors,
    moveRobot,
    robotMode,
    setRobotMode,
    camera,
    adjustCamera,
    speed,
    heading,
    signalStrength,
    setFeedType,
    setStreamActive,
    detections,
    logs,
    coordinates
  } = useTelemetry();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [showStarfield, setShowStarfield] = useState(false);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(e.key)) {
        e.preventDefault();
      }

      if (!isDeviceConnected) return;

      if (key === "w" || e.key === "ArrowUp") {
        setActiveKey("forward");
        moveRobot("forward");
      } else if (key === "s" || e.key === "ArrowDown") {
        setActiveKey("backward");
        moveRobot("backward");
      } else if (key === "a" || e.key === "ArrowLeft") {
        setActiveKey("left");
        moveRobot("left");
      } else if (key === "d" || e.key === "ArrowRight") {
        setActiveKey("right");
        moveRobot("right");
      } else if (e.key === " " || key === "spacebar") {
        setActiveKey("stop");
        moveRobot("stop");
      }
    };

    const handleKeyUp = () => {
      setActiveKey(null);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [moveRobot, isDeviceConnected]);

  // Starfield Simulation
  useEffect(() => {
    if (!showStarfield) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 320);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 240);

    const handleResize = () => {
      if (canvas && canvas.parentElement) {
        width = canvas.width = canvas.parentElement.clientWidth;
        height = canvas.height = canvas.parentElement.clientHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    const starsCount = 60;
    const stars: { x: number; y: number; z: number }[] = [];

    for (let i = 0; i < starsCount; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 800,
        y: (Math.random() - 0.5) * 800,
        z: Math.random() * 1000,
      });
    }

    const render = () => {
      ctx.fillStyle = "rgba(3, 4, 12, 0.25)";
      ctx.fillRect(0, 0, width, height);

      stars.forEach((star) => {
        star.z -= isDeviceConnected ? 4.5 : 1.0;
        if (star.z <= 0) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * 800;
          star.y = (Math.random() - 0.5) * 800;
        }

        const k = 128.0 / star.z;
        const px = star.x * k + width / 2;
        const py = star.y * k + height / 2;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const size = (1 - star.z / 1000) * 2.5;
          ctx.beginPath();
          ctx.arc(px, py, Math.max(0.5, size), 0, Math.PI * 2);
          ctx.fillStyle = "#ff3344";
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
  }, [showStarfield, isDeviceConnected]);

  const handleManualDpad = (dir: "forward" | "backward" | "left" | "right" | "stop") => {
    if (!isDeviceConnected) return;
    moveRobot(dir);
  };

  return (
    <AuraShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* Top Row: Camera, Digital Twin, and Thrust Vectors (3 columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Column 1: CAMERA STREAM (span 4) */}
          <div className="lg:col-span-4 flex flex-col bg-black/60 border border-zinc-800 rounded-lg p-4 font-mono space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff3344] animate-pulse"></span>
                CAMERA STREAM
              </span>
              <div className="flex items-center gap-1.5">
                {["OPTICAL", "THERMAL", "NIGHT"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFeedType(type.toLowerCase() as any)}
                    className={`text-[8px] font-bold px-1.5 py-0.5 rounded border transition-all ${
                      camera.feedType === type.toLowerCase()
                        ? "bg-[#ff3344]/15 border-[#ff3344] text-[#ff3344]"
                        : "border-zinc-800 text-zinc-500 hover:text-zinc-300"
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Box Canvas view */}
            <div className="relative aspect-video rounded bg-[#030306] border border-zinc-900 flex items-center justify-center overflow-hidden scanlines">
              {showStarfield ? (
                <canvas ref={canvasRef} className="w-full h-full block" />
              ) : (
                <div className="w-full h-full relative flex items-center justify-center">
                  {/* Thermal or Night vision tint color */}
                  {camera.feedType === "thermal" && (
                    <div className="absolute inset-0 bg-red-950/20 mix-blend-color-dodge pointer-events-none"></div>
                  )}
                  {camera.feedType === "night" && (
                    <div className="absolute inset-0 bg-emerald-950/30 mix-blend-overlay pointer-events-none"></div>
                  )}

                  {/* Target Bounding box detections */}
                  {isDeviceConnected && detections.map((det) => (
                    <div
                      key={det.id}
                      className="absolute border border-[#ff3344] bg-[#ff3344]/10 text-[8px] text-[#ff3344] p-0.5 rounded z-10"
                      style={{
                        left: `${det.box[0]}%`,
                        top: `${det.box[1]}%`,
                        width: `${det.box[2]}%`,
                        height: `${det.box[3]}%`
                      }}
                    >
                      {det.label} ({det.confidence.toFixed(0)}%)
                    </div>
                  ))}

                  {/* Crosshair target reticle */}
                  <div className="absolute w-20 h-20 border border-dashed border-zinc-800/80 rounded-full flex items-center justify-center pointer-events-none">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff3344]/40"></div>
                  </div>

                  <Target className="w-8 h-8 text-zinc-800 animate-pulse pointer-events-none" />
                </div>
              )}

              {/* HUD OSD info text tags */}
              <div className="absolute top-2 left-2 text-[7px] text-zinc-500 bg-black/60 px-1.5 py-0.5 rounded border border-zinc-900">
                PAN: {camera.pan}° // TILT: {camera.tilt}°
              </div>
              <div className="absolute top-2 right-2 text-[7px] text-zinc-500 bg-black/60 px-1.5 py-0.5 rounded border border-zinc-900">
                ZOOM: {camera.zoom.toFixed(1)}X
              </div>
            </div>

            {/* Pan & Tilt Calibration control buttons */}
            <div className="space-y-3 pt-2 text-[9px] text-zinc-400">
              <div className="flex justify-between items-center font-bold">
                <span className="uppercase">GIMBAL CALIBRATION</span>
                <span className="text-[#ff3344]">ACTIVE</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-zinc-500 block uppercase">PAN ANGLE ({camera.pan}°)</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => adjustCamera("pan-left")}
                      disabled={!isDeviceConnected}
                      className="flex-1 py-1 px-2 text-center rounded border border-zinc-800 bg-zinc-950/40 text-[9px] font-bold text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-20 cursor-pointer"
                    >
                      ◀ LEFT
                    </button>
                    <button
                      onClick={() => adjustCamera("pan-right")}
                      disabled={!isDeviceConnected}
                      className="flex-1 py-1 px-2 text-center rounded border border-zinc-800 bg-zinc-950/40 text-[9px] font-bold text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-20 cursor-pointer"
                    >
                      RIGHT ▶
                    </button>
                  </div>
                </div>
                
                <div className="space-y-1.5">
                  <span className="text-zinc-500 block uppercase">TILT ANGLE ({camera.tilt}°)</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => adjustCamera("tilt-down")}
                      disabled={!isDeviceConnected}
                      className="flex-1 py-1 px-2 text-center rounded border border-zinc-800 bg-zinc-950/40 text-[9px] font-bold text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-20 cursor-pointer"
                    >
                      ▼ DOWN
                    </button>
                    <button
                      onClick={() => adjustCamera("tilt-up")}
                      disabled={!isDeviceConnected}
                      className="flex-1 py-1 px-2 text-center rounded border border-zinc-800 bg-zinc-950/40 text-[9px] font-bold text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-20 cursor-pointer"
                    >
                      UP ▲
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Zoom Selector */}
              <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60">
                <span className="text-zinc-500 uppercase">Digital Zoom multiplier ({camera.zoom.toFixed(1)}x)</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => adjustCamera("zoom-out")}
                    className="w-6 h-6 flex items-center justify-center rounded border border-zinc-800 bg-zinc-950/40 hover:text-white hover:border-zinc-700 text-[10px] cursor-pointer"
                  >
                    -
                  </button>
                  <button
                    onClick={() => adjustCamera("zoom-in")}
                    className="w-6 h-6 flex items-center justify-center rounded border border-zinc-800 bg-zinc-950/40 hover:text-white hover:border-zinc-700 text-[10px] cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2: TELEMETRY LINK STATUS (span 5) */}
          <div className="lg:col-span-5 flex flex-col">
            <DigitalTwin3D
              pan={camera.pan}
              tilt={camera.tilt}
              speed={speed}
              battery={batteryLevel}
              obstacleDistance={sensors.obstacleDistance}
            />
          </div>

          {/* Column 3: THRUST VECTORS (span 3) */}
          <div className="lg:col-span-3 flex flex-col bg-black/60 border border-zinc-800 rounded-lg p-6 justify-between min-h-[300px] font-mono">
            <div className="border-b border-zinc-900 pb-2 flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                THRUST VECTORS
              </span>
              <span className="text-[8px] bg-red-950/20 text-[#ff3344] px-1.5 py-0.5 border border-[#ff3344]/30 rounded uppercase font-bold">
                {isDeviceConnected ? "MANUAL" : "LOCKED"}
              </span>
            </div>

            {/* D-Pad controls grid */}
            <div className="flex-1 flex items-center justify-center my-6">
              <div className="grid grid-cols-3 gap-2.5 max-w-[160px] w-full">
                <div></div>
                <button
                  onClick={() => handleManualDpad("forward")}
                  className={`w-12 h-12 flex items-center justify-center border rounded transition-all ${
                    activeKey === "forward"
                      ? "bg-[#ff3344] border-[#ff3344] text-white shadow-[0_0_15px_rgba(255,51,68,0.5)]"
                      : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600"
                  }`}
                  disabled={!isDeviceConnected}
                  aria-label="Move Forward"
                >
                  <ArrowUp className="w-5 h-5" />
                </button>
                <div></div>

                <button
                  onClick={() => handleManualDpad("left")}
                  className={`w-12 h-12 flex items-center justify-center border rounded transition-all ${
                    activeKey === "left"
                      ? "bg-[#ff3344] border-[#ff3344] text-white shadow-[0_0_15px_rgba(255,51,68,0.5)]"
                      : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600"
                  }`}
                  disabled={!isDeviceConnected}
                  aria-label="Rotate Left"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleManualDpad("stop")}
                  className={`w-12 h-12 flex items-center justify-center border rounded transition-all ${
                    activeKey === "stop"
                      ? "bg-red-600 border-red-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                      : "bg-[#ff3344]/15 border-red-500/40 text-red-500 hover:bg-[#ff3344]/25"
                  }`}
                  disabled={!isDeviceConnected}
                  aria-label="Stop Rover"
                >
                  <span className="w-2.5 h-2.5 bg-current rounded-sm"></span>
                </button>
                <button
                  onClick={() => handleManualDpad("right")}
                  className={`w-12 h-12 flex items-center justify-center border rounded transition-all ${
                    activeKey === "right"
                      ? "bg-[#ff3344] border-[#ff3344] text-white shadow-[0_0_15px_rgba(255,51,68,0.5)]"
                      : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600"
                  }`}
                  disabled={!isDeviceConnected}
                  aria-label="Rotate Right"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>

                <div></div>
                <button
                  onClick={() => handleManualDpad("backward")}
                  className={`w-12 h-12 flex items-center justify-center border rounded transition-all ${
                    activeKey === "backward"
                      ? "bg-[#ff3344] border-[#ff3344] text-white shadow-[0_0_15px_rgba(255,51,68,0.5)]"
                      : "bg-zinc-950/50 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600"
                  }`}
                  disabled={!isDeviceConnected}
                  aria-label="Move Backward"
                >
                  <ArrowDown className="w-5 h-5" />
                </button>
                <div></div>
              </div>
            </div>

            {/* Keyboard guide text */}
            <div className="border-t border-zinc-900 pt-3 text-center space-y-1">
              <p className="text-[7.5px] text-zinc-500">KEYBOARD MAP: [W] [A] [S] [D] OR ARROWS</p>
              <p className="text-[7.5px] text-zinc-500 font-bold">[SPACE] = HALT OVERRIDE</p>
            </div>
          </div>

        </div>

        {/* Middle Row: Directives & Stats (2 columns) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left: OPERATIONAL DIRECTIVES */}
          <div className="bg-black/60 border border-zinc-800 rounded-lg p-5 font-mono space-y-4">
            <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-900 pb-2">
              OPERATIONAL DIRECTIVES
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: "manual", label: "Manual Override" },
                { key: "auto", label: "Auto Patrol" },
                { key: "agriculture", label: "Agriculture Mode" },
                { key: "slam", label: "SLAM Pathfinder" }
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setRobotMode(mode.key as any)}
                  className={`py-3 px-4 rounded border text-xs font-bold uppercase tracking-wider transition-all text-left ${
                    robotMode === mode.key
                      ? "bg-[#ff3344]/15 border-[#ff3344] text-white shadow-[0_0_10px_rgba(255,51,68,0.25)]"
                      : "bg-transparent border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: SYSTEM STATS table */}
          <div className="bg-black/60 border border-zinc-800 rounded-lg p-5 font-mono space-y-4">
            <h3 className="text-[10px] font-bold text-[#ff3344] uppercase tracking-widest border-b border-zinc-900 pb-2">
              SYSTEM STATS
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 border border-zinc-900 rounded bg-[#030306]/40">
                <span className="text-[8px] text-zinc-500 block uppercase tracking-wider">Velocity</span>
                <span className="text-sm font-bold text-white mt-1 block">
                  {isDeviceConnected ? `${speed.toFixed(1)} m/s` : "0.0 m/s"}
                </span>
              </div>
              <div className="p-3 border border-zinc-900 rounded bg-[#030306]/40">
                <span className="text-[8px] text-zinc-500 block uppercase tracking-wider">Compass Heading</span>
                <span className="text-sm font-bold text-white mt-1 block">
                  {heading}°
                </span>
              </div>
              <div className="p-3 border border-zinc-900 rounded bg-[#030306]/40">
                <span className="text-[8px] text-zinc-500 block uppercase tracking-wider">Battery Packs</span>
                <span className="text-sm font-bold text-white mt-1 block">
                  {batteryLevel}%
                </span>
              </div>
              <div className="p-3 border border-zinc-900 rounded bg-[#030306]/40">
                <span className="text-[8px] text-zinc-500 block uppercase tracking-wider">Signal Strength</span>
                <span className="text-sm font-bold text-white mt-1 block">
                  {signalStrength}%
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Row: Telemetry logs command terminal */}
        <section className="bg-black/60 border border-zinc-800 rounded-lg p-4 font-mono space-y-3">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
            <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ff3344] animate-pulse"></span>
              TELEMETRY CONSOLE FEED
            </span>
            <span className="text-[8px] text-zinc-650 uppercase">LIVE FEED RECORD</span>
          </div>

          <div className="h-44 overflow-y-auto bg-zinc-950/60 p-3 rounded border border-zinc-900 text-[9px] text-[#ff3344]/80 space-y-1.5 font-mono scrollbar-thin">
            {logs.slice(0, 20).map((log) => (
              <div key={log.id} className="flex gap-4">
                <span className="text-[#ff3344]/45 select-none">[{log.timestamp}]</span>
                <span className="text-zinc-300">{log.text}</span>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="text-zinc-600 italic">No console logs available. Initialize telemetry transmitter.</div>
            )}
          </div>
        </section>

      </div>
    </AuraShell>
  );
}
