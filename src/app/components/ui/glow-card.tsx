"use client";
import React, { useEffect, useRef } from "react";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
  style?: React.CSSProperties;
  innerStyle?: React.CSSProperties;
  as?: "div" | "a";
  href?: string;
  onClick?: () => void;
}

export const GlowCard = ({
  children,
  className = "",
  innerClassName = "",
  style,
  innerStyle,
  as = "div",
  href,
  onClick,
}: GlowCardProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    };
    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={ref} className={`glow-card ${className}`} style={style} onClick={onClick}>
      {children}
    </div>
  );
};

interface GlowRowProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const GlowRow = ({ children, className = "", style }: GlowRowProps) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handleMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
    };
    el.addEventListener("mousemove", handleMouseMove);
    return () => el.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <div ref={ref} className={`glow-row ${className}`} style={style}>
      {children}
    </div>
  );
};
