"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, type ParticipantSelf } from "@/lib/api";
import { getToken } from "@/lib/token";

const C = {
  pageBg: "#E6E5DD", card: "#F7F6F2", ink: "#222420", inkSoft: "#595C50",
  inkFaint: "#8A8C80", line: "#D4D3C8", lineSoft: "#E0DFD6",
  accent: "#586B4D", accentDeep: "#43543A", accentTint: "#EAEDE3",
};
const SERIF = "'Merriweather', Georgia, 'Times New Roman', serif";
const MONO  = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";
const DAY_LETTERS = ["M", "T", "W", "T", "F", "S", "S"];

const WELLBEING = [
  { id: "energy",    label: "Energy",    low: "low",     high: "high"    },
  { id: "mood",      label: "Mood",      low: "low",     high: "high"    },
  { id: "digestion", label: "Digestion", low: "rough",   high: "easy"    },
  { id: "sleep",     label: "Sleep",     low: "poor",    high: "sound"   },
  { id: "hydration", label: "Hydration", low: "low",     high: "high"    },
  { id: "comfort",   label: "Comfort",   low: "in pain", high: "at ease" },
];

const FRUCT_TEST_MAP: Record<string, string> = { "Lab": "lab", "Home kit": "home_kit", "Clinic": "clinic" };

// Returns ISO day of week: 1=Mon … 7=Sun
function todayDayOffset(): number {
  const d = new Date().getDay();
  return d === 0 ? 7 : d;
}

// tri-state cycle: null (unanswered) -> true (had it) -> false (didn't) -> null
const cycle = (v: boolean | null): boolean | null => v === null ? true : v === true ? false : null;

// Clamp input to one decimal place; blank = null on server
function dec1(s: string): string {
  let v = s.replace(/[^0-9.]/g, "");
  const i = v.indexOf(".");
  if (i !== -1) v = v.slice(0, i + 1) + v.slice(i + 1).replace(/\./g, "").slice(0, 1);
  return v;
}

/* ---- sub-components ---- */

function StartingNumbers({
  self, editable, a1c, setA1c, fruct, setFruct, fructHow, setFructHow,
  weight, setWeight, unit, setUnit, height, setHeight, heightUnit, setHeightUnit,
  onSave, saving, saveError,
}: {
  self: ParticipantSelf | null;
  editable: boolean;
  a1c: string; setA1c: (v: string) => void;
  fruct: string; setFruct: (v: string) => void;
  fructHow: string; setFructHow: (v: string) => void;
  weight: string; setWeight: (v: string) => void;
  unit: string; setUnit: (v: string) => void;
  height: string; setHeight: (v: string) => void;
  heightUnit: string; setHeightUnit: (v: string) => void;
  onSave: () => void;
  saving: boolean;
  saveError: string | null;
}) {
  const row = { display: "flex", alignItems: "center", gap: 10, marginBottom: 16 };
  const lab: React.CSSProperties = { fontFamily: MONO, fontSize: 13.5, color: C.inkSoft, width: 112 };
  const fld: React.CSSProperties = { fontFamily: MONO, fontSize: 16, width: 90, padding: "10px 12px", background: editable ? C.card : C.pageBg, border: `1px solid ${C.line}`, borderRadius: 5, color: C.ink };

  const UnitToggle = ({ val, set, opts }: { val: string; set: (v: string) => void; opts: string[] }) => (
    <div style={{ display: "flex", border: `1px solid ${C.line}`, borderRadius: 5, overflow: "hidden" }}>
      {opts.map((u) => (
        <button key={u} className="a1c-unit" disabled={!editable} onClick={() => set(u)}
                style={{ fontFamily: MONO, fontSize: 14, padding: "9px 14px", border: "none", cursor: editable ? "pointer" : "default", background: val === u ? C.accent : C.card, color: val === u ? C.card : C.inkSoft }}>{u}</button>
      ))}
    </div>
  );

  return (
    <div role="tabpanel" className="a1c-fade">
      <p style={prose}>
        Your baseline — set at sign-up and on day one.
        {editable ? " Fix or fill anything here; it stays open until week 1 closes, then locks." : " Week 1 has closed — these are now locked."}
      </p>

      <div style={row as React.CSSProperties}>
        <span style={lab}>A1C</span>
        <input inputMode="decimal" value={a1c} onChange={(e) => setA1c(dec1(e.target.value))} disabled={!editable} style={fld} />
        <span style={{ fontFamily: MONO, fontSize: 14.5, color: C.inkSoft }}>%</span>
      </div>

      <div style={row as React.CSSProperties}>
        <span style={lab}>Fructosamine</span>
        <input inputMode="decimal" value={fruct} onChange={(e) => setFruct(dec1(e.target.value))} disabled={!editable} placeholder="—" style={fld} />
        <span style={{ fontFamily: MONO, fontSize: 13, color: C.inkFaint }}>µmol/L · optional</span>
      </div>
      {fruct && editable && (
        <div style={{ display: "flex", gap: 6, marginLeft: 120, marginBottom: 12 }}>
          {["Lab", "Home kit", "Clinic"].map((o) => (
            <button key={o} className={`a1c-opt ${fructHow === o ? "on" : ""}`} onClick={() => setFructHow(o)}
                    style={{ fontFamily: MONO, fontSize: 12, padding: "6px 10px", cursor: "pointer", borderRadius: 4, background: fructHow === o ? C.accent : C.card, color: fructHow === o ? C.card : C.inkSoft, border: `1px solid ${fructHow === o ? C.accent : C.line}` }}>
              {o}
            </button>
          ))}
        </div>
      )}
      {fruct && !fructHow && editable && (
        <div style={{ fontFamily: SERIF, fontSize: 13, color: "#9A5A3C", marginLeft: 120, marginBottom: 12 }}>Select how it was measured.</div>
      )}

      <div style={row as React.CSSProperties}>
        <span style={lab}>Weight</span>
        <input inputMode="decimal" value={weight} onChange={(e) => setWeight(dec1(e.target.value))} disabled={!editable} placeholder="—" style={fld} />
        <UnitToggle val={unit} set={setUnit} opts={["kg", "lb"]} />
      </div>
      <div style={{ ...row, marginBottom: 0 } as React.CSSProperties}>
        <span style={lab}>Height</span>
        <input inputMode="decimal" value={height} onChange={(e) => setHeight(dec1(e.target.value))} disabled={!editable} placeholder="—" style={fld} />
        <UnitToggle val={heightUnit} set={setHeightUnit} opts={["cm", "in"]} />
      </div>
      <div style={{ fontFamily: SERIF, fontSize: 13, lineHeight: 1.5, color: C.inkFaint, marginTop: 18 }}>
        Fructosamine is optional. Weight and height go together — fill both or leave both; they&rsquo;re used only to read your numbers in context.
      </div>

      {saveError && (
        <div style={{ padding: "10px 13px", background: "#FEF2EE", border: "1px solid #9A5A3C", borderRadius: 5, fontFamily: SERIF, fontSize: 14, color: "#9A5A3C", marginTop: 14 }}>
          {saveError}
        </div>
      )}

      {editable && (
        <button className="a1c-btn a1c-primary" onClick={onSave} disabled={saving || (!!fruct && !fructHow)}
                style={{ ...btnPrimary, marginTop: 22, opacity: saving ? 0.6 : 1 }}>
          {saving ? "Saving…" : "Save starting numbers"}
        </button>
      )}
    </div>
  );
}

