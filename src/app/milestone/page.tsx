"use client";

import React, { useState, useEffect } from "react";
import { api, ApiError, type ParticipantSelf } from "@/lib/api";

const C = {
  pageBg: "#E6E5DD", card: "#F7F6F2", ink: "#222420", inkSoft: "#595C50",
  inkFaint: "#8A8C80", line: "#D4D3C8", lineSoft: "#E0DFD6",
  accent: "#586B4D", accentDeep: "#43543A", accentTint: "#EAEDE3",
  clay: "#9A5A3C", clayTint: "#EFE6DF", zoneMid: "#DAD8C8", zoneHi: "#C9C6B4",
};
const SERIF = "'Merriweather', Georgia, 'Times New Roman', serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const A1C_ZONES = [
  { from: 5.0, to: 5.7, bg: C.accentTint, label: "normal" },
  { from: 5.7, to: 6.5, bg: C.zoneMid, label: "prediabetes" },
  { from: 6.5, to: 8.0, bg: C.zoneHi, label: "diabetes" },
];
const FRUCT_ZONES = [
  { from: 180, to: 285, bg: C.accentTint, label: "typical · ~200–285" },
  { from: 285, to: 360, bg: C.zoneMid, label: "elevated" },
];
const WELLBEING = [
  { key: "energy",    label: "Energy",    low: "low",     high: "high"    },
  { key: "mood",      label: "Mood",      low: "low",     high: "high"    },
  { key: "digestion", label: "Digestion", low: "rough",   high: "easy"    },
  { key: "sleep",     label: "Sleep",     low: "poor",    high: "sound"   },
  { key: "hydration", label: "Hydration", low: "low",     high: "high"    },
  { key: "comfort",   label: "Comfort",   low: "in pain", high: "at ease" },
];

// A1C test type — uses 'clinic_pharmacy', distinct from fructosamine's 'clinic'
const A1C_TEST_MAP: Record<string, string> = { "Lab": "lab", "Home kit": "home_kit", "Clinic / pharmacy": "clinic_pharmacy" };
const FRUCT_TEST_MAP: Record<string, string> = { "Lab": "lab", "Home kit": "home_kit", "Clinic": "clinic" };

function dec1(s: string): string {
  let v = s.replace(/[^0-9.]/g, "");
  const i = v.indexOf(".");
  if (i !== -1) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/\./g, "").slice(0, 1);
  return v;
}

function a1cBadge(base: number, now: number) {
  const d = Math.round((now - base) * 10) / 10;
  const below = now < 5.7 && base >= 5.7;
  if (d <= -0.5) return { tone: "good", title: "A clinically meaningful change", line: `Down ${Math.abs(d)} from your start — clinicians count a change of half a point or more as clinically meaningful.${below ? " Your A1C is now below the prediabetes range." : ""}` };
  if (below) return { tone: "good", title: "Below the prediabetes range", line: `Your A1C moved from ${base} to ${now} — now under 5.7.` };
  if (d < 0) return { tone: "soft", title: "Eased down", line: `Down ${Math.abs(d)} from where you started.` };
  if (d === 0) return { tone: "neutral", title: "Holding steady", line: "Right where you started — and steady is data too." };
  return { tone: "soft", title: "Up a little", line: `Up ${d} from your start. Numbers move, for all kinds of reasons — recording it is just as valuable to the study.` };
}

function Num({ value, suffix, faded }: { value: string; suffix: string; faded?: boolean }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "baseline", gap: 4 }}>
      <span style={{ fontFamily: MONO, fontSize: 50, lineHeight: 1, color: faded ? C.inkFaint : C.ink, fontWeight: faded ? 400 : 600 }}>{value}</span>
      <span style={{ fontFamily: MONO, fontSize: 13, color: C.inkFaint }}>{suffix}</span>
    </span>
  );
}

