"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import AuraShell from "@/components/AuraShell";
import { useTelemetry } from "@/context/TelemetryContext";
import { Compass, MapPin, ListOrdered, Navigation, Plus, Play, Trash2 } from "lucide-react";

const Navigation3D = dynamic(() => import("@/components/Navigation3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[360px] flex items-center justify-center bg-black/80 border border-[#ff3344]/20 rounded-xl relative overflow-hidden scanlines">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-[#ff3344] rounded-full animate-spin"></div>
        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">LAUNCHING 3D PATHFINDER...</p>
      </div>
    </div>
  ),
});

interface Node {
  id: string;
  name: string;
  x: number;
  z: number;
}

const PRESET_NODES: Node[] = [
  { id: "dock", name: "Base Charge Station", x: -3, z: 2 },
  { id: "greenhouse-a", name: "Greenhouse Alpha", x: 3, z: -2 },
  { id: "greenhouse-b", name: "Greenhouse Beta", x: 3, z: 2 },
  { id: "biolab", name: "Research Bio-Lab", x: 0, z: -1.5 },
  { id: "warehouse", name: "Storage Warehouse B", x: -4, z: -2 },
];

export default function RedesignedNavigation() {
  const { coordinates, addLog, setRobotMode, isDeviceConnected } = useTelemetry();
  const [selectedNode, setSelectedNode] = useState<Node | null>(PRESET_NODES[0]);
  const [navigating, setNavigating] = useState(false);
  const [navProgress, setNavProgress] = useState(0);
  const [destinationQueue, setDestinationQueue] = useState<Node[]>([PRESET_NODES[1], PRESET_NODES[2]]);
  const [eta, setEta] = useState("0m 00s");
  const [confidence, setConfidence] = useState(99);

  const startNavigation = (node: Node) => {
    setSelectedNode(node);
    setNavigating(true);
    setNavProgress(0);
    setRobotMode("navigation");
    addLog(`Navigation Engine: Pathfinding calculation initialized for ${node.name.toUpperCase()}`, "info");
  };

  useEffect(() => {
    if (!navigating || !selectedNode) {
      setEta("0m 00s");
      return;
    }

    const interval = setInterval(() => {
      setNavProgress((prev) => {
        const nextVal = prev + 5;
        if (nextVal >= 100) {
          clearInterval(interval);
          setNavigating(false);
          addLog(`Navigation complete: Robot successfully reached target: ${selectedNode.name}`, "success");
          
          // Process next items in queue
          if (destinationQueue.length > 0) {
            const nextNode = destinationQueue[0];
            setDestinationQueue((q) => q.slice(1));
            setTimeout(() => startNavigation(nextNode), 1500);
          }
          return 100;
        }
        
        const secondsLeft = Math.round(((100 - nextVal) / 100) * 45);
        setEta(`0m ${secondsLeft.toString().padStart(2, "0")}s`);
        setConfidence(Math.max(94, Math.min(99, Math.round(98 + (Math.random() - 0.5) * 2))));
        
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigating, selectedNode, destinationQueue]);

  const addToQueue = (node: Node) => {
    if (destinationQueue.some((n) => n.id === node.id)) return;
    setDestinationQueue((prev) => [...prev, node]);
    addLog(`Waypoint Queue: Added ${node.name} to target list`, "info");
  };

  const clearQueue = () => {
    setDestinationQueue([]);
  };

  return (
    <AuraShell>
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left: Pathfinder 3D Map (8 Cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="backdrop-blur-md bg-zinc-950/70 border border-[#ff3344]/25 shadow-[0_0_20px_rgba(255,51,68,0.1)] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ff3344]/15 pb-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-[#ff3344] drop-shadow-[0_0_4px_rgba(255,51,68,0.5)] animate-pulse" />
                <span>3D SLAM Pathfinder Map</span>
              </h3>
              <div className="flex items-center gap-4 text-[10px] font-mono">
                <span className="text-zinc-400">ETA: <span className="text-white font-bold">{eta}</span></span>
                <span className="text-zinc-400">CONFIDENCE: <span className="text-[#ff3344] font-bold">{confidence}%</span></span>
              </div>
            </div>

            {/* Interactive 3D SLAM Canvas */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#ff3344]/15 bg-black/60 shadow-inner">
              <Navigation3D
                selectedNodeId={selectedNode?.id || null}
                navProgress={navProgress}
                onSelectNode={(id) => {
                  const node = PRESET_NODES.find((n) => n.id === id);
                  if (node && !navigating) {
                    startNavigation(node);
                  }
                }}
              />
              
              {/* Floating coordinates tag */}
              <div className="absolute top-4 left-4 z-10 font-mono text-[9px] bg-zinc-950/95 p-3 rounded-lg border border-[#ff3344]/25 text-zinc-400 pointer-events-none space-y-1 shadow-lg">
                <p className="font-black text-white uppercase text-[10px] tracking-widest border-b border-[#ff3344]/20 pb-1 mb-1">[MISSION CONTROL OSD]</p>
                <p>LAT: <span className="text-zinc-200 font-bold">{coordinates.lat.toFixed(6)}</span></p>
                <p>LNG: <span className="text-zinc-200 font-bold">{coordinates.lng.toFixed(6)}</span></p>
                <p>TARGET: <span className="text-[#ff3344] font-bold">{selectedNode ? selectedNode.name.toUpperCase() : "NONE"}</span></p>
                <p>COMPILER_PROG: <span className="text-[#ff3344] font-bold">{navProgress}%</span></p>
              </div>

              {/* Waypoint progress overlay */}
              {navigating && (
                <div className="absolute bottom-4 left-4 right-4 z-10 bg-zinc-950/95 p-4 rounded-xl border border-[#ff3344]/20 flex items-center justify-between gap-4 font-mono text-xs shadow-2xl">
                  <div className="space-y-0.5">
                    <span className="text-zinc-500 uppercase text-[9px] tracking-wider block">PATHFINDING STATUS</span>
                    <span className="text-white font-bold block flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-[#ff3344] animate-bounce" />
                      NAVIGATING TO {selectedNode?.name.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 max-w-[240px] h-2 bg-zinc-900 rounded-full overflow-hidden border border-white/5 relative">
                    <div className="h-full bg-gradient-to-r from-[#ff3344]/80 to-[#ff3344] transition-all duration-1000 shadow-[0_0_10px_rgba(255,51,68,0.8)]" style={{ width: `${navProgress}%` }}></div>
                  </div>
                  <span className="text-[#ff3344] font-black">{navProgress}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Target Nodes & Planned Queue (4 Cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          
          {/* Planned Destinations Queue */}
          <div className="backdrop-blur-md bg-zinc-950/70 border border-[#ff3344]/25 shadow-[0_0_20px_rgba(255,51,68,0.1)] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ff3344]/15 pb-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-[#ff3344]" />
                <span>Destination Queue</span>
              </h3>
              {destinationQueue.length > 0 && (
                <button
                  onClick={clearQueue}
                  className="p-1 px-2 text-[9px] font-mono rounded bg-red-950/20 border border-red-900/40 hover:border-red-500 text-[#ff3344] uppercase transition-all flex items-center gap-1 shadow-sm font-bold"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
              {destinationQueue.length === 0 ? (
                <div className="p-6 rounded-lg border border-dashed border-zinc-800 text-center font-mono text-[10px] text-zinc-500 uppercase tracking-wide">
                  No pending queue locations
                </div>
              ) : (
                destinationQueue.map((node, index) => (
                  <div key={node.id} className="p-3 rounded-lg bg-black/40 border border-zinc-900 flex items-center justify-between text-xs font-mono transition-all hover:bg-zinc-900/40">
                    <span className="font-bold text-white">#{index + 1} {node.name}</span>
                    <span className="text-[10px] text-zinc-550 bg-zinc-900/90 px-2 py-0.5 rounded border border-zinc-800">X:{node.x} Z:{node.z}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Saved Preset Locations */}
          <div className="backdrop-blur-md bg-zinc-950/70 border border-[#ff3344]/25 shadow-[0_0_20px_rgba(255,51,68,0.1)] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ff3344]/15 pb-3">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#ff3344]" />
                <span>Locations</span>
              </h3>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
              {PRESET_NODES.map((node) => (
                <div key={node.id} className="p-3.5 rounded-lg bg-black/40 border border-zinc-900/80 flex items-center justify-between text-xs font-mono hover:bg-[#ff3344]/2 hover:border-[#ff3344]/30 transition-all duration-200">
                  <span className="text-zinc-200 font-bold">{node.name}</span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => addToQueue(node)}
                      className="p-1 px-2 rounded-md border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-white text-[9px] transition-all font-bold flex items-center gap-0.5"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      <span>QUEUE</span>
                    </button>
                    
                    <button
                      onClick={() => startNavigation(node)}
                      disabled={navigating}
                      className="p-1 px-2.5 rounded-md border border-[#ff3344]/40 bg-[#ff3344]/10 text-[#ff3344] hover:bg-[#ff3344]/25 text-[9px] transition-all disabled:opacity-50 font-bold flex items-center gap-0.5"
                    >
                      <Play className="w-2.5 h-2.5 fill-current" />
                      <span>GO</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </AuraShell>
  );
}
