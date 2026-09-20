"use client";
import { useState, useEffect } from "react";
import {
  User, Brain, Palette, CreditCard, Users, Shield, BookOpen, Gift, Database,
  MessageCircle, Info, Plug, Settings, LogOut, Globe, Mail, Lock, Eye, X,
  ChevronRight, Trash2, Download, BarChart3, FileText, Check, Zap,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const tabs = [
  { section: "SETTINGS", items: [
    { id: "general", label: "General", icon: Settings },
    { id: "memory", label: "Memory", icon: Brain },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "public-chats", label: "Public Chats", icon: Users },
    { id: "security", label: "Security & Privacy", icon: Shield },
  ]},
  { section: "RESOURCES", items: [
    { id: "guide", label: "Guide", icon: BookOpen },
    { id: "referral", label: "Referral", icon: Gift },
    { id: "data", label: "Data", icon: Database },
  ]},
  { section: "MORE", items: [
    { id: "feedback", label: "Feedback", icon: MessageCircle },
    { id: "about", label: "About", icon: Info },
    { id: "connect", label: "Connect", icon: Plug },
  ]},
];

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-subtle)", borderRadius: 12, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
      <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 8 }}>{title}</h3>
      {children}
    </div>
  );
}

function InputField({ label, value, icon, onChange, type = "text" }: { label: string; value: string; icon: React.ReactNode; onChange?: (val: string) => void; type?: string }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "8px 14px" }}>
        <span style={{ color: "var(--text-muted)", display: "flex", alignItems: "center" }}>{icon}</span>
        <input 
          type={type} 
          value={value} 
          onChange={(e) => onChange?.(e.target.value)} 
          style={{ 
            background: "none", 
            border: "none", 
            outline: "none", 
            color: "var(--text-primary)", 
            fontSize: "0.85rem", 
            width: "100%", 
            fontFamily: "inherit" 
          }} 
        />
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, on }: { label: string; desc: string; on: boolean }) {
  const [enabled, setEnabled] = useState(on);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <div>
        <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-primary)" }}>{label}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{desc}</div>
      </div>
      <button onClick={() => setEnabled(!enabled)} style={{
        width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer", transition: "all 0.2s",
        background: enabled ? "var(--signal)" : "var(--border-subtle)", position: "relative", flexShrink: 0
      }}>
        <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: enabled ? 21 : 3, transition: "left 0.2s" }} />
      </button>
    </div>
  );
}

function ActionRow({ icon, label, desc, action, danger, onClick }: { icon: React.ReactNode; label: string; desc: string; action?: string; danger?: boolean; onClick?: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid var(--border-subtle)" }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-primary)" }}>{label}</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{desc}</div>
      </div>
      {action && <button onClick={onClick} style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--border-subtle)", background: danger ? "rgba(255,69,58,0.1)" : "transparent", color: danger ? "#ff453a" : "var(--text-secondary)", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer" }}>{action}</button>}
    </div>
  );
}

