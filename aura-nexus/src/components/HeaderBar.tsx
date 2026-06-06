"use client";

import React, { useEffect, useState } from "react";
import { useTelemetry } from "@/context/TelemetryContext";
import { Battery, Wifi, ShieldAlert, Cpu, Calendar, Clock } from "lucide-react";

export default function HeaderBar() {
  const { batteryLevel, signalStrength, connectivity, robotMode } = useTelemetry();
  const [time, setTime] = useState("");
  const [dateStr, setDateStr] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setTime(d.toLocaleTimeString("en-US", { hour12: false }));
      setDateStr(
        d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    };
    updateTime();
    const t = setInterval(updateTime, 1000);
    return () => clearInterval(t);
  }, []);

  // Battery icon color helper
  const getBatteryColor = () => {
    if (batteryLevel > 50) return "text-emerald-400";
    if (batteryLevel > 20) return "text-amber-400";
    return "text-red-500 animate-pulse";
  };

  return (
    <header className="w-full h-14 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between px-6 z-30 shrink-0 sticky top-0">
      {/* Brand Label */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
          <Cpu className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-widest text-white font-mono flex items-center gap-1.5">
            AURA_NEXUS <span className="text-[9px] font-normal px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">v2.4</span>
          </h1>
        </div>
      </div>

      {/* Center mode status */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded bg-white/5 border border-white/5">
        <span className="text-[10px] font-mono text-zinc-500">ACTIVE_MODE:</span>
        <span className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider uppercase">
          {robotMode}
        </span>
      </div>

      {/* Right HUD controls */}
      <div className="flex items-center gap-6">
        {/* Connection status */}
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connectivity === "connected" ? "bg-emerald-400 shadow-[0_0_8px_#34d399]" : "bg-red-500 animate-pulse"}`}></span>
          <span className="text-xs font-mono text-zinc-400 uppercase hidden sm:inline">
            {connectivity}
          </span>
        </div>

        {/* WiFi / Signal Strength */}
        <div className="flex items-center gap-1.5">
          <Wifi className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-zinc-300">{signalStrength}%</span>
        </div>

        {/* Battery */}
        <div className="flex items-center gap-1.5">
          <Battery className={`w-4 h-4 ${getBatteryColor()}`} />
          <span className="text-xs font-mono text-zinc-300">{batteryLevel}%</span>
        </div>

        {/* Live Date/Time clock */}
        <div className="hidden lg:flex items-center gap-4 border-l border-white/10 pl-6">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Calendar className="w-3.5 h-3.5" />
            <span className="text-xs font-mono">{dateStr}</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-mono font-semibold tracking-widest">{time}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
