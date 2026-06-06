"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Key, ArrowRight, UserPlus } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("field-ops");
  const [platformKey, setPlatformKey] = useState("");
  const [generating, setGenerating] = useState(false);

  const generateSecurityCert = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    
    // Simulate encryption key builder
    setTimeout(() => {
      const generatedKey = "AURA-" + Math.random().toString(36).substr(2, 9).toUpperCase() + "-" + Math.random().toString(36).substr(2, 4).toUpperCase();
      setPlatformKey(generatedKey);
      setGenerating(false);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-[#030305] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 cyber-grid opacity-30 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg robotics-card p-8 relative border-zinc-800 shadow-[0_15px_50px_rgba(255,51,68,0.08)] bg-black/60 z-10 cyber-corners"
      >
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-2xl font-bold font-mono tracking-widest text-white uppercase">KEY_REGISTRATION</h1>
          <p className="text-xs font-mono text-zinc-555 font-semibold uppercase">INITIALIZE NEW OPERATOR PROFILE IN THE SYSTEM NETWORK</p>
        </div>

        {platformKey ? (
          // Cryptographic Certificate Success View
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <Shield className="w-8 h-8 ai-pulse" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-bold font-mono text-emerald-400 uppercase">Profile Key Provisioned</h3>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                Write down this private cryptographic key. It is required for command console decryption.
              </p>
            </div>

            <div className="p-4 rounded bg-black/60 border border-emerald-500/20 font-mono text-center select-all cursor-pointer hover:border-emerald-500/40 transition-colors">
              <p className="text-sm font-bold text-white tracking-widest">{platformKey}</p>
              <p className="text-[9px] text-zinc-600 mt-1">CLICK TO COPY KEY</p>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full btn-cyber py-3 flex items-center justify-center gap-2 text-xs font-mono font-bold"
            >
              <span>Initialize Command Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          // Registration Form
          <form onSubmit={generateSecurityCert} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest pl-1 font-bold">OPERATOR NAME</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Lex Aura"
                  className="w-full px-4 py-2.5 bg-black/60 border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#ff3344]/85 transition-all font-mono placeholder:text-zinc-700"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest pl-1 font-bold">SYSTEM CLASSIFICATION</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/60 border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#ff3344]/85 transition-all font-mono appearance-none cursor-pointer"
                >
                  <option value="field-ops">FIELD OPERATOR (L1)</option>
                  <option value="crop-intelligence">AGRI ANALYST (L2)</option>
                  <option value="security-officer">SECURITY COMMANDER (L2)</option>
                  <option value="super-admin">CORE ENGINEER (L3)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest pl-1 font-bold">AUTHENTICATION EMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@aura.nexus"
                className="w-full px-4 py-2.5 bg-black/60 border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#ff3344]/85 transition-all font-mono placeholder:text-zinc-700"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest pl-1 font-bold">VAULT PASSCODE</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-2.5 bg-black/60 border border-zinc-800 rounded text-sm text-white focus:outline-none focus:border-[#ff3344]/85 transition-all font-mono placeholder:text-zinc-700"
              />
            </div>

            <div className="p-4 rounded bg-[#ff3344]/5 border border-[#ff3344]/20 text-xs font-mono text-zinc-400 space-y-1">
              <p className="font-bold text-[#ff3344] flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5" /> SECURITY COMPLIANCE AGREEMENT
              </p>
              <p className="leading-relaxed">
                By registering, this device receives an encrypted certificate syncing with the Firebase database cluster. All system overrides are cryptographically signed.
              </p>
            </div>

            <button
              type="submit"
              disabled={generating}
              className="w-full btn-cyber py-3 flex items-center justify-center gap-2 mt-6 text-xs font-mono font-bold"
            >
              {generating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>PROVISIONING CRYPTO KEY...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Generate Platform Credentials</span>
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center mt-6">
          <p className="text-xs text-zinc-500">
            Already registered?{" "}
            <Link href="/login" className="text-[#ff3344] hover:underline font-bold">
              Operator Log In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
