"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid, OrbitControls } from "@react-three/drei";
import { motion } from "framer-motion";
import { Cpu, ArrowRight, Shield, Zap, Target, Compass, Activity, Eye, ShieldAlert } from "lucide-react";
import * as THREE from "three";

// Interactive 3D Robot model for the Hero Orb Panel
function InteractiveHeroRobot() {
  const groupRef = useRef<THREE.Group>(null);
  const radarRef = useRef<THREE.Mesh>(null);
  const eyeRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();
    const { x, y } = state.pointer; // Mouse coordinates normalized between -1 and 1

    if (groupRef.current) {
      // Float animation
      groupRef.current.position.y = Math.sin(elapsed * 1.5) * 0.1;
      
      // Rotate towards mouse pointer position
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, x * 0.6, 0.1);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, -y * 0.4, 0.1);
    }

    if (radarRef.current) {
      radarRef.current.rotation.y = elapsed * 3.5;
    }

    if (eyeRef.current) {
      const pulse = (Math.sin(elapsed * 6) + 1) / 2;
      const mat = eyeRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        // Pulse red intensity
        mat.color.setRGB(0.7 + pulse * 0.3, 0.02, 0.05);
      }
    }
  });

  return (
    <group ref={groupRef} scale={1.35} position={[0, -0.25, 0]}>
      {/* Robot Base */}
      <mesh castShadow position={[0, -0.15, 0]}>
        <boxGeometry args={[1.7, 0.3, 1.1]} />
        <meshStandardMaterial color="#0b0b0d" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Main Core Cylinder */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.5, 0.7, 0.5, 16]} />
        <meshStandardMaterial color="#101012" metalness={0.95} roughness={0.05} />
      </mesh>

      {/* Red Camera Eye */}
      <mesh ref={eyeRef} position={[0.55, 0.28, 0]}>
        <sphereGeometry args={[0.13, 16, 16]} />
        <meshBasicMaterial color="#ff3344" />
      </mesh>

      {/* Rotating radar dish */}
      <mesh ref={radarRef} position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 0.06, 12]} />
        <meshStandardMaterial color="#ff3344" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Scanning cone helper */}
      <mesh position={[1.0, 0.15, 0]} rotation={[0, 0, Math.PI / 2.6]}>
        <coneGeometry args={[0.25, 1.0, 4, 1, true]} />
        <meshBasicMaterial color="#ff3344" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Glowing Lidar telemetry background stream
function LidarTelemetryStream({ count = 120 }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 3.0 + Math.random() * 4.0;
      arr[i * 3] = Math.cos(angle) * radius;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 3.0;
      arr[i * 3 + 2] = Math.sin(angle) * radius;
    }
    return arr;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#ff3344" size={0.03} transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