// Sub-pages
function GeneralPage({ user, supabase }: { user: any; supabase: any }) {
  const [displayName, setDisplayName] = useState("");
  const [company, setCompany] = useState("");
  const [website, setWebsite] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.full_name || user.email?.split('@')[0] || "");
      setCompany(user.user_metadata?.company || "");
      setWebsite(user.user_metadata?.website || "");
    }
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: displayName,
          company: company,
          website: website
        }
      });
      if (error) throw error;
      setMessage("✓ Profile updated successfully!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err: any) {
      setMessage(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const email = user?.email || "Loading...";

  return (<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <SectionCard title="Profile Details">
      <InputField label="DISPLAY NAME" value={displayName} onChange={setDisplayName} icon={<User size={14} />} />
      <div style={{ display: "flex", gap: 12 }}>
        <InputField label="COMPANY" value={company} onChange={setCompany} icon={<Globe size={14} />} />
        <InputField label="WEBSITE" value={website} onChange={setWebsite} icon={<Globe size={14} />} />
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <span style={{ fontSize: "0.8rem", color: message.startsWith("✓") ? "#00d488" : "#ff453a" }}>{message}</span>
        <button 
          onClick={handleSave} 
          disabled={loading}
          style={{ 
            padding: "8px 20px", 
            borderRadius: 8, 
            border: "none", 
            background: "var(--signal)", 
            color: "#fff", 
            fontSize: "0.8rem", 
            fontWeight: 600, 
            cursor: "pointer",
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </SectionCard>
    <SectionCard title="Account">
      <ActionRow icon={<Mail size={16} />} label="Email" desc={email} action="VERIFIED" />
      <ActionRow icon={<LogOut size={16} />} label="Sign out" desc="Log out of this device" action="Sign out" danger onClick={handleLogout} />
    </SectionCard>
  </div>);
}

function SecurityPage({ user, supabase }: { user: any; supabase: any }) {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState("");

  // MFA state
  const [mfaStatus, setMfaStatus] = useState<"disabled" | "enrolling" | "enabled">("disabled");
  const [mfaFactor, setMfaFactor] = useState<any>(null);
  const [mfaSecret, setMfaSecret] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaMsg, setMfaMsg] = useState("");

  const checkMfa = async () => {
    try {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) throw error;
      const active = data?.totp?.find((f: any) => f.status === "verified");
      if (active) {
        setMfaStatus("enabled");
        setMfaFactor(active);
      } else {
        setMfaStatus("disabled");
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      checkMfa();
    }
  }, [user]);

  const handleUpdatePassword = async () => {
    if (!newPassword) {
      setPassMsg("❌ Password cannot be empty");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMsg("❌ Passwords do not match");
      return;
    }
    setPassLoading(true);
    setPassMsg("");
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPassMsg("✓ Password updated successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPassMsg(""), 3000);
    } catch (err: any) {
      setPassMsg(`❌ Error: ${err.message}`);
    } finally {
      setPassLoading(false);
    }
  };

  const handleStartMfa = async () => {
    setMfaLoading(true);
    setMfaMsg("");
    try {
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
      if (error) throw error;
      setMfaFactor(data);
      setMfaSecret(data.totp.secret);
      setMfaStatus("enrolling");
    } catch (err: any) {
      setMfaMsg(`❌ Error: ${err.message}`);
    } finally {
      setMfaLoading(false);
    }
  };

  const handleVerifyMfa = async () => {
    if (mfaCode.length !== 6) {
      setMfaMsg("❌ Code must be 6 digits");
      return;
    }
    setMfaLoading(true);
    setMfaMsg("");
    try {
      // Challenge
      const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: mfaFactor.id
      });
      if (challengeError) throw challengeError;

      // Verify
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: mfaFactor.id,
        challengeId: challengeData.id,
        code: mfaCode
      });
      if (verifyError) throw verifyError;

      setMfaMsg("✓ Two-factor authentication enabled successfully!");
      setMfaCode("");
      checkMfa();
    } catch (err: any) {
      setMfaMsg(`❌ Error: ${err.message}`);
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisableMfa = async () => {
    if (!mfaFactor) return;
    setMfaLoading(true);
    setMfaMsg("");
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: mfaFactor.id });
      if (error) throw error;
      setMfaMsg("✓ Two-factor authentication disabled.");
      setMfaFactor(null);
      setMfaStatus("disabled");
      setTimeout(() => setMfaMsg(""), 3000);
    } catch (err: any) {
      setMfaMsg(`❌ Error: ${err.message}`);
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <SectionCard title="Two-Factor Authentication (2FA)">
        {mfaStatus === "disabled" && (
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 12 }}>
              Add an extra layer of security to your account by configuring a one-time password authenticator.
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Status: Disabled</span>
              <button
                onClick={handleStartMfa}
                disabled={mfaLoading}
                style={{
                  padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--signal)", color: "#fff",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", opacity: mfaLoading ? 0.7 : 1
                }}
              >
                Enable 2FA
              </button>
            </div>
            {mfaMsg && <div style={{ fontSize: "0.8rem", color: "#ff453a", marginTop: 8 }}>{mfaMsg}</div>}
          </div>
        )}

        {mfaStatus === "enrolling" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Scan the QR code or enter this secret key in your authenticator app (Google Authenticator, Duo, 1Password):
            </p>
            <div style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "12px", fontFamily: "monospace", fontSize: "0.9rem", color: "var(--signal)", textAlign: "center", wordBreak: "break-all" }}>
              {mfaSecret}
            </div>
            <InputField
              label="Enter 6-Digit Code"
              value={mfaCode}
              onChange={setMfaCode}
              icon={<Shield size={14} />}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
              <button
                onClick={() => setMfaStatus("disabled")}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.8rem", cursor: "pointer" }}
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyMfa}
                disabled={mfaLoading}
                style={{
                  padding: "8px 20px", borderRadius: 8, border: "none", background: "#00d488", color: "#fff",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", opacity: mfaLoading ? 0.7 : 1
                }}
              >
                {mfaLoading ? "Verifying..." : "Verify & Enable"}
              </button>
            </div>
            {mfaMsg && <div style={{ fontSize: "0.8rem", color: mfaMsg.startsWith("✓") ? "#00d488" : "#ff453a" }}>{mfaMsg}</div>}
          </div>
        )}

        {mfaStatus === "enabled" && (
          <div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 12 }}>
              Two-factor authentication is currently active on your account.
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8rem", color: "#00d488", fontWeight: 600 }}>✓ Status: Active</span>
              <button
                onClick={handleDisableMfa}
                disabled={mfaLoading}
                style={{
                  padding: "8px 20px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "rgba(255,69,58,0.1)", color: "#ff453a",
                  fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", opacity: mfaLoading ? 0.7 : 1
                }}
              >
                Disable 2FA
              </button>
            </div>
            {mfaMsg && <div style={{ fontSize: "0.8rem", color: mfaMsg.startsWith("✓") ? "#00d488" : "#ff453a", marginTop: 8 }}>{mfaMsg}</div>}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Change Password">
        <InputField label="NEW PASSWORD" value={newPassword} onChange={setNewPassword} icon={<Lock size={14} />} type="password" />
        <InputField label="CONFIRM PASSWORD" value={confirmPassword} onChange={setConfirmPassword} icon={<Lock size={14} />} type="password" />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
          <span style={{ fontSize: "0.8rem", color: passMsg.startsWith("✓") ? "#00d488" : "#ff453a" }}>{passMsg}</span>
          <button
            onClick={handleUpdatePassword}
            disabled={passLoading}
            style={{
              padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--signal)", color: "#fff",
              fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", opacity: passLoading ? 0.7 : 1
            }}
          >
            {passLoading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Data & Privacy">
        <ToggleRow label="Usage analytics" desc="Help us improve by sharing anonymous usage data" on={true} />
        <ToggleRow label="Crash reports" desc="Automatically send crash reports" on={true} />
        <ToggleRow label="Training data" desc="Allow your data to improve AI models" on={false} />
      </SectionCard>
    </div>
  );
}

