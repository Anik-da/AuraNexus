"use client";

import React from "react";
import AuraShell from "@/components/AuraShell";
import { useTelemetry } from "@/context/TelemetryContext";
import { Milestone, Trophy, Clock, Zap } from "lucide-react";

export default function MissionHistory() {
  const { missions } = useTelemetry();

  return (
    <AuraShell>
      <div className="space-y-6">
        
        {/* Header summary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-panel p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-zinc-550 uppercase">Patrol Coverage</span>
              <p className="text-xl font-bold font-mono text-red-500 mt-1">94.8% Avg</p>
            </div>
            <Trophy className="w-8 h-8 text-red-500/20" />
          </div>

          <div className="glass-panel p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-zinc-550 uppercase">Total System Hours</span>
              <p className="text-xl font-bold font-mono text-red-400 mt-1">124.5 Hours</p>
            </div>
            <Clock className="w-8 h-8 text-red-500/20" />
          </div>

          <div className="glass-panel p-4 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-zinc-550 uppercase">Power Cycle efficiency</span>
              <p className="text-xl font-bold font-mono text-red-400 mt-1">91.4% Rate</p>
            </div>
            <Zap className="w-8 h-8 text-red-500/20" />
          </div>
        </div>

        {/* Missions list */}
        <div className="glass-panel p-6 space-y-4">
          <h3 className="text-xs font-mono tracking-widest text-zinc-550 uppercase flex items-center gap-2">
            <Milestone className="w-4 h-4 text-red-500" />
            <span>PLATFORM MISSION LOGS</span>
          </h3>

          <div className="space-y-3">
            {missions.map((mis) => (
              <div
                key={mis.id}
                className="p-4 rounded-lg bg-zinc-900/30 border border-zinc-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-mono text-sm"
              >
                <div>
                  <span className="text-xs text-zinc-550 mr-3">{mis.id}</span>
                  <span className="text-white font-bold tracking-wide uppercase">{mis.name}</span>
                  <p className="text-[10px] text-zinc-550 mt-0.5">LAUNCHED: {mis.date}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{mis.duration}</span>
                  </div>

                  <div className="flex items-center gap-1 text-red-400 font-semibold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{mis.efficiency}% EFF</span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded text-[10px] border uppercase ${
                    mis.status === "completed"
                      ? "bg-red-950/20 border-red-900/60 text-red-400"
                      : "bg-rose-950/20 border-rose-900/60 text-rose-500"
                  }`}>
                    {mis.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AuraShell>
  );
}
