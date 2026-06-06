"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useTelemetry } from "@/context/TelemetryContext";

interface NodePoint {
  position: [number, number, number];
  color: string;
  name: string;
}

const NODES: NodePoint[] = [
  // Input layer
  { position: [-2.5, 1.5, 0], color: "#ff3344", name: "In_Image" },
  { position: [-2.5, 0.5, 0.5], color: "#ff3344", name: "In_Audio" },
  { position: [-2.5, -0.5, -0.5], color: "#ff3344", name: "In_Lidar" },
  { position: [-2.5, -1.5, 0], color: "#ff3344", name: "In_Env" },
  // Hidden Layer 1
  { position: [-0.8, 1.8, 0.5], color: "#ff0055", name: "Conv_1" },
  { position: [-0.8, 0.6, -0.5], color: "#ff0055", name: "Conv_2" },
  { position: [-0.8, -0.6, 0.8], color: "#ff0055", name: "Pool_1" },
  { position: [-0.8, -1.8, -0.8], color: "#ff0055", name: "Pool_2" },
  // Hidden Layer 2
  { position: [0.8, 1.5, -0.5], color: "#ff4466", name: "Dense_1" },
  { position: [0.8, 0.3, 0.5], color: "#ff4466", name: "Dense_2" },
  { position: [0.8, -0.9, -0.3], color: "#ff4466", name: "Dense_3" },
  { position: [0.8, -2.1, 0.3], color: "#ff4466", name: "Dense_4" },
  // Output Layer
  { position: [2.5, 1.0, 0], color: "#ec4899", name: "Out_YOLOv8" },
  { position: [2.5, 0.0, 0.2], color: "#ec4899", name: "Out_NDVI" },
  { position: [2.5, -1.0, -0.2], color: "#ec4899", name: "Out_DINO" },
];

// Draw synaptic connections
function Connections() {
  const linePositions = React.useMemo(() => {
    const points: number[] = [];
    
    // Connect Input layer to Hidden Layer 1
    NODES.slice(0, 4).forEach((inputNode) => {
      NODES.slice(4, 8).forEach((hidden1Node) => {
        points.push(...inputNode.position);
        points.push(...hidden1Node.position);
      });
    });

    // Connect Hidden Layer 1 to Hidden Layer 2
    NODES.slice(4, 8).forEach((hidden1Node) => {
      NODES.slice(8, 12).forEach((hidden2Node) => {
        points.push(...hidden1Node.position);
        points.push(...hidden2Node.position);
      });
    });

    // Connect Hidden Layer 2 to Output Layer
    NODES.slice(8, 12).forEach((hidden2Node) => {
      NODES.slice(12, 15).forEach((outNode) => {
        points.push(...hidden2Node.position);
        points.push(...outNode.position);
      });
    });

    return new Float32Array(points);
  }, []);

  return (
    <lineSegments>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[linePositions, 3]}
          count={linePositions.length / 3}
          array={linePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#3a1015" transparent opacity={0.65} />
    </lineSegments>
  );
}

// Synaptic pulses moving along routes
function SynapticPulses() {
  const pulsesRef = useRef<THREE.Points>(null);
  const count = 35;

  const [positions] = useState(() => new Float32Array(count * 3));
  const [pulseData] = useState(() => {
    const arr = [];
    for (let i = 0; i < count; i++) {
      const fromIdx = Math.floor(Math.random() * 12);
      const toIdx = Math.floor(4 + Math.random() * 11);
      arr.push({
        from: NODES[fromIdx].position,
        to: NODES[toIdx].position,
        progress: Math.random(),
        speed: 0.35 + Math.random() * 0.4
      });
    }
    return arr;
  });

  useFrame((state, delta) => {
    if (pulsesRef.current) {
      const positionsAttr = pulsesRef.current.geometry.attributes.position as THREE.BufferAttribute;
      
      pulseData.forEach((p, i) => {
        p.progress += p.speed * delta;
        if (p.progress >= 1.0) {
          p.progress = 0;
          const fromIdx = Math.floor(Math.random() * 12);
          const toIdx = Math.min(NODES.length - 1, fromIdx + 4 + Math.floor(Math.random() * 4));
          p.from = NODES[fromIdx].position;
          p.to = NODES[toIdx].position;
        }

        positionsAttr.setXYZ(
          i,
          p.from[0] + (p.to[0] - p.from[0]) * p.progress,
          p.from[1] + (p.to[1] - p.from[1]) * p.progress,
          p.from[2] + (p.to[2] - p.from[2]) * p.progress
        );
      });
      
      positionsAttr.needsUpdate = true;
    }
  });

  return (
    <points ref={pulsesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial color="#ff3344" size={0.065} transparent opacity={0.9} />
    </points>
  );
}

function NodeGraph() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.25) * 0.25;
      groupRef.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.15) * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <Connections />
      <SynapticPulses />
      {/* Node Spheres */}
      {NODES.map((node, i) => (
        <mesh key={i} position={node.position}>
          <sphereGeometry args={[0.09, 16, 16]} />
          <meshBasicMaterial color={node.color} />
        </mesh>
      ))}
    </group>
  );
}

export default function NeuralNet3D() {
  const { isDeviceConnected } = useTelemetry();

  return (
    <div className="w-full h-full min-h-[300px] relative rounded overflow-hidden bg-black/60 border border-zinc-800">
      
      {/* Network health metrics overlay */}
      <div className="absolute top-4 left-4 z-10 font-mono text-[9px] text-red-500 bg-zinc-950/90 p-3 rounded border border-zinc-800 space-y-1 pointer-events-none">
        <p className="font-bold text-white uppercase text-[10px]">AI Synaptic Node Grid</p>
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full bg-red-500 ${isDeviceConnected ? "animate-ping" : ""}`}></span>
          <span>NEURAL_MODEL_HEALTH: {isDeviceConnected ? "99.8%" : "85.0% (CACHED)"}</span>
        </div>
        <p>ACTIVE ENGINES: {isDeviceConnected ? "YOLOv8, NDVI, Whisper, DINO" : "NDVI Heuristic Fallback"}</p>
        <p>SYNAPSE PINGS: {isDeviceConnected ? "35 ACTIVE" : "0 ACTIVE (STANDBY)"}</p>
        <p>AVG INFERENCE LATENCY: {isDeviceConnected ? "0.05s" : "0.12s (HEURISTIC)"}</p>
      </div>

      {/* Flashing offline status OSD indicator */}
      {!isDeviceConnected && (
        <div className="absolute top-4 right-4 z-10 font-mono text-[9px] text-[#ff3344] bg-red-950/20 border border-[#ff3344]/40 px-3 py-1.5 rounded-md animate-pulse uppercase font-bold tracking-widest shadow-[0_0_10px_rgba(255,51,68,0.25)]">
          LOCAL HEURISTICS (OFFLINE)
        </div>
      )}

      <Canvas camera={{ position: [0, 0, 5], fov: 45 } as any}>
        <NodeGraph />
        <OrbitControls enableZoom={true} />
      </Canvas>
    </div>
  );
}