function MemoryPage() {
  return (<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <SectionCard title="Agent Memory">
      <ToggleRow label="Enable persistent memory" desc="Allow the agent to remember context across sessions" on={true} />
      <ToggleRow label="Auto-summarize conversations" desc="Compress long conversations into memory notes" on={true} />
      <ToggleRow label="Cross-session learning" desc="Let agent learn from patterns across all tasks" on={false} />
    </SectionCard>
    <SectionCard title="Stored Memories">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div><div style={{ fontSize: "0.85rem", color: "var(--text-primary)" }}>12 memories stored</div><div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Using 2.4 MB of memory</div></div>
        <button style={{ padding: "6px 14px", borderRadius: 6, border: "1px solid var(--border-subtle)", background: "rgba(255,69,58,0.1)", color: "#ff453a", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer" }}>Clear All</button>
      </div>
    </SectionCard>
  </div>);
}

function AppearancePage() {
  const [theme, setTheme] = useState("dark");
  return (<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <SectionCard title="Theme">
      <div style={{ display: "flex", gap: 12 }}>
        {["dark", "light", "system"].map(t => (
          <button key={t} onClick={() => setTheme(t)} style={{
            flex: 1, padding: "14px 16px", borderRadius: 10, border: `1px solid ${theme === t ? "var(--signal)" : "var(--border-subtle)"}`,
            background: theme === t ? "rgba(46,123,255,0.08)" : "var(--bg-surface)", color: theme === t ? "var(--signal)" : "var(--text-secondary)",
            fontSize: "0.82rem", fontWeight: 500, cursor: "pointer", textTransform: "capitalize", transition: "all 0.2s"
          }}>{t === "dark" ? "🌙 Dark" : t === "light" ? "☀️ Light" : "💻 System"}</button>
        ))}
      </div>
    </SectionCard>
    <SectionCard title="Display">
      <ToggleRow label="Compact mode" desc="Reduce spacing and padding" on={false} />
      <ToggleRow label="Show animations" desc="Enable smooth transitions and effects" on={true} />
      <ToggleRow label="Code line numbers" desc="Show line numbers in code blocks" on={true} />
    </SectionCard>
  </div>);
}

function BillingPage() {
  return (<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <SectionCard title="Current Plan">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(46,123,255,0.06)", border: "1px solid rgba(46,123,255,0.15)", borderRadius: 10, padding: "16px 20px" }}>
        <div><div style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)" }}>Free Plan</div><div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>3 hours / month cloud compute</div></div>
        <button style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: "var(--signal)", color: "#fff", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>Upgrade</button>
      </div>
    </SectionCard>
    <SectionCard title="Usage This Month">
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
        <span style={{ color: "var(--text-secondary)" }}>Compute time</span><span style={{ color: "var(--text-primary)", fontWeight: 500 }}>0h 42m / 3h</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "var(--border-subtle)", overflow: "hidden" }}><div style={{ width: "23%", height: "100%", borderRadius: 3, background: "linear-gradient(90deg, var(--signal), #00d488)" }} /></div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
        <span style={{ color: "var(--text-secondary)" }}>API calls</span><span style={{ color: "var(--text-primary)", fontWeight: 500 }}>1,247 / 10,000</span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: "var(--border-subtle)", overflow: "hidden" }}><div style={{ width: "12%", height: "100%", borderRadius: 3, background: "linear-gradient(90deg, var(--signal), #00d488)" }} /></div>
    </SectionCard>
    <SectionCard title="Payment Methods">
      <ActionRow icon={<CreditCard size={16} />} label="No payment method" desc="Add a card to upgrade your plan" action="Add Card" />
    </SectionCard>
  </div>);
}

