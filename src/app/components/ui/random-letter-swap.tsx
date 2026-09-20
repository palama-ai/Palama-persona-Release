"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface RandomLetterSwapProps {
  label: string;
  className?: string;
  staggerDuration?: number;
  transition?: any;
  style?: React.CSSProperties;
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+";

export function RandomLetterSwap({
  label,
  className = "",
  staggerDuration = 0.025,
  transition = { duration: 0.6, type: "spring" },
  style,
}: RandomLetterSwapProps) {
  const [displayText, setDisplayText] = useState(label);
  const [isHovered, setIsHovered] = useState(false);
  
  useEffect(() => {
    if (!isHovered) {
      setDisplayText(label);
      return;
    }

    let iterations = 0;
    const maxIterations = 10;
    
    const interval = setInterval(() => {
      setDisplayText((currentText) => 
        label
          .split("")
          .map((letter, index) => {
            if (index < iterations) {
              return label[index];
            }
            // Preserve spaces
            if (letter === " ") return " ";
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join("")
      );
      
      iterations += 1;
      if (iterations >= label.length) {
        clearInterval(interval);
        setDisplayText(label);
      }
    }, staggerDuration * 1000);

    return () => clearInterval(interval);
  }, [isHovered, label, staggerDuration]);

  return (
    <motion.span
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      transition={transition}
      style={{ display: "inline-block", ...style }}
    >
      {displayText}
    </motion.span>
  );
}
