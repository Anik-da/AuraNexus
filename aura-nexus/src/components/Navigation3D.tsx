"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import { useTelemetry } from "@/context/TelemetryContext";

interface Node {
  id: string;
  name: string;
  x: number;
  z: number;
  height: number;
  color: string;
}

const BUILDINGS: Node[] = [
  { id: "dock", name: "Charge Station", x: -3, z: 2, height: 0.8, color: "#ff3344" },
  { id: "greenhouse-a", name: "Greenhouse Alpha", x: 3, z: -2, height: 1.4, color: "#ff4466" },
  { id: "greenhouse-b", name: "Greenhouse Beta", x: 3, z: 2, height: 1.2, color: "#ff0055" },
  { id: "biolab", name: "Bio-Lab", x: 0, z: -1.5, height: 2.0, color: "#ec4899" },
  { id: "warehouse", name: "Warehouse B", x: -4, z: -2, height: 1.6, color: "#f43f5e" },
];

interface Navigation3DProps {
  selectedNodeId: string | null;
  navProgress: number;
  onSelectNode: (nodeId: string) => void;
}

function Scene({ selectedNodeId, navProgress, onSelectNode }: Navigation3DProps) {
  const robotRef = useRef<THREE.Group>(null);
  const activeBuilding = BUILDINGS.find((b) => b.id === selectedNodeId);

  // Position of base station
  const startX = -3;
  const startZ = 2;

  useFrame(() => {
    if (robotRef.current && activeBuilding) {
      // Linear interpolation from start position to active building based on progress
      const targetX = startX + (activeBuilding.x - startX) * (navProgress / 100);
      const targetZ = startZ + (activeBuilding.z - startZ) * (navProgress / 100);
      
      robotRef.current.position.x = targetX;
      robotRef.current.position.z = targetZ;
      // Hover oscillation
      robotRef.current.position.y = 0.25 + Math.sin(Date.now() * 0.005) * 0.04;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 8, 5]} intensity={1.5} color="#ff3344" />
      <pointLight position={[-5, 5, -5]} intensity={1.0} color="#ff0055" />

      {/* Grid Floor */}
      <Grid
        position={[0, -0.05, 0]}
        args={[15, 15]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#2e0508"
        sectionSize={2.5}
        sectionThickness={1.0}
        sectionColor="#ff3344"
        fadeDistance={10}
        infiniteGrid
      />

      {/* Buildings and Waypoints */}
      {BUILDINGS.map((b) => {
        const isTarget = b.id === selectedNodeId;
        return (
          <group key={b.id} position={[b.x, b.height / 2, b.z]}>
            {/* Holographic Building Column */}
            <mesh
              onClick={() => onSelectNode(b.id)}
            >
              <boxGeometry args={[0.9, b.height, 0.9]} />
              <meshStandardMaterial
                color={b.color}
                transparent
                opacity={isTarget ? 0.35 : 0.15}
                wireframe={false}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>

            {/* Neon Border Edge wireframe */}
            <mesh position={[0, 0, 0]}>
              <boxGeometry args={[0.92, b.height + 0.02, 0.92]} />
              <meshBasicMaterial
                color={isTarget ? "#ff3344" : b.color}
                wireframe
                transparent
                opacity={isTarget ? 0.8 : 0.35}
              />
            </mesh>

            {/* Waypoint floating sphere indicator */}
            <mesh
              position={[0, b.height / 2 + 0.3, 0]}
              onClick={() => onSelectNode(b.id)}
            >
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial
                color={isTarget ? "#ff3344" : "#71717a"}
              />
            </mesh>
          </group>
        );
      })}

      {/* Glowing neon path tube tracer */}
      {activeBuilding && (
        <mesh position={[0, 0.1, 0]}>
          {/* We draw a simple vector line representing route path */}
          <lineSegments>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[
                  new Float32Array([
                    startX, 0.1, startZ,
                    activeBuilding.x, 0.1, activeBuilding.z
                  ]),
                  3
                ]}
                count={2}
                array={new Float32Array([
                  startX, 0.1, startZ,
                  activeBuilding.x, 0.1, activeBuilding.z
                ])}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#ff3344" linewidth={2.0} transparent opacity={0.8} />
          </lineSegments>
        </mesh>
      )}

      {/* Robot Mini Representation */}
      <group ref={robotRef} position={[startX, 0.25, startZ]}>
        <mesh>
          <boxGeometry args={[0.3, 0.15, 0.2]} />
          <meshStandardMaterial color="#ff3344" metalness={0.9} roughness={0.1} />
        </mesh>
        <mesh position={[0.15, 0, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <pointLight intensity={2.0} distance={1.2} color="#ff3344" />
      </group>

      <OrbitControls maxPolarAngle={Math.PI / 2.1} minDistance={4} maxDistance={12} />
    </>
  );
}

export default function Navigation3D({ selectedNodeId, navProgress, onSelectNode }: Navigation3DProps) {
  const { isDeviceConnected } = useTelemetry();

  return (
    <div className="w-full h-full min-h-[360px] relative rounded overflow-hidden bg-black/60 border border-zinc-800">
      
      {/* 3D control guides */}
      <div className="absolute bottom-3 left-3 z-10 font-mono text-[8px] text-zinc-400 bg-zinc-950/90 px-2.5 py-1.5 rounded border border-zinc-800 pointer-events-none uppercase tracking-wide">
        DRAG TO ROTATE | SCROLL TO ZOOM
      </div>

      {/* Connection State OSD alert overlay */}
      {!isDeviceConnected && (
        <div className="absolute top-3 right-3 z-10 font-mono text-[9px] text-[#ff3344] bg-red-950/20 border border-[#ff3344]/40 px-3 py-1.5 rounded-md animate-pulse uppercase font-bold tracking-widest shadow-[0_0_10px_rgba(255,51,68,0.25)] flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff3344] animate-ping"></span>
          <span>LIDAR CACHE ACTIVE (OFFLINE)</span>
        </div>
      )}

      <Canvas camera={{ position: [0, 6, 8], fov: 45 }}>
        <Scene selectedNodeId={selectedNodeId} navProgress={navProgress} onSelectNode={onSelectNode} />
      </Canvas>
    </div>
  );
}
