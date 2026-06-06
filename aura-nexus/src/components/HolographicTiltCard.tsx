"use client";

import React, { useRef, useState } from "react";

interface HolographicTiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export default function HolographicTiltCard({ children, className = "", ...props }: HolographicTiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState("");
  const [reflectionStyle, setReflectionStyle] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left; // Mouse position inside card
    const y = e.clientY - rect.top;

    // Normalize coordinates (-0.5 to 0.5)
    const normalizedX = (x / rect.width) - 0.5;
    const normalizedY = (y / rect.height) - 0.5;

    // Perspective rotation calculations (cap at 10 degrees)
    const rotateY = (normalizedX * 10).toFixed(2);
    const rotateX = -(normalizedY * 10).toFixed(2);

    setTransformStyle(`perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`);
    setReflectionStyle(`radial-gradient(circle at ${x}px ${y}px, rgba(255, 51, 68, 0.12) 0%, transparent 60%)`);
  };

  const handleMouseLeave = () => {
    setTransformStyle("");
    setReflectionStyle("");
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: transformStyle,
        transition: "transform 200ms ease-out, border-color 180ms ease, box-shadow 180ms ease",
        willChange: "transform",
        borderColor: isHovered ? "var(--line-strong)" : "var(--line)",
        background: "linear-gradient(145deg, rgba(40, 9, 11, 0.84), rgba(26, 6, 8, 0.56))",
        boxShadow: isHovered 
          ? "var(--shadow), 0 0 24px rgba(255, 51, 68, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
          : "var(--shadow), inset 0 1px 0 rgba(255, 255, 255, 0.08)"
      }}
      className={`border rounded-xl backdrop-blur-md relative overflow-hidden transition-all duration-300 ${className}`}
      {...props}
    >
      {/* Light Reflection layer */}
      {reflectionStyle && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{ background: reflectionStyle }}
        />
      )}

      {/* Internal Inset sub-border */}
      <div className="absolute inset-2.5 border border-white/5 rounded-lg pointer-events-none z-0" />

      {/* Content wrapper */}
      <div className="relative z-10 p-5">{children}</div>
    </div>
  );
}
