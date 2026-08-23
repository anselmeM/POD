"use client";

import React from "react";

export function GradientMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary blue blob */}
      <div
        className="animate-orb-1 absolute -top-[20%] left-[20%] w-[600px] h-[600px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(88, 166, 255, 0.15) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      {/* Purple blob */}
      <div
        className="animate-orb-2 absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(188, 140, 255, 0.12) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      {/* Cyan accent */}
      <div
        className="animate-orb-3 absolute bottom-[10%] left-[40%] w-[400px] h-[400px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(86, 212, 221, 0.08) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
    </div>
  );
}
