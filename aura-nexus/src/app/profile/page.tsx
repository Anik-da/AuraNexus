"use client";

import React, { useState } from "react";
import AuraShell from "@/components/AuraShell";
import { useTelemetry } from "@/context/TelemetryContext";
import { User, Shield, Key, Check, Copy } from "lucide-react";

export default function ProfileManagement() {
  const { addLog } = useTelemetry();
  const [copied, setCopied] = useState(false);
  const [operatorKey] = useState("AURA-9F8A2D1C-Z7W3");

  const copyKey = () => {
    navigator.clipboard.writeText(operatorKey);
    setCopied(true);
    addLog("Operator private security token copied to clipboard.", "info");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AuraShell>
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Profile Card */}
        <div className="glass-panel p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
            <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500">
              <User className="w-10 h-10 animate-pulse" />
            </div>
            
            <div className="text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-xl font-bold text-white">Commander Lex Aura</h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/15 border border-red-500/30 text-red-400">
                  Level 3 Core Engineer
                </span>
              </div>
              <p className="text-xs font-mono text-zinc-550">OPERATOR_ID: AURA-7012-SYS</p>
              <p className="text-xs font-mono text-zinc-400">Email: commander@aura.nexus</p>
            </div>
          </div>

          {/* Security Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono tracking-widest text-zinc-500 uppercase flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              <span>AUTHENTICATION VAULT CREDENTIALS</span>
            </h3>

            <div className="p-4 rounded-lg bg-black/40 border border-zinc-800 space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500">Device Encryption Cert</span>
                <span className="text-red-400 font-semibold uppercase">Active (AES-256)</span>
              </div>

              <div className="h-[1px] bg-zinc-800"></div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-zinc-550 block mb-1">Decryption Access Key</span>
                  <span className="text-white font-bold tracking-widest">{operatorKey}</span>
                </div>
                
                <button
                  onClick={copyKey}
                  className="p-1.5 rounded bg-white/5 border border-white/10 hover:border-red-500/30 text-zinc-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-red-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* System override permissions */}
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-mono tracking-widest text-zinc-550 uppercase flex items-center gap-2">
              <Key className="w-4 h-4 text-red-500" />
              <span>ROBOTIC OVERRIDE PRIVILEGES</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                <span className="text-zinc-550 block">Thrust Vectors</span>
                <span className="text-red-400 font-semibold mt-1 block">MANUAL ALLOWED</span>
              </div>
              <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                <span className="text-zinc-550 block">Vision Model Swap</span>
                <span className="text-red-400 font-semibold mt-1 block">SUPERVISOR ALLOWED</span>
              </div>
              <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                <span className="text-zinc-550 block">Waypoints Mapping</span>
                <span className="text-red-400 font-semibold mt-1 block">WRITE/OVERWRITE</span>
              </div>
              <div className="p-3 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                <span className="text-zinc-550 block">Firebase Write</span>
                <span className="text-red-400 font-semibold mt-1 block">AUTHORIZED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuraShell>
  );
}
