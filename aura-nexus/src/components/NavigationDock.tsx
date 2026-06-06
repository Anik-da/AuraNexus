"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  LayoutDashboard,
  Gamepad2,
  Brain,
  Video,
  Compass,
  Activity,
  Terminal as TerminalIcon,
  History,
  User,
  Sliders,
  LogIn,
  Menu,
  X,
  Cpu
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  color: string;
}

const navItems: NavItem[] = [
  { name: "Home", href: "/", icon: Home, color: "text-zinc-400 hover:text-white" },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, color: "text-cyan-400 hover:text-cyan-300" },
  { name: "Control Center", href: "/control", icon: Gamepad2, color: "text-blue-400 hover:text-blue-300" },
  { name: "AI Detections", href: "/detections", icon: Brain, color: "text-purple-400 hover:text-purple-300" },
  { name: "Live Stream", href: "/streaming", icon: Video, color: "text-rose-400 hover:text-rose-300" },
  { name: "Navigation", href: "/navigation", icon: Compass, color: "text-emerald-400 hover:text-emerald-300" },
  { name: "Sensor Analytics", href: "/analytics", icon: Activity, color: "text-amber-400 hover:text-amber-300" },
  { name: "Activity Logs", href: "/logs", icon: TerminalIcon, color: "text-sky-400 hover:text-sky-300" },
  { name: "Missions", href: "/missions", icon: History, color: "text-indigo-400 hover:text-indigo-300" },
  { name: "Profile", href: "/profile", icon: User, color: "text-zinc-300 hover:text-white" },
  { name: "Admin OS", href: "/admin", icon: Sliders, color: "text-red-400 hover:text-red-300" },
];

export default function NavigationDock() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Desktop Floating Side Navigation Dock (Apple Vision Pro/Nothing OS Style) */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed left-6 top-1/2 -translate-y-1/2 hidden xl:flex flex-col items-center gap-4 py-6 px-3 glass-panel z-50 border-white/10"
      >
        <Link href="/">
          <div className="flex items-center justify-center w-11 h-11 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 mb-4 cursor-pointer hover:bg-cyan-500/20 transition-all hover:scale-110">
            <Cpu className="w-5 h-5 ai-pulse" />
          </div>
        </Link>

        <div className="flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link key={item.name} href={item.href}>
                <div className="relative group flex items-center justify-center">
                  <motion.div
                    whileHover={{ scale: 1.15 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,240,255,0.2)]"
                        : "text-zinc-400 hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.div>
                  
                  {/* Tooltip */}
                  <div className="absolute left-16 px-2 py-1 rounded bg-black/80 border border-white/10 text-xs font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                    {item.name}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="w-full h-[1px] bg-white/10 my-2"></div>

        <Link href="/login">
          <motion.div
            whileHover={{ scale: 1.1 }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent cursor-pointer`}
          >
            <LogIn className="w-5 h-5" />
          </motion.div>
        </Link>
      </motion.div>

      {/* Mobile/Tablet Glass Navbar */}
      <div className="fixed top-0 inset-x-0 h-16 xl:hidden glass-panel rounded-none border-b border-t-0 border-x-0 border-white/10 flex items-center justify-between px-6 z-50">
        <Link href="/">
          <div className="flex items-center gap-2 text-cyan-400 font-bold tracking-wider font-mono">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>AURA_NEXUS</span>
          </div>
        </Link>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-zinc-400 hover:text-white rounded-lg focus:outline-none"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-16 bg-[#090a0f]/95 backdrop-blur-xl border-b border-white/10 z-40 py-6 px-8 flex flex-col gap-3 max-h-[85vh] overflow-y-auto xl:hidden"
          >
            <p className="text-[10px] font-mono text-zinc-500 tracking-widest uppercase mb-2">OS Navigation Menu</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link key={item.name} href={item.href} onClick={() => setIsOpen(false)}>
                    <div
                      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                        isActive
                          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300"
                          : "bg-white/5 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <div className="h-[1px] bg-white/10 my-2"></div>

            <Link href="/login" onClick={() => setIsOpen(false)}>
              <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-cyan-500 text-white font-medium text-center text-sm shadow-[0_0_15px_rgba(0,240,255,0.25)]">
                <LogIn className="w-4 h-4" />
                <span>Operator Log In</span>
              </div>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
