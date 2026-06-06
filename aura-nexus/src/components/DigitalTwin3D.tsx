"use client";

import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Grid } from "@react-three/drei";
import * as THREE from "three";
import { useTelemetry } from "@/context/TelemetryContext";

interface DigitalTwinProps {
  pan: number;
  tilt: number;
  speed: number;
  battery: number;
  obstacleDistance: number;
}

function LiveDroneModel({ pan, tilt, speed, obstacleDistance }: Omit<DigitalTwinProps, "battery">) {
  const groupRef = useRef<THREE.Group>(null);
  const radarRef = useRef<THREE.Mesh>(null);
  const eyeGroupRef = useRef<THREE.Group>(null);
  const leftFrontWheel = useRef<THREE.Mesh>(null);
  const rightFrontWheel = useRef<THREE.Mesh>(null);
  const leftBackWheel = useRef<THREE.Mesh>(null);
  const rightBackWheel = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const elapsed = state.clock.getElapsedTime();

    // Hover floating height
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(elapsed * 2.0) * 0.08;
    }

    // Spin radar constant
    if (radarRef.current) {
      radarRef.current.rotation.y = elapsed * 4.0;
    }

    // Sync camera pan/tilt rotation (convert degrees to radians)
    if (eyeGroupRef.current) {
      // Pan controls Y rotation
      eyeGroupRef.current.rotation.y = THREE.MathUtils.lerp(
        eyeGroupRef.current.rotation.y,
        (pan / 180) * Math.PI,
        0.15
      );
      // Tilt controls X rotation
      eyeGroupRef.current.rotation.x = THREE.MathUtils.lerp(
        eyeGroupRef.current.rotation.x,
        (-tilt / 180) * Math.PI,
        0.15
      );
    }

    // Rotate wheels based on current speed
    const wheelRotationSpeed = speed * 12.0 * delta;
    if (Math.abs(speed) > 0.05) {
      if (leftFrontWheel.current) leftFrontWheel.current.rotation.y += wheelRotationSpeed;
      if (rightFrontWheel.current) rightFrontWheel.current.rotation.y += wheelRotationSpeed;
      if (leftBackWheel.current) leftBackWheel.current.rotation.y += wheelRotationSpeed;
      if (rightBackWheel.current) rightBackWheel.current.rotation.y += wheelRotationSpeed;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Chassis */}
      <mesh castShadow receiveShadow position={[0, -0.15, 0]}>
        <boxGeometry args={[1.8, 0.35, 1.2]} />
        <meshStandardMaterial color="#0e0e11" metalness={0.92} roughness={0.1} />
      </mesh>

      {/* Main payload enclosure */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.55, 0.7, 0.55, 16]} />
        <meshStandardMaterial color="#18181b" metalness={0.88} roughness={0.15} />
      </mesh>

      {/* Camera payload head (rotates with pan/tilt) */}
      <group ref={eyeGroupRef} position={[0, 0.3, 0]}>
        {/* Sensor Eyeball support housing */}
        <mesh position={[0.55, 0.05, 0]}>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#ff3344" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Lidar eye glow lens */}
        <mesh position={[0.67, 0.05, 0]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshBasicMaterial color="#ff3344" />
        </mesh>

        {/* Dynamic laser scan helper representing current obstacle distance */}
        <mesh position={[1.4, 0.05, 0]} rotation={[0, 0, Math.PI / 2.0]}>
          <coneGeometry args={[0.2 * (obstacleDistance / 10.0 + 0.5), obstacleDistance / 3.0 + 0.5, 4, 1, true]} />
          <meshBasicMaterial
            color={obstacleDistance < 1.5 ? "#ff3b30" : "#ff3344"}
            transparent
            opacity={0.14}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Rotating Upper Radar Dome */}
      <mesh ref={radarRef} position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 0.08, 12]} />
        <meshStandardMaterial color="#ff5566" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Wheels */}
      {/* Front Left */}
      <mesh ref={leftFrontWheel} position={[-0.65, -0.3, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.18, 16]} />
        <meshStandardMaterial color="#27272a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Front Right */}
      <mesh ref={rightFrontWheel} position={[0.65, -0.3, 0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.18, 16]} />
        <meshStandardMaterial color="#27272a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Back Left */}
      <mesh ref={leftBackWheel} position={[-0.65, -0.3, -0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.18, 16]} />
        <meshStandardMaterial color="#27272a" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Back Right */}
      <mesh ref={rightBackWheel} position={[0.65, -0.3, -0.7]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.18, 16]} />
        <meshStandardMaterial color="#27272a" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

