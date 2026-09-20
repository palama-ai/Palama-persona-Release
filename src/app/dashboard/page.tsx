"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Settings, Shield, LogOut, ChevronRight, Bug, CircleHelp, Download, Monitor, MoreHorizontal } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

type Section = "general" | "help" | "legal";
type JoinState = "idle" | "sending" | "done" | "error";

/**
 * Dashboard: Palama Cloud pre-registration + Co-Worker download.
 * Settings live behind the "..." button. No Windows build is bundled —
 * the download button activates via NEXT_PUBLIC_WINDOWS_DOWNLOAD_URL.
 */
const WINDOWS_URL = process.env.NEXT_PUBLIC_WINDOWS_DOWNLOAD_URL || "";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [cloud, setCloud] = useState<JoinState>("idle");
  const [cloudMsg, setCloudMsg] = useState("");

  const [macEmail, setMacEmail] = useState("");
  const [mac, setMac] = useState<JoinState>("idle");
  const [macMsg, setMacMsg] = useState("");

  const [showSettings, setShowSettings] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [section, setSection] = useState<Section>("general");
  const [loggingOut, setLoggingOut] = useState(false);
  // Portals escape the layout's stacking context (main has z-index:10),
  // otherwise the fixed header would sit above the button and modals.
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Prefill with the signed-in account email
  useEffect(() => {
    let cancelled = false;
    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user?.email) {
        setEmail((e) => e || data.user.email!);
        setMacEmail((e) => e || data.user.email!);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const joinList = async (
    target: "cloud" | "macos",
    address: string,
    setState: (s: JoinState) => void,
    setMessage: (m: string) => void
  ) => {
    const clean = address.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setMessage("Enter a valid email address.");
      setState("error");
      return;
    }
    setState("sending");
    setMessage("");
    const { error } = await supabase.from("waitlist").insert({ email: clean, platform: target });
    if (error) {
      if ((error as any).code === "23505") {
        setMessage("You're already on the list.");
        setState("done");
      } else {
        setMessage("Could not join. Run WAITLIST_SQL.sql in Supabase, then retry.");
        setState("error");
      }
      return;
    }
    setState("done");
    setMessage(target === "cloud" ? "You're on the list for Palama Cloud." : "You're on the macOS waitlist.");
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await supabase.auth.signOut();
    } catch {}
    router.push("/");
    router.refresh();
  };

  const titles: Record<Section, string> = {
    general: "General",
    help: "Help & support",
    legal: "Legal info",
  };

  const nav: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Settings size={17} /> },
    { id: "help", label: "Help & support", icon: <CircleHelp size={17} /> },
    { id: "legal", label: "Legal & safety", icon: <Shield size={17} /> },
  ];

  return (
    <div className="dash">
      <style>{`
        * { box-sizing: border-box; }
        body { background: #000; margin: 0; }
        .dash { min-height: 100vh; width: 100%; background: #000; color: #ededed; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; position: relative; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
        .dash-dots { position: fixed; top: 11px; right: 26px; width: 42px; height: 42px; border-radius: 50%; border: none; background: rgba(255,255,255,0.08); color: #fff; font-size: 1.2rem; letter-spacing: 1px; cursor: pointer; z-index: 9999; display: flex; align-items: center; justify-content: center; pointer-events: auto; }
        .dash-dots:hover { background: rgba(255,255,255,0.15); }
        .dash-center { text-align: center; max-width: 560px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 14px; }
        .dash-title { font-size: 2rem; font-weight: 700; letter-spacing: -0.02em; margin: 8px 0 0; color: #fff; }
        .dash-sub { color: #a1a1aa; margin: 0; font-size: 1rem; line-height: 1.6; }
        .dash-form { display: flex; gap: 10px; width: 100%; max-width: 440px; margin-top: 10px; }
        .dash-input { flex: 1; min-width: 0; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.12); border-radius: 999px; padding: 13px 20px; color: #fff; font-size: 0.95rem; font-family: inherit; outline: none; }
        .dash-input:focus { border-color: rgba(255,255,255,0.35); }
        .dash-btn { padding: 13px 26px; border-radius: 999px; border: none; background: #fff; color: #000; font-size: 0.95rem; font-weight: 650; font-family: inherit; cursor: pointer; white-space: nowrap; }
        .dash-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .dash-btn.done { background: #1668dc; color: #000; }
        .dash-msg-ok { color: #4ade80; font-size: 0.9rem; }
        .dash-msg-err { color: #f87171; font-size: 0.9rem; }
        .dash-dl-btn { margin-top: 14px; display: inline-flex; align-items: center; gap: 10px; padding: 13px 30px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.16); background: transparent; color: #fff; font-size: 1rem; font-weight: 600; font-family: inherit; cursor: pointer; }
        .dash-dl-btn:hover { background: rgba(255,255,255,0.06); }
        .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.72); backdrop-filter: blur(6px); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .acc-modal { width: 100%; max-width: 880px; min-height: 480px; max-height: 86vh; overflow: auto; background: #1c1c1e; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; display: flex; box-shadow: 0 24px 80px rgba(0,0,0,0.6); }
        .acc-side { width: 250px; flex-shrink: 0; border-right: 1px solid rgba(255,255,255,0.08); padding: 26px 16px; display: flex; flex-direction: column; }
        .acc-side h2 { font-size: 1.25rem; font-weight: 700; margin: 0 0 18px 10px; color: #fff; }
        .acc-nav { display: flex; flex-direction: column; gap: 4px; flex: 1; }
        .acc-nav-btn { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px; border: none; border-radius: 10px; background: transparent; color: rgba(255,255,255,0.75); font-size: 0.95rem; font-weight: 500; font-family: inherit; cursor: pointer; text-align: left; }
        .acc-nav-btn:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .acc-nav-btn.active { background: rgba(255,255,255,0.1); color: #fff; }
        .acc-logout { display: flex; align-items: center; gap: 12px; width: 100%; padding: 10px 12px; border: none; border-radius: 10px; background: transparent; color: rgba(255,255,255,0.85); font-size: 0.95rem; font-weight: 500; font-family: inherit; cursor: pointer; text-align: left; }
        .acc-logout:hover { background: rgba(239,68,68,0.12); color: #f87171; }
        .acc-main { flex: 1; padding: 26px 30px; min-width: 0; }
        .acc-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
        .acc-head h3 { font-size: 1.3rem; font-weight: 700; margin: 0; color: #fff; }
        .acc-close { width: 30px; height: 30px; border-radius: 50%; border: none; background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.7); font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .acc-close:hover { background: rgba(255,255,255,0.14); color: #fff; }
        .acc-card { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; }
        .acc-row { display: flex; align-items: center; gap: 14px; padding: 18px 20px; color: #fff; text-decoration: none; }
        a.acc-row:hover { background: rgba(255,255,255,0.04); }
        .acc-row + .acc-row { border-top: 1px solid rgba(255,255,255,0.06); }
        .acc-row-main { flex: 1; min-width: 0; }
        .acc-row-title { font-size: 1rem; font-weight: 600; color: #fff; }
        .acc-row-sub { font-size: 0.88rem; color: rgba(255,255,255,0.5); margin-top: 3px; display: block; }
        .acc-row-arrow { color: rgba(255,255,255,0.4); font-size: 1.1rem; flex-shrink: 0; }
        .acc-note { font-size: 0.95rem; color: rgba(255,255,255,0.75); line-height: 1.6; margin: 0 0 18px; }
        .acc-note a { color: #60a5fa; }
        .dl-modal { width: 100%; max-width: 460px; background: #1c1c1e; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 30px; box-shadow: 0 24px 80px rgba(0,0,0,0.6); display: flex; flex-direction: column; gap: 14px; }
        .dl-modal h3 { margin: 0; font-size: 1.3rem; font-weight: 700; color: #fff; text-align: center; }
        .dl-modal .sub { margin: 0; color: #a1a1aa; font-size: 0.9rem; text-align: center; }
        .dl-win { display: flex; align-items: center; justify-content: center; gap: 10px; padding: 14px; border-radius: 12px; border: none; background: #fff; color: #000; font-size: 1rem; font-weight: 650; font-family: inherit; cursor: pointer; text-decoration: none; }
        .dl-win.disabled { opacity: 0.45; cursor: not-allowed; }
        .dl-sep { display: flex; align-items: center; gap: 12px; color: #71717a; font-size: 0.8rem; }
        .dl-sep::before, .dl-sep::after { content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.1); }
        .dl-mac-row { display: flex; gap: 8px; }
        @media (max-width: 640px) {
          .dash-form { flex-direction: column; }
          .acc-modal { flex-direction: column; }
          .acc-side { width: 100%; border-right: none; border-bottom: 1px solid rgba(255,255,255,0.08); }
        }
      `}</style>

      {/* "..." opens settings (portaled above the fixed site header) */}
      {mounted && createPortal(
        <button
          type="button"
          className="dash-dots"
          onClick={() => setShowSettings(true)}
          onMouseDown={() => setShowSettings(true)}
          onTouchStart={() => setShowSettings(true)}
          aria-label="Settings"
        >
          <MoreHorizontal size={20} />
        </button>,
        document.body
      )}

      {/* Center: pre-register + download */}
      <div className="dash-center">
        <h1 className="dash-title">Get early access to Palama Cloud</h1>
        <p className="dash-sub">Join the pre-registration list. We will let you know the moment your workspace is ready.</p>
        <form
          className="dash-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (cloud !== "sending") joinList("cloud", email, setCloud, setCloudMsg);
          }}
        >
          <input
            className="dash-input"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={cloud === "sending" || cloud === "done"}
          />
          <button className={`dash-btn ${cloud === "done" ? "done" : ""}`} disabled={cloud === "sending" || cloud === "done"}>
            {cloud === "sending" ? "Joining..." : cloud === "done" ? "Joined!" : "Notify me"}
          </button>
        </form>
        {cloudMsg && <p className={cloud === "error" ? "dash-msg-err" : "dash-msg-ok"}>{cloudMsg}</p>}

        <button className="dash-dl-btn" onClick={() => setShowDownload(true)}>
          <Download size={17} /> Download Palama Co-Worker
        </button>
      </div>

      {/* Settings modal (behind "...", portaled above the site header) */}
      {mounted && showSettings && createPortal(
        <div className="overlay" onClick={() => setShowSettings(false)}>
          <div className="acc-modal" onClick={(e) => e.stopPropagation()}>
            <aside className="acc-side">
              <h2>Settings</h2>
              <nav className="acc-nav">
                {nav.map((item) => (
                  <button
                    key={item.id}
                    className={`acc-nav-btn ${section === item.id ? "active" : ""}`}
                    onClick={() => setSection(item.id)}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
              </nav>
              <button className="acc-logout" onClick={handleLogout} disabled={loggingOut}>
                <LogOut size={17} />
                {loggingOut ? "Logging out..." : "Log out"}
              </button>
            </aside>
            <div className="acc-main">
              <div className="acc-head">
                <h3>{titles[section]}</h3>
                <button className="acc-close" onClick={() => setShowSettings(false)} aria-label="Close">✕</button>
              </div>

              {section === "general" && (
                <div className="acc-card">
                  <a className="acc-row" href="/platform/profile">
                    <span className="acc-row-main">
                      <span className="acc-row-title">Palama Account</span>
                      <span className="acc-row-sub">Password, security, personal details</span>
                    </span>
                    <span className="acc-row-arrow">↗</span>
                  </a>
                </div>
              )}

              {section === "help" && (
                <>
                  <div className="acc-card">
                    <a className="acc-row" href="/support/help" target="_blank" rel="noreferrer">
                      <span className="acc-row-main"><span className="acc-row-title">Help Center</span></span>
                      <span className="acc-row-arrow">↗</span>
                    </a>
                    <a className="acc-row" href="/contact/sales">
                      <span className="acc-row-main"><span className="acc-row-title">Submit feedback</span></span>
                      <span className="acc-row-arrow"><ChevronRight size={18} /></span>
                    </a>
                  </div>
                  <div className="acc-card" style={{ marginTop: 16 }}>
                    <a className="acc-row" href="/support/help">
                      <span className="acc-row-main">
                        <span className="acc-row-title" style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                          <Bug size={17} style={{ color: "rgba(255,255,255,0.55)" }} /> Report an issue
                        </span>
                      </span>
                    </a>
                  </div>
                </>
              )}

              {section === "legal" && (
                <>
                  <p className="acc-note">
                    Responses are generated by AI. Some may be inaccurate or inappropriate.{" "}
                    <a href="/legal/terms">Learn more</a>
                  </p>
                  <div className="acc-card">
                    <a className="acc-row" href="/legal/terms">
                      <span className="acc-row-main"><span className="acc-row-title">Palama Terms of Service</span></span>
                      <span className="acc-row-arrow">↗</span>
                    </a>
                    <a className="acc-row" href="/legal/privacy">
                      <span className="acc-row-main"><span className="acc-row-title">Palama Privacy Policy</span></span>
                      <span className="acc-row-arrow">↗</span>
                    </a>
                    <a className="acc-row" href="/legal/brand">
                      <span className="acc-row-main"><span className="acc-row-title">Palama Brand Guidelines</span></span>
                      <span className="acc-row-arrow">↗</span>
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Download popup (portaled for the same reason) */}
      {mounted && showDownload && createPortal(
        <div className="overlay" onClick={() => setShowDownload(false)}>
          <div className="dl-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Download Palama Co-Worker</h3>
            <p className="sub">Your AI desktop assistant. Choose your platform.</p>
            {WINDOWS_URL ? (
              <a className="dl-win" href={WINDOWS_URL}>
                <Monitor size={17} /> Download for Windows
              </a>
            ) : (
              <button className="dl-win disabled" disabled title="Installer uploads here when ready">
                <Monitor size={17} /> Windows — coming soon
              </button>
            )}
            <div className="dl-sep">macOS users</div>
            {mac === "done" ? (
              <p className="dash-msg-ok" style={{ textAlign: "center" }}>{macMsg || "You're on the macOS waitlist."}</p>
            ) : (
              <form
                className="dl-mac-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (mac !== "sending") joinList("macos", macEmail, setMac, setMacMsg);
                }}
              >
                <input
                  className="dash-input"
                  type="email"
                  placeholder="you@example.com"
                  value={macEmail}
                  onChange={(e) => setMacEmail(e.target.value)}
                  disabled={mac === "sending"}
                />
                <button className="dash-btn" disabled={mac === "sending"}>
                  {mac === "sending" ? "..." : "Join"}
                </button>
              </form>
            )}
            {mac === "error" && <p className="dash-msg-err" style={{ textAlign: "center" }}>{macMsg}</p>}
            <button className="dash-dl-btn" style={{ alignSelf: "center" }} onClick={() => setShowDownload(false)}>
              Close
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
