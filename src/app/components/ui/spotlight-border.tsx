"use client";
import React, { useEffect, useRef } from "react";

interface SpotlightBorderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  activeColor?: string;
  idleColor?: string;
  borderWidth?: number;
  radius?: number | string;
  spotlightSize?: number;
}

export const SpotlightBorder = ({
  children,
  className = "",
  style = {},
  activeColor = "rgba(255, 255, 255, 0.4)",
  idleColor = "rgba(255, 255, 255, 0.08)",
  borderWidth = 1,
  radius = 12,
  spotlightSize = 350,
  ...props
}: SpotlightBorderProps) => {
  const itemRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const item = itemRef.current;
    if (!item) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = item.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      item.style.setProperty("--mouse-x", `${x}px`);
      item.style.setProperty("--mouse-y", `${y}px`);
    };

    item.addEventListener("mousemove", handleMouseMove);

    return () => {
      item.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div
      ref={itemRef}
      className={`relative group ${className}`}
      style={
        {
          "--active-color": activeColor,
          "--idle-color": idleColor,
          "--border-width": `${borderWidth}px`,
          "--radius": typeof radius === "number" ? `${radius}px` : radius,
          "--spotlight-size": `${spotlightSize}px`,
          borderRadius: "var(--radius)",
          ...style,
        } as React.CSSProperties
      }
      {...props}
    >
      {/* Background / Inner Content Layer */}
      <div
        className="absolute inset-0 bg-neutral-950 z-0"
        style={{
          margin: "var(--border-width)",
          borderRadius: "calc(var(--radius) - var(--border-width))",
        }}
      />

      {/* Default Border (Idle) */}
      <div
        className="absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-0"
        style={{
          border: "var(--border-width) solid var(--idle-color)",
          borderRadius: "var(--radius)",
        }}
      />

      {/* Spotlight Border (Hover) */}
      <div
        className="absolute inset-0 z-0 opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-100"
        style={{
          borderRadius: "var(--radius)",
          background: `radial-gradient(var(--spotlight-size) circle at var(--mouse-x) var(--mouse-y), var(--active-color), transparent 40%)`,
        }}
      />
      
      {/* Black Mask inside the Spotlight to create a border-only effect */}
       <div
        className="absolute inset-0 z-0 opacity-0 transition-opacity duration-300 pointer-events-none group-hover:opacity-100"
        style={{
          margin: "var(--border-width)",
          borderRadius: "calc(var(--radius) - var(--border-width))",
          background: "black",
        }}
      />

      {/* Actual Content Wrapper (Z-index above borders) */}
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
