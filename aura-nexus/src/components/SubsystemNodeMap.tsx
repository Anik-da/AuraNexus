"use client";

import React, { useState } from "react";
import { useTelemetry } from "@/context/TelemetryContext";

export default function SubsystemNodeMap() {
  const { isDeviceConnected, speed, batteryLevel, signalStrength, robotMode } = useTelemetry();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const nodes = [
    { id: "core", label: "AURA-1", x: "50%", y: "50%", color: "text-red-500 border-red-500/40 shadow-red-500/10", details: `Mode: ${robotMode.toUpperCase()}` },
    { id: "drive", label: "DRIVE", x: "18%", y: "22%", color: "text-rose-400 border-rose-500/30 shadow-rose-500/5", details: `Velocity: ${isDeviceConnected ? speed.toFixed(1) : 0} m/s` },
    { id: "ai", label: "INTELL", x: "82%", y: "24%", color: "text-pink-500 border-pink-500/30 shadow-pink-550/5", details: "AuraCrop Classifier Active" },
    { id: "nav", label: "NAV", x: "16%", y: "78%", color: "text-purple-400 border-purple-500/30 shadow-purple-500/5", details: `GPS: X=${isDeviceConnected ? "Nominal" : "Offline"}` },
    { id: "comms", label: "COMMS", x: "84%", y: "76%", color: "text-rose-300 border-rose-450/30 shadow-rose-450/5", details: `Link: ${isDeviceConnected ? signalStrength : 0}%` },
  ];

  return (
    <div className="relative w-full h-[220px] border border-red-500/10 rounded-xl bg-black/40 overflow-hidden">
      
      {/* Background circle lines */}
      <div className="absolute inset-[30%] border border-red-500/5 rounded-full pointer-events-none"></div>
      <div className="absolute inset-[15%] border border-red-500/5 rounded-full pointer-events-none"></div>

      {nodes.map((node, index) => {
        const isCore = node.id === "core";
        const floatDelay = `${index * 0.3}s`;

        return (
          <div
            key={node.id}
            className={`absolute px-3 py-1.5 border rounded-full bg-black/80 font-mono text-[9px] font-bold cursor-pointer transition-all duration-300 z-10 flex flex-col items-center justify-center min-w-[60px] text-center select-none shadow-[0_0_12px_rgba(255,51,68,0.05)] ${node.color} ${
              !isCore ? "node-float-animation" : ""
            } ${hoveredNode === node.id ? "scale-105 border-red-500 shadow-[0_0_15px_rgba(255,51,68,0.3)] z-20" : ""}`}
            style={{
              left: node.x,
              top: node.y,
              transform: `translate(-50%, -50%)`,
              animationDelay: floatDelay
            }}
            onMouseEnter={() => setHoveredNode(node.id)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            <span>{node.label}</span>
          </div>
        );
      })}

      {/* Detail Overlay Readout */}
      <div className="absolute bottom-2 left-3 right-3 text-center pointer-events-none">
        <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest block">
          {hoveredNode 
            ? nodes.find(n => n.id === hoveredNode)?.details 
            : isDeviceConnected ? "Subsystem Sync Status: NOMINAL" : "Subsystem Sync Status: OFFLINE"
          }
        </span>
      </div>

    </div>
  );
}
