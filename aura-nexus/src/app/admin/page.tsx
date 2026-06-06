"use client";

import React, { useState } from "react";
import AuraShell from "@/components/AuraShell";
import { useTelemetry } from "@/context/TelemetryContext";
import { Sliders, Users, Radio, Lock, ShieldAlert, Cpu, Battery, Wifi } from "lucide-react";

export default function AdminDashboard() {
  const { addLog, isDeviceConnected } = useTelemetry();
  const [activeModel, setActiveModel] = useState("AuraCrop-v2.4");
  const [systemLocked, setSystemLocked] = useState(false);

  const handleModelChange = (model: string) => {
    setActiveModel(model);
    addLog(`System admin command: AI Model swapped to ${model}`, "success");
  };

  const toggleSystemLock = () => {
    const nextLock = !systemLocked;
    setSystemLocked(nextLock);
    addLog(`CRITICAL OVERRIDE: Global system lock ${nextLock ? "ENGAGED" : "DISENGAGED"} by admin.`, nextLock ? "error" : "success");
  };

  return (
    <AuraShell>
      <div className="space-y-6">
        
        {/* Core Lock override */}
        <div className={`p-6 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300 backdrop-blur-md ${
          systemLocked
            ? "bg-red-500/10 border-red-500 text-red-400 shadow-[0_0_25px_rgba(239,68,68,0.25)]"
            : "bg-zinc-950/70 border-[#ff3344]/25 text-red-400 shadow-[0_0_15px_rgba(255,51,68,0.08)]"
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${systemLocked ? "bg-red-500/25 animate-pulse" : "bg-red-950/30"}`}>
              <Lock className={`w-5 h-5 ${systemLocked ? "text-red-400" : "text-[#ff3344]"}`} />
            </div>
            <div>
              <h4 className="text-sm font-black font-mono uppercase tracking-wider">GLOBAL SECURITY SYSTEM LOCK</h4>
              <p className="text-[10px] font-mono text-zinc-400 mt-1 uppercase tracking-wide">
                {systemLocked
                  ? "ALL VEHICLE SERVO MOTORS IN EMERGENCY HALT. DRIVERS DISENGAGED."
                  : "SYSTEM ARMED. CORE ENGAGED FOR MANUAL AND AUTONOMOUS DIRECTIVES."}
              </p>
            </div>
          </div>
          <button
            onClick={toggleSystemLock}
            className={`px-5 py-2.5 rounded-lg font-mono text-xs font-bold border transition-all duration-200 ${
              systemLocked
                ? "bg-red-500 text-white border-transparent hover:bg-red-650 shadow-[0_0_12px_rgba(239,68,68,0.4)]"
                : "bg-transparent text-red-400 border-red-500/40 hover:bg-[#ff3344]/15 hover:border-red-500"
            }`}
          >
            {systemLocked ? "RELEASE SYS LOCK" : "ENGAGE EMERGENCY LOCK"}
          </button>
        </div>

        {/* Fleet and AI control grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* AI Model Management (6 cols) */}
          <div className="lg:col-span-6 backdrop-blur-md bg-zinc-950/70 border border-[#ff3344]/25 shadow-[0_0_20px_rgba(255,51,68,0.1)] rounded-xl p-6 space-y-4">
            <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center gap-2 border-b border-[#ff3344]/15 pb-4">
              <Sliders className="w-5 h-5 text-[#ff3344] drop-shadow-[0_0_4px_rgba(255,51,68,0.5)]" />
              <span>AI COMPLIANCE CLUSTER</span>
            </h3>

            <div className="space-y-4 pt-1">
              <div className="p-3.5 bg-black/40 border border-zinc-900 rounded-lg flex items-center justify-between text-xs font-mono">
                <span className="text-zinc-500">Active classification model</span>
                <span className="text-[#ff3344] font-bold tracking-wide">{activeModel}</span>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-mono text-zinc-500 uppercase block pl-0.5 font-bold tracking-wider">Available Vision Modules</span>
                
                {[
                  { id: "AuraCrop-v2.4", name: "AuraCrop-v2.4", type: "Agri Classification" },
                  { id: "AuraSurveil-v3.1", name: "AuraSurveil-v3.1", type: "Surveillance / Object Box" },
                  { id: "AuraNavSLAM-v1.0", name: "AuraNavSLAM-v1.0", type: "Lidar Mapping SLAM" }
                ].map((model) => (
                  <button
                    key={model.id}
                    onClick={() => handleModelChange(model.id)}
                    className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all duration-200 font-mono text-xs ${
                      activeModel === model.id
                        ? "bg-[#ff3344]/8 border-[#ff3344]/40 text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.02)]"
                        : "bg-black/20 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Cpu className={`w-4 h-4 ${activeModel === model.id ? "text-[#ff3344]" : "text-zinc-550"}`} />
                      <span className="font-bold">{model.name}</span>
                    </div>
                    <span className={`text-[9px] px-2 py-0.5 rounded ${activeModel === model.id ? "bg-[#ff3344]/15 text-[#ff3344] border border-[#ff3344]/30" : "bg-zinc-900 text-zinc-500 border border-zinc-800"}`}>
                      {model.type}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Connected Robots / Operators (6 cols) */}
          <div className="lg:col-span-6 backdrop-blur-md bg-zinc-950/70 border border-[#ff3344]/25 shadow-[0_0_20px_rgba(255,51,68,0.1)] rounded-xl p-6 space-y-6">
            
            {/* Robot Fleet status */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center justify-between border-b border-[#ff3344]/15 pb-4">
                <span>Active Nodes (Robots)</span>
                <Radio className="w-5 h-5 text-[#ff3344] drop-shadow-[0_0_4px_rgba(255,51,68,0.5)]" />
              </h3>

              <div className="space-y-3">
                {[
                  { id: "AURA-1", status: "online", battery: 89, location: "Greenhouse Alpha" },
                  { id: "AURA-2", status: "standby", battery: 100, location: "Base Charge Station" },
                  { id: "AURA-3", status: "offline", battery: 0, location: "Storage Warehouse B" }
                ].map((node) => (
                  <div
                    key={node.id}
                    className="p-3.5 rounded-xl bg-black/40 border border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs hover:border-[#ff3344]/20 transition-all"
                  >
                    <div>
                      <span className="text-white font-bold">{node.id}</span>
                      <p className="text-[10px] text-zinc-500 mt-0.5">LOC: {node.location}</p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6">
                      <div className="flex items-center gap-2">
                        <Battery className={`w-4 h-4 ${node.battery > 20 ? "text-[#ff3344]" : "text-zinc-500"}`} />
                        <span className="text-zinc-350">{node.battery}%</span>
                        {node.battery > 0 && (
                          <div className="w-12 h-1 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                            <div className="h-full bg-[#ff3344]" style={{ width: `${node.battery}%` }}></div>
                          </div>
                        )}
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-md text-[9px] uppercase border font-bold ${
                        node.status === "online" ? "bg-red-950/25 border-red-900/60 text-[#ff3344]" :
                        node.status === "standby" ? "bg-red-950/10 border-red-900/40 text-red-400" :
                        "bg-zinc-900 border-zinc-800 text-zinc-500"
                      }`}>
                        {node.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Operator List */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold font-mono tracking-widest text-white uppercase flex items-center justify-between border-b border-[#ff3344]/15 pb-4">
                <span>ACTIVE OPERATORS DIRECTORY</span>
                <Users className="w-5 h-5 text-[#ff3344] drop-shadow-[0_0_4px_rgba(255,51,68,0.5)]" />
              </h3>

              <div className="space-y-3">
                {[
                  { name: "Lex Aura", role: "Super Admin (Core)", status: "Active Now" },
                  { name: "Kaelen Vane", role: "Field Agent", status: "Patrol Idle" }
                ].map((user) => (
                  <div
                    key={user.name}
                    className="p-3.5 rounded-xl bg-black/40 border border-zinc-900 flex items-center justify-between font-mono text-xs hover:border-[#ff3344]/20 transition-all"
                  >
                    <div>
                      <span className="text-white font-bold">{user.name}</span>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{user.role}</p>
                    </div>
                    <span className="text-[10px] text-[#ff3344] bg-[#ff3344]/10 border border-[#ff3344]/30 px-2 py-0.5 rounded-full font-bold">
                      {user.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </AuraShell>
  );
}
