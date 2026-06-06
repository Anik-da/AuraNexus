"use client";

import React, { useState, useEffect } from "react";
import AuraShell from "@/components/AuraShell";
import SubsystemNodeMap from "@/components/SubsystemNodeMap";
import { useTelemetry } from "@/context/TelemetryContext";

export default function Dashboard() {
  const { isDeviceConnected, signalStrength, logs, toggleDeviceConnection, sensors } = useTelemetry();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AuraShell>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        
        {/* 1. Hero Panel Control Deck Card */}
        <section 
          className="hero-panel border border-[#ff3344]/25 bg-gradient-to-br from-[#28090b]/80 to-[#120405]/90 rounded-[32px] p-8 md:p-12 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-[0_24px_80px_rgba(0,0,0,0.6)] backdrop-blur-md"
          aria-labelledby="dashboard-title"
        >
          {/* Neon overlay grid lines */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_75%_30%,rgba(255,51,68,0.12),transparent_60%)] z-0"></div>

          <div className="flex-1 space-y-6 relative z-10">
            <div>
              <p className="eyebrow text-[#ff3344] font-mono text-xs font-black tracking-[0.2em] uppercase mb-2">
                AURANEXUS SYSTEM CONSOLE // V2.4
              </p>
              <h1 id="dashboard-title" className="text-white font-sans font-extrabold text-3xl sm:text-4xl lg:text-5xl uppercase tracking-tight leading-none">
                AURA-1 CONTROL DECK
              </h1>
              <p className="text-xs sm:text-sm font-mono text-zinc-400 leading-relaxed max-w-xl mt-4">
                A futuristic command center for tracking rover telemetry, live video payloads, satellite link signals, and edge intelligence classification models.
              </p>
            </div>

            {/* Selector buttons */}
            <div className="flex flex-wrap gap-3" aria-label="Console mode quick directives">
              <button
                onClick={() => toggleDeviceConnection(!isDeviceConnected)}
                className={`px-5 py-2.5 rounded-full border text-[10px] font-mono font-bold uppercase tracking-widest transition-all duration-250 cursor-pointer ${
                  isDeviceConnected
                    ? "bg-[#ff3344]/15 border-[#ff3344] text-white shadow-[0_0_15px_rgba(255,51,68,0.35)]"
                    : "bg-transparent border-[#ff3344]/30 text-[#ff3344] hover:bg-[#ff3344]/10 hover:border-[#ff3344]"
                }`}
              >
                {isDeviceConnected ? "ONLINE SIGNAL" : "OFFLINE GATE"}
              </button>
              
              {["SURVEILLANCE", "AUTO PILOT", "DIAGNOSTICS"].map((btn) => (
                <button
                  key={btn}
                  className="px-5 py-2.5 rounded-full border border-zinc-800 text-[10px] font-mono font-medium text-zinc-400 uppercase tracking-widest bg-[#ff3344]/0 hover:bg-[#ff3344]/5 hover:border-[#ff3344]/30 hover:text-white transition-all duration-200"
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>

          {/* Right Orb View */}
          <div className="relative z-10 shrink-0 w-64 h-64 md:w-72 md:h-72 rounded-full border border-red-500/20 bg-gradient-to-br from-red-500/10 to-rose-950/5 shadow-[inset_0_0_30px_rgba(255,51,68,0.15)] flex flex-col items-center justify-center overflow-hidden">
            {/* Concentric rings rotating animation */}
            <div className="absolute inset-4 border border-red-500/20 rounded-full animate-[spin_25s_linear_infinite]" style={{ transform: "rotateX(62deg) rotateY(15deg)" }}></div>
            <div className="absolute inset-10 border border-dashed border-red-500/25 rounded-full animate-[spin_12s_linear_infinite_reverse]" style={{ transform: "rotateX(30deg) rotateY(45deg)" }}></div>
            
            {/* Digital text metrics */}
            <div className="text-center z-20 space-y-1">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-[0.2em]">SIGNAL DENSITY</span>
              <strong className={`text-xl sm:text-2xl font-mono block tracking-wider font-extrabold uppercase ${isDeviceConnected ? "text-emerald-400 text-shadow" : "text-[#ff3344]"}`}>
                {isDeviceConnected ? `${signalStrength}%` : "OFFLINE"}
              </strong>
            </div>
          </div>
        </section>

        {/* 2. System Alerts Marquee Ticker */}
        <section 
          className="h-12 border border-[#ff3344]/20 bg-gradient-to-r from-[#28090b]/40 to-[#120405]/30 rounded-xl flex items-center px-4 overflow-hidden relative"
          aria-label="System status alerts marquee"
        >
          <span className="shrink-0 bg-[#ff3344]/15 border border-[#ff3344]/40 text-[#ff3344] font-mono text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-wider mr-4">
            ALERTS
          </span>
          <div className="flex-1 overflow-hidden relative" style={{ maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)" }}>
            <div className="ticker-track-animation flex whitespace-nowrap gap-12 text-[10px] font-mono text-zinc-400">
              {logs.length > 0 ? (
                logs.slice(0, 5).map((log, idx) => (
                  <span key={idx} className="flex items-center gap-1.5 uppercase">
                    <span className="text-[#ff3344]">◆</span> {log.timestamp} // {log.text}
                  </span>
                ))
              ) : (
                <>
                  <span className="flex items-center gap-1.5 uppercase"><span className="text-[#ff3344]">◆</span> AURA-1 ROVER SYNC ESTABLISHED ON CHANNEL BROADCAST 12</span>
                  <span className="flex items-center gap-1.5 uppercase"><span className="text-[#ff3344]">◆</span> CAMERA PAYLOAD ACQUIRED STABLE STREAM AT H.264 HD v2.4</span>
                </>
              )}
              {/* Duplicate track content for seamless scroll */}
              {logs.length > 0 ? (
                logs.slice(0, 5).map((log, idx) => (
                  <span key={`dup-${idx}`} className="flex items-center gap-1.5 uppercase">
                    <span className="text-[#ff3344]">◆</span> {log.timestamp} // {log.text}
                  </span>
                ))
              ) : (
                <>
                  <span className="flex items-center gap-1.5 uppercase"><span className="text-[#ff3344]">◆</span> AURA-1 ROVER SYNC ESTABLISHED ON CHANNEL BROADCAST 12</span>
                  <span className="flex items-center gap-1.5 uppercase"><span className="text-[#ff3344]">◆</span> CAMERA PAYLOAD ACQUIRED STABLE STREAM AT H.264 HD v2.4</span>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 3. Subsystems and Real-time Diagnostics Grid */}
        {mounted && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Subsystem Node Map (span 5) */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div className="robotics-card p-6 h-full flex flex-col justify-between bg-black/40 border border-zinc-800 rounded-xl relative overflow-hidden">
                <div>
                  <h3 className="text-xs font-mono tracking-widest text-zinc-400 uppercase font-bold border-b border-zinc-800 pb-2 mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff3344] animate-ping"></span>
                    SYSTEM LINK OVERVIEW
                  </h3>
                  <p className="text-[10px] font-mono text-zinc-550 uppercase leading-relaxed mb-4">
                    Visual telemetry map of secure wireless connection links between central processing core and remote subsystem microcontrollers.
                  </p>
                </div>
                <SubsystemNodeMap />
              </div>
            </div>

            {/* Diagnostic Feeds Grid (span 7) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="robotics-card p-5 bg-black/40 border border-zinc-800 rounded-xl flex flex-col justify-between">
                <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block">THERMAL LOAD</span>
                <div>
                  <p className="text-2xl font-bold font-mono text-red-500 mt-1">{isDeviceConnected ? `${sensors.temp}°C` : "OFFLINE"}</p>
                  <span className="text-[8px] font-mono text-zinc-650 uppercase">CORE CPU TEMP</span>
                </div>
              </div>

              <div className="robotics-card p-5 bg-black/40 border border-zinc-800 rounded-xl flex flex-col justify-between">
                <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block">SOIL MOISTURE</span>
                <div>
                  <p className="text-2xl font-bold font-mono text-red-400 mt-1">{isDeviceConnected ? `${sensors.soilMoisture}%` : "OFFLINE"}</p>
                  <span className="text-[8px] font-mono text-zinc-650 uppercase">NDVI GEOGRAPHIC TRUTH</span>
                </div>
              </div>

              <div className="robotics-card p-5 bg-black/40 border border-zinc-800 rounded-xl flex flex-col justify-between">
                <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block">ATMOSPHERIC METHANE</span>
                <div>
                  <p className="text-2xl font-bold font-mono text-red-400 mt-1">{isDeviceConnected ? `${sensors.methane} ppm` : "OFFLINE"}</p>
                  <span className="text-[8px] font-mono text-zinc-650 uppercase">MQ-4 GAS ARRAY</span>
                </div>
              </div>

              <div className="robotics-card p-5 bg-black/40 border border-zinc-800 rounded-xl flex flex-col justify-between">
                <span className="text-[9px] font-mono text-zinc-550 uppercase tracking-widest block">SIGNAL POWER</span>
                <div>
                  <p className="text-2xl font-bold font-mono text-red-500 mt-1">{isDeviceConnected ? `${signalStrength}%` : "OFFLINE"}</p>
                  <span className="text-[8px] font-mono text-zinc-650 uppercase">ESP32 RSSI INTENSITY</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 4. Live Metric Readout Logs */}
        {mounted && (
          <section className="robotics-card p-6 bg-black/40 border border-zinc-800 rounded-xl">
            <h3 className="text-xs font-mono tracking-widest text-zinc-400 uppercase font-bold border-b border-zinc-800 pb-2 mb-4">
              LIVE METRIC READOUT FEED
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-[10px] text-zinc-400">
                <thead>
                  <tr className="border-b border-zinc-900 text-zinc-500">
                    <th className="pb-2 uppercase">Timestamp</th>
                    <th className="pb-2 uppercase">Subsystem</th>
                    <th className="pb-2 uppercase">Log Event Message</th>
                    <th className="pb-2 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.length > 0 ? (
                    logs.slice(0, 6).map((log, idx) => (
                      <tr key={idx} className="border-b border-zinc-950/40 hover:bg-zinc-900/10">
                        <td className="py-2.5 text-zinc-550">{log.timestamp}</td>
                        <td className="py-2.5 text-red-400 font-bold uppercase">{log.type}</td>
                        <td className="py-2.5 text-white uppercase">{log.text}</td>
                        <td className="py-2.5">
                          <span className="px-2 py-0.5 rounded text-[8px] border border-zinc-800 bg-zinc-900/30 uppercase text-zinc-400">
                            NOMINAL
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-zinc-650 uppercase">
                        No active telemetry received. Connect device to stream.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

      </div>
    </AuraShell>
  );
}