function PublicChatsPage() {
  return (<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <SectionCard title="Shared Conversations">
      <ToggleRow label="Allow public sharing" desc="Enable sharing conversations via link" on={false} />
      <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text-muted)", fontSize: "0.82rem" }}>No public chats yet</div>
    </SectionCard>
  </div>);
}

function GuidePage() {
  const guides = [
    { title: "Getting Started", desc: "Learn the basics of Palama Cloud", icon: <Zap size={16} /> },
    { title: "Using Agents", desc: "How to give tasks to your AI agent", icon: <Brain size={16} /> },
    { title: "Cloud Computers", desc: "Set up and manage environments", icon: <Database size={16} /> },
    { title: "Connectors & APIs", desc: "Integrate external services", icon: <Plug size={16} /> },
    { title: "Schedules", desc: "Automate recurring tasks", icon: <BarChart3 size={16} /> },
  ];
  return (<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <SectionCard title="Quick Start Guides">
      {guides.map((g, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < guides.length - 1 ? "1px solid var(--border-subtle)" : "none", cursor: "pointer" }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "rgba(46,123,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--signal)" }}>{g.icon}</div>
          <div style={{ flex: 1 }}><div style={{ fontSize: "0.85rem", fontWeight: 500, color: "var(--text-primary)" }}>{g.title}</div><div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{g.desc}</div></div>
          <ChevronRight size={14} style={{ color: "var(--text-muted)" }} />
        </div>
      ))}
    </SectionCard>
  </div>);
}