function Compare({ label, base, now, fmt, suffix, goodDir, eps, last, noLabel }: {
  label?: string; base: number; now: number; fmt: (v: number) => string;
  suffix: string; goodDir: "down" | "up" | "none"; eps: number; last?: boolean; noLabel?: boolean;
}) {
  const d = now - base;
  const moved = Math.abs(d) > eps;
  const improving = goodDir === "down" ? d < 0 : goodDir === "up" ? d > 0 : null;
  const color = !moved || goodDir === "none" ? C.inkFaint : improving ? C.accentDeep : C.clay;
  const bg    = !moved || goodDir === "none" ? C.lineSoft  : improving ? C.accentTint : C.clayTint;
  const arrow = !moved ? "—" : d < 0 ? "↓" : "↑";
  const mag   = suffix === "µmol/L" ? `${Math.round(Math.abs(d))}` : Math.abs(d).toFixed(1);
  return (
    <div style={{ marginBottom: last ? 0 : 4 }}>
      {!noLabel && label && <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: C.inkSoft, marginBottom: 10 }}>{label}</div>}
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Num value={fmt(base)} suffix={suffix} faded />
        <span style={{ fontFamily: MONO, fontSize: 24, color: C.inkFaint }}>→</span>
        <Num value={fmt(now)} suffix={suffix} />
        <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 23, fontWeight: 600, color, background: bg, border: `1px solid ${color}33`, borderRadius: 24, padding: "6px 16px", whiteSpace: "nowrap" }}>
          {arrow} {moved ? mag : "0"}
        </span>
      </div>
      <div style={{ display: "flex", gap: 70, marginTop: 4, fontFamily: MONO, fontSize: 11.5, color: C.inkFaint }}>
        <span>baseline</span><span>now</span>
      </div>
    </div>
  );
}

function BigMarker({ at, faded, label }: { at: number; faded?: boolean; label: string }) {
  return (
    <div style={{ position: "absolute", top: 4, left: `${at}%`, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 0, height: 0, borderLeft: "8px solid transparent", borderRight: "8px solid transparent", borderTop: `11px solid ${faded ? C.inkFaint : C.accentDeep}` }} />
      <span style={{ fontFamily: MONO, fontSize: 12, color: faded ? C.inkFaint : C.accentDeep, marginTop: 3, fontWeight: faded ? 400 : 700 }}>{label}</span>
    </div>
  );
}

function Band({ lo, hi, zones, base, now }: { lo: number; hi: number; zones: { from: number; to: number; bg: string; label: string }[]; base: number; now: number }) {
  const pos = (v: number) => Math.max(0, Math.min(100, ((v - lo) / (hi - lo)) * 100));
  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ position: "relative", height: 20, borderRadius: 6, overflow: "hidden", background: C.lineSoft }}>
        {zones.map((z, i) => <div key={i} style={{ position: "absolute", top: 0, bottom: 0, left: `${pos(z.from)}%`, width: `${pos(z.to) - pos(z.from)}%`, background: z.bg }} />)}
      </div>
      <div style={{ position: "relative", height: 32 }}>
        <BigMarker at={pos(base)} faded label="was" />
        <BigMarker at={pos(now)} label="now" />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, color: C.inkFaint, marginTop: -6 }}>
        {zones.map((z, i) => <span key={i}>{z.label}</span>)}
      </div>
    </div>
  );
}

