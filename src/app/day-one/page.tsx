"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, type ParticipantSelf } from "@/lib/api";

const C = {
  pageBg: "#E6E5DD", card: "#F7F6F2", ink: "#222420", inkSoft: "#595C50",
  inkFaint: "#8A8C80", line: "#D4D3C8", lineSoft: "#E0DFD6",
  accent: "#586B4D", accentDeep: "#43543A", accentTint: "#EAEDE3",
};
const SERIF = "'Merriweather', Georgia, 'Times New Roman', serif";
const MONO  = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

// Build upcoming Monday options using LOCAL time — never toISOString() which rolls
// western-hemisphere Mondays back to Sunday in UTC.
function upcomingMondays() {
  const today = new Date();
  const daysToMon = (1 - today.getDay() + 7) % 7;
  const m1 = new Date(today); m1.setDate(today.getDate() + daysToMon);
  const m2 = new Date(m1);    m2.setDate(m1.getDate() + 7);

  const fmt   = (d: Date) => d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const toISO = (d: Date) => {
    const y  = d.getFullYear();
    const mo = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${mo}-${dd}`;
  };
  return [
    { label: fmt(m1), iso: toISO(m1), soon: daysToMon === 0 },
    { label: fmt(m2), iso: toISO(m2), soon: false },
  ];
}

const PATH = [
  { id: "in", kind: "enroll", done: true },
  { id: "1", kind: "week", next: true },
  { id: "2", kind: "week" },
  { id: "3", kind: "week" },
  { id: "4", kind: "milestone" },
  { id: "·", kind: "gap" },
  { id: "8", kind: "milestone" },
];

function PathwayPreview() {
  return (
    <div style={{ marginTop: 16, overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 12.5, whiteSpace: "nowrap" }}>
        {PATH.map((n, i) => {
          if (n.kind === "gap") return <span key={i} style={{ color: C.line, padding: "0 7px" }}>···</span>;
          const isMile = n.kind === "milestone";
          const fill   = n.done ? C.inkSoft : n.next ? C.accent : "transparent";
          const txt    = n.done || n.next ? C.card : C.inkFaint;
          const border = n.done ? C.inkSoft : n.next ? C.accent : C.line;
          return (
            <React.Fragment key={n.id}>
              {i > 0 && PATH[i - 1].kind !== "gap" && <span style={{ color: C.line, padding: "0 5px" }}>─</span>}
              <span title={n.done ? "Enrolled" : isMile ? `A1C at week ${n.id}` : `Week ${n.id}`}
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 23, height: 23, padding: "0 5px", borderRadius: isMile ? 3 : 12, background: fill, color: txt, border: `1px solid ${border}`, fontWeight: n.next ? 700 : 400 }}>
                {isMile ? `${n.id}◆` : n.id}
              </span>
            </React.Fragment>
          );
        })}
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.inkFaint, marginLeft: 12 }}>week 1 starts now</span>
      </div>
    </div>
  );
}

function ColLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.13em", textTransform: "uppercase", color: C.accentDeep, fontWeight: 600, marginBottom: 8 }}>{children}</div>;
}
function RowLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: SERIF, fontSize: 15.5, fontWeight: 700, color: C.ink, marginBottom: 8 }}>{children}</div>;
}

const micro: React.CSSProperties = { fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.5, color: C.inkSoft, margin: "0 0 13px" };
const inp: React.CSSProperties   = { fontFamily: MONO, fontSize: 15.5, padding: "9px 11px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 5, color: C.ink };

const FRUCT_TEST_MAP: Record<string, string> = { "Lab": "lab", "Home kit": "home_kit", "Clinic": "clinic" };

export default function StartDayOnePage() {
  const router  = useRouter();
  const mondays = upcomingMondays();

  const [start,         setStart]         = useState(0);
  const [fruct,         setFruct]         = useState("");
  const [fructHow,      setFructHow]      = useState("");
  const [toast,         setToast]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [existingStart, setExistingStart] = useState<string | null>(null);
  const [locked,        setLocked]        = useState(false);

  useEffect(() => {
    api.get("/participants/me")
      .then((data) => {
        const p = data as ParticipantSelf;
        if (p.startDate) {
          setExistingStart(p.startDate);
          setLocked(true);
        }
        if (p.baselineFructosamine) {
          setFruct(String(p.baselineFructosamine));
          setFructHow(p.baselineFructosamineTestType ?? "");
        }
      })
      .catch(() => { /* not fatal — participant may not have token yet */ });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const handleBegin = async () => {
    if (locked) { router.push("/check-in"); return; }
    setLoading(true);
    setError(null);
    try {
      await api.patch("/participants/me", { startDate: mondays[start].iso });

      if (fruct && fructHow) {
        await api.patch("/participants/me/baseline", {
          baselineFructosamine:         parseFloat(fruct),
          baselineFructosamineTestType: FRUCT_TEST_MAP[fructHow] ?? fructHow,
        });
      }

      router.push("/check-in");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          setError("Your start date is already locked — the exposure clock has begun.");
          setLocked(true);
        } else {
          setError(err.error);
        }
      } else {
        setError("Something went wrong — please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: C.pageBg, height: "100vh", display: "flex", flexDirection: "column", color: C.ink, overflow: "hidden" }} className="a1c-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap');
        .a1c-root *:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; border-radius: 2px; }
        .a1c-btn,.a1c-opt,.a1c-card,.a1c-unit { transition: background-color .12s, color .12s, border-color .12s, transform .07s; }
        .a1c-primary:hover { background: ${C.accentDeep}; }
        .a1c-opt:hover:not(.on),.a1c-card:hover:not(.on) { border-color: ${C.accent}; }
        .a1c-ghost:hover { color: ${C.ink}; }
        .a1c-btn:active { transform: translateY(1px); }
        .a1c-fade { animation: a1cFade .35s ease both; }
        @media (prefers-reduced-motion: reduce){ .a1c-fade{ animation:none; } }
        @keyframes a1cFade { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;} }
        input { font-family: ${MONO}; }
      `}</style>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ maxWidth: 580, margin: "0 auto", padding: "20px 22px 24px" }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.inkSoft }}>
            Day one · The A1C Challenge
          </span>

          <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 32, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "10px 0 0" }}>Day one</h1>
          <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.55, color: C.inkSoft, margin: "8px 0 0" }}>
            You&rsquo;ve got the food — set your clock, and take the baseline that has to be measured right as you start.
          </p>

          <PathwayPreview />
          <div style={{ height: 1, background: C.line, margin: "18px 0 20px" }} />

          {locked && existingStart && (
            <div style={{ padding: "14px 16px", background: C.accentTint, border: `1px solid ${C.accent}`, borderRadius: 8, marginBottom: 20 }}>
              <div style={{ fontFamily: SERIF, fontSize: 15.5, color: C.ink, fontWeight: 700 }}>Your start is set</div>
              <div style={{ fontFamily: MONO, fontSize: 14, color: C.accentDeep, marginTop: 6 }}>{existingStart}</div>
              <div style={{ fontFamily: SERIF, fontSize: 14, color: C.inkSoft, marginTop: 6 }}>
                Your exposure clock is running. Head to your weekly check-in.
              </div>
            </div>
          )}

          {!locked && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(244px, 1fr))", gap: 26, alignItems: "start" }}>
              <div>
                <ColLabel>When you&rsquo;ll start</ColLabel>
                <p style={micro}>Weeks run Monday–Sunday. Pick the Monday you&rsquo;ll begin eating.</p>
                {mondays.map((m, i) => (
                  <button key={i} className={`a1c-card ${start === i ? "on" : ""}`} onClick={() => setStart(i)}
                          style={{ width: "100%", textAlign: "left", cursor: "pointer", padding: "13px 14px", marginBottom: 9, borderRadius: 7, background: start === i ? C.accentTint : C.card, border: `1px solid ${start === i ? C.accent : C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <span>
                      <span style={{ fontFamily: SERIF, fontSize: 15.5, fontWeight: 700, color: C.ink }}>{m.label}</span>
                      <span style={{ display: "block", fontFamily: MONO, fontSize: 11.5, color: C.inkFaint, marginTop: 2 }}>
                        {i === 0 ? (m.soon ? "today — start now" : "this coming Monday") : "a week to settle in first"}
                      </span>
                    </span>
                    <span style={{ fontFamily: MONO, fontSize: 13, color: start === i ? C.accentDeep : "transparent" }}>✓</span>
                  </button>
                ))}
              </div>

              <div>
                <ColLabel>Day-one baseline · optional</ColLabel>
                <p style={micro}>Editable until end of week 1 — enter now if you have it.</p>
                <RowLabel>Fructosamine</RowLabel>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input inputMode="decimal" value={fruct} onChange={(e) => setFruct(e.target.value.replace(/[^0-9.]/g, ""))} placeholder=""
                         style={{ ...inp, width: 84 }} />
                  <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.inkFaint }}>µmol/L</span>
                </div>
                {fruct && (
                  <div className="a1c-fade" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {["Lab", "Home kit", "Clinic"].map((o) => (
                      <button key={o} className={`a1c-opt ${fructHow === o ? "on" : ""}`} onClick={() => setFructHow(o)}
                              style={{ flex: "1 1 auto", fontFamily: MONO, fontSize: 12.5, padding: "8px 6px", cursor: "pointer", borderRadius: 5, background: fructHow === o ? C.accent : C.card, color: fructHow === o ? C.card : C.inkSoft, border: `1px solid ${fructHow === o ? C.accent : C.line}` }}>
                        {o}
                      </button>
                    ))}
                  </div>
                )}
                {fruct && !fructHow && (
                  <div style={{ fontFamily: SERIF, fontSize: 13, color: "#9A5A3C", marginTop: 8 }}>
                    Select how it was measured to save this value.
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div style={{ padding: "13px 15px", background: "#FEF2EE", border: "1px solid #9A5A3C", borderRadius: 6, fontFamily: SERIF, fontSize: 14.5, color: "#9A5A3C", marginTop: 16 }}>
              {error}
            </div>
          )}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.line}`, background: C.card, flexShrink: 0 }}>
        <div style={{ maxWidth: 580, margin: "0 auto", padding: "13px 22px 15px" }}>
          <button className="a1c-btn a1c-primary" onClick={handleBegin} disabled={loading}
                  style={{ width: "100%", fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: C.card, background: loading ? C.line : C.accent, border: "none", borderRadius: 6, padding: "14px", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "Setting your start…" : locked ? "Go to week 1 →" : "Begin week 1"}
          </button>
          <p style={{ fontFamily: SERIF, fontSize: 12.5, color: C.inkFaint, margin: "10px 2px 0", textAlign: "center" }}>
            Your start must be on a Monday. Return any time that week to fill in the weekly data.
          </p>
        </div>
      </div>

      {toast && (
        <div className="a1c-fade" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 88, background: C.ink, color: C.card, fontFamily: MONO, fontSize: 13, padding: "10px 16px", borderRadius: 6, zIndex: 60, maxWidth: 340, textAlign: "center" }}>{toast}</div>
      )}
    </div>
  );
}