export default function DigitalTwin3D({ pan, tilt, speed, battery, obstacleDistance }: DigitalTwinProps) {
  const { isDeviceConnected } = useTelemetry();

  if (!isDeviceConnected) {
    return (
      <div className="w-full h-full min-h-[300px] relative rounded overflow-hidden bg-black/60 border border-zinc-800 flex flex-col justify-between p-4 font-mono scanlines">
        {/* Header indicator */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
          <span className="text-[9px] text-rose-500 uppercase tracking-widest font-bold flex items-center gap-1.5 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Telemetry Link Offline
          </span>
          <span className="text-[8px] text-zinc-600">AURA-1 CHASSIS DIAGRAM</span>
        </div>

        {/* CSS/HTML Grid layout representing the schematic */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative w-full max-w-[240px] aspect-video border border-zinc-900 bg-zinc-950/40 rounded flex flex-col items-center justify-between p-3">
            {/* Lidar PTZ Housing Mockup */}
            <div className="w-16 h-10 border border-dashed border-zinc-800 rounded flex flex-col items-center justify-center bg-zinc-900/30">
              <div className="w-6 h-6 rounded-full border border-zinc-800 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
              </div>
              <span className="text-[6px] text-zinc-650 mt-1 uppercase">PTZ_GIMBAL</span>
            </div>

            {/* Drone Chassis Mockup */}
            <div className="w-full h-12 border border-zinc-900 bg-zinc-950 rounded flex items-center justify-around relative">
              <span className="text-[7px] text-zinc-600 uppercase tracking-wider font-bold">PRIMARY CHASSIS FRAME</span>
              
              {/* Internal warning overlay */}
              <div className="absolute inset-0 bg-rose-950/5 flex items-center justify-center border border-rose-950/20">
                <span className="text-[8px] text-rose-500/80 font-bold tracking-widest uppercase">WAITING FOR HANDSHAKE</span>
              </div>
            </div>

            {/* Wheels Mockup */}
            <div className="w-full flex justify-between px-2">
              <div className="w-8 h-4 border border-zinc-900 bg-zinc-900 rounded-sm"></div>
              <div className="w-8 h-4 border border-zinc-900 bg-zinc-900 rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Schematic labeling details using CSS absolute markers */}
        <div className="grid grid-cols-2 gap-2 text-[8px] text-zinc-500 border-t border-zinc-900 pt-2">
          <div>
            <p className="text-zinc-600 font-bold uppercase">Hardware Nodes:</p>
            <p>• DRIVE_MOTORS: <span className="text-rose-500 font-semibold">[OFFLINE]</span></p>
            <p>• SERVO_STACK: <span className="text-rose-500 font-semibold">[OFFLINE]</span></p>
          </div>
          <div className="text-right">
            <p className="text-zinc-650 font-bold uppercase">System Link:</p>
            <p>PORT: <span className="text-zinc-600">8000/ESP32</span></p>
            <p>TCP: <span className="text-rose-500 font-semibold">[DISCONNECTED]</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px] relative rounded overflow-hidden bg-black/60 border border-zinc-800">
      
      {/* OSD Diagnostics details */}
      <div className="absolute top-3 left-3 z-10 font-mono text-[9px] text-red-500 bg-zinc-950/90 px-2 py-1 rounded border border-zinc-800 space-y-0.5 pointer-events-none">
        <p className="font-bold text-white uppercase">WebGL 3D Digital Twin</p>
        <p>TELEMETRY_VEL: {speed.toFixed(2)} m/s</p>
        <p>CAM_ANGLE: {pan}°P / {tilt}°T</p>
        <p>BATTERY_PACK: {battery}%</p>
        <p>CLEARANCE: {obstacleDistance.toFixed(2)}m</p>
      </div>

      <Canvas camera={{ position: [3, 2, 4], fov: 45 }}>
        <ambientLight intensity={0.35} />
        <pointLight position={[5, 5, 5]} intensity={1.8} color="#ff3344" />
        <pointLight position={[-5, 5, -5]} intensity={1.0} color="#ff0055" />
        
        <LiveDroneModel pan={pan} tilt={tilt} speed={speed} obstacleDistance={obstacleDistance} />
        
        <Grid
          position={[0, -0.65, 0]}
          args={[10, 10]}
          cellSize={0.5}
          cellThickness={0.5}
          cellColor="#2e0508"
          sectionSize={2.5}
          sectionThickness={1.0}
          sectionColor="#ff3344"
          fadeDistance={12}
          infiniteGrid
        />

        <OrbitControls enableZoom={true} maxPolarAngle={Math.PI / 2.05} minDistance={1.8} maxDistance={8} />
      </Canvas>
    </div>
  );
}
