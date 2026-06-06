import type { Metadata } from "next";
import "./globals.css";
import { TelemetryProvider } from "@/context/TelemetryContext";

export const metadata: Metadata = {
  title: "AURANEXUS | AI Robotics OS",
  description: "Autonomous Robotic command interface for Team AURA. Integrating Smart Agriculture, Surveillance, Navigation, and Environmental Telemetry.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth select-none">
      <body className="min-h-screen bg-[#030305] text-[#e2e8f0] antialiased overflow-x-hidden font-sans">
        {/* Futuristic background elements */}
        <div className="gradient-mesh"></div>
        <div className="fixed inset-0 cyber-grid pointer-events-none z-0"></div>
        
        {/* Core content wrapper wrapped in TelemetryProvider */}
        <TelemetryProvider>
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </TelemetryProvider>
      </body>
    </html>
  );
}