export default function RedesignedLandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-[#030306] text-[#f4f4f5] selection:bg-zinc-800 selection:text-white font-sans antialiased overflow-x-hidden relative">
      
      {/* Background Lidar Canvas */}
      <div className="fixed inset-0 -z-10 w-full h-full pointer-events-none">
        {mounted && (
          <Canvas camera={{ position: [0, 1.5, 6], fov: 60 }}>
            <color attach="background" args={["#030306"]} />
            <ambientLight intensity={0.15} />
            <pointLight position={[5, 5, 5]} intensity={1.0} color="#ff3344" />
            
            <LidarTelemetryStream count={160} />
            
            <Grid
              position={[0, -2.5, 0]}
              args={[16, 16]}
              cellSize={0.8}
              cellThickness={0.4}
              cellColor="#2c0507"
              sectionSize={4}
              sectionThickness={0.7}
              sectionColor="#ff3344"
              fadeDistance={22}
              infiniteGrid
            />
          </Canvas>
        )}
      </div>

      {/* Header bar */}
      <header className="w-full h-16 border-b border-zinc-800 bg-black/40 backdrop-blur-md sticky top-0 z-50 px-6 md:px-12 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center">
            <Cpu className="w-4 h-4 text-[#ff3344]" />
          </div>
          <span className="text-sm font-bold tracking-widest font-mono text-white">AURANEXUS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <button className="text-[10px] font-mono uppercase tracking-wider py-1.5 px-3.5 rounded bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white transition-all">
              Operator Log In
            </button>
          </Link>
          <Link href="/dashboard">
            <button className="text-[10px] font-mono uppercase tracking-wider py-1.5 px-3.5 rounded bg-[#ff3344]/10 border border-[#ff3344] text-[#ff3344] hover:bg-[#ff3344]/20 transition-all shadow-[0_0_8px_rgba(255,51,68,0.2)] font-bold">
              Enter Console
            </button>
          </Link>
        </div>
      </header>

      {/* News-Shell container conforming to requested design grid */}
      <main className="news-shell space-y-12 px-4 md:px-6 relative z-10">
        
        {/* Hero Panel: Splits into Copy (left) and Interactive 3D Orb (right) */}
        <section className="hero-panel" aria-labelledby="dashboard-title">
          
          <div className="hero-copy flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
              <p className="eyebrow !m-0">AURA LATTICE OPERATIONS ACTIVE</p>
            </div>

            <h1 id="dashboard-title" className="text-white font-sans uppercase font-extrabold text-4xl sm:text-5xl md:text-6xl tracking-tight leading-none !mb-2">
              Autonomous Command & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff3344] to-[#cc1f2f]">
                Robotics Control OS
              </span>
            </h1>

            <p className="hero-lede">
              A modular multi-agent operating system coordinating smart farming diagnostics, autonomous patrol lines, and SLAM navigation mappings under a unified WebGL flight console.
            </p>

            <div className="control-strip" aria-label="News feed controls">
              <Link href="/dashboard">
                <button className="control-button is-active px-6 py-2.5 font-bold font-mono text-xs uppercase tracking-widest flex items-center gap-2">
                  <span>LAUNCH COMMAND CENTER</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
              <Link href="/signup">
                <button className="control-button px-6 py-2.5 font-bold font-mono text-xs uppercase tracking-widest">
                  REQUEST COMPILER KEY
                </button>
              </Link>
            </div>
          </div>

          {/* Hero Orb Panel: 3D model with rotating scanning rings */}
          <aside className="hero-orb flex items-center justify-center" aria-label="Global signal visualization">
            <div className="relative w-72 h-72 md:w-80 md:h-80 rounded-full border border-red-500/25 bg-gradient-to-br from-red-500/10 to-rose-950/5 shadow-[0_0_60px_rgba(255,51,68,0.2)] overflow-hidden flex items-center justify-center">
              
              {/* Concentric rotating neon scan-rings */}
              <div className="absolute inset-4 border border-red-500/20 rounded-full animate-[spin_25s_linear_infinite]" style={{ transform: "rotateX(62deg) rotateY(15deg)" }}></div>
              <div className="absolute inset-10 border border-dashed border-red-500/30 rounded-full animate-[spin_12s_linear_infinite_reverse]" style={{ transform: "rotateX(30deg) rotateY(45deg)" }}></div>
              
              {/* Three.js Interactive Canvas inside orb */}
              <div className="w-full h-full absolute inset-0 z-0">
                {mounted && (
                  <Canvas camera={{ position: [0, 1.2, 4.2], fov: 60 }}>
                    <ambientLight intensity={0.25} />
                    <pointLight position={[4, 4, 4]} intensity={1.5} color="#ff3344" />
                    <InteractiveHeroRobot />
                  </Canvas>
                )}
              </div>

              {/* Glass Scanline overlay */}
              <div className="absolute inset-0 pointer-events-none z-10 scanlines bg-gradient-to-tr from-white/0 via-white/5 to-white/10 mix-blend-overlay"></div>

              {/* Status Box overlay */}
              <div className="absolute bottom-6 px-4 py-1.5 border border-red-500/20 rounded-full bg-black/85 backdrop-blur-md text-center min-w-[130px] shadow-lg z-20">
                <p className="text-[8px] font-mono text-zinc-500 uppercase tracking-widest leading-none">Diagnostic Link</p>
                <strong className="text-xs font-mono text-[#ff3344] font-bold block mt-1">
                  SECURE FEED
                </strong>
              </div>
            </div>
          </aside>

        </section>

        {/* System Alerts Ticker Marquee */}
        <section className="ticker">
          <div className="ticker-label">SYSTEM_ALERTS</div>
          <div className="ticker-window">
            <div className="ticker-track ticker-track-animation font-mono text-[10px] uppercase">
              <span className="flex items-center gap-1.5 text-zinc-400">AURA-1 ROVER SYNC ESTABLISHED ON CHANNEL BROADCAST 12</span>
              <span className="flex items-center gap-1.5 text-zinc-400">CAMERA PAYLOAD ACQUIRED STABLE STREAM AT H.264 HD v2.4</span>
              <span className="flex items-center gap-1.5 text-zinc-400">LIDAR TELEMETRY DETECTED TARGET ANOMALY IN SECTOR E-8</span>
              <span className="flex items-center gap-1.5 text-zinc-400">FLIGHT VECTOR VECTORING COMPLETED VIA OVERRIDE ACTUATOR</span>
              {/* Duplicate contents for loop */}
              <span className="flex items-center gap-1.5 text-zinc-400">AURA-1 ROVER SYNC ESTABLISHED ON CHANNEL BROADCAST 12</span>
              <span className="flex items-center gap-1.5 text-zinc-400">CAMERA PAYLOAD ACQUIRED STABLE STREAM AT H.264 HD v2.4</span>
              <span className="flex items-center gap-1.5 text-zinc-400">LIDAR TELEMETRY DETECTED TARGET ANOMALY IN SECTOR E-8</span>
              <span className="flex items-center gap-1.5 text-zinc-400">FLIGHT VECTOR VECTORING COMPLETED VIA OVERRIDE ACTUATOR</span>
            </div>
          </div>
        </section>

        {/* Specifications Section styled as the Feed Grid */}
        <section className="space-y-6 pt-6">
          <div className="text-center space-y-2">
            <p className="panel-kicker text-xs font-mono tracking-widest text-[#ff3344] uppercase font-bold">TACTICAL MULTI-AGENT SPECIFICATIONS</p>
            <h2 className="text-3xl font-mono uppercase tracking-tight text-white">System Modality</h2>
          </div>

          <div className="feed-list">
            {[
              {
                title: "Smart Agriculture",
                desc: "High-resolution bioscan analysis classification. Identifies weeds, blight, and nutrient deficiencies directly on edge nodes.",
                topic: "CLASSIFIER",
                impact: "HIGH IMPACT",
                featured: true,
              },
              {
                title: "Autonomous Surveillance",
                desc: "Continuous perimeter patrol sweep. Infrared night thermal vision tracking and perimeter breach alert system.",
                topic: "SURVEILLANCE",
                impact: "ACTIVE FEED",
                featured: false,
              },
              {
                title: "Indoor Navigation",
                desc: "Real-time SLAM route mapping, lidar path planning coordinates, and obstacle avoidance maneuvers.",
                topic: "NAVIGATION",
                impact: "REAL-TIME",
                featured: false,
              },
              {
                title: "Personal AI Core",
                desc: "Direct terminal command compilation. Translates text/voice queries into immediate thrust vector execution.",
                topic: "COGNITIVE",
                impact: "LOCAL LLM",
                featured: false,
              },
              {
                title: "Environmental Monitoring",
                desc: "Monitors temperature metrics, relative humidity, methane leaks, and soil moisture statistics.",
                topic: "METRICS",
                impact: "TELEMETRY",
                featured: false,
              },
              {
                title: "Tactical Live Streaming",
                desc: "Sinks real-time OSD camera feed with object recognition bounding indicators, latency readouts, and flight statistics.",
                topic: "VIDEO FEED",
                impact: "H.264 HD",
                featured: true,
              },
            ].map((feat, idx) => (
              <article
                key={idx}
                className={`feed-item ${feat.featured ? "is-featured" : ""}`}
              >
                <div className="card-topline">
                  <span className="topic-pill">{feat.topic}</span>
                  <span className="impact-pill">{feat.impact}</span>
                </div>
                
                <h3 className="text-white font-mono font-bold uppercase tracking-wide">{feat.title}</h3>
                <p className="text-zinc-400 text-xs leading-relaxed font-mono mt-2">{feat.desc}</p>
                
                <div className="card-actions">
                  <button className="mini-action px-3 py-1 font-mono text-[9px] uppercase tracking-wider">
                    LAUNCH OVERRIDE
                  </button>
                  <button className="mini-action px-3 py-1 font-mono text-[9px] uppercase tracking-wider">
                    MONITOR FEED
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Live Diagnostics section styled matching feed block details */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-6">
          
          <div className="feed-item is-featured flex flex-col justify-center p-8">
            <span className="topic-pill w-max mb-4">COMPUTER VISION NETWORKS</span>
            <h3 className="text-3xl font-mono uppercase text-white font-bold leading-none">Inference Classifiers</h3>
            <p className="text-zinc-400 text-sm leading-relaxed font-mono mt-4">
              AURANEXUS drives state-of-the-art YOLO detection systems and plant disease diagnostic classifiers directly on the edge. High-confidence bounding tags and diagnostic metrics route immediately into the centralized dashboard.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 font-mono text-xs">
              <div className="p-4 rounded bg-black/40 border border-zinc-800 flex flex-col">
                <span className="text-[9px] text-zinc-500 block uppercase">YOLOv8 DETECTOR TRACKING</span>
                <span className="text-red-400 font-bold text-base mt-1">99.2% ACCURACY</span>
              </div>
              <div className="p-4 rounded bg-black/40 border border-zinc-800 flex flex-col">
                <span className="text-[9px] text-zinc-500 block uppercase">NDVI DIAGNOSTICS LATENCY</span>
                <span className="text-red-400 font-bold text-base mt-1">0.05s DELAY</span>
              </div>
            </div>
          </div>

          <div className="feed-item flex flex-col justify-between p-8">
            <div className="card-topline">
              <span className="topic-pill">VISUAL LOG</span>
              <span className="impact-pill">EDGE MODEL</span>
            </div>
            
            <h3 className="text-white font-mono font-bold uppercase tracking-wide">Diagnostic Snapshot Preview</h3>
            
            <div className="aspect-video w-full rounded bg-black border border-zinc-800 flex items-center justify-center relative overflow-hidden scanlines mt-4 flex-1">
              <div className="absolute top-3 left-3 text-[8px] font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 text-zinc-400">
                FRAME_AI_SCANNING
              </div>
              <div className="absolute border border-[#ff3344] bg-[#ff3344]/15 text-[8px] font-mono text-[#ff3344] px-2 py-0.5 rounded shadow-[0_0_8px_rgba(255,51,68,0.2)]" style={{ top: "30%", left: "35%", width: "32%", height: "36%" }}>
                CROP_LEAF (94.8%)
              </div>
              <span className="text-[9px] font-mono text-zinc-700">edge_classifier_active</span>
            </div>
          </div>

        </section>

      </main>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-800 py-8 text-center text-zinc-650 text-[9px] font-mono bg-black/25 relative z-10 tracking-widest">
        <p>© 2026 TEAM AURA. SYSTEMS DEPLOYED ON ENTERPRISE GRAPHITE SERVERS.</p>
      </footer>
    </div>
  );
}
