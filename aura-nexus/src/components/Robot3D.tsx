"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";

// Rotating Radar and scan elements on the robot model
function DroneModel() {
  const groupRef = useRef<THREE.Group>(null);
  const radarRef = useRef<THREE.Mesh>(null);
  const eyeRef = useRef<THREE.Mesh>(null);
  const leftWheelRef = useRef<THREE.Mesh>(null);
  const rightWheelRef = useRef<THREE.Mesh>(null);

  // Animate robot parts
  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime();

    if (groupRef.current) {
      // Gentle floating animation
      groupRef.current.position.y = Math.sin(elapsed * 1.5) * 0.15;
      // Idle rotation
      groupRef.current.rotation.y = elapsed * 0.15;
    }

    if (radarRef.current) {
      // Rapid radar rotation
      radarRef.current.rotation.y = elapsed * 3.5;
    }

    if (eyeRef.current) {
      // Glow pulse intensity
      const pulse = (Math.sin(elapsed * 4) + 1) / 2;
      const mat = eyeRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.color.setRGB(0, 0.6 + pulse * 0.4, 1);
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Robot Chassis Base */}
      <mesh castShadow receiveShadow position={[0, -0.2, 0]}>
        <boxGeometry args={[2.2, 0.4, 1.4]} />
        <meshStandardMaterial color="#1a1c23" metalness={0.95} roughness={0.08} />
      </mesh>

      {/* Robot Upper Body */}
      <mesh castShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.7, 0.9, 0.7, 16]} />
        <meshStandardMaterial color="#0b0e14" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Main Sensor Camera Eye */}
      <mesh ref={eyeRef} position={[0.75, 0.38, 0]}>
        <sphereGeometry args={[0.18, 16, 16]} />
        <meshBasicMaterial color="#00f0ff" />
      </mesh>

      {/* Rotating Upper Radar Dome */}
      <mesh ref={radarRef} position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.55, 0.55, 0.1, 12]} />
        <meshStandardMaterial color="#0066ff" metalness={0.9} roughness={0.1} wireframe={false} />
      </mesh>

      {/* Glowing Radar Antenna */}
      <mesh position={[0, 1.0, 0.3]}>
        <boxGeometry args={[0.06, 0.4, 0.06]} />
        <meshStandardMaterial color="#00f0ff" emissive="#00f0ff" emissiveIntensity={0.6} />
      </mesh>

      {/* Wheels */}
      {/* Front Left */}
      <mesh ref={leftWheelRef} position={[-0.8, -0.4, 0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.25, 16]} />
        <meshStandardMaterial color="#2d303a" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Front Right */}
      <mesh position={[0.8, -0.4, 0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.25, 16]} />
        <meshStandardMaterial color="#2d303a" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Back Left */}
      <mesh ref={rightWheelRef} position={[-0.8, -0.4, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.25, 16]} />
        <meshStandardMaterial color="#2d303a" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Back Right */}
      <mesh position={[0.8, -0.4, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.42, 0.42, 0.25, 16]} />
        <meshStandardMaterial color="#2d303a" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* Scanner laser projection helper */}
      <mesh position={[1.4, 0.2, 0]} rotation={[0, 0, Math.PI / 2.5]}>
        <coneGeometry args={[0.4, 1.5, 4, 1, true]} />
        <meshBasicMaterial color="#00f0ff" transparent opacity={0.15} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

// Particle field representing sensor telemetry grid
function LidarParticles({ count = 280 }) {
  const pointsRef = useRef<THREE.Points>(null);

  // Generate particle positions
  const [positions] = useState(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      // Create random positions in a ring/sphere around the robot
      const theta = Math.random() * Math.PI * 2;
      const radius = 2.0 + Math.random() * 4.5;
      arr[i * 3] = Math.cos(theta) * radius;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 2.8;
      arr[i * 3 + 2] = Math.sin(theta) * radius;
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
      <pointsMaterial color="#00f0ff" size={0.045} transparent opacity={0.65} sizeAttenuation />
    </points>
  );
}

export default function Robot3D() {
  return (
    <div className="w-full h-full min-h-[350px] relative rounded-xl overflow-hidden bg-black/40 border border-white/5">
      {/* Holographic scanner details */}
      <div className="absolute top-4 left-4 z-10 font-mono text-[10px] text-cyan-400/80 bg-black/60 px-2.5 py-1 rounded border border-cyan-500/20 pointer-events-none">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
          <span>R3F_RENDERER_ACTIVE: 60FPS</span>
        </div>
      </div>

      <Canvas camera={{ position: [3, 2.5, 4.5], fov: 45 }}>
        <color attach="background" args={["#04050a"]} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
        <pointLight position={[-5, 5, -5]} intensity={0.6} color="#0066ff" />
        <pointLight position={[3, 1, 0]} intensity={1.5} color="#00f0ff" />
        
        <DroneModel />
        <LidarParticles count={250} />
        
        {/* Glowing Matrix Grid */}
        <Grid
          position={[0, -0.9, 0]}
          args={[12, 12]}
          cellSize={0.6}
          cellThickness={0.8}
          cellColor="#121b2d"
          sectionSize={3}
          sectionThickness={1.2}
          sectionColor="#00f0ff"
          fadeDistance={25}
          infiniteGrid
        />

        <OrbitControls
          enableZoom={true}
          maxPolarAngle={Math.PI / 1.9} // Prevent looking completely under grid
          minDistance={2}
          maxDistance={12}
        />
      </Canvas>
    </div>
  );
}
