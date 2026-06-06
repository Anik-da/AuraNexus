"use client";

import React from "react";
import { useTelemetry } from "@/context/TelemetryContext";

export default function HolographicGlobe() {
  const { isDeviceConnected, signalStrength } = useTelemetry();
  const signalDensity = isDeviceConnected ? signalStrength : 0;

  return (
    <aside className="hero-orb" aria-label="Global signal visualization">
      <div className="relative w-full aspect-square max-w-[260px] mx-auto border border-red-500/20 rounded-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-red-500/10 to-rose-950/5 shadow-[0_0_50px_rgba(255,51,68,0.15)] overflow-hidden">
        
        {/* Animated Holographic Rings */}
        <div className={`relative w-[180px] h-[180px] border border-red-500/40 rounded-full bg-gradient-to-br from-red-500/5 to-transparent shadow-[0_0_24px_rgba(255,51,68,0.1),inset_0_0_24px_rgba(255,51,68,0.1)] holo-globe-animation ${!isDeviceConnected ? "opacity-35" : ""}`}>
          
          <span className="absolute inset-2 border border-red-450/30 rounded-full globe-ring-animation" style={{ transform: "rotateX(68deg)" }}></span>
          <span className="absolute inset-2 border border-red-450/30 rounded-full globe-ring-animation" style={{ transform: "rotateY(68deg)", animationDelay: "-2s" }}></span>
          <span className="absolute inset-2 border border-rose-450/30 rounded-full globe-ring-animation" style={{ transform: "rotateX(35deg) rotateY(48deg)", animationDelay: "-4s" }}></span>
          
          {/* Pulsing signal markers */}
          {isDeviceConnected && (
            <>
              <span className="absolute top-[24%] left-[64%] w-3 h-3 rounded-full bg-red-500 alert-dot-pulse shadow-[0_0_12px_rgba(255,51,68,0.9)]"></span>
              <span className="absolute top-[58%] left-[30%] w-3 h-3 rounded-full bg-amber-400 alert-dot-pulse shadow-[0_0_12px_rgba(251,191,36,0.9)]" style={{ animationDelay: "-0.5s" }}></span>
              <span className="absolute top-[68%] left-[72%] w-3 h-3 rounded-full bg-emerald-400 alert-dot-pulse shadow-[0_0_12px_rgba(52,211,153,0.9)]" style={{ animationDelay: "-0.8s" }}></span>
            </>
          )}
        </div>

        {/* Diagnostic Status Box */}
        <div className="absolute bottom-5 px-4 py-1.5 border border-red-500/20 rounded-full bg-black/70 backdrop-blur text-center min-w-[120px] shadow-lg">
          <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Signal Density</p>
          <strong className="text-sm font-mono text-red-500 font-bold block mt-1">
            {signalDensity > 0 ? `${signalDensity}%` : "OFFLINE"}
          </strong>
        </div>

      </div>
    </aside>
  );
}
