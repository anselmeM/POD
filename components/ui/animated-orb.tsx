"use client";

import React from "react";

interface AnimatedOrbProps {
  className?: string;
  color?: "blue" | "purple" | "cyan" | "green";
  size?: number;
  blur?: number;
  opacity?: number;
  animationClass?: string;
}

const colorMap = {
  blue: "radial-gradient(circle, rgba(88, 166, 255, 0.15) 0%, transparent 70%)",
  purple: "radial-gradient(circle, rgba(188, 140, 255, 0.12) 0%, transparent 70%)",
  cyan: "radial-gradient(circle, rgba(86, 212, 221, 0.1) 0%, transparent 70%)",
  green: "radial-gradient(circle, rgba(63, 185, 80, 0.08) 0%, transparent 70%)",
};

export function AnimatedOrb({
  className = "",
  color = "blue",
  size = 600,
  blur = 80,
  opacity = 0.3,
  animationClass = "animate-orb-1",
}: AnimatedOrbProps) {
  return (
    <div
      className={`absolute pointer-events-none ${animationClass} ${className}`}
      style={{
        width: size,
        height: size,
        background: colorMap[color],
        filter: `blur(${blur}px)`,
        opacity,
        borderRadius: "50%",
      }}
    />
  );
}

export function OrbField() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <AnimatedOrb
        color="blue"
        size={700}
        blur={100}
        opacity={0.2}
        animationClass="animate-orb-1"
        className="-top-[20%] left-[10%]"
      />
      <AnimatedOrb
        color="purple"
        size={500}
        blur={90}
        opacity={0.15}
        animationClass="animate-orb-2"
        className="top-[30%] right-[5%]"
      />
      <AnimatedOrb
        color="cyan"
        size={400}
        blur={70}
        opacity={0.1}
        animationClass="animate-orb-3"
        className="bottom-[10%] left-[30%]"
      />
    </div>
  );
}
