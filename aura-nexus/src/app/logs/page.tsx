"use client";

import React, { useState, useEffect, useRef } from "react";
import AuraShell from "@/components/AuraShell";
import { useTelemetry } from "@/context/TelemetryContext";
import { Terminal, Download, Trash2, Send, Cpu, Wifi, HardDrive } from "lucide-react";

export default function ActivityLogs() {
  const { logs, clearLogs, addLog, isDeviceConnected, toggleDeviceConnection } = useTelemetry();
  const [filter, setFilter] = useState<"all" | "info" | "warning" | "error" | "success">("all");
  const [cliInput, setCliInput] = useState("");
  const [consoleMessages, setConsoleMessages] = useState<Array<{ id: string; time: string; type: string; text: string }>>([]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Pre-populate system boot logs when the component mounts
  useEffect(() => {
    const timeStr = () => new Date().toLocaleTimeString("en-US", { hour12: false });
    const bootLogs = [
      { id: "b1", time: timeStr(), type: "info", text: "AURANEXUS OS [v3.42.0] core booting up..." },
      { id: "b2", time: timeStr(), type: "info", text: "Verifying hardware abstraction layers (HAL)..." },
      { id: "b3", time: timeStr(), type: "success", text: "Internal memory registers initialized successfully." },
      { id: "b4", time: timeStr(), type: "info", text: "LIDAR telemetry module loaded: standing by for 3D SLAM feed." },
      { id: "b5", time: timeStr(), type: "warning", text: "LIDAR warning: Calibration cache stale, local heuristics active." },
      { id: "b6", time: timeStr(), type: "info", text: "AI Spectral model (AuraCrop-v2.4) compiled on client browser GPU." },
    ];
    setConsoleMessages(bootLogs);
  }, []);

  // Sync context logs with console messages
  useEffect(() => {
    if (logs.length > 0) {
      setConsoleMessages((prev) => {
        const existingTexts = new Set(prev.map(p => p.text));
        const newLogs = logs
          .filter(l => !existingTexts.has(l.text))
          .map(l => ({ id: l.id, time: l.timestamp, type: l.type, text: l.text }));
        return [...prev, ...newLogs];
      });
    }
  }, [logs]);

  // Scroll to bottom on log updates
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [consoleMessages]);

  const filteredLogs = consoleMessages.filter((log) => {
    if (filter === "all") return true;
    return log.type === filter;
  });

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cliInput.trim()) return;

    const cmd = cliInput.trim().toLowerCase();
    const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
    
    // Add user typed command
    const userLog = { id: `user-${Date.now()}`, time: timeStr, type: "info", text: `operator@auranexus:~$ ${cliInput}` };
    setConsoleMessages((prev) => [...prev, userLog]);
    setCliInput("");

    setTimeout(() => {
      let replyType = "info";
      let replyText = "";

      if (cmd === "/help" || cmd === "help") {
        replyText = "SUPPORTED COMMANDS: /clear, /ping, /sysinfo, /override, /connect, /help";
      } else if (cmd === "/clear" || cmd === "clear") {
        setConsoleMessages([]);
        clearLogs();
        return;
      } else if (cmd === "/ping" || cmd === "ping") {
        replyType = isDeviceConnected ? "success" : "error";
        replyText = isDeviceConnected 
          ? "PING SUCCESS: ESP32-S3 latency: 12ms, packet loss: 0%."
          : "PING FAILED: Connection timeout. Handshake target host unreachable.";
      } else if (cmd === "/sysinfo" || cmd === "sysinfo") {
        replyType = "success";
        replyText = "SYS_INFO: Core: ESP32-S3 Tensilica LX7 | Ram: 8MB PSRAM | Signal: -62dBm | Battery: 89%";
      } else if (cmd === "/override" || cmd === "override") {
        replyType = "error";
        replyText = "CRITICAL: Global system lock engaged via CLI. Servo controllers halted.";
        addLog("CRITICAL OVERRIDE: Global system lock ENGAGED via CLI.", "error");
      } else if (cmd === "/connect" || cmd === "connect") {
        if (isDeviceConnected) {
          replyText = "SYSTEM: Connection already active.";
        } else {
          toggleDeviceConnection(true);
          replyType = "success";
          replyText = "SYSTEM: Establishing connection handshake... Connection successful!";
        }
      } else {
        replyType = "warning";
        replyText = `Command not recognized: "${cmd}". Type /help for assistance.`;
      }

      setConsoleMessages((prev) => [
        ...prev,
        { id: `reply-${Date.now()}`, time: timeStr, type: replyType, text: replyText }
      ]);
    }, 300);
  };

  const exportLogs = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(consoleMessages, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `aura_logs_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addLog("Operator exported local system logs to disk.", "success");
  };

  return (
    <AuraShell>
      <div className="grid grid-cols-12 gap-6">
        
        {/* Left: Terminal Console Block (8 Cols) */}
        <div className="col-span-12 lg:col-span-9 space-y-4">
          <div className="backdrop-blur-md bg-zinc-950/70 border border-[#ff3344]/25 shadow-[0_0_20px_rgba(255,51,68,0.1)] rounded-xl overflow-hidden flex flex-col h-[600px]">
            
            {/* Terminal Top Control Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ff3344]/15 bg-black/40 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <Terminal className="w-5 h-5 text-[#ff3344] drop-shadow-[0_0_6px_rgba(255,51,68,0.5)] animate-pulse" />
                <div>
                  <h3 className="text-xs font-bold text-white font-mono uppercase tracking-wider">SYSTEM LOG DIRECTORY</h3>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase tracking-widest mt-0.5">REAL-TIME OPERATIONAL TRANSLATION STACK</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {/* Filter tabs */}
                <div className="flex items-center gap-1 p-1 rounded-lg bg-black/60 border border-zinc-800/80">
                  {(["all", "info", "warning", "error", "success"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilter(type)}
                      className={`text-[9px] font-mono px-2.5 py-1 rounded-md uppercase transition-all duration-250 ${
                        filter === type
                          ? "bg-[#ff3344]/15 text-[#ff3344] border border-[#ff3344]/40 shadow-[0_0_8px_rgba(255,51,68,0.2)] font-bold"
                          : "text-zinc-400 hover:text-zinc-200 border border-transparent"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <button
                  onClick={exportLogs}
                  title="Export Logs"
                  className="p-2 rounded-lg bg-zinc-900/60 border border-zinc-800 hover:border-[#ff3344]/40 text-zinc-400 hover:text-white transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => {
                    clearLogs();
                    setConsoleMessages([]);
                  }}
                  title="Clear Console"
                  className="p-2 rounded-lg bg-red-950/20 border border-red-900/40 hover:border-red-500 text-red-400 hover:text-red-350 transition-all shadow-md"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* CRT styled message display */}
            <div className="flex-1 overflow-y-auto p-6 font-mono text-xs space-y-2.5 select-text scrollbar-thin bg-black/80 relative scanlines">
              {filteredLogs.length === 0 ? (
                <div className="text-center text-zinc-500 py-24 uppercase tracking-widest text-[10px]">
                  NO SYSTEM RECORDS MATCHING ACTIVE FILTER
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 py-1.5 border-b border-zinc-900/40 last:border-0 hover:bg-[#ff3344]/3 transition-all rounded px-2">
                    <span className="text-zinc-500 text-[10px] shrink-0 pt-0.5">[{log.time}]</span>
                    
                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest shrink-0 border ${
                      log.type === "success" ? "bg-red-950/25 border-red-900/60 text-[#ff3344] shadow-[0_0_6px_rgba(255,51,68,0.1)]" :
                      log.type === "warning" ? "bg-amber-950/20 border-amber-900/40 text-amber-400" :
                      log.type === "error" ? "bg-red-950/40 border-red-900/80 text-red-500 animate-pulse font-extrabold" :
                      "bg-zinc-900/80 border-zinc-800 text-zinc-400"
                    }`}>
                      {log.type}
                    </span>

                    <span className={`leading-relaxed text-[11px] ${
                      log.type === "success" ? "text-zinc-200" :
                      log.type === "warning" ? "text-amber-300" :
                      log.type === "error" ? "text-red-450" :
                      "text-zinc-300"
                    }`}>
                      {log.text}
                    </span>
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>

            {/* Command-Line Interactive Input Panel */}
            <form onSubmit={handleCliSubmit} className="border-t border-[#ff3344]/15 bg-black/90 p-4 flex items-center gap-3">
              <span className="text-[#ff3344] font-mono text-xs font-bold pl-2">operator@auranexus:~$</span>
              <input
                type="text"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                placeholder="Type command (e.g. /help, /ping, /connect)..."
                className="flex-1 bg-transparent border-0 outline-0 ring-0 focus:outline-none focus:ring-0 text-white font-mono text-xs placeholder-zinc-650"
              />
              <button
                type="submit"
                className="p-2 rounded-lg bg-[#ff3344] hover:bg-[#ff4455] text-white transition-all shadow-[0_0_10px_rgba(255,51,68,0.3)]"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>

        {/* Right: Subsystem Status (3 Cols) */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          
          <div className="backdrop-blur-md bg-zinc-950/70 border border-[#ff3344]/25 shadow-[0_0_20px_rgba(255,51,68,0.1)] rounded-xl p-5 space-y-4">
            <h4 className="text-xs font-bold font-mono uppercase text-white tracking-widest border-b border-[#ff3344]/15 pb-2">Subsystems</h4>
            
            <div className="space-y-3 font-mono text-[10px]">
              <div className="p-3 bg-black/40 border border-zinc-900 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#ff3344]" />
                  <span className="text-zinc-400">CORE PROCESSOR</span>
                </div>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>

              <div className="p-3 bg-black/40 border border-zinc-900 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-[#ff3344]" />
                  <span className="text-zinc-400">ESP32 TRANSCEIVER</span>
                </div>
                <span className={isDeviceConnected ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                  {isDeviceConnected ? "CONNECTED" : "OFFLINE"}
                </span>
              </div>

              <div className="p-3 bg-black/40 border border-zinc-900 rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#ff3344]" />
                  <span className="text-zinc-400">LIDAR CACHE DRIVER</span>
                </div>
                <span className="text-emerald-400 font-bold">READY</span>
              </div>
            </div>
          </div>

          <div className="backdrop-blur-md bg-zinc-950/70 border border-[#ff3344]/25 shadow-[0_0_20px_rgba(255,51,68,0.1)] rounded-xl p-5 font-mono text-[10px] space-y-3">
            <h4 className="text-xs font-bold uppercase text-white tracking-widest border-b border-[#ff3344]/15 pb-2">CLI Help Docs</h4>
            <p className="text-zinc-400 leading-relaxed">Type the following command triggers directly inside the console line:</p>
            <ul className="space-y-1.5 text-zinc-300">
              <li>• <span className="text-[#ff3344] font-bold">/help</span> - List options</li>
              <li>• <span className="text-[#ff3344] font-bold">/ping</span> - Test ping to device</li>
              <li>• <span className="text-[#ff3344] font-bold">/sysinfo</span> - Print system diagnostics</li>
              <li>• <span className="text-[#ff3344] font-bold">/connect</span> - Handshake device</li>
              <li>• <span className="text-[#ff3344] font-bold">/override</span> - Global lockout</li>
            </ul>
          </div>
        </div>

      </div>
    </AuraShell>
  );
}