function PathwayStrip({ current }: { current: string }) {
  const PATH = [
    { id: "e", label: "in", kind: "enroll" },
    { id: "1", label: "1", kind: "week" }, { id: "2", label: "2", kind: "week" },
    { id: "3", label: "3", kind: "week" }, { id: "4", label: "4", kind: "milestone" },
    { id: "5", label: "5", kind: "week" }, { id: "6", label: "6", kind: "week" },
    { id: "7", label: "7", kind: "week" }, { id: "8", label: "8", kind: "milestone" },
  ];
  return (
    <div style={{ marginTop: 12, overflowX: "auto" }}>
      <div style={{ display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 12.5, whiteSpace: "nowrap" }}>
        {PATH.map((n, i) => {
          const isCurrent = n.id === current;
          const past = !isCurrent && (n.id === "e" || Number(n.id) < Number(current));
          const isMile = n.kind === "milestone";
          const fill = isCurrent ? C.accent : past ? C.inkSoft : "transparent";
          const txt  = isCurrent || past ? C.card : C.inkFaint;
          const border = isCurrent ? C.accent : past ? C.inkSoft : C.line;
          return (
            <React.Fragment key={n.id}>
              {i > 0 && <span style={{ color: C.line, padding: "0 5px" }}>─</span>}
              <span title={isMile ? `Milestone at week ${n.id}` : n.id === "e" ? "Enrolled" : `Week ${n.id}`}
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 22, height: 22, padding: "0 4px", borderRadius: isMile ? 3 : 11, background: fill, color: txt, border: `1px solid ${border}`, fontWeight: isCurrent ? 700 : 400 }}>
                {isMile ? `${n.label}◆` : n.label}
              </span>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.inkFaint, marginTop: 7 }}>
        you are on week {current} · next milestone at week 4 (A1C)
      </div>
    </div>
  );
}

function Tab({ id, active, onClick, sub, children }: { id: string; active: string; onClick: (id: string) => void; sub: string; children: React.ReactNode }) {
  const on = active === id;
  return (
    <button role="tab" aria-selected={on} className="a1c-tab" onClick={() => onClick(id)}
            style={{ flex: 1, textAlign: "left", cursor: "pointer", padding: "10px 11px", background: on ? C.card : "transparent", border: `1px solid ${on ? C.accent : C.line}`, borderRadius: 5, color: on ? C.ink : C.inkFaint }}>
      <div style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, lineHeight: 1.15 }}>{children}</div>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.06em", textTransform: "uppercase", color: on ? C.accentDeep : C.inkFaint, marginTop: 3 }}>{sub}</div>
    </button>
  );
}