function ReferralPage() {
  return (<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <SectionCard title="Your Referral Code">
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: 1, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "12px 16px", fontFamily: "monospace", fontSize: "0.9rem", color: "var(--signal)", letterSpacing: 2 }}>PALAMA-AY0UB-2026</div>
        <button style={{ padding: "12px 20px", borderRadius: 8, border: "1px solid var(--border-subtle)", background: "transparent", color: "var(--text-secondary)", fontSize: "0.8rem", cursor: "pointer" }}>Copy</button>
      </div>
    </SectionCard>
    <SectionCard title="Rewards">
      <div style={{ display: "flex", gap: 16 }}>
        <div style={{ flex: 1, background: "var(--bg-surface)", borderRadius: 10, padding: "16px", textAlign: "center" }}><div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--signal)" }}>0</div><div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>Referrals</div></div>
        <div style={{ flex: 1, background: "var(--bg-surface)", borderRadius: 10, padding: "16px", textAlign: "center" }}><div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#00d488" }}>0h</div><div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 4 }}>Bonus Time</div></div>
      </div>
    </SectionCard>
  </div>);
}

function DataPage() {
  return (<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <SectionCard title="Data Management">
      <ActionRow icon={<Download size={16} />} label="Export all data" desc="Download your conversations, settings, and memories" action="Export" />
      <ActionRow icon={<FileText size={16} />} label="Request data copy" desc="Get a full copy of all stored data (GDPR)" action="Request" />
      <ActionRow icon={<Trash2 size={16} />} label="Delete all data" desc="Permanently remove all data from our servers" action="Delete" danger />
    </SectionCard>
  </div>);
}

