"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Fingerprint, Lock, Mail, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState("Tap fingerprint to bypass");

  const handleScan = () => {
    setScanning(true);
    setScanStatus("SCANNING BIOMETRICS...");
    
    setTimeout(() => {
      setScanStatus("MATCH FOUND. DECRYPTING...");
      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    }, 1500);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background neon grid lines */}
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md robotics-card p-8 relative border-zinc-800 shadow-[0_15px_50px_rgba(255,51,68,0.08)] bg-black/60 z-10 cyber-corners"
      >
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-bold font-mono tracking-widest text-white uppercase">OPERATOR_LOG_IN</h1>
          <p className="text-xs font-mono text-zinc-550 uppercase">AUTHENTICATE WITH THE AURANEXUS NETWORK</p>
        </div>

        {/* Biometric Scan Section */}
        <div className="flex flex-col items-center justify-center p-6 mb-6 rounded bg-black/40 border border-zinc-800 relative overflow-hidden">
          {scanning && (
            <div className="absolute inset-x-0 top-0 h-0.5 bg-[#ff3344] shadow-[0_0_10px_#ff3344] animate-bounce"></div>
          )}
          
          <button
            onClick={handleScan}
            disabled={scanning}
            className={`w-20 h-20 rounded-full border border-red-500/20 flex items-center justify-center transition-all duration-300 relative group overflow-hidden ${
              scanning 
                ? "bg-[#ff3344]/10 border-[#ff3344] shadow-[0_0_20px_rgba(255,51,68,0.3)] animate-pulse" 
                : "bg-black hover:border-[#ff3344]/50 hover:bg-rose-500/5"
            }`}
          >
            <Fingerprint className={`w-10 h-10 ${scanning ? "text-[#ff3344]" : "text-zinc-500 group-hover:text-[#ff3344] transition-colors"}`} />
          </button>
          
          <p className="text-[9px] font-mono tracking-widest text-[#ff3344] uppercase mt-4 font-bold">{scanStatus}</p>
        </div>

        {/* Traditional Credentials Form */}
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest pl-1 font-bold">OPERATOR ID / EMAIL</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-zinc-550" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@aura.nexus"
                className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#ff3344]/80 transition-all font-mono placeholder:text-zinc-700"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between pl-1">
              <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest font-bold">ACCESS KEY</label>
              <a href="#" className="text-[9px] font-mono text-[#ff3344] hover:underline">FORGOT?</a>
            </div>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 w-4 h-4 text-zinc-550" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-black/60 border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#ff3344]/80 transition-all font-mono placeholder:text-zinc-700"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full btn-cyber py-3 flex items-center justify-center gap-2 mt-6 text-xs font-mono font-bold"
          >
            <span>Decrypt Security Vault</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-xs text-zinc-500">
            Unauthorized access subject to System Lock.{" "}
            <Link href="/signup" className="text-[#ff3344] hover:underline font-bold">
              Request Platform Key
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
