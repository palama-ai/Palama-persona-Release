"use client";
import { motion } from "framer-motion";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export default function BorderBeam({
  className = "",
  size = 200,
  duration = 15,
  colorFrom = "#fff",
  colorTo = "transparent",
  delay = 0,
}: BorderBeamProps) {
  return (
    <div 
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        borderRadius: "inherit",
        overflow: "hidden",
        maskImage: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
        WebkitMaskComposite: "xor",
        maskComposite: "exclude",
        padding: "1px",
      }}
    >
      <motion.div
        animate={{
          transform: ["rotate(0deg)", "rotate(360deg)"],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: duration,
          delay: delay
        }}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: "200%",
          height: "200%",
          marginLeft: "-100%",
          marginTop: "-100%",
          background: `conic-gradient(from 0deg, transparent 0%, ${colorTo} 60%, ${colorFrom} 100%)`,
        }}
      />
    </div>
  );
}
