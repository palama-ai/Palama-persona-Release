"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, Maximize2, Minimize2, X, Settings } from "lucide-react";

interface FloatingOrbProps {
  isMinimized?: boolean;
  onRestore?: () => void;
  onClose?: () => void;
}

export default function FloatingOrb({ isMinimized = false, onRestore, onClose }: FloatingOrbProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <AnimatePresence>
      {isMinimized && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div
            className="fixed bottom-6 right-6 z-50"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div
              className="relative flex items-center gap-3 bg-[#111]/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 min-w-[200px] shadow-2xl"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Liquid Orb */}
              <div className="relative w-10 h-10">
                <canvas
                  id="mini-orb"
                  width={80}
                  height={80}
                  className="w-10 h-10"
                  style={{ display: "block" }}
                />
              </div>

              <div className="flex flex-col items-start gap-1 ml-2">
                <span className="text-white font-medium text-sm">Palama</span>
                <span className="text-white/60 text-xs">Ready</span>
              </div>

              {/* Action buttons on hover */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1 ml-auto"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {}}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                      aria-label="Settings"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M12 6v6l4 2" />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {}}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                      aria-label="Minimize"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {}}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                      aria-label="Minimize"
                    >
                      <Minimize2 className="w-4 h-4" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {}}
                      className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
                      aria-label="Close"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}