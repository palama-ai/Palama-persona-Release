"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

/**
 * Palama account settings (opened from the desktop app → Profile settings).
 * Name / email / password / 2FA / data download / account deletion.
 * All operations run against Supabase Auth + the agent engine.
 */
export default function ProfileSettingsPage() {
  const supabase = createClient();
  const [status, setStatus] = useState<"checking" | "ready" | "login">("checking");
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");

  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [newEmail, setNewEmail] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");

  const [totpVerified, setTotpVerified] = useState(false);
  const [enroll, setEnroll] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [mfaCode, setMfaCode] = useState("");
  const [deleteArm, setDeleteArm] = useState(false);

  const note = (kind: "ok" | "err", text: string) => setMsg({ kind, text });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!data.user) {
        setStatus("login");
        return;
      }
      setEmail(data.user.email || "");
      setName(((data.user.user_metadata as any)?.full_name || "") as string);
      setStatus("ready");
      // 2FA state
      try {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        if (!cancelled && factors) {
          setTotpVerified((factors.totp || []).some((f: any) => f.status === "verified"));
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    setMsg(null);
    try {
      await fn();
    } catch (err: any) {
      note("err", err?.message || "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  const saveName = () => run("name", async () => {
    const { error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } });
    if (error) throw error;
    note("ok", "Display name updated.");
  });

  const saveEmail = () => run("email", async () => {
    if (!newEmail.includes("@")) throw new Error("Enter a valid email address.");
    const { error } = await supabase.auth.updateUser({ email: newEmail.trim() });
    if (error) throw error;
    setNewEmail("");
    note("ok", "Confirmation sent to the new address. Click the link there to finish.");
  });

  const savePassword = () => run("pass", async () => {
    if (newPass.length < 8) throw new Error("Password must be at least 8 characters.");
    if (newPass !== newPass2) throw new Error("Passwords do not match.");
    const { error } = await supabase.auth.updateUser({ password: newPass });
    if (error) throw error;
    setNewPass("");
    setNewPass2("");
    note("ok", "Password updated. Use it on your next sign-in.");
  });

  const startEnroll = () => run("mfa", async () => {
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Palama" });
    if (error) throw error;
    setEnroll({ factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  });

  const verifyEnroll = () => run("mfa", async () => {
    if (!enroll || mfaCode.replace(/\D/g, "").length !== 6) throw new Error("Enter the 6-digit code.");
    const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId: enroll.factorId });
    if (chErr) throw chErr;
    const { error } = await supabase.auth.mfa.verify({
      factorId: enroll.factorId,
      challengeId: ch.id,
      code: mfaCode.replace(/\D/g, ""),
    });
    if (error) throw error;
    setEnroll(null);
    setMfaCode("");
    setTotpVerified(true);
    note("ok", "Two-factor authentication enabled.");
  });

  const removeMfa = () => run("mfa", async () => {
    const { data: factors, error: lErr } = await supabase.auth.mfa.listFactors();
    if (lErr) throw lErr;
    const verified = (factors?.totp || []).filter((f: any) => f.status === "verified");
    if (verified.length === 0) {
      setTotpVerified(false);
      return;
    }
    for (const f of verified) {
      const { error } = await supabase.auth.mfa.unenroll({ factorId: f.id });
      if (error) throw error;
    }
    setTotpVerified(false);
    note("ok", "Two-factor authentication disabled.");
  });

  const downloadData = () => run("export", async () => {
    const res = await fetch("/api/account/export", { cache: "no-store" });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j.error || `Export failed (${res.status}).`);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `palama-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    note("ok", "Your data was downloaded as JSON.");
  });

  const deleteAccount = () => run("delete", async () => {
    if (!deleteArm) {
      setDeleteArm(true);
      note("err", "This is permanent. Click “Delete my account” again to confirm.");
      return;
    }
    const res = await fetch("/api/account/delete", { method: "DELETE" });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(j.error || `Delete failed (${res.status}).`);
    await supabase.auth.signOut();
    window.location.href = "/";
  });

  return (
    <div className="psettings">
      <style>{`
        * { box-sizing: border-box; }
        body { background: #000; margin: 0; color: #ededed; }
        .psettings { min-height: 100vh; width: 100%; background: #000; color: #ededed; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 64px 24px 96px; }
        .psettings-inner { max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
        .psettings h1 { font-size: 2rem; font-weight: 700; letter-spacing: -0.02em; margin: 0 0 4px; color: #fff; }
        .psettings .sub { color: #a1a1aa; margin: 0 0 16px; font-size: 0.95rem; }
        .pcard { background: #111; border: 1px solid rgba(255,255,255,0.09); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .pcard h2 { font-size: 1.05rem; font-weight: 650; margin: 0; color: #fff; }
        .pcard p.desc { font-size: 0.88rem; color: #a1a1aa; margin: 0; line-height: 1.5; }
        .pfield { display: flex; flex-direction: column; gap: 6px; }
        .pfield label { font-size: 0.85rem; font-weight: 500; color: #e4e4e7; }
        .pinput { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 10px 14px; color: #fff; font-size: 0.95rem; font-family: inherit; outline: none; width: 100%; }
        .pinput:focus { border-color: rgba(255,255,255,0.4); }
        .prow { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .pbtn { padding: 10px 18px; border-radius: 8px; border: none; background: #fff; color: #000; font-size: 0.9rem; font-weight: 600; font-family: inherit; cursor: pointer; }
        .pbtn:disabled { opacity: 0.6; cursor: not-allowed; }
        .pbtn-ghost { background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.15); }
        .pbtn-danger { background: #dc2626; color: #fff; }
        .pbtn-danger.armed { background: #7f1d1d; }
        .pmsg-ok { background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); color: #4ade80; padding: 10px 14px; border-radius: 8px; font-size: 0.88rem; }
        .pmsg-err { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.25); color: #f87171; padding: 10px 14px; border-radius: 8px; font-size: 0.88rem; }
        .pqr { background: #fff; border-radius: 12px; padding: 16px; width: fit-content; }
        .pqr svg { display: block; width: 180px; height: 180px; }
        .psecret { font-family: monospace; font-size: 0.85rem; color: #e4e4e7; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; padding: 8px 12px; word-break: break-all; user-select: all; }
        .pbadge { display: inline-block; font-size: 0.75rem; font-weight: 700; padding: 3px 10px; border-radius: 999px; }
        .pbadge.on { background: rgba(34,197,94,0.15); color: #4ade80; }
        .pbadge.off { background: rgba(255,255,255,0.07); color: #a1a1aa; }
        .danger-zone { border-color: rgba(239,68,68,0.3); }
        .center { text-align: center; padding: 80px 20px; color: #a1a1aa; }
        .center a { color: #fff; }
      `}</style>

      <div className="psettings-inner">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1>Profile settings</h1>
          <p className="sub">Manage your Palama account, security, and data.</p>
        </motion.div>

        {status === "checking" && <div className="center">Loading your account...</div>}

        {status === "login" && (
          <div className="center">
            <p>You need to sign in first.</p>
            <Link href="/auth/login?next=/platform/profile">Go to sign in</Link>
          </div>
        )}

        {status === "ready" && (
          <>
            {msg && <div className={msg.kind === "ok" ? "pmsg-ok" : "pmsg-err"}>{msg.text}</div>}

            <div className="pcard">
              <h2>Profile</h2>
              <div className="pfield">
                <label>Email</label>
                <input className="pinput" value={email} disabled readOnly />
              </div>
              <div className="pfield">
                <label>Display name</label>
                <input
                  className="pinput"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  maxLength={60}
                />
              </div>
              <div className="prow">
                <button className="pbtn" onClick={saveName} disabled={busy !== null}>
                  {busy === "name" ? "Saving..." : "Save name"}
                </button>
              </div>
            </div>

            <div className="pcard">
              <h2>Change email</h2>
              <p className="desc">A confirmation link will be sent to the new address.</p>
              <div className="pfield">
                <label>New email</label>
                <input
                  className="pinput"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="new@example.com"
                />
              </div>
              <div className="prow">
                <button className="pbtn" onClick={saveEmail} disabled={busy !== null}>
                  {busy === "email" ? "Sending..." : "Change email"}
                </button>
              </div>
            </div>

            <div className="pcard">
              <h2>Change password</h2>
              <div className="pfield">
                <label>New password (min 8 characters)</label>
                <input
                  className="pinput"
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                />
              </div>
              <div className="pfield">
                <label>Confirm new password</label>
                <input
                  className="pinput"
                  type="password"
                  value={newPass2}
                  onChange={(e) => setNewPass2(e.target.value)}
                />
              </div>
              <div className="prow">
                <button className="pbtn" onClick={savePassword} disabled={busy !== null}>
                  {busy === "pass" ? "Saving..." : "Update password"}
                </button>
              </div>
            </div>

            <div className="pcard">
              <h2>
                Two-factor authentication{" "}
                <span className={totpVerified ? "pbadge on" : "pbadge off"}>
                  {totpVerified ? "Enabled" : "Disabled"}
                </span>
              </h2>
              {!totpVerified && !enroll && (
                <>
                  <p className="desc">Add an authenticator app (Google Authenticator, 1Password...) as a second step on sign-in.</p>
                  <div className="prow">
                    <button className="pbtn" onClick={startEnroll} disabled={busy !== null}>
                      {busy === "mfa" ? "Preparing..." : "Enable 2FA"}
                    </button>
                  </div>
                </>
              )}
              {!totpVerified && enroll && (
                <>
                  <p className="desc">Scan this code with your authenticator app, then enter the 6-digit code. If scanning fails, enter the secret manually.</p>
                  <div className="pqr">
                    {/* Supabase returns qr_code as an SVG data URL for <img src> */}
                    <img src={enroll.qr} alt="Authenticator QR code" width={180} height={180} />
                  </div>
                  <div className="psecret">{enroll.secret}</div>
                  <div className="pfield">
                    <label>6-digit code</label>
                    <input
                      className="pinput"
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="000000"
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </div>
                  <div className="prow">
                    <button className="pbtn" onClick={verifyEnroll} disabled={busy !== null}>
                      {busy === "mfa" ? "Verifying..." : "Verify & enable"}
                    </button>
                    <button className="pbtn pbtn-ghost" onClick={() => { setEnroll(null); setMfaCode(""); }}>
                      Cancel
                    </button>
                  </div>
                </>
              )}
              {totpVerified && (
                <>
                  <p className="desc">Your account is protected by an authenticator app.</p>
                  <div className="prow">
                    <button className="pbtn pbtn-ghost" onClick={removeMfa} disabled={busy !== null}>
                      {busy === "mfa" ? "Removing..." : "Disable 2FA"}
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="pcard">
              <h2>Download my data</h2>
              <p className="desc">Get a JSON copy of your profile and your agent task history.</p>
              <div className="prow">
                <button className="pbtn" onClick={downloadData} disabled={busy !== null}>
                  {busy === "export" ? "Preparing..." : "Download data"}
                </button>
              </div>
            </div>

            <div className="pcard danger-zone">
              <h2>Delete account</h2>
              <p className="desc">Permanently delete your Palama account and data. This cannot be undone.</p>
              <div className="prow">
                <button
                  className={`pbtn pbtn-danger ${deleteArm ? "armed" : ""}`}
                  onClick={deleteAccount}
                  disabled={busy !== null && busy !== "delete"}
                >
                  {busy === "delete" ? "Deleting..." : deleteArm ? "Click again to confirm" : "Delete my account"}
                </button>
                {deleteArm && (
                  <button className="pbtn pbtn-ghost" onClick={() => { setDeleteArm(false); setMsg(null); }}>
                    Keep my account
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