function dayStyle(v: boolean | null) {
  if (v === true)  return { background: C.accent,      color: C.card,    border: `1px solid ${C.accent}`,   textDecoration: "none" };
  if (v === false) return { background: "transparent", color: C.inkFaint, border: `1px solid ${C.inkFaint}`, textDecoration: "line-through" };
  return                  { background: C.card,        color: C.inkFaint, border: `1px dashed ${C.line}`,    textDecoration: "none" };
}

function IntakeRow({ title, hint, days, onTap, had, not, unanswered, amount, setAmount, echo }: {
  title: string; hint: string; days: (boolean | null)[]; onTap: (i: number) => void;
  had: number; not: number; unanswered: number;
  amount: string; setAmount: (v: string) => void; echo?: string;
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
        <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: C.ink }}>{title}</span>
        <span style={{ fontFamily: MONO, fontSize: 13, color: C.inkFaint }}>{hint}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 7 }}>
        {days.map((v, i) => (
          <button key={i} className="a1c-cell" aria-label={`${title} day ${i + 1}: ${v === true ? "had it" : v === false ? "didn't" : "not answered"}`} onClick={() => onTap(i)}
                  style={{ fontFamily: MONO, fontSize: 16, padding: "13px 0", cursor: "pointer", borderRadius: 4, ...dayStyle(v) }}>
            {DAY_LETTERS[i]}
          </button>
        ))}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 13, color: C.inkFaint, marginTop: 8 }}>
        {had} had · {not} not{unanswered > 0 ? ` · ${unanswered} to answer` : ""}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginTop: 12 }}>
        <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.inkSoft }}>about how much per day</span>
        <input inputMode="decimal" value={amount} onChange={(e) => setAmount(dec1(e.target.value))} placeholder="—"
               style={{ fontFamily: MONO, fontSize: 15, width: 60, padding: "8px 10px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 4, color: C.ink }} />
        <span style={{ fontFamily: MONO, fontSize: 13, color: C.inkFaint }}>g</span>
        {echo && <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.inkFaint }}>{echo}</span>}
      </div>
    </div>
  );
}

function ScaleRow({ label, low, high, value, onPick }: { label: string; low: string; high: string; value: number | undefined; onPick: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: SERIF, fontSize: 17.5, color: C.ink }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.inkFaint }}>{low} → {high}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 7 }}>
        {[1, 2, 3, 4, 5].map((v) => {
          const on = value === v;
          return (
            <button key={v} className={`a1c-scale ${on ? "on" : ""}`} aria-pressed={on} aria-label={`${label} ${v} of 5`} onClick={() => onPick(v)}
                    style={{ fontFamily: MONO, fontSize: 16, padding: "11px 0", cursor: "pointer", background: on ? C.accent : C.card, color: on ? C.card : C.inkFaint, border: `1px solid ${on ? C.accent : C.line}`, borderRadius: 4 }}>
              {v}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function EducationPane() {
  const [showCal, setShowCal] = useState(false);
  const [calDay, setCalDay]   = useState(0);
  const linkRef = useRef<HTMLAnchorElement>(null);

  const buildAndDownload = () => {
    const byday = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"][calDay];
    const stamp = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//A1C Challenge//Check-in//EN", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT", `UID:a1c-${Date.now()}@a1c-challenge`, `DTSTAMP:${stamp}`,
      "SUMMARY:A1C Challenge — weekly check-in", `RRULE:FREQ=WEEKLY;BYDAY=${byday}`,
      "DURATION:PT10M", "DESCRIPTION:Five minutes for your weekly check-in. Thank you for taking part.",
      "BEGIN:VALARM", "ACTION:DISPLAY", "TRIGGER:-PT0M", "DESCRIPTION:A1C Challenge check-in", "END:VALARM",
      "END:VEVENT", "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    const a = linkRef.current!;
    a.href = url; a.download = "a1c-checkin-reminder.ics"; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div style={{ borderTop: `1px solid ${C.line}`, background: C.card, flexShrink: 0 }}>
      <div style={{ maxWidth: 560, margin: "0 auto", padding: "13px 22px 15px" }}>
        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.16em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 7 }}>Good to know</div>
        <div style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: C.inkSoft }}>
          Hemp seed and raw flower are <strong style={{ color: C.ink, fontWeight: 700 }}>foods</strong> here — eaten as part of your day, raw, unless your clinician says otherwise. This sheet waits for you: open it whenever suits your week.
        </div>
        {!showCal ? (
          <button className="a1c-info" onClick={() => setShowCal(true)} style={{ fontFamily: MONO, fontSize: 14, letterSpacing: "0.04em", color: C.accentDeep, background: "none", border: "none", padding: 0, cursor: "pointer", marginTop: 9, fontWeight: 700 }}>
            + Add a weekly reminder to your calendar
          </button>
        ) : (
          <div className="a1c-fade" style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontFamily: SERIF, fontSize: 14, color: C.inkSoft }}>Remind me on</span>
            <select value={calDay} onChange={(e) => setCalDay(Number(e.target.value))}
                    style={{ fontFamily: SERIF, fontSize: 14, padding: "6px 9px", borderRadius: 4, border: `1px solid ${C.line}`, background: C.pageBg, color: C.ink }}>
              {["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((d, i) => (
                <option key={d} value={i}>{d}s</option>
              ))}
            </select>
            <button className="a1c-btn a1c-primary" onClick={buildAndDownload}
                    style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: C.card, background: C.accent, border: "none", borderRadius: 4, padding: "7px 14px", cursor: "pointer" }}>
              Save reminder
            </button>
            <a ref={linkRef} style={{ display: "none" }}>.ics</a>
          </div>
        )}
      </div>
    </div>
  );
}

