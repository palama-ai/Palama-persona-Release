"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="auth-split">
      <style>{`
        * { box-sizing: border-box; }
        body { background: #000; margin: 0; color: #ededed; }
        .auth-split { display: flex; min-height: 100vh; width: 100%; background: #000; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; }
        
        .auth-left { display: none; flex: 1.2; position: relative; overflow: hidden; border-right: 1px solid rgba(255,255,255,0.05); align-items: center; justify-content: flex-start; padding-left: 8vw; background: #000; }
        @media (min-width: 992px) { .auth-left { display: flex; } }
        
        .auth-right { flex: 1; display: flex; align-items: center; justify-content: center; padding: 32px; position: relative; background: #000; }
        
        .massive-brand-text { font-size: clamp(5rem, 12vw, 14rem); font-weight: 800; line-height: 0.85; letter-spacing: -0.04em; color: transparent; background: linear-gradient(180deg, #52525b 0%, #18181b 100%); -webkit-background-clip: text; background-clip: text; user-select: none; pointer-events: none; position: relative; z-index: 10; }
        .massive-sub-text { font-size: 0.6em; margin-left: 16px; background: linear-gradient(180deg, #27272a 0%, #000000 90%); -webkit-background-clip: text; background-clip: text; display: block; }
        
        .auth-card { width: 100%; max-width: 400px; display: flex; flex-direction: column; gap: 24px; position: relative; z-index: 10; align-items: stretch; }
        .auth-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; justify-content: center; text-decoration: none; color: #fff; font-weight: 600; font-size: 1.15rem; }
        .auth-logo img { width: 28px; height: 28px; }
        .auth-title { font-size: 1.75rem; font-weight: 600; color: #fff; text-align: center; margin: 0 0 8px; letter-spacing: -0.02em; }
        .auth-sub { font-size: 0.95rem; color: #a1a1aa; text-align: center; margin: 0; line-height: 1.5; }
        
        .auth-field { display: flex; flex-direction: column; gap: 8px; }
        .auth-label { font-size: 0.9rem; font-weight: 500; color: #e4e4e7; }
        .auth-input { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 12px 16px; color: #fff; font-size: 1rem; font-family: inherit; outline: none; transition: all 0.2s; width: 100%; }
        .auth-input:focus { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.05); }
        
        .auth-btn { width: 100%; padding: 12px; border-radius: 8px; border: none; background: #fff; color: #000; font-size: 0.95rem; font-weight: 600; font-family: inherit; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; }
        .auth-btn:hover { background: #e4e4e7; transform: translateY(-1px); }
        
        .auth-link { color: #a1a1aa; text-decoration: none; transition: color 0.2s; background: none; border: none; font-size: 0.9rem; font-family: inherit; cursor: pointer; padding: 0; text-align: center; display: block; }
        .auth-link:hover { color: #fff; text-decoration: underline; }

        .ambient-glow-1 { position: absolute; top: -10%; left: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(46,123,255,0.05) 0%, transparent 60%); border-radius: 50%; filter: blur(60px); pointer-events: none; }
        .ambient-glow-2 { position: absolute; bottom: -10%; right: -10%; width: 50vw; height: 50vw; background: radial-gradient(circle, rgba(0,212,136,0.03) 0%, transparent 60%); border-radius: 50%; filter: blur(80px); pointer-events: none; }
      `}</style>

      {/* Left Panel - Brand */}
      <div className="auth-left">
        <div className="ambient-glow-1" />
        <div className="ambient-glow-2" />
        <motion.div 
          className="massive-brand-text"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Palama<br />Persona
        </motion.div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-right">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {sent ? (
            <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: 24, alignItems: "center" }}>
              <div>
                <h1 className="auth-title">Check your inbox</h1>
                <p className="auth-sub">We sent a password reset link to<br /><strong style={{ color: "#fff", fontWeight: 500 }}>{email}</strong></p>
              </div>
              <Link href="/auth/login" className="auth-btn">Back to Sign in</Link>
              <button onClick={() => setSent(false)} className="auth-link">Try a different email</button>
            </div>
          ) : (
            <>
              <div>
                <h1 className="auth-title">Reset password</h1>
                <p className="auth-sub">Enter your email and we'll send you a link to reset your password.</p>
              </div>

              <form onSubmit={e => { e.preventDefault(); setSent(true); }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div className="auth-field">
                  <label className="auth-label">Email Address</label>
                  <input className="auth-input" type="email" placeholder="m@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                
                <button type="submit" className="auth-btn">Send Reset Link</button>
              </form>

              <Link href="/auth/login" className="auth-link" style={{ marginTop: 16 }}>
                ← Back to sign in
              </Link>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
}
