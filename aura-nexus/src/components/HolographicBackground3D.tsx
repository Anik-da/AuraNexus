"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";
import * as THREE from "three";

// Glowing particle data streams
function StarField({ count = 180 }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 15;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 15;
    }
    return arr;
  });

  useFrame((state) => {
    if (pointsRef.current) {
      // Rotation and float drift
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.01) * 0.05;
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
      <pointsMaterial color="#ff3344" size={0.03} transparent opacity={0.3} sizeAttenuation />
    </points>
  );
}

// Glowing pulsing ambient lights
function MovingLights() {
  const lightRef1 = useRef<THREE.PointLight>(null);
  const lightRef2 = useRef<THREE.PointLight>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (lightRef1.current) {
      lightRef1.current.position.x = Math.cos(t * 0.5) * 6;
      lightRef1.current.position.y = Math.sin(t * 0.3) * 4;
    }
    if (lightRef2.current) {
      lightRef2.current.position.x = Math.sin(t * 0.4) * -6;
      lightRef2.current.position.y = Math.cos(t * 0.6) * -4;
    }
  });

  return (
    <>
      <pointLight ref={lightRef1} intensity={1.5} color="#ff0022" distance={10} />
      <pointLight ref={lightRef2} intensity={1.5} color="#ff0055" distance={10} />
    </>
  );
}

export default function HolographicBackground3D() {
  return (
    <div className="fixed inset-0 -z-20 w-full h-full pointer-events-none bg-[#030306]">
      {/* Dynamic linear vertical scanner gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#09090b]/40 via-[#030306]/95 to-[#09090b]/40"></div>
      
      <Canvas camera={{ position: [0, 0, 6], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <StarField count={220} />
        <MovingLights />
        
        {/* Holographic scanning ground grid */}
        <Grid
          position={[0, -2.5, 0]}
          args={[20, 20]}
          cellSize={1.0}
          cellThickness={0.5}
          cellColor="#2e0508"
          sectionSize={5}
          sectionThickness={1.0}
          sectionColor="#ff3344"
          fadeDistance={18}
          infiniteGrid
        />
      </Canvas>
    </div>
  );
}
