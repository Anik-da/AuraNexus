"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTelemetry } from "@/context/TelemetryContext";
import {
  LayoutDashboard,
  Cpu,
  Video,
  Compass,
  Brain,
  BarChart2,
  Terminal,
  Settings,
  Battery,
  Wifi,
  User,
  Menu,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const HolographicBackground3D = dynamic(() => import("./HolographicBackground3D"), {
  ssr: false,
});

const SIDEBAR_LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/control", label: "Robot Control", icon: Cpu },
  { href: "/navigation", label: "Navigation", icon: Compass },
  { href: "/detections", label: "AI Detection", icon: Brain },
  { href: "/analytics", label: "Sensor Analytics", icon: BarChart2 },
  { href: "/logs", label: "Activity Logs", icon: Terminal },
  { href: "/admin", label: "Settings", icon: Settings },
];

export default function AuraShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { batteryLevel, signalStrength, connectivity, robotMode, isDeviceConnected, toggleDeviceConnection } = useTelemetry();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-transparent text-[#f4f4f5] flex font-sans antialiased overflow-hidden relative">
      <HolographicBackground3D />
      
      {/* Desktop Sidebar (Left) */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-[#ff3344]/15 bg-gradient-to-b from-[#160608]/95 via-[#0d0304]/98 to-[#090203]/95 backdrop-blur-xl shrink-0 h-screen sticky top-0 relative overflow-hidden z-20">
        
        {/* Subtle high-tech background lines scan effect */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[size:100%_4px,3px_100%] z-0"></div>

        {/* Brand Header */}
        <div className="h-16 px-6 border-b border-[#ff3344]/15 flex items-center gap-3.5 shrink-0 relative z-10">
          <div className="w-6 h-6 rounded-full bg-[#ff3344]/10 border border-[#ff3344]/40 flex items-center justify-center shadow-[0_0_8px_rgba(255,51,68,0.25)]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff3344] animate-pulse"></span>
          </div>
          <span className="text-xs font-black tracking-[0.25em] font-mono text-white uppercase">AURANEXUS</span>
        </div>

        {/* Links Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2.5 overflow-y-auto relative z-10">
          {SIDEBAR_LINKS.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link key={link.href} href={link.href} className="block">
                <button className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-widest transition-all duration-200 border ${
                  active
                    ? "border-[#ff3344] text-white bg-[#ff3344]/15 shadow-[0_0_15px_rgba(255,51,68,0.25)] font-bold"
                    : "border-transparent text-zinc-400 hover:text-white hover:border-[#ff3344]/30 hover:bg-[#ff3344]/5"
                }`}>
                  <Icon className={`w-5 h-5 ${active ? "text-[#ff3344] drop-shadow-[0_0_4px_rgba(255,51,68,0.5)]" : "text-zinc-500"}`} />
                  <span>{link.label}</span>
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Footer Status info */}
        <div className="p-4 border-t border-[#ff3344]/15 font-mono text-[8px] text-[#ff3344]/60 uppercase tracking-widest shrink-0 relative z-10 flex items-center gap-2 pl-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff3344] animate-ping"></span>
          <span>OPERATOR COMMANDS OS</span>
        </div>
      </aside>

      {/* Main Container Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent relative z-10">
        
        {/* Top Status Bar */}
        <header className="h-16 border-b border-[#ff3344]/15 bg-[#160608]/40 backdrop-blur-md flex items-center justify-between px-6 shrink-0">
          {/* Left: Mobile hamburger & Page Header */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-[#ff3344]/40 hover:bg-[#ff3344]/5 transition-all"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider">SYS_MODE:</span>
              <span className="text-[9px] font-mono text-[#ff3344] font-bold uppercase tracking-widest pl-0.5">
                {robotMode}
              </span>
            </div>
          </div>

          {/* Right: Metrics Dials & Profile */}
          <div className="flex items-center gap-5 md:gap-6">
            {/* Connection status */}
            <button
              onClick={() => toggleDeviceConnection(!isDeviceConnected)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full font-mono text-[9px] uppercase tracking-wider transition-all border ${
                isDeviceConnected
                  ? "bg-emerald-950/20 border-emerald-500/35 text-emerald-400 hover:bg-emerald-900/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                  : "bg-red-950/20 border-red-500/35 text-red-400 hover:bg-red-900/30 shadow-[0_0_10px_rgba(255,51,68,0.1)] animate-pulse"
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isDeviceConnected ? "bg-emerald-400" : "bg-red-500 animate-ping"}`}></span>
              <span>{isDeviceConnected ? "LINK: ONLINE" : "LINK: OFFLINE"}</span>
            </button>

            {/* Signal */}
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Wifi className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[10px] font-mono">{signalStrength}%</span>
            </div>

            {/* Battery */}
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Battery className={`w-3.5 h-3.5 ${batteryLevel > 20 ? "text-emerald-400" : "text-[#ff3344] animate-pulse"}`} />
              <span className="text-[10px] font-mono">{batteryLevel}%</span>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-2 border-l border-zinc-800 pl-5 md:pl-6">
              <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-[9px] font-mono text-zinc-300 uppercase tracking-widest hidden sm:inline">
                Commander Lex
              </span>
            </div>
          </div>
        </header>

        {/* Breaking News/System Logs Ticker */}
        <section className="h-10 border-b border-[#ff3344]/15 bg-gradient-to-r from-[#28090b]/40 to-transparent flex items-center px-6 shrink-0 relative overflow-hidden select-none">
          <span className="shrink-0 bg-red-950/35 border border-red-500/30 text-[#ff3344] font-mono text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-widest mr-4 shadow-[0_0_8px_rgba(255,51,68,0.1)]">
            SYSTEM_ALERTS
          </span>
          <div className="flex-1 overflow-hidden relative" style={{ maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)" }}>
            <div className="ticker-track-animation flex whitespace-nowrap gap-12 text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5"><span className="text-[#ff3344]">◆</span> AURA-1 ROVER SYNC ESTABLISHED ON CHANNEL BROADCAST 12</span>
              <span className="flex items-center gap-1.5"><span className="text-[#ff3344]">◆</span> CAMERA PAYLOAD ACQUIRED STABLE STREAM AT H.264 HD v2.4</span>
              <span className="flex items-center gap-1.5"><span className="text-[#ff3344]">◆</span> LIDAR TELEMETRY DETECTED TARGET ANOMALY IN SECTOR E-8</span>
              <span className="flex items-center gap-1.5"><span className="text-[#ff3344]">◆</span> FLIGHT VECTOR VECTORING COMPLETED VIA OVERRIDE ACTUATOR</span>
              {/* Duplicate track content for seamless scroll */}
              <span className="flex items-center gap-1.5"><span className="text-[#ff3344]">◆</span> AURA-1 ROVER SYNC ESTABLISHED ON CHANNEL BROADCAST 12</span>
              <span className="flex items-center gap-1.5"><span className="text-[#ff3344]">◆</span> CAMERA PAYLOAD ACQUIRED STABLE STREAM AT H.264 HD v2.4</span>
              <span className="flex items-center gap-1.5"><span className="text-[#ff3344]">◆</span> LIDAR TELEMETRY DETECTED TARGET ANOMALY IN SECTOR E-8</span>
              <span className="flex items-center gap-1.5"><span className="text-[#ff3344]">◆</span> FLIGHT VECTOR VECTORING COMPLETED VIA OVERRIDE ACTUATOR</span>
            </div>
          </div>
        </section>

        {/* Dynamic Mobile Menu Slide-over */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileMenuOpen(false)}
                className="lg:hidden fixed inset-0 bg-black z-40"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "tween", duration: 0.2 }}
                className="lg:hidden fixed top-0 bottom-0 left-0 w-64 bg-gradient-to-b from-[#160608] to-[#0d0304] border-r border-[#ff3344]/20 z-50 flex flex-col"
              >
                <div className="h-16 px-6 border-b border-[#ff3344]/15 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <span className="w-2 h-2 rounded-full bg-[#ff3344] animate-pulse"></span>
                    <span className="text-xs font-black tracking-[0.25em] font-mono text-white uppercase">AURANEXUS</span>
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-2.5">
                  {SIDEBAR_LINKS.map((link) => {
                    const Icon = link.icon;
                    const active = pathname === link.href;
                    return (
                      <Link key={link.href} href={link.href} className="block" onClick={() => setMobileMenuOpen(false)}>
                        <button className={`w-full flex items-center gap-4 px-4 py-3 rounded-lg font-mono text-xs uppercase tracking-widest transition-all border ${
                          active
                            ? "border-[#ff3344] text-white bg-[#ff3344]/15 shadow-[0_0_15px_rgba(255,51,68,0.25)] font-bold"
                            : "border-transparent text-zinc-400 hover:text-white hover:border-[#ff3344]/30 hover:bg-[#ff3344]/5"
                        }`}>
                          <Icon className={`w-5 h-5 ${active ? "text-[#ff3344]" : "text-zinc-500"}`} />
                          <span>{link.label}</span>
                        </button>
                      </Link>
                    );
                  })}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Scrollable Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>

      </div>
    </div>
  );
}
