"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTelemetry } from "@/context/TelemetryContext";
import { Terminal, Send, Minimize2, Maximize2, Sparkles, X, ChevronRight } from "lucide-react";

export default function AuraTerminal() {
  const { logs, runAICommand, clearLogs } = useTelemetry();
  const [command, setCommand] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "AURANEXUS AI terminal initialized.",
    "AURA Core v2.4 standing by. Enter a command or query.",
    "Type '/help' for a full list of system directives.",
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!command.trim()) return;

    const cmdText = command.trim();
    setTerminalLogs((prev) => [...prev, `> ${cmdText}`]);
    setCommand("");

    // Simulate thinking delay
    setTimeout(() => {
      if (cmdText.toLowerCase() === "/clear") {
        clearLogs();
        setTerminalLogs(["SYSTEM CONSOLE LOG BUFFER PURGED."]);
      } else {
        const response = runAICommand(cmdText);
        // Break response by newlines
        const lines = response.split("\n");
        setTerminalLogs((prev) => [...prev, ...lines]);
      }
    }, 400);
  };

  return (
    <>
      {/* Floating Orb trigger when closed */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full glass-panel border-cyan-500/40 flex items-center justify-center cursor-pointer shadow-[0_0_20px_rgba(0,240,255,0.4)] group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 animate-pulse"></div>
            {/* Glowing sphere audio lines */}
            <div className="flex items-center gap-1">
              <span className="w-1 h-4 bg-cyan-400 rounded-full sound-wave-bar" style={{ animationDelay: "0.1s" }}></span>
              <span className="w-1 h-7 bg-blue-400 rounded-full sound-wave-bar" style={{ animationDelay: "0.3s" }}></span>
              <span className="w-1 h-5 bg-cyan-300 rounded-full sound-wave-bar" style={{ animationDelay: "0.5s" }}></span>
              <span className="w-1 h-8 bg-purple-400 rounded-full sound-wave-bar" style={{ animationDelay: "0.2s" }}></span>
              <span className="w-1 h-4 bg-cyan-400 rounded-full sound-wave-bar" style={{ animationDelay: "0.4s" }}></span>
            </div>
            <div className="absolute -bottom-1 text-[8px] font-mono text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity">AURA</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expanded Terminal Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 100 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-6 right-6 z-50 w-[90vw] sm:w-[450px] h-[380px] glass-panel border-cyan-500/30 flex flex-col shadow-[0_15px_50px_rgba(0,0,0,0.8)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center justify-center">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 ai-pulse"></div>
                </div>
                <span className="text-xs font-mono tracking-wider font-semibold text-cyan-400 flex items-center gap-1">
                  AURA_CORE <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: "8s" }} />
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrolling Console Area */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-zinc-300 space-y-2 select-text bg-black/30">
              {terminalLogs.map((log, index) => {
                const isUser = log.startsWith("> ");
                return (
                  <div
                    key={index}
                    className={`leading-relaxed whitespace-pre-wrap ${
                      isUser
                        ? "text-cyan-400 font-bold"
                        : log.startsWith("ERROR")
                        ? "text-red-400"
                        : log.startsWith("SYSTEM") || log.startsWith("TRANSITIONED") || log.startsWith("HALT")
                        ? "text-emerald-400"
                        : "text-zinc-300"
                    }`}
                  >
                    {!isUser && <span className="text-zinc-600 mr-1.5">[AURA]</span>}
                    {log}
                  </div>
                );
              })}
              <div ref={terminalEndRef} />
            </div>

            {/* Quick Command Suggestion Bar */}
            <div className="px-4 py-1.5 bg-black/40 border-t border-white/5 flex gap-1.5 overflow-x-auto shrink-0 select-none">
              {["/help", "/scan", "/battery", "/optics thermal", "/mode manual"].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setCommand(suggestion)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 hover:bg-cyan-500/10 hover:text-cyan-300 border border-white/5 text-zinc-500 transition-colors whitespace-nowrap"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="p-3 bg-white/5 border-t border-white/5 flex gap-2">
              <div className="relative flex-1 flex items-center">
                <ChevronRight className="absolute left-2.5 w-4 h-4 text-cyan-500" />
                <input
                  type="text"
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Ask AURA or compile directive..."
                  className="w-full pl-8 pr-3 py-2 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                  autoFocus
                />
              </div>
              <button
                type="submit"
                className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-500/30 hover:bg-cyan-500 hover:text-black hover:border-transparent flex items-center justify-center text-cyan-400 transition-all shadow-[0_0_10px_rgba(0,240,255,0.1)]"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
