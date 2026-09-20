"use client";
import React from "react";
import { motion } from "framer-motion";

export default function ShinyBorder({
  children,
  className = "",
  duration = 8,
}: {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}) {
  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`} style={{ background: "rgba(255,255,255,0.02)" }}>
      {/* Animated Gradient Border */}
      <div 
        className="pointer-events-none absolute inset-0"
        style={{
          borderRadius: "inherit",
          padding: "1px",
          maskImage: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      >
        <motion.div
          animate={{
            x: ["-100%", "200%"],
          }}
          transition={{
            repeat: Infinity,
            ease: "linear",
            duration: duration,
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "50%",
            height: "100%",
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            transform: "skewX(-20deg)",
          }}
        />
        <div style={{ position: "absolute", inset: 0, border: "1px solid rgba(255,255,255,0.05)", borderRadius: "inherit" }} />
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
