"use client";

import React from "react";

export function GradientMesh() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary blue blob */}
      <div
        className="mesh-blob-1 absolute -top-[20%] left-[20%] w-[600px] h-[600px] rounded-full opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(37, 99, 235, 0.12) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />
      {/* Purple blob */}
      <div
        className="mesh-blob-2 absolute top-[10%] right-[10%] w-[500px] h-[500px] rounded-full opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.1) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />
      {/* Subtle green accent */}
      <div
        className="mesh-blob-3 absolute bottom-[10%] left-[40%] w-[400px] h-[400px] rounded-full opacity-20"
        style={{
          background: "radial-gradient(circle, rgba(22, 163, 74, 0.08) 0%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />
    </div>
  );
}