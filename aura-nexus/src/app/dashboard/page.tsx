"use client";

import React, { useState, useEffect } from "react";
import AuraShell from "@/components/AuraShell";
import AuraCockpit from "@/components/AuraCockpit";
import { useTelemetry } from "@/context/TelemetryContext";

export default function Dashboard() {
  const { isDeviceConnected, signalStrength, logs, toggleDeviceConnection } = useTelemetry();
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

        {/* 3. Operational Cockpit Override Console */}
        <section aria-label="Operational cockpit controls override">
          {mounted && <AuraCockpit />}
        </section>

      </div>
    </AuraShell>
  );
}