function FeedbackPage() {
  return (<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <SectionCard title="Send Feedback">
      <div>
        <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Category</div>
        <div style={{ display: "flex", gap: 8 }}>
          {["Bug Report", "Feature Request", "General"].map((c, i) => (
            <button key={c} style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${i === 0 ? "var(--signal)" : "var(--border-subtle)"}`, background: i === 0 ? "rgba(46,123,255,0.08)" : "transparent", color: i === 0 ? "var(--signal)" : "var(--text-secondary)", fontSize: "0.78rem", cursor: "pointer" }}>{c}</button>
          ))}
        </div>
      </div>
      <div>
        <div style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Message</div>
        <textarea style={{ width: "100%", height: 120, background: "var(--bg-surface)", border: "1px solid var(--border-subtle)", borderRadius: 8, padding: "12px 14px", color: "var(--text-primary)", fontSize: "0.85rem", fontFamily: "inherit", resize: "vertical", outline: "none" }} placeholder="Describe your feedback..." />
      </div>
      <button style={{ alignSelf: "flex-end", padding: "10px 24px", borderRadius: 8, border: "none", background: "var(--signal)", color: "#fff", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer" }}>Submit Feedback</button>
    </SectionCard>
  </div>);
}

function AboutPage() {
  return (<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <SectionCard title="Palama Cloud">
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: 4 }}>Palama Cloud</div>
        <div style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Version 2.2.0</div>
        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: 2 }}>by NeuraDeep AI</div>
      </div>
    </SectionCard>
    <SectionCard title="Links">
      <ActionRow icon={<Globe size={16} />} label="Website" desc="neuradeep.ai" action="Visit" />
      <ActionRow icon={<FileText size={16} />} label="Terms of Service" desc="Read our terms" action="Open" />
      <ActionRow icon={<Shield size={16} />} label="Privacy Policy" desc="How we handle your data" action="Open" />
      <ActionRow icon={<Info size={16} />} label="Licenses" desc="Open source attributions" action="View" />
    </SectionCard>
  </div>);
}

function ConnectPage() {
  return (<div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
    <SectionCard title="Connected Accounts">
      <ActionRow icon={<img src="https://cdn.simpleicons.org/gmail/EA4335" width={16} height={16} alt="" />} label="Gmail" desc="ayoub@neuradeep.ai" action="Disconnect" />
      <ActionRow icon={<img src="https://cdn.jsdelivr.net/npm/simple-icons@13/icons/slack.svg" width={16} height={16} alt="" />} label="Slack" desc="NeuraDeep Workspace" action="Disconnect" />
      <ActionRow icon={<img src="https://cdn.simpleicons.org/github/ffffff" width={16} height={16} alt="" />} label="GitHub" desc="Not connected" action="Connect" />
    </SectionCard>
  </div>);
}

const titleMap: Record<string, [string, string]> = {
  general: ["General", "Profile and account"],
  memory: ["Memory", "Agent memory and learning"],
  appearance: ["Appearance", "Theme and display"],
  billing: ["Billing", "Plan and usage"],
  "public-chats": ["Public Chats", "Shared conversations"],
  security: ["Security & Privacy", "Manage password, 2FA, and privacy settings"],
  guide: ["Guide", "Documentation and tutorials"],
  referral: ["Referral", "Invite friends, earn rewards"],
  data: ["Data", "Import, export, and deletion"],
  feedback: ["Feedback", "Report bugs and request features"],
  about: ["About", "Version and legal"],
  connect: ["Connect", "External accounts"],
};

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState("general");
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      setUser(data.user);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const [title, subtitle] = titleMap[activeTab] || ["Settings", ""];

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralPage user={user} supabase={supabase} />;
      case "memory":
        return <MemoryPage />;
      case "appearance":
        return <AppearancePage />;
      case "billing":
        return <BillingPage />;
      case "public-chats":
        return <PublicChatsPage />;
      case "security":
        return <SecurityPage user={user} supabase={supabase} />;
      case "guide":
        return <GuidePage />;
      case "referral":
        return <ReferralPage />;
      case "data":
        return <DataPage />;
      case "feedback":
        return <FeedbackPage />;
      case "about":
        return <AboutPage />;
      case "connect":
        return <ConnectPage />;
      default:
        return <GeneralPage user={user} supabase={supabase} />;
    }
  };

  const initial = user?.user_metadata?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U";
  const sidebarName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User";

  return (
    <div style={{ flex: 1, display: "flex", height: "100%", background: "var(--bg-base)", overflow: "hidden" }}>
      <style>{`
        .stg-sidebar { width: 240px; min-width: 240px; background: var(--bg-surface); border-right: 1px solid var(--border-subtle); display: flex; flex-direction: column; padding: 24px 0; overflow-y: auto; }
        .stg-user { display: flex; align-items: center; gap: 12px; padding: 0 20px 20px; border-bottom: 1px solid var(--border-subtle); margin-bottom: 12px; }
        .stg-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--signal), var(--neura-grad-end)); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 0.8rem; font-weight: 600; flex-shrink: 0; }
        .stg-section-label { font-size: 0.6rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1.5px; padding: 12px 20px 6px; }
        .stg-tab { display: flex; align-items: center; gap: 10px; padding: 8px 20px; font-size: 0.82rem; font-weight: 500; color: var(--text-secondary); cursor: pointer; transition: all 0.15s; border: none; background: none; width: 100%; text-align: left; font-family: inherit; }
        .stg-tab:hover { background: var(--bg-glass-hover); color: var(--text-primary); }
        .stg-tab.active { background: rgba(46,123,255,0.1); color: var(--signal); }
        .stg-main { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
        .stg-header { padding: 28px 40px 20px; border-bottom: 1px solid var(--border-subtle); }
        .stg-header h2 { font-size: 1.4rem; font-weight: 600; color: var(--text-primary); margin-bottom: 4px; }
        .stg-header p { font-size: 0.82rem; color: var(--text-muted); }
        .stg-content { padding: 28px 40px; flex: 1; }
        @media screen and (max-width: 768px) {
          .stg-sidebar { width: 100%; min-width: unset; border-right: none; border-bottom: 1px solid var(--border-subtle); flex-direction: row; overflow-x: auto; padding: 8px; gap: 4px; flex-wrap: wrap; max-height: 120px; }
          .stg-user { display: none; }
          .stg-section-label { display: none; }
          .stg-tab { padding: 6px 12px; font-size: 0.72rem; white-space: nowrap; width: auto; border-radius: 6px; }
          .stg-header { padding: 20px 20px 14px; }
          .stg-content { padding: 16px 20px; }
        }
      `}</style>

      {/* Sidebar */}
      <div className="stg-sidebar">
        <div className="stg-user">
          <div className="stg-avatar">{initial}</div>
          <div>
            <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)" }}>{sidebarName}</div>
          </div>
        </div>
        {tabs.map(group => (
          <div key={group.section}>
            <div className="stg-section-label">{group.section}</div>
            {group.items.map(item => (
              <button key={item.id} className={`stg-tab ${activeTab === item.id ? "active" : ""}`} onClick={() => setActiveTab(item.id)}>
                <item.icon size={15} /> {item.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="stg-main">
        <div className="stg-header">
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
        <div className="stg-content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
