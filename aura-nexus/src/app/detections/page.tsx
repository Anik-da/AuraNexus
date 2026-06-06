"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import AuraShell from "@/components/AuraShell";
import { useTelemetry } from "@/context/TelemetryContext";
import { Brain, Heart, RefreshCw, BarChart2, Shield, AlertTriangle, CheckCircle } from "lucide-react";

const NeuralNet3D = dynamic(() => import("@/components/NeuralNet3D"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center bg-black/80 border border-[#ff3344]/20 rounded-xl relative overflow-hidden scanlines">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-zinc-700 border-t-[#ff3344] rounded-full animate-spin"></div>
        <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest">CONNECTING NEURAL SYNAPSES...</p>
      </div>
    </div>
  ),
});

export default function RedesignedAIDetections() {
  const { detections, addLog, isDeviceConnected } = useTelemetry();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const triggerScan = () => {
    setScanning(true);
    setScanResult(null);
    addLog("Initiating manual multi-spectral crop scan...", "info");

    setTimeout(() => {
      setScanning(false);
      const results = [
        "HEALTHY MAIZE: NITROGEN OPTIMAL (98% CONFIDENCE)",
        "WARN: SOYBEAN RUST DETECTED (78% CONFIDENCE) - TREATMENT SUGGESTED",
        "WARN: CORN LEAF BLIGHT (84% CONFIDENCE)",
        "HEALTHY TOMATO VINE (99% CONFIDENCE)"
      ];
      setScanResult(results[Math.floor(Math.random() * results.length)]);
      addLog("Bioscan classification completed.", "success");
    }, 1500);
  };

  return (
    <AuraShell>
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left: Scan viewer & WebGL Neural Network (8 Cols) */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="backdrop-blur-md bg-zinc-950/70 border border-[#ff3344]/25 shadow-[0_0_20px_rgba(255,51,68,0.1)] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#ff3344]/15 pb-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white flex items-center gap-2">
                <Brain className="w-5 h-5 text-[#ff3344] drop-shadow-[0_0_4px_rgba(255,51,68,0.5)] animate-pulse" />
                <span>AI SPECTRAL ANALYZER</span>
              </h3>
              <button
                onClick={triggerScan}
                disabled={scanning}
                className="py-1.5 px-4 text-xs rounded-lg border border-[#ff3344] bg-[#ff3344]/10 text-[#ff3344] hover:bg-[#ff3344]/20 transition-all font-mono font-bold flex items-center shadow-[0_0_12px_rgba(255,51,68,0.2)]"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${scanning ? "animate-spin" : ""}`} />
                <span>{scanning ? "ANALYZING..." : "RUN BIOSCAN"}</span>
              </button>
            </div>

            {/* Scan viewer / Neural Canvas area */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#ff3344]/15 bg-black/60 shadow-inner">
              {scanning && (
                <div className="absolute inset-0 bg-zinc-950/95 flex flex-col items-center justify-center z-25 scanlines">
                  <div className="w-8 h-8 border-2 border-[#ff3344] border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest text-center animate-pulse">
                    DECOMPRESSING MULTISPECTRAL BANDS...
                  </p>
                </div>
              )}

              <NeuralNet3D />

              {!scanning && scanResult && (
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-zinc-950/95 border border-[#ff3344]/30 font-mono text-xs z-10 shadow-[0_0_20px_rgba(255,51,68,0.2)] flex items-start gap-3">
                  {scanResult.includes("WARN") ? (
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-[#ff3344] shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-red-400 font-bold uppercase tracking-widest text-[9px] border-b border-[#ff3344]/15 pb-1 mb-1">[CLASSIFICATION OUTPUT]</p>
                    <p className="text-white mt-1 font-bold tracking-wide">{scanResult}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Diagnostics details */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              
              <div className="p-4 rounded-xl bg-black/40 border border-zinc-900 flex items-center justify-between font-mono text-xs hover:border-[#ff3344]/20 transition-all">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Index</span>
                  <p className="text-sm font-black text-white mt-1">NDVI 0.76</p>
                  <div className="w-20 h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden border border-white/5">
                    <div className="h-full bg-emerald-500" style={{ width: "76%" }}></div>
                  </div>
                </div>
                <Heart className="w-5 h-5 text-emerald-500/70" />
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-zinc-900 flex items-center justify-between font-mono text-xs hover:border-[#ff3344]/20 transition-all">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Chlorophyll</span>
                  <p className="text-sm font-black text-white mt-1">42.8 ug/cm²</p>
                  <div className="w-20 h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden border border-white/5">
                    <div className="h-full bg-[#ff3344]" style={{ width: "68%" }}></div>
                  </div>
                </div>
                <BarChart2 className="w-5 h-5 text-[#ff3344]/70" />
              </div>

              <div className="p-4 rounded-xl bg-black/40 border border-zinc-900 flex items-center justify-between font-mono text-xs hover:border-[#ff3344]/20 transition-all">
                <div>
                  <span className="text-[9px] text-zinc-500 uppercase block font-bold">Soil Nitrogen</span>
                  <p className="text-sm font-black text-white mt-1">Optimal</p>
                  <div className="w-20 h-1 bg-zinc-900 rounded-full mt-2 overflow-hidden border border-white/5">
                    <div className="h-full bg-[#ff3344]" style={{ width: "90%" }}></div>
                  </div>
                </div>
                <Shield className="w-5 h-5 text-[#ff3344]/70" />
              </div>
            </div>
          </div>
        </div>

        {/* Right: History detections (4 Cols) */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="backdrop-blur-md bg-zinc-950/70 border border-[#ff3344]/25 shadow-[0_0_20px_rgba(255,51,68,0.1)] rounded-xl p-6 space-y-4 h-[560px] flex flex-col">
            <div className="flex items-center justify-between border-b border-[#ff3344]/15 pb-4">
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">Detection History</h3>
              <span className="text-[9px] font-mono text-[#ff3344] bg-[#ff3344]/10 border border-[#ff3344]/30 px-2 py-0.5 rounded-full font-bold tracking-widest animate-pulse">LIVE FEED</span>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto pr-1 scrollbar-thin">
              {detections.length === 0 ? (
                <div className="p-6 rounded-lg border border-dashed border-zinc-800 text-center font-mono text-[10px] text-zinc-500 uppercase tracking-wide">
                  Waiting for live telemetry stream...
                </div>
              ) : (
                detections.map((det) => (
                  <div key={det.id} className="p-4 rounded-xl bg-black/40 border border-zinc-900 space-y-3 font-mono text-xs hover:border-[#ff3344]/20 transition-all">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">{det.label}</span>
                      <span className="text-[9px] text-zinc-500">[{det.timestamp}]</span>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] text-zinc-400">
                        <span>CONFIDENCE WEIGHT</span>
                        <span className="text-[#ff3344] font-bold">{det.confidence}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden border border-white/5 relative">
                        <div className="h-full bg-gradient-to-r from-[#ff3344]/70 to-[#ff3344] shadow-[0_0_8px_rgba(255,51,68,0.6)]" style={{ width: `${det.confidence}%` }}></div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </AuraShell>
  );
}