function Popover({ children, onClose, side, title }: { children: React.ReactNode; onClose: () => void; side: "left" | "right"; title: string }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, [onClose]);
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
      <div className="a1c-fade" role="dialog" aria-label={title}
           style={{ position: "absolute", top: 28, [side]: 0, zIndex: 41, width: 290, background: C.card, border: `1px solid ${C.line}`, borderRadius: 7, padding: "16px 17px", boxShadow: "0 10px 30px rgba(34,36,32,0.16)", fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.55, color: C.inkSoft }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.accentDeep, marginBottom: 10 }}>{title}</div>
        {children}
      </div>
    </>
  );
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose?: () => void }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(34,36,32,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, zIndex: 70 }}>
      <div className="a1c-fade" onClick={(e) => e.stopPropagation()} style={{ background: C.card, borderRadius: 8, maxWidth: 390, width: "100%", padding: "28px 26px" }}>
        {children}
      </div>
    </div>
  );
}

function Line({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${C.lineSoft}`, paddingBottom: 8 }}>
      <span style={{ color: C.inkFaint }}>{k}</span>
      <span style={{ color: C.ink }}>{v}</span>
    </div>
  );
}

const prose: React.CSSProperties      = { fontFamily: SERIF, fontSize: 17, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 22px" };
const btnPrimary: React.CSSProperties = { flex: 1, fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: C.card, background: C.accent, border: "none", borderRadius: 5, padding: "14px", cursor: "pointer" };
const btnSecondary: React.CSSProperties = { flex: 1, fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: C.inkSoft, background: "transparent", border: `1px solid ${C.line}`, borderRadius: 5, padding: "14px", cursor: "pointer" };

export default function WeeklyCheckInPage() {
  const router = useRouter();
  const [token,          setToken]          = useState<string | null>(null);
  const [tokenResolved,  setTokenResolved]  = useState(false);
  const [self,           setSelf]           = useState<ParticipantSelf | null>(null);
  const [studyWeek,      setStudyWeek]      = useState<number>(1);
  const [baselineEditable, setBaselineEditable] = useState(true);
  const [mountError,     setMountError]     = useState<string | null>(null);

  // baseline (starting numbers tab)
  const [baseA1c,       setBaseA1c]       = useState("");
  const [baseFruct,     setBaseFruct]     = useState("");
  const [baseFructHow,  setBaseFructHow]  = useState("");
  const [baseWeight,    setBaseWeight]    = useState("");
  const [baseUnit,      setBaseUnit]      = useState("kg");
  const [baseHeight,    setBaseHeight]    = useState("");
  const [baseHeightUnit,setBaseHeightUnit]= useState("cm");
  const [baselineSaving,setBaselineSaving]= useState(false);
  const [baselineError, setBaselineError] = useState<string | null>(null);

  // weekly check-in
  const [tab,          setTab]          = useState("objective");
  const [hemp,         setHemp]         = useState<(boolean | null)[]>(Array(7).fill(null));
  const [cannabis,     setCannabis]     = useState<(boolean | null)[]>(Array(7).fill(null));
  const [hempAmt,      setHempAmt]      = useState("");
  const [cannAmt,      setCannAmt]      = useState("");
  const [wb,           setWb]           = useState<Record<string, number>>({});
  const [weight,       setWeight]       = useState("");
  const [unit,         setUnit]         = useState("kg");
  const [note,         setNote]         = useState("");
  const [popover,      setPopover]      = useState<string | null>(null);
  const [toast,        setToast]        = useState("");
  const [confirmStep,  setConfirmStep]  = useState<string | null>(null);
  const [done,         setDone]         = useState(false);
  const [submitting,   setSubmitting]   = useState(false);
  const [warnings,     setWarnings]     = useState<string[]>([]);

  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isWeek1 = studyWeek === 1;

  // Defer token read to client-only to avoid SSR hydration mismatch
  useEffect(() => {
    const t = getToken();
    setToken(t);
    setTokenResolved(true);
  }, []);

  // On mount: fetch participant state and any existing draft
  useEffect(() => {
    if (!tokenResolved) return;
    if (!token) {
      router.replace("/before-you-begin");
      return;
    }

    api.get("/participants/me")
      .then((meData) => {
        const p = meData as ParticipantSelf;
        setSelf(p);
        const wk = p.studyWeek ?? null;
        setStudyWeek(wk ?? 1);
        setBaselineEditable(p.baselineEditable);
        setBaseA1c(p.baselineA1c ? String(p.baselineA1c) : "");
        setBaseFruct(p.baselineFructosamine ? String(p.baselineFructosamine) : "");
        setBaseFructHow(p.baselineFructosamineTestType ?? "");
        setBaseWeight(p.weightValue ? String(p.weightValue) : "");
        setBaseUnit(p.weightUnit ?? "kg");
        setBaseHeight(p.heightValue ? String(p.heightValue) : "");
        setBaseHeightUnit(p.heightUnit ?? "cm");

        // Don't fetch draft if study hasn't started yet
        if (wk == null || wk < 1) return;

        return api.get(`/checkins/draft?studyWeek=${wk}`);
      })
      .then((draft) => {
        if (!draft) return;
        const d = (draft as { draftData: Record<string, unknown> }).draftData;
        if (d.hemp)     setHemp(d.hemp as (boolean | null)[]);
        if (d.cannabis) setCannabis(d.cannabis as (boolean | null)[]);
        if (d.hempAmt)  setHempAmt(String(d.hempAmt));
        if (d.cannAmt)  setCannAmt(String(d.cannAmt));
        if (d.wb)       setWb(d.wb as Record<string, number>);
        if (d.weight)   setWeight(String(d.weight));
        if (d.unit)     setUnit(d.unit as string);
        if (d.note)     setNote(d.note as string);
      })
      .catch((err) => {
        if (err instanceof ApiError && err.status === 404) return; // no draft yet — fine
        if (err instanceof ApiError && err.error !== "NO_TOKEN") {
          setMountError(err.error);
        }
      });
  }, [tokenResolved, token, router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // Autosave draft — debounced 2s
  const saveDraft = useCallback(() => {
    if (!token || !studyWeek) return;
    api.post("/checkins/draft", {
      studyWeek,
      lastSavedOffset: todayDayOffset(),
      draftData: { hemp, cannabis, hempAmt, cannAmt, wb, weight, unit, note },
    }).catch(() => { /* silent — draft save is best-effort */ });
  }, [token, studyWeek, hemp, cannabis, hempAmt, cannAmt, wb, weight, unit, note]);

  useEffect(() => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    autosaveTimer.current = setTimeout(saveDraft, 2000);
    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [saveDraft]);

  const saveBaseline = async () => {
    setBaselineSaving(true);
    setBaselineError(null);
    try {
      const hasWeight = !!baseWeight;
      const hasHeight = !!baseHeight;
      if (hasWeight !== hasHeight) {
        setBaselineError("Weight and height must both be filled or both left blank.");
        return;
      }
      const payload: Record<string, unknown> = {
        baselineA1c: parseFloat(baseA1c),
        baselineFructosamine:         baseFruct ? parseFloat(baseFruct) : null,
        baselineFructosamineTestType: baseFruct ? (FRUCT_TEST_MAP[baseFructHow] ?? null) : null,
        weightValue: hasWeight ? parseFloat(baseWeight) : null,
        weightUnit:  hasWeight ? (baseUnit === "lb" ? "lbs" : baseUnit) : null,
        heightValue: hasHeight ? parseFloat(baseHeight) : null,
        heightUnit:  hasHeight ? baseHeightUnit : null,
      };
      await api.patch("/participants/me/baseline", payload);
      setToast("Baseline saved.");
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setBaselineError("Week 1 has closed — baseline is now locked.");
        setBaselineEditable(false);
      } else if (err instanceof ApiError) {
        setBaselineError(err.details ? Object.values(err.details).join(" · ") : err.error);
      } else {
        setBaselineError("Save failed — please try again.");
      }
    } finally {
      setBaselineSaving(false);
    }
  };

  const submitCheckIn = async () => {
    setSubmitting(true);
    try {
      const payload = {
        studyWeek,
        submittedAtDayOffset: todayDayOffset(),
        hempDayMon: hemp[0], hempDayTue: hemp[1], hempDayWed: hemp[2],
        hempDayThu: hemp[3], hempDayFri: hemp[4], hempDaySat: hemp[5], hempDaySun: hemp[6],
        hempAmountG:    hempAmt ? parseFloat(hempAmt) : null,
        cannabisDayMon: cannabis[0], cannabisDayTue: cannabis[1], cannabisDayWed: cannabis[2],
        cannabisDayThu: cannabis[3], cannabisDayFri: cannabis[4], cannabisDaySat: cannabis[5], cannabisDaySun: cannabis[6],
        cannabisAmountG: cannAmt ? parseFloat(cannAmt) : null,
        wbEnergy:     wb.energy     ?? null,
        wbMood:       wb.mood       ?? null,
        wbDigestion:  wb.digestion  ?? null,
        wbSleep:      wb.sleep      ?? null,
        wbHydration:  wb.hydration  ?? null,
        wbPain:       wb.comfort    ?? null,
        weightValue:  weight ? parseFloat(weight) : null,
        weightUnit:   weight ? (unit === "lb" ? "lbs" : unit) : null,
        freeTextNote: note || null,
      };
      const res = await api.post("/checkins", payload) as { warnings?: string[] };
      setWarnings(res.warnings ?? []);
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) {
        setToast(err.status === 409 ? "This week has already been submitted." : err.error);
      } else {
        setToast("Submit failed — please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const answered    = (arr: (boolean | null)[]) => arr.filter((v) => v !== null).length;
  const had         = (arr: (boolean | null)[]) => arr.filter((v) => v === true).length;
  const not         = (arr: (boolean | null)[]) => arr.filter((v) => v === false).length;
  const hempAnswered = answered(hemp);
  const cannAnswered = answered(cannabis);
  const weekComplete = hempAnswered === 7 && cannAnswered === 7;
  const wbDone       = Object.keys(wb).length;

  const tapDay = (arr: (boolean | null)[], set: (a: (boolean | null)[]) => void, i: number) => {
    const n = arr.slice(); n[i] = cycle(n[i]); set(n);
  };

  const onDone = () => wbDone < 6 ? setConfirmStep("ask") : submitCheckIn();

  if (!tokenResolved) return null;

  if (mountError) {
    return (
      <div style={{ background: C.pageBg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ fontFamily: SERIF, fontSize: 16, color: C.inkSoft, textAlign: "center" }}>{mountError}</div>
      </div>
    );
  }

  if (self && (self.studyWeek == null || self.studyWeek < 1)) {
    return (
      <div style={{ background: C.pageBg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 380, textAlign: "center" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 26, color: C.ink, marginBottom: 14 }}>Not quite yet</div>
          <div style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: C.inkSoft, marginBottom: 22 }}>
            Your first week starts on <strong style={{ color: C.ink }}>{self.startDate ?? "your chosen Monday"}</strong>. Come back then to log week 1.
          </div>
          <a href="/day-one" style={{ fontFamily: SERIF, fontSize: 15, fontWeight: 700, color: C.card, background: C.accent, borderRadius: 6, padding: "12px 24px", textDecoration: "none", display: "inline-block" }}>
            Back to day one
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="a1c-root" style={{ background: C.pageBg, height: "100vh", display: "flex", flexDirection: "column", color: C.ink, overflow: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap');
        .a1c-root *:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; border-radius: 2px; }
        .a1c-cell, .a1c-scale, .a1c-unit, .a1c-btn, .a1c-tab { transition: background-color .12s ease, color .12s ease, border-color .12s ease, transform .07s ease; }
        .a1c-cell:hover, .a1c-scale:hover:not(.on) { border-color: ${C.accent}; }
        .a1c-primary:hover { background: ${C.accentDeep}; }
        .a1c-secondary:hover { border-color: ${C.accent}; color: ${C.ink}; }
        .a1c-btn:active { transform: translateY(1px); }
        .a1c-info:hover { color: ${C.accentDeep}; }
        .a1c-fade { animation: a1cFade .35s ease both; }
        @media (prefers-reduced-motion: reduce){ .a1c-fade{ animation:none; } }
        @keyframes a1cFade { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;} }
      `}</style>

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "18px 22px 26px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, position: "relative" }}>
            <button className="a1c-info" onClick={() => setPopover(popover === "title" ? null : "title")} aria-expanded={popover === "title"}
                    style={{ fontFamily: MONO, fontSize: 13.5, letterSpacing: "0.04em", color: C.inkSoft, background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left" }}>
              The A1C Challenge · Weekly check-in
            </button>
            <button className="a1c-info" onClick={() => setPopover(popover === "token" ? null : "token")} aria-expanded={popover === "token"}
                    style={{ fontFamily: MONO, fontSize: 13.5, letterSpacing: "0.04em", color: C.inkFaint, background: "none", border: "none", padding: 0, cursor: "pointer", whiteSpace: "nowrap" }}>
              {token ?? "—"}
            </button>
            {popover === "title" && (
              <Popover onClose={() => setPopover(null)} side="left" title="Want to learn more?">
                <p style={{ margin: "0 0 10px" }}>The A1C Challenge looks at whether eating hemp seed and raw cannabis flower, as everyday food, tracks with changes in blood-sugar control over four weeks.</p>
                <p style={{ margin: 0, color: C.inkFaint }}>It&rsquo;s observational and self-reported — a shared look, not a treatment.</p>
              </Popover>
            )}
            {popover === "token" && (
              <Popover onClose={() => setPopover(null)} side="right" title="What is this?">
                <p style={{ margin: "0 0 10px" }}>This is your whole identity here — no name, no email. It&rsquo;s how your weeks stay linked together while staying anonymous.</p>
                <div style={{ fontFamily: MONO, fontSize: 15, color: C.ink, background: C.pageBg, border: `1px solid ${C.line}`, borderRadius: 4, padding: "9px 11px", textAlign: "center", margin: "0 0 10px" }}>{token}</div>
                <p style={{ margin: 0, color: C.inkFaint }}>Write it down somewhere safe. If it&rsquo;s lost there&rsquo;s no way to recover it — that&rsquo;s the trade for keeping you anonymous.</p>
              </Popover>
            )}
          </div>

          <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 54, lineHeight: 1, letterSpacing: "-0.02em", marginTop: 10 }}>
            Week {studyWeek}
          </div>

          <PathwayStrip current={String(studyWeek)} />
          <div style={{ height: 1, background: C.line, margin: "14px 0 18px" }} />

          <div role="tablist" aria-label="Check-in sections" style={{ display: "flex", gap: 7, marginBottom: 22 }}>
            <Tab id="objective" active={tab} onClick={setTab} sub="for science">Intake &amp; measures</Tab>
            {isWeek1 && <Tab id="starting" active={tab} onClick={setTab} sub="week 1 · baseline">Starting numbers</Tab>}
            <Tab id="subjective" active={tab} onClick={setTab} sub="how it felt">This week</Tab>
          </div>

          {tab === "starting" ? (
            <StartingNumbers
              self={self}
              editable={baselineEditable}
              a1c={baseA1c} setA1c={setBaseA1c}
              fruct={baseFruct} setFruct={setBaseFruct}
              fructHow={baseFructHow} setFructHow={setBaseFructHow}
              weight={baseWeight} setWeight={setBaseWeight}
              unit={baseUnit} setUnit={setBaseUnit}
              height={baseHeight} setHeight={setBaseHeight}
              heightUnit={baseHeightUnit} setHeightUnit={setBaseHeightUnit}
              onSave={saveBaseline}
              saving={baselineSaving}
              saveError={baselineError}
            />
          ) : tab === "objective" ? (
            <div role="tabpanel" className="a1c-fade">
              <p style={prose}>Mark each day you had it, eaten as food.</p>
              <div style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint, margin: "-10px 0 22px" }}>
                tap a day to cycle · <span style={{ color: C.accentDeep }}>had it</span> → <span style={{ textDecoration: "line-through" }}>didn&rsquo;t</span> → clear
              </div>
              <IntakeRow title="Hemp seed" hint={self ? `your amount · ${self.baselineA1c ? "" : ""}` : ""} days={hemp} onTap={(i) => tapDay(hemp, setHemp, i)} had={had(hemp)} not={not(hemp)} unanswered={7 - hempAnswered}
                         amount={hempAmt} setAmount={setHempAmt} echo={parseFloat(hempAmt) ? `≈ ${(parseFloat(hempAmt) / 10).toFixed(1)} tbsp` : "1 tbsp ≈ 10 g"} />
              <IntakeRow title="Raw cannabis flower" hint="aim · at least 1 g/day, raw" days={cannabis} onTap={(i) => tapDay(cannabis, setCannabis, i)} had={had(cannabis)} not={not(cannabis)} unanswered={7 - cannAnswered}
                         amount={cannAmt} setAmount={setCannAmt} />
              <div style={{ height: 1, background: C.lineSoft, margin: "24px 0 16px" }} />
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 13 }}>Measures about you</div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <label style={{ fontFamily: MONO, fontSize: 14.5, color: C.inkSoft, width: 96 }}>Your weight</label>
                <input inputMode="decimal" value={weight} onChange={(e) => setWeight(dec1(e.target.value))} placeholder="—"
                       style={{ fontFamily: MONO, fontSize: 16.5, width: 96, padding: "9px 11px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 4, color: C.ink }} />
                <div style={{ display: "flex", border: `1px solid ${C.line}`, borderRadius: 4, overflow: "hidden" }}>
                  {["kg", "lb"].map((u) => (
                    <button key={u} className="a1c-unit" onClick={() => setUnit(u)}
                            style={{ fontFamily: MONO, fontSize: 14.5, padding: "9px 16px", border: "none", cursor: "pointer", background: unit === u ? C.accent : C.card, color: unit === u ? C.card : C.inkSoft }}>
                      {u}
                    </button>
                  ))}
                </div>
                <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.inkFaint }}>optional</span>
              </div>
            </div>
          ) : (
            <div role="tabpanel" className="a1c-fade">
              <p style={prose}>A quick read on each, 1 to 5. Your sense of the week is enough — blank is a fine answer.</p>
              {WELLBEING.map(({ id, ...rest }) => (
                <ScaleRow key={id} {...rest} value={wb[id]} onPick={(v) => setWb({ ...wb, [id]: v })} />
              ))}
              <div style={{ height: 1, background: C.lineSoft, margin: "22px 0 18px" }} />
              <label style={{ fontFamily: MONO, fontSize: 14.5, color: C.inkSoft, display: "block", marginBottom: 9 }}>Anything worth noting</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
                        placeholder="A change you noticed, a hard week, a question for yourself later…"
                        style={{ width: "100%", boxSizing: "border-box", fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.6, padding: "13px 15px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 4, color: C.ink, resize: "vertical" }} />
            </div>
          )}

          {tab === "starting" ? (
            <button className="a1c-btn a1c-primary" onClick={() => setTab("objective")} style={{ ...btnPrimary, width: "100%", marginTop: 28 }}>
              Continue to this week →
            </button>
          ) : (
            <>
              <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
                <button className={`a1c-btn ${weekComplete ? "a1c-secondary" : "a1c-primary"}`}
                        onClick={() => { saveDraft(); setToast("Draft saved — close and come back any time before the week closes."); }}
                        style={weekComplete ? btnSecondary : btnPrimary}>
                  Save as draft
                </button>
                <button className={`a1c-btn ${weekComplete ? "a1c-primary" : "a1c-secondary"}`} onClick={onDone} disabled={submitting}
                        style={weekComplete ? { ...btnPrimary, opacity: submitting ? 0.6 : 1 } : btnSecondary}>
                  {submitting ? "Submitting…" : "Done"}
                </button>
              </div>
              <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.6, color: C.inkFaint, margin: "14px 2px 0", textAlign: "center" }}>
                Both keep your work. <strong style={{ color: C.inkSoft, fontWeight: 700 }}>Done</strong> marks the week complete; you can still reopen and change it until the week closes.
              </p>
            </>
          )}
        </div>
      </div>

      <EducationPane />

      {toast && (
        <div className="a1c-fade" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 148, background: C.ink, color: C.card, fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.45, padding: "11px 16px", borderRadius: 6, maxWidth: 360, textAlign: "center", zIndex: 60 }}>
          {toast}
        </div>
      )}

      {confirmStep === "ask" && (
        <Modal>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accentDeep }}>Before you finish</div>
          <div style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 700, color: C.ink, margin: "10px 0 12px", lineHeight: 1.3 }}>Finish week {studyWeek}?</div>
          <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft, margin: 0 }}>
            You filled in {wbDone} of the six reads on <em>This week</em>. Blank is a fine answer — fill the rest only if something comes to mind.
          </p>
          <div style={{ display: "flex", gap: 12, marginTop: 22 }}>
            <button className="a1c-btn a1c-secondary" onClick={() => setConfirmStep(null)} style={{ ...btnSecondary, flex: 1 }}>Keep editing</button>
            <button className="a1c-btn a1c-primary" onClick={() => { setConfirmStep(null); submitCheckIn(); }} style={{ ...btnPrimary, flex: 1 }}>Finish week</button>
          </div>
        </Modal>
      )}

      {done && (
        <Modal onClose={() => setDone(false)}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accentDeep }}>Week complete</div>
          <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 32, color: C.ink, margin: "10px 0 18px", letterSpacing: "-0.01em" }}>Week {studyWeek} is in</div>
          <div style={{ display: "grid", gap: 9, fontFamily: MONO, fontSize: 14, color: C.inkSoft }}>
            <Line k="days had" v={`${had(hemp) + had(cannabis)}`} />
            <Line k="wellbeing" v={`${wbDone} of 6 noted`} />
          </div>
          {warnings.length > 0 && (
            <div style={{ marginTop: 16, padding: "12px 14px", background: "#FEF9EC", border: "1px solid #C8A44A", borderRadius: 6 }}>
              {warnings.map((w, i) => (
                <div key={i} style={{ fontFamily: SERIF, fontSize: 13.5, color: "#7A6020", lineHeight: 1.5, marginBottom: i < warnings.length - 1 ? 8 : 0 }}>{w}</div>
              ))}
            </div>
          )}
          <p style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.6, color: C.inkFaint, margin: "20px 0 0" }}>Nothing here identifies you. You can reopen week {studyWeek} and change it until it closes.</p>
          <button className="a1c-btn a1c-primary" onClick={() => setDone(false)} style={{ ...btnPrimary, marginTop: 22, width: "100%" }}>Back to my week</button>
        </Modal>
      )}
    </div>
  );
}
