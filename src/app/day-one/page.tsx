"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, type ParticipantSelf } from "@/lib/api";
import { C, SERIF, MONO } from "@/lib/theme";

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
      <div style={{ display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 13.5, whiteSpace: "nowrap" }}>
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
        <span style={{ fontFamily: MONO, fontSize: 13.5, color: C.inkFaint, marginLeft: 12 }}>week 1 starts now</span>
      </div>
    </div>
  );
}

function ColLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: MONO, fontSize: 13.5, letterSpacing: "0.13em", textTransform: "uppercase", color: C.accentDeep, fontWeight: 600, marginBottom: 8 }}>{children}</div>;
}
function RowLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: SERIF, fontSize: 15.5, fontWeight: 700, color: C.ink, marginBottom: 8 }}>{children}</div>;
}

function ReminderStrip({ startLabel }: { startLabel: string }) {
  const [showCal, setShowCal] = useState(false);
  const [calDay,  setCalDay]  = useState(1); // default Monday
  const linkRef = useRef<HTMLAnchorElement>(null);

  const buildAndDownload = () => {
    const byday = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][calDay];
    const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//A1C Challenge//Check-in//EN", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT", `UID:a1c-${Date.now()}@a1c-challenge`, `DTSTAMP:${stamp}`,
      "SUMMARY:A1C Challenge — weekly check-in",
      `DESCRIPTION:Your weekly A1C Challenge check-in. Started ${startLabel}.`,
      `RRULE:FREQ=WEEKLY;BYDAY=${byday}`, "DURATION:PT10M",
      "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-PT0M", "DESCRIPTION:A1C Challenge check-in", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = linkRef.current!;
    a.href = url; a.download = "a1c-checkin-reminder.ics"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const fbShare = () => {
    const url = encodeURIComponent(typeof window !== "undefined" ? window.location.origin : "");
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank", "noopener,width=600,height=400");
  };

  return (
    <div style={{ marginTop: 20, padding: "16px 18px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 8 }}>
      <div style={{ fontFamily: MONO, fontSize: 13.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 12 }}>
        Don&rsquo;t lose track
      </div>

      {!showCal ? (
        <button onClick={() => setShowCal(true)} className="a1c-ghost"
                style={{ display: "block", fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: C.accentDeep, background: "none", border: "none", padding: 0, cursor: "pointer", marginBottom: 12, textAlign: "left" }}>
          + Add a weekly reminder to your calendar
        </button>
      ) : (
        <div className="a1c-fade" style={{ marginBottom: 14 }}>
          <div style={{ fontFamily: SERIF, fontSize: 14, color: C.inkSoft, marginBottom: 8 }}>Remind me on</div>
          <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
            <select value={calDay} onChange={(e) => setCalDay(Number(e.target.value))}
                    style={{ fontFamily: SERIF, fontSize: 14.5, padding: "8px 10px", borderRadius: 5, border: `1px solid ${C.line}`, background: C.pageBg, color: C.ink }}>
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d, i) => (
                <option key={d} value={i}>{d}s</option>
              ))}
            </select>
            <button onClick={buildAndDownload} className="a1c-btn a1c-primary"
                    style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 700, color: C.card, background: C.accent, border: "none", borderRadius: 5, padding: "8px 16px", cursor: "pointer" }}>
              Save reminder
            </button>
            <a ref={linkRef} style={{ display: "none" }} />
          </div>
        </div>
      )}

      <button onClick={fbShare} className="a1c-ghost"
              style={{ display: "block", fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: C.inkSoft, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
        + Tell someone on Facebook
        <span style={{ display: "block", fontFamily: SERIF, fontSize: 12.5, fontWeight: 400, color: C.inkFaint, marginTop: 3 }}>
          Shares the study, not your numbers — nothing here identifies you.
        </span>
      </button>
    </div>
  );
}

