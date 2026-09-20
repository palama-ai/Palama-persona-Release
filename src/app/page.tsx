"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [mode, setMode] = useState<"Fast" | "Deep">("Deep");

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 01 — HERO */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section style={{
        display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center", textAlign: "center",
        paddingTop: "calc(var(--nav-height) + 48px)", paddingBottom: 24,
      }}>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ fontSize: "1.4rem", fontWeight: 600, marginBottom: 24, color: "#fff" }}
        >
          What can I help with?
        </motion.h2>

        {/* Chatbot Input */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.08 }}
          style={{ width: "100%", maxWidth: 600, padding: "0 24px" }}
        >
          <div style={{ background: "#1a1a1a", borderRadius: 14, border: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ padding: "14px 18px 10px" }}>
              <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Palama anything or request an action..."
                style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "0.9rem", fontFamily: "inherit" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px 10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <button style={{ width: 30, height: 30, borderRadius: 8, background: "transparent", border: "1px solid rgba(255,255,255,0.12)", color: "#777", fontSize: "1rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>+</button>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <button style={{ width: 30, height: 30, borderRadius: "50%", background: inputValue.trim() ? "#fff" : "#333", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={inputValue.trim() ? "#000" : "#666"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pills */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}
          style={{ display: "flex", gap: 8, marginTop: 14 }}
        >
          {["Talk with Palama", "API Platform", "Stories", "More"].map((pill) => (
            <button key={pill} style={{ padding: "5px 14px", borderRadius: 16, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "#fff", fontSize: "0.78rem", cursor: "pointer" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >{pill}</button>
          ))}
        </motion.div>
      </section>

      {/* Content wrapper */}
      <div style={{ maxWidth: 1060, margin: "0 auto", padding: "0 24px" }}>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* RECENT NEWS */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>Recent news</h2>
            <Link href="/news" style={{ fontSize: "0.82rem", color: "#777", textDecoration: "none" }}>View all</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, alignItems: "start" }}>
            <Link href="/news" style={{ textDecoration: "none", color: "#fff" }}>
              <div style={{ borderRadius: 12, overflow: "hidden" }}>
                <div style={{ height: 420, background: "#111", borderRadius: 12 }} />
                <div style={{ paddingTop: 16 }}>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 600, lineHeight: 1.3, marginBottom: 8, color: "#fff", letterSpacing: "-0.02em" }}>
                    Palama 2.0: Frontier intelligence that scales with your ambition
                  </h2>
                  <div style={{ fontSize: "0.82rem", color: "#a1a1aa" }}><span style={{ fontWeight: 600, color: "#fff" }}>Product</span>  Jul 9, 2026</div>
                </div>
              </div>
            </Link>

            <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 24 }}>
              {[
                { title: "Expanding Daybreak as the Cyber Defense Window Narrows", tag: "Security", date: "Aug 10, 2026", href: "/safety/security-privacy" },
                { title: "Advancing the price-performance frontier with Palama 2.0", tag: "Product", date: "Jul 30, 2026", href: "/products/release-notes" },
              ].map((card) => (
                <Link key={card.title} href={card.href} style={{ textDecoration: "none", color: "#fff" }}>
                  <div>
                    <div style={{ width: "100%", height: 160, borderRadius: 10, background: "#111", marginBottom: 12 }} />
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.4, marginBottom: 6, color: "#fff" }}>{card.title}</h3>
                    <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}><span style={{ fontWeight: 600, color: "#fff" }}>{card.tag}</span>  {card.date}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>


        {/* ═══════════════════════════════════════════════════════════ */}
        {/* STORIES */}
        {/* ═══════════════════════════════════════════════════════════ */}
        <section style={{ paddingTop: 32, paddingBottom: 56 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <h2 style={{ fontSize: "1.15rem", fontWeight: 700, color: "#fff" }}>Stories</h2>
            <Link href="/use-cases" style={{ fontSize: "0.82rem", color: "#777", textDecoration: "none" }}>View all</Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24, alignItems: "start" }}>
            <Link href="/use-cases" style={{ textDecoration: "none", color: "#fff" }}>
              <div style={{ borderRadius: 12, overflow: "hidden" }}>
                <div style={{ height: 420, background: "#111", borderRadius: 12 }} />
                <div style={{ paddingTop: 16 }}>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 600, lineHeight: 1.3, marginBottom: 8, color: "#fff", letterSpacing: "-0.02em" }}>
                    Training to cycle across Antarctica with Palama
                  </h2>
                  <div style={{ fontSize: "0.82rem", color: "#a1a1aa" }}>Jun 11, 2026</div>
                </div>
              </div>
            </Link>

            <div style={{ display: "grid", gridTemplateRows: "1fr 1fr", gap: 24 }}>
              {[
                { title: "Creating new simulations of black holes with Codex", date: "Jun 11, 2026", href: "/use-cases" },
                { title: "Chip Ganassi Racing × Palama", date: "May 28, 2026", href: "/use-cases" },
              ].map((card) => (
                <Link key={card.title} href={card.href} style={{ textDecoration: "none", color: "#fff" }}>
                  <div>
                    <div style={{ width: "100%", height: 160, borderRadius: 10, background: "#111", marginBottom: 12 }} />
                    <h3 style={{ fontSize: "0.95rem", fontWeight: 500, lineHeight: 1.4, marginBottom: 6, color: "#fff" }}>{card.title}</h3>
                    <div style={{ fontSize: "0.75rem", color: "#a1a1aa" }}>{card.date}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>


      </div>
    </div>
  );
}
