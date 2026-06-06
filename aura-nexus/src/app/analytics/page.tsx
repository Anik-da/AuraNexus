"use client";

import React, { useState, useEffect } from "react";
import AuraShell from "@/components/AuraShell";
import { useTelemetry } from "@/context/TelemetryContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Activity, Thermometer, Droplets, ShieldAlert, Sparkles } from "lucide-react";

interface ChartDataPoint {
  time: string;
  temp: number;
  humidity: number;
  moisture: number;
}

export default function SensorAnalytics() {
  const { sensors } = useTelemetry();
  const [mounted, setMounted] = useState(false);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Initialize and append live data points
  useEffect(() => {
    setMounted(true);
    
    // Generate initial history
    const initial: ChartDataPoint[] = [];
    const now = Date.now();
    for (let i = 9; i >= 0; i--) {
      const timeStr = new Date(now - i * 5000).toLocaleTimeString("en-US", { hour12: false });
      initial.push({
        time: timeStr,
        temp: Number((23 + Math.random() * 3).toFixed(1)),
        humidity: Number((50 + Math.random() * 10).toFixed(1)),
        moisture: Number((40 + Math.random() * 5).toFixed(1)),
      });
    }
    setChartData(initial);
  }, []);

  // Listen to simulator changes and append
  useEffect(() => {
    if (!mounted) return;
    const timeStr = new Date().toLocaleTimeString("en-US", { hour12: false });
    
    setChartData((prev) => {
      const next = [
        ...prev,
        {
          time: timeStr,
          temp: sensors.temp,
          humidity: sensors.humidity,
          moisture: sensors.soilMoisture,
        },
      ];
      return next.slice(-15); // keep last 15 points
    });
  }, [sensors, mounted]);

  return (
    <AuraShell>
      <div className="space-y-6">
        
        {/* Real-time stats header strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="robotics-card p-4 flex items-center justify-between border-red-500/10 cyber-corners">
            <div>
              <span className="text-[10px] font-mono text-zinc-550 uppercase font-bold">Ambient Temperature</span>
              <p className="text-xl font-bold font-mono text-red-500 mt-1">{sensors.temp}°C</p>
            </div>
            <Thermometer className="w-8 h-8 text-red-500/20" />
          </div>

          <div className="robotics-card p-4 flex items-center justify-between border-red-500/10 cyber-corners">
            <div>
              <span className="text-[10px] font-mono text-zinc-555 uppercase font-bold">Air Humidity</span>
              <p className="text-xl font-bold font-mono text-red-400 mt-1">{sensors.humidity}%</p>
            </div>
            <Droplets className="w-8 h-8 text-red-500/20" />
          </div>

          <div className="robotics-card p-4 flex items-center justify-between border-red-500/10 cyber-corners">
            <div>
              <span className="text-[10px] font-mono text-zinc-550 uppercase font-bold">Soil Moisture</span>
              <p className="text-xl font-bold font-mono text-red-400 mt-1">{sensors.soilMoisture}%</p>
            </div>
            <Droplets className="w-8 h-8 text-red-500/20" />
          </div>

          <div className="robotics-card p-4 flex items-center justify-between border-red-500/10 cyber-corners">
            <div>
              <span className="text-[10px] font-mono text-zinc-555 uppercase font-bold">Methane (CH4)</span>
              <p className="text-xl font-bold font-mono text-red-400 mt-1">{sensors.methane} ppm</p>
            </div>
            <ShieldAlert className="w-8 h-8 text-red-500/20" />
          </div>
        </div>

        {/* Real-time moving charts */}
        {mounted && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Temp & Humidity Chart */}
            <div className="robotics-card p-6 space-y-4 cyber-corners">
              <h3 className="text-xs font-mono tracking-widest text-zinc-400 uppercase flex items-center gap-2 font-bold border-b border-zinc-800 pb-3">
                <Activity className="w-4 h-4 text-red-400" />
                <span>THERMAL & CLIMATE TRENDS</span>
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff3344" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#ff3344" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff0055" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ff0055" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,51,68,0.05)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ background: "#090a0f", borderColor: "rgba(255,51,68,0.1)", fontSize: 11, fontFamily: 'monospace' }} />
                    <Area name="Temp (°C)" type="monotone" dataKey="temp" stroke="#ff3344" fillOpacity={1} fill="url(#colorTemp)" />
                    <Area name="Hum (%)" type="monotone" dataKey="humidity" stroke="#ff0055" fillOpacity={1} fill="url(#colorHum)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Soil moisture chart */}
            <div className="robotics-card p-6 space-y-4 cyber-corners">
              <h3 className="text-xs font-mono tracking-widest text-zinc-400 uppercase flex items-center gap-2 font-bold border-b border-zinc-800 pb-3">
                <Sparkles className="w-4 h-4 text-red-400" />
                <span>SOIL SATURATION TELEMETRY</span>
              </h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorMoisture" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff4466" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#ff4466" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,51,68,0.05)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                    <YAxis stroke="rgba(255,255,255,0.3)" style={{ fontSize: 9, fontFamily: 'monospace' }} />
                    <Tooltip contentStyle={{ background: "#090a0f", borderColor: "rgba(255,51,68,0.1)", fontSize: 11, fontFamily: 'monospace' }} />
                    <Area name="Moisture (%)" type="monotone" dataKey="moisture" stroke="#ff4466" fillOpacity={1} fill="url(#colorMoisture)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuraShell>
  );
}