function ScaleRow({ label, low, high, value, onPick }: { label: string; low: string; high: string; value: number | undefined; onPick: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <span style={{ fontFamily: SERIF, fontSize: 17, color: C.ink }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint }}>{low} → {high}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6 }}>
        {[1, 2, 3, 4, 5].map((v) => {
          const on = value === v;
          return (
            <button key={v} aria-pressed={on} aria-label={`${label} ${v} of 5`} onClick={() => onPick(v)}
                    style={{ fontFamily: MONO, fontSize: 15.5, padding: "10px 0", cursor: "pointer", background: on ? C.accent : C.card, color: on ? C.card : C.inkFaint, border: `1px solid ${on ? C.accent : C.line}`, borderRadius: 4, transition: "background .1s, color .1s, border-color .1s" }}>
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PickRow({ label, value, set, opts }: { label: string; value: string; set: (v: string) => void; opts: string[] }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.inkSoft, marginBottom: 7 }}>{label}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {opts.map((o) => {
          const on = value === o;
          return (
            <button key={o} onClick={() => set(o)}
                    style={{ fontFamily: MONO, fontSize: 13, padding: "7px 12px", cursor: "pointer", borderRadius: 4, background: on ? C.accent : C.card, color: on ? C.card : C.inkSoft, border: `1px solid ${on ? C.accent : C.line}`, transition: "background .1s, color .1s, border-color .1s" }}>
              {o}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface MilestoneResult {
  milestoneA1c: number;
  milestoneA1cTestType: string;
  milestoneFructosamine: number | null;
  wbEnergy: number | null;
  wbMood: number | null;
  wbDigestion: number | null;
  wbSleep: number | null;
  wbHydration: number | null;
  wbPain: number | null;
  [key: string]: unknown;
}

export default function MilestonePage() {
  const [self,         setSelf]       = useState<ParticipantSelf | null>(null);
  const [studyWeek,    setStudyWeek]  = useState<number>(4);
  const [mountError,   setMountError] = useState<string | null>(null);
  const [result,       setResult]     = useState<MilestoneResult | null>(null);
  const [toast,        setToast]      = useState("");

  // entry form
  const [a1c,          setA1c]        = useState("");
  const [a1cHow,       setA1cHow]     = useState("");
  const [fruct,        setFruct]      = useState("");
  const [fructHow,     setFructHow]   = useState("");
  const [wb,           setWb]         = useState<Record<string, number>>({});
  const [adherence,    setAdherence]  = useState("");   // 0–100 (%)
  const [medChange,    setMedChange]  = useState("");   // "yes" | "no" | "unsure"
  const [whatNext,     setWhatNext]   = useState("");
  const [noteText,     setNoteText]   = useState("");
  const [submitting,   setSubmitting] = useState(false);
  const [submitError,  setSubmitError]= useState<string | null>(null);

  useEffect(() => {
    api.get("/participants/me")
      .then((data) => {
        const p = data as ParticipantSelf;
        setSelf(p);
        setStudyWeek(p.studyWeek ?? 4);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.error !== "NO_TOKEN") setMountError(err.error);
      });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const milestoneType = studyWeek <= 4 ? "week_4" : "week_8";

  const canSubmit = !!a1c && !!a1cHow && (fruct ? !!fructHow : true);

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const medChangeMap: Record<string, boolean | null> = { yes: true, no: false, unsure: null };
      const payload: Record<string, unknown> = {
        milestoneType,
        milestoneA1c:             parseFloat(a1c),
        milestoneA1cTestType:     A1C_TEST_MAP[a1cHow] ?? a1cHow,
        milestoneFructosamine:    fruct ? parseFloat(fruct) : null,
        milestoneFructosamineTestType: fruct ? (FRUCT_TEST_MAP[fructHow] ?? null) : null,
        wbEnergy:     wb.energy     ?? null,
        wbMood:       wb.mood       ?? null,
        wbDigestion:  wb.digestion  ?? null,
        wbSleep:      wb.sleep      ?? null,
        wbHydration:  wb.hydration  ?? null,
        wbPain:       wb.comfort    ?? null,
        selfReportedAdherence: adherence ? parseFloat(adherence) / 100 : null,
        medicationChangeOverall: medChange ? (medChangeMap[medChange] ?? null) : null,
        whatNext:      whatNext || null,
        freeTextNote:  noteText || null,
      };
      const res = await api.post("/milestones", payload) as MilestoneResult;
      setResult(res);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) setSubmitError("This milestone has already been recorded.");
        else setSubmitError(err.details ? Object.values(err.details).join(" · ") : err.error);
      } else {
        setSubmitError("Submit failed — please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (mountError) {
    return (
      <div style={{ background: C.pageBg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: SERIF, fontSize: 16, color: C.inkSoft }}>{mountError}</div>
      </div>
    );
  }

  // ---- results view ----
  if (result) {
    const baseA1c   = self?.baselineA1c ?? 0;
    const nowA1c    = result.milestoneA1c;
    const baseFruct = self?.baselineFructosamine ?? null;
    const nowFruct  = result.milestoneFructosamine ?? null;
    const wbBase    = null; // no baseline wb average stored
    const wbNow     = [result.wbEnergy, result.wbMood, result.wbDigestion, result.wbSleep, result.wbHydration, result.wbPain]
                        .filter((v): v is number => v != null);
    const wbAvgNow  = wbNow.length ? wbNow.reduce((a, b) => a + b, 0) / wbNow.length : null;
    const badge     = a1cBadge(baseA1c, nowA1c);
    const bs = badge.tone === "good" ? { bg: C.accentTint, bd: C.accent, mark: C.accentDeep }
             : badge.tone === "soft" ? { bg: C.clayTint, bd: C.clay, mark: C.clay }
             : { bg: C.card, bd: C.line, mark: C.inkFaint };

    return (
      <div style={{ background: C.pageBg, height: "100vh", display: "flex", flexDirection: "column", color: C.ink, overflow: "hidden" }} className="a1c-root">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap');
          .a1c-root *:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; border-radius: 2px; }
          .a1c-btn { transition: background-color .12s, color .12s, border-color .12s, transform .07s; }
          .a1c-primary:hover { background: ${C.accentDeep}; }
          .a1c-secondary:hover { border-color: ${C.accent}; color: ${C.ink}; }
          .a1c-btn:active { transform: translateY(1px); }
          .a1c-fade { animation: a1cFade .4s ease both; }
          @media (prefers-reduced-motion: reduce){ .a1c-fade{ animation:none; } }
          @keyframes a1cFade { from{opacity:0; transform:translateY(8px);} to{opacity:1; transform:none;} }
        `}</style>

        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 22px 28px" }}>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.accentDeep }}>Week {studyWeek} · milestone</div>
            <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 38, lineHeight: 1.08, letterSpacing: "-0.02em", margin: "12px 0 0" }}>
              Your {studyWeek <= 4 ? "four" : "eight"}-week mark
            </h1>
            <p style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.6, color: C.inkSoft, margin: "14px 0 0" }}>
              {studyWeek <= 4 ? "Four weeks logged, and a second reading in." : "Eight weeks — you've seen this through."} Whatever it shows, your numbers are part of the answer now.
            </p>

            <div className="a1c-fade" style={{ marginTop: 26 }}>
              <Compare label="A1C" base={baseA1c} now={nowA1c} fmt={(v) => v.toFixed(1)} suffix="%" goodDir="down" eps={0.05} />
              <Band lo={5.0} hi={8.0} zones={A1C_ZONES} base={baseA1c} now={nowA1c} />

              {baseFruct != null && nowFruct != null && (
                <>
                  <div style={{ marginTop: 26, display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.06em", textTransform: "uppercase", color: C.inkSoft }}>Fructosamine</span>
                    <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.04em", textTransform: "uppercase", color: C.accentDeep, background: C.accentTint, borderRadius: 20, padding: "3px 10px" }}>the faster-moving marker</span>
                  </div>
                  <Compare base={baseFruct} now={nowFruct} fmt={(v) => `${Math.round(v)}`} suffix="µmol/L" goodDir="down" eps={2} noLabel />
                  <Band lo={180} hi={360} zones={FRUCT_ZONES} base={baseFruct} now={nowFruct} />
                  <p style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.55, color: C.inkFaint, margin: "12px 0 0" }}>
                    Fructosamine answers faster — it reflects roughly your last 2–3 weeks, while your A1C still carries earlier months inside it.
                  </p>
                </>
              )}

              <div style={{ marginTop: 22, padding: "16px 18px", background: bs.bg, border: `1px solid ${bs.bd}`, borderRadius: 9 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 9 }}>
                  <span style={{ fontFamily: MONO, fontSize: 14, color: bs.mark }}>{badge.tone === "good" ? "◆" : "·"}</span>
                  <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 800, color: C.ink, letterSpacing: "-0.01em" }}>{badge.title}</span>
                </div>
                <p style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.55, color: C.inkSoft, margin: "8px 0 0" }}>{badge.line}</p>
              </div>
            </div>

            {wbAvgNow !== null && (
              <div className="a1c-fade" style={{ marginTop: 22 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 11 }}>How you felt</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                  {WELLBEING.map(({ key, label }) => {
                    const wbKey = key === "comfort" ? "wbPain" : `wb${label}`;
                    const v = result[wbKey] as number | null;
                    return (
                      <div key={key} style={{ padding: "10px 12px", background: C.card, border: `1px solid ${C.lineSoft}`, borderRadius: 5 }}>
                        <div style={{ fontFamily: MONO, fontSize: 11, color: C.inkFaint, marginBottom: 5 }}>{label}</div>
                        <div style={{ fontFamily: MONO, fontSize: 26, color: v != null ? C.ink : C.inkFaint }}>{v ?? "—"}</div>
                        <div style={{ fontFamily: MONO, fontSize: 10, color: C.inkFaint }}>of 5</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div style={{ marginTop: 24, padding: "15px 17px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 8 }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 8 }}>What this is</div>
              <p style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.6, color: C.inkSoft, margin: 0 }}>
                These are your own numbers, measured twice. Whether the food is <em>why</em> they moved is the question everyone&rsquo;s data answers together — one person&rsquo;s change, in any direction, isn&rsquo;t proof on its own.
              </p>
            </div>

            <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft, margin: "24px 0 0", textAlign: "center", fontStyle: "italic" }}>
              Somewhere out there, someone like you is looking for this too.
            </p>
          </div>
        </div>

        <div style={{ borderTop: `1px solid ${C.line}`, background: C.card, flexShrink: 0 }}>
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "13px 22px 15px" }}>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="a1c-btn a1c-secondary" onClick={() => setToast("This shares the study link, not your numbers.")}
                      style={{ flex: 1, fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: C.inkSoft, background: "transparent", border: `1px solid ${C.line}`, borderRadius: 6, padding: "14px", cursor: "pointer" }}>
                Invite someone like you
              </button>
              {studyWeek <= 4 && (
                <button className="a1c-btn a1c-primary" onClick={() => setToast("Heading to week 5.")}
                        style={{ flex: 1.3, fontFamily: SERIF, fontSize: 16.5, fontWeight: 700, color: C.card, background: C.accent, border: "none", borderRadius: 6, padding: "14px", cursor: "pointer" }}>
                  Keep going to week 8
                </button>
              )}
            </div>
            <p style={{ fontFamily: SERIF, fontSize: 12.5, color: C.inkFaint, margin: "10px 2px 0", textAlign: "center" }}>
              {studyWeek <= 4 ? "Week 4 is a snapshot. Week 8 makes it a clearer picture — for you, and for everyone." : "Eight weeks is the full picture. Thank you."}
            </p>
          </div>
        </div>

        {toast && (
          <div className="a1c-fade" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 92, background: C.ink, color: C.card, fontFamily: MONO, fontSize: 12.5, padding: "10px 16px", borderRadius: 6, zIndex: 60, maxWidth: 340, textAlign: "center" }}>{toast}</div>
        )}
      </div>
    );
  }

  // ---- entry form ----
  return (
    <div style={{ background: C.pageBg, height: "100vh", display: "flex", flexDirection: "column", color: C.ink, overflow: "hidden" }} className="a1c-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap');
        .a1c-root *:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; border-radius: 2px; }
        .a1c-btn { transition: background-color .12s, color .12s, border-color .12s, transform .07s; }
        .a1c-primary:hover { background: ${C.accentDeep}; }
        .a1c-btn:active { transform: translateY(1px); }
        .a1c-fade { animation: a1cFade .35s ease both; }
        @media (prefers-reduced-motion: reduce){ .a1c-fade{ animation:none; } }
        @keyframes a1cFade { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;} }
      `}</style>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "24px 22px 28px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.accentDeep }}>Week {studyWeek} · milestone</div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 36, lineHeight: 1.08, letterSpacing: "-0.02em", margin: "10px 0 0" }}>
            Your {studyWeek <= 4 ? "four" : "eight"}-week reading
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.6, color: C.inkSoft, margin: "12px 0 0" }}>
            Enter your new test results, and anything else from the last {studyWeek <= 4 ? "four" : "eight"} weeks.
          </p>

          <div style={{ height: 1, background: C.line, margin: "20px 0 22px" }} />

          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 16 }}>New test results</div>

          {/* A1C */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 9 }}>A1C <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 400, color: C.clay }}>required</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
              <input inputMode="decimal" value={a1c} onChange={(e) => setA1c(dec1(e.target.value))} placeholder=""
                     style={{ fontFamily: MONO, fontSize: 16, width: 80, padding: "9px 11px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 5, color: C.ink }} />
              <span style={{ fontFamily: MONO, fontSize: 14.5, color: C.inkSoft }}>%</span>
              <span style={{ fontFamily: SERIF, fontSize: 13.5, color: C.inkFaint, marginLeft: 4 }}>
                {self?.baselineA1c ? `was ${self.baselineA1c}%` : ""}
              </span>
            </div>
            <PickRow label="How was it measured?" value={a1cHow} set={setA1cHow} opts={Object.keys(A1C_TEST_MAP)} />
          </div>

          {/* Fructosamine */}
          <div style={{ marginBottom: 22 }}>
            <div style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: C.ink, marginBottom: 9 }}>Fructosamine <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 400, color: C.inkFaint }}>optional</span></div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
              <input inputMode="decimal" value={fruct} onChange={(e) => setFruct(dec1(e.target.value))} placeholder="—"
                     style={{ fontFamily: MONO, fontSize: 16, width: 80, padding: "9px 11px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 5, color: C.ink }} />
              <span style={{ fontFamily: MONO, fontSize: 14.5, color: C.inkSoft }}>µmol/L</span>
              {self?.baselineFructosamine && <span style={{ fontFamily: SERIF, fontSize: 13.5, color: C.inkFaint }}>was {self.baselineFructosamine}</span>}
            </div>
            {fruct && <PickRow label="How was it measured?" value={fructHow} set={setFructHow} opts={Object.keys(FRUCT_TEST_MAP)} />}
          </div>

          <div style={{ height: 1, background: C.lineSoft, margin: "4px 0 22px" }} />
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 16 }}>How you felt overall</div>
          <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 18px" }}>One to five, looking back over the whole stretch.</p>

          {WELLBEING.map((d) => (
            <ScaleRow key={d.key} {...d} value={wb[d.key]} onPick={(v) => setWb({ ...wb, [d.key]: v })} />
          ))}

          <div style={{ height: 1, background: C.lineSoft, margin: "18px 0 22px" }} />
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 16 }}>A couple of questions</div>

          <PickRow label="Any medication or supplement changes over this stretch?" value={medChange} set={setMedChange} opts={["No", "Yes", "Not sure"]} />

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.inkSoft, marginBottom: 8 }}>
              About what share of days would you say you had the hemp or cannabis as food?
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input inputMode="decimal" value={adherence} onChange={(e) => setAdherence(dec1(e.target.value))} placeholder="—"
                     style={{ fontFamily: MONO, fontSize: 16, width: 72, padding: "9px 11px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 5, color: C.ink }} />
              <span style={{ fontFamily: MONO, fontSize: 15, color: C.inkSoft }}>%</span>
              <span style={{ fontFamily: SERIF, fontSize: 13.5, color: C.inkFaint }}>of the time</span>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.inkSoft, marginBottom: 8 }}>What are you thinking about doing next?</div>
            <textarea value={whatNext} onChange={(e) => setWhatNext(e.target.value)} rows={2}
                      placeholder="Keep going, try something different, nothing yet — whatever comes to mind."
                      style={{ width: "100%", boxSizing: "border-box", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, padding: "12px 14px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 5, color: C.ink, resize: "vertical" }} />
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.inkSoft, marginBottom: 8 }}>Anything else you want to record</div>
            <textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} rows={3}
                      placeholder="A change you noticed, something that surprised you, a question for yourself later…"
                      style={{ width: "100%", boxSizing: "border-box", fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, padding: "12px 14px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 5, color: C.ink, resize: "vertical" }} />
          </div>

          {submitError && (
            <div style={{ padding: "12px 14px", background: "#FEF2EE", border: "1px solid #9A5A3C", borderRadius: 6, fontFamily: SERIF, fontSize: 14.5, color: "#9A5A3C", marginTop: 14 }}>
              {submitError}
            </div>
          )}

          {!canSubmit && (a1c || a1cHow) && (
            <div style={{ fontFamily: SERIF, fontSize: 14, color: C.clay, marginTop: 12 }}>
              {!a1c ? "Enter your A1C value." : !a1cHow ? "Select how A1C was measured." : fruct && !fructHow ? "Select how fructosamine was measured." : ""}
            </div>
          )}
        </div>
      </div>

      <div style={{ borderTop: `1px solid ${C.line}`, background: C.card, flexShrink: 0 }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "13px 22px 15px" }}>
          <button className="a1c-btn a1c-primary" onClick={submit} disabled={!canSubmit || submitting}
                  style={{ width: "100%", fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: C.card, background: canSubmit && !submitting ? C.accent : C.line, border: "none", borderRadius: 6, padding: "14px", cursor: canSubmit && !submitting ? "pointer" : "default" }}>
            {submitting ? "Saving…" : "Record my milestone"}
          </button>
          <p style={{ fontFamily: SERIF, fontSize: 12.5, color: C.inkFaint, margin: "10px 2px 0", textAlign: "center" }}>
            A1C is the only required field. Everything else is optional — fill what you have.
          </p>
        </div>
      </div>
    </div>
  );
}