const micro: React.CSSProperties = { fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.5, color: C.inkSoft, margin: "0 0 13px" };
const inp: React.CSSProperties   = { fontFamily: MONO, fontSize: 15.5, padding: "9px 11px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 5, color: C.ink };

const FRUCT_TEST_MAP: Record<string, string> = { "Lab": "lab", "Home kit": "home_kit", "Clinic": "clinic" };
const FRUCT_REVERSE: Record<string, string>  = { "lab": "Lab", "home_kit": "Home kit", "clinic": "Clinic" };

export default function StartDayOnePage() {
  const router  = useRouter();
  const mondays = upcomingMondays();

  const [start,         setStart]         = useState(0);
  const [fruct,         setFruct]         = useState("");
  const [fructHow,      setFructHow]      = useState("");
  const [baselineA1c,   setBaselineA1c]   = useState<number | null>(null);
  const [toast,         setToast]         = useState("");
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [existingStart, setExistingStart] = useState<string | null>(null);
  const [locked,        setLocked]        = useState(false);
  const [studyWeek,     setStudyWeek]     = useState<number | null>(null);

  useEffect(() => {
    api.get("/participants/me")
      .then((data) => {
        const p = data as ParticipantSelf;
        if (p.startDate) {
          setExistingStart(p.startDate);
          setLocked(true);
        }
        setStudyWeek(p.studyWeek);
        setBaselineA1c(p.baselineA1c ?? null);
        if (p.baselineFructosamine) {
          setFruct(String(p.baselineFructosamine));
          setFructHow(FRUCT_REVERSE[p.baselineFructosamineTestType ?? ""] ?? "");
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const handleBegin = async () => {
    if (locked) {
      // Only navigate to check-in if the week has actually started
      if (studyWeek != null && studyWeek >= 1) router.push("/check-in");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.patch("/participants/me", { startDate: mondays[start].iso });

      if (fruct && fructHow && baselineA1c !== null) {
        await api.patch("/participants/me/baseline", {
          baselineA1c,
          baselineFructosamine:         parseFloat(fruct),
          baselineFructosamineTestType: FRUCT_TEST_MAP[fructHow] ?? fructHow,
        });
      }

      // Stay on this page — show the "Your start is set" card with reminder options
      setExistingStart(mondays[start].iso);
      setLocked(true);
      // Re-fetch to pick up studyWeek (may now be 1 if they chose today's Monday)
      api.get("/participants/me").then((d) => setStudyWeek((d as ParticipantSelf).studyWeek)).catch(() => {});
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

  // Label for the footer button when start is already set
  const lockedButtonLabel = studyWeek != null && studyWeek >= 1
    ? "Go to my check-in →"
    : "Start date saved — see you Monday";

  return (
    <div style={{ background: C.pageBg, height: "100vh", display: "flex", flexDirection: "column", color: C.ink, overflow: "hidden" }} className="a1c-root">
<div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ maxWidth: 580, width: "100%", margin: "0 auto", padding: "20px 18px 24px", boxSizing: "border-box" }}>
          <span style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: C.inkSoft }}>
            Day one · The A1C Challenge
          </span>

          <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 32, lineHeight: 1.05, letterSpacing: "-0.02em", margin: "10px 0 0" }}>Day one</h1>
          <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.55, color: C.inkSoft, margin: "8px 0 0" }}>
            You&rsquo;ve got the food — set your clock, and take the baseline that has to be measured right as you start.
          </p>

          <PathwayPreview />
          <div style={{ height: 1, background: C.line, margin: "18px 0 20px" }} />

          {locked && existingStart && (
            <div className="a1c-fade">
              <div style={{ padding: "14px 16px", background: C.accentTint, border: `1px solid ${C.accent}`, borderRadius: 8 }}>
                <div style={{ fontFamily: SERIF, fontSize: 15.5, color: C.ink, fontWeight: 700 }}>Your start is set</div>
                <div style={{ fontFamily: MONO, fontSize: 14, color: C.accentDeep, marginTop: 6 }}>{existingStart}</div>
                <div style={{ fontFamily: SERIF, fontSize: 14, color: C.inkSoft, marginTop: 6 }}>
                  {studyWeek != null && studyWeek >= 1
                    ? "Your exposure clock is running. Head to your weekly check-in."
                    : "Your exposure clock starts Monday. Come back then to log your first week."}
                </div>
              </div>
              <div style={{ marginTop: 14, padding: "12px 15px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 7, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.12em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 4 }}>Bookmark your check-in</div>
                  <span style={{ fontFamily: MONO, fontSize: 14.5, color: C.accentDeep }}>a1c-challenge.org/check-in</span>
                </div>
                <a href="/check-in" style={{ fontFamily: SERIF, fontSize: 14.5, fontWeight: 700, color: C.card, background: C.accent, borderRadius: 6, padding: "9px 18px", textDecoration: "none", whiteSpace: "nowrap" }}>
                  Go to check-in →
                </a>
              </div>
              <ReminderStrip startLabel={existingStart} />
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
                      <span style={{ display: "block", fontFamily: MONO, fontSize: 13.5, color: C.inkFaint, marginTop: 2 }}>
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
                  <span style={{ fontFamily: MONO, fontSize: 13.5, color: C.inkFaint }}>µmol/L</span>
                </div>
                {fruct && (
                  <div className="a1c-fade" style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                    {["Lab", "Home kit", "Clinic"].map((o) => (
                      <button key={o} className={`a1c-opt ${fructHow === o ? "on" : ""}`} onClick={() => setFructHow(o)}
                              style={{ flex: "1 1 auto", fontFamily: MONO, fontSize: 13.5, padding: "8px 6px", cursor: "pointer", borderRadius: 5, background: fructHow === o ? C.accent : C.card, color: fructHow === o ? C.card : C.inkSoft, border: `1px solid ${fructHow === o ? C.accent : C.line}` }}>
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
        <div style={{ maxWidth: 580, width: "100%", margin: "0 auto", padding: "13px 18px 15px", boxSizing: "border-box" }}>
          <button className="a1c-btn a1c-primary" onClick={handleBegin}
                  disabled={loading || (locked && (studyWeek == null || studyWeek < 1))}
                  style={{ width: "100%", fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: C.card, background: loading ? C.line : locked && (studyWeek == null || studyWeek < 1) ? C.line : C.accent, border: "none", borderRadius: 6, padding: "14px", cursor: loading || (locked && (studyWeek == null || studyWeek < 1)) ? "default" : "pointer" }}>
            {loading ? "Setting your start…" : locked ? lockedButtonLabel : "Set my start date"}
          </button>
          <p style={{ fontFamily: SERIF, fontSize: 12.5, color: C.inkFaint, margin: "10px 2px 0", textAlign: "center" }}>
            {locked
              ? "Come back on your start date to log week 1."
              : "Your start must be on a Monday. Return any time that week to fill in the weekly data."}
          </p>
        </div>
      </div>

      {toast && (
        <div className="a1c-fade" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 88, background: C.ink, color: C.card, fontFamily: MONO, fontSize: 13, padding: "10px 16px", borderRadius: 6, zIndex: 60, maxWidth: 340, textAlign: "center" }}>{toast}</div>
      )}
    </div>
  );
}
