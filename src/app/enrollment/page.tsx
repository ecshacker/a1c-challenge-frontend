"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError } from "@/lib/api";
import { setPendingToken, persistToken } from "@/lib/token";

const C = {
  pageBg: "#E6E5DD", card: "#F7F6F2", ink: "#222420", inkSoft: "#595C50",
  inkFaint: "#8A8C80", line: "#D4D3C8", lineSoft: "#E0DFD6",
  accent: "#586B4D", accentDeep: "#43543A", accentTint: "#EAEDE3", warn: "#9A5A3C",
};
const SERIF = "'Merriweather', Georgia, 'Times New Roman', serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const WELLBEING = [
  { id: "energy",   label: "Energy",    low: "low",     high: "high"    },
  { id: "mood",     label: "Mood",      low: "low",     high: "high"    },
  { id: "digestion",label: "Digestion", low: "rough",   high: "easy"    },
  { id: "sleep",    label: "Sleep",     low: "poor",    high: "sound"   },
  { id: "hydration",label: "Hydration", low: "low",     high: "high"    },
  { id: "comfort",  label: "Comfort",   low: "in pain", high: "at ease" },
];

const STEPS = ["Eligibility", "Your baseline", "How you're starting", "A few details"];

const AGE_CONTEXT: Record<string, { pct: string; group: string; note: string }> = {
  "18-29": { pct: "more than 1 in 4", group: "adults 18–44", note: "And it's climbing faster in your age group than any other — while being studied the least. That gap is exactly what your readings help fill." },
  "30-44": { pct: "more than 1 in 4", group: "adults 18–44", note: "And type 2 diabetes is rising fast in adults under their mid-40s, where research is thinnest. That's exactly the gap your readings help fill." },
  "45-59": { pct: "close to half",    group: "adults 45–64", note: "You're in plenty of company. What no one has studied is whether these foods, eaten raw, change anything — that's what you're helping find out." },
  "60-74": { pct: "nearly half",      group: "adults 60 and over", note: "You're in plenty of company. What no one has studied is whether these foods, eaten raw, change anything — that's what you're helping find out." },
  "75plus": { pct: "nearly half",     group: "adults 65 and older", note: "You're in plenty of company. The question this study asks — raw, as food — hasn't been looked at, at any age. Your part helps answer it." },
};

// Maps UI display labels to schema enum values
const AGE_BAND_LABELS: [string, string][] = [
  ["18–29", "18-29"], ["30–44", "30-44"], ["45–59", "45-59"],
  ["60–74", "60-74"], ["75 +",  "75plus"],
];
const SEX_MAP: Record<string, string> = {
  "Female": "female", "Male": "male", "Intersex": "intersex",
  "Prefer not to say": "prefer_not_to_say",
};
const A1C_TEST_MAP: Record<string, string> = {
  "Lab": "lab", "Home kit": "home_kit", "Pharmacy / clinic": "clinic_pharmacy",
};
const FRUCT_TEST_MAP: Record<string, string> = {
  "Lab": "lab", "Home kit": "home_kit", "Clinic": "clinic",
};
const ETHNICITY_OPTIONS: [string, string][] = [
  ["American Indian or Alaska Native", "american_indian_alaska_native"],
  ["Asian",                             "asian"],
  ["Black / African American",          "black_african_american"],
  ["Hispanic or Latino",                "hispanic_latino"],
  ["Middle Eastern / North African",    "middle_eastern_north_african"],
  ["Native Hawaiian / Pacific Islander","native_hawaiian_pacific_islander"],
  ["White / European",                  "white_european"],
  ["Multiracial",                       "multiracial"],
  ["Other",                             "other"],
  ["Prefer not to say",                 "prefer_not_to_say"],
];
const DIABETES_OPTIONS: [string, string][] = [
  ["Type 1",         "type1"],
  ["Type 2",         "type2"],
  ["Prediabetes / at risk", "prediabetes"],
  ["Not sure",       "unknown"],
];
const GLUCOSE_MON_OPTIONS: [string, string][] = [
  ["None",        "none"],
  ["Fingerstick", "fingerstick"],
  ["CGM",         "cgm"],
];
const CARE_OPTIONS: [string, string][] = [
  ["Adding to my current care",        "adding_to_standard_care"],
  ["Instead of standard care",         "replacing_standard_care"],
  ["No current standard care",         "no_current_standard_care"],
];

function deriveA1cMonthYear(label: string): { month: number; year: number } {
  const now = new Date();
  const offsets: Record<string, number> = {
    "This month": 0, "Last month": -1, "Two months ago": -2,
  };
  const off = offsets[label] ?? 0;
  const d = new Date(now.getFullYear(), now.getMonth() + off, 1);
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

function todayDayOffset(): number {
  const d = new Date().getDay(); // 0=Sun
  return d === 0 ? 7 : d;       // 1=Mon…7=Sun
}

/* ---- sub-components ---- */

function TokenReveal({ token, saved, setSaved, onCopy, onContinue }: {
  token: string;
  saved: boolean;
  setSaved: (v: boolean) => void;
  onCopy: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="a1c-fade" style={{ padding: "34px 22px 28px", minHeight: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.accentDeep }}>You&rsquo;re in</div>
      <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 30, letterSpacing: "-0.01em", margin: "12px 0 6px" }}>This is your code</h1>
      <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 22px" }}>
        Write it down now — somewhere you&rsquo;ll still find it in four weeks.
      </p>
      <div style={{ background: C.card, border: `1.5px solid ${C.accent}`, borderRadius: 10, padding: "26px 18px", textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: "0.08em", color: C.ink, wordBreak: "break-all" }}>{token}</div>
        <button className="a1c-ghost" onClick={onCopy} style={{ marginTop: 16, fontFamily: MONO, fontSize: 13, color: C.accentDeep, background: "none", border: `1px solid ${C.line}`, borderRadius: 5, padding: "8px 16px", cursor: "pointer", fontWeight: 600 }}>Copy</button>
      </div>
      <div style={{ marginTop: 22, padding: "16px 18px", background: C.accentTint, border: `1px solid ${C.accent}`, borderRadius: 8 }}>
        <div style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft }}>
          This is your whole identity here. There&rsquo;s no name or email attached — so no one, <em>including us</em>, can recover it for you. That&rsquo;s exactly what keeps you anonymous. Lose it and you&rsquo;d start over.
        </div>
      </div>
      <label style={{ display: "flex", alignItems: "flex-start", gap: 11, marginTop: 24, cursor: "pointer" }}>
        <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)}
               style={{ width: 20, height: 20, marginTop: 1, accentColor: C.accent, flexShrink: 0 }} />
        <span style={{ fontFamily: SERIF, fontSize: 16, color: C.ink, fontWeight: 700 }}>I&rsquo;ve written it down somewhere safe.</span>
      </label>
      <button className="a1c-btn a1c-primary" disabled={!saved} onClick={onContinue}
              style={{ marginTop: 22, fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: C.card, background: saved ? C.accent : C.line, border: "none", borderRadius: 6, padding: "15px", cursor: saved ? "pointer" : "not-allowed" }}>
        Continue to Day One →
      </button>
    </div>
  );
}

function YesNo({ q, v, set, yes = "Yes", no = "No" }: { q: string; v: boolean | null; set: (v: boolean) => void; yes?: string; no?: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontFamily: SERIF, fontSize: 17, color: C.ink, marginBottom: 11 }}>{q}</div>
      <div style={{ display: "flex", gap: 10 }}>
        {([[true, yes], [false, no]] as [boolean, string][]).map(([val, lab]) => (
          <button key={lab} className={`a1c-opt ${v === val ? "on" : ""}`} onClick={() => set(val)}
                  style={{ flex: 1, fontFamily: SERIF, fontSize: 16, fontWeight: 600, padding: "12px", cursor: "pointer", borderRadius: 6, background: v === val ? C.accent : C.card, color: v === val ? C.card : C.inkSoft, border: `1px solid ${v === val ? C.accent : C.line}` }}>
            {lab}
          </button>
        ))}
      </div>
    </div>
  );
}

function Choice({ options, value, set, wrap }: { options: string[]; value: string; set: (v: string) => void; wrap?: boolean }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: wrap ? "wrap" : "nowrap" }}>
      {options.map((o) => (
        <button key={o} className={`a1c-opt ${value === o ? "on" : ""}`} onClick={() => set(o)}
                style={{ flex: wrap ? "0 1 auto" : 1, fontFamily: MONO, fontSize: 13.5, padding: "10px 14px", cursor: "pointer", borderRadius: 5, background: value === o ? C.accent : C.card, color: value === o ? C.card : C.inkSoft, border: `1px solid ${value === o ? C.accent : C.line}`, whiteSpace: "nowrap" }}>
          {o}
        </button>
      ))}
    </div>
  );
}

function EnumButtons({ pairs, value, set }: { pairs: [string, string][]; value: string; set: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {pairs.map(([label, val]) => (
        <button key={val} className={`a1c-opt ${value === val ? "on" : ""}`} onClick={() => set(val)}
                style={{ textAlign: "left", fontFamily: SERIF, fontSize: 15.5, padding: "11px 14px", cursor: "pointer", borderRadius: 5, background: value === val ? C.accent : C.card, color: value === val ? C.card : C.inkSoft, border: `1px solid ${value === val ? C.accent : C.line}` }}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Scale({ label, low, high, value, onPick }: { label: string; low: string; high: string; value: number | undefined; onPick: (v: number) => void }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontFamily: SERIF, fontSize: 17, color: C.ink }}>{label}</span>
        <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.inkFaint }}>{low} → {high}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 7 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const on = value === n;
          return (
            <button key={n} className={`a1c-scale ${on ? "on" : ""}`} aria-pressed={on} onClick={() => onPick(n)}
                    style={{ fontFamily: MONO, fontSize: 16, padding: "11px 0", cursor: "pointer", background: on ? C.accent : C.card, color: on ? C.card : C.inkFaint, border: `1px solid ${on ? C.accent : C.line}`, borderRadius: 4 }}>
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, optional, children }: { label: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
        <span style={{ fontFamily: SERIF, fontSize: 16.5, fontWeight: 700, color: C.ink }}>{label}</span>
        {optional && <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.inkFaint, textTransform: "uppercase", letterSpacing: "0.1em" }}>optional</span>}
      </div>
      {children}
    </div>
  );
}

function AgeContext({ ctx, onDismiss }: { ctx: { pct: string; group: string; note: string }; onDismiss: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onDismiss();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onDismiss]);
  return (
    <div ref={ref} className="a1c-fade" style={{ marginTop: 12, padding: "14px 16px", background: C.accentTint, border: `1px solid ${C.accent}`, borderRadius: 7, position: "relative" }}>
      <button onClick={onDismiss} aria-label="Dismiss"
              style={{ position: "absolute", top: 10, right: 12, fontFamily: MONO, fontSize: 16, lineHeight: 1, color: C.inkFaint, background: "none", border: "none", cursor: "pointer", padding: "2px 4px" }}>×</button>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.accentDeep, marginBottom: 7 }}>You&rsquo;re not alone in this</div>
      <div style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.6, color: C.inkSoft }}>
        <strong style={{ color: C.ink, fontWeight: 700 }}>{ctx.pct} of {ctx.group}</strong> are in the prediabetes range too — so you&rsquo;re far from the only one your age watching these numbers. {ctx.note}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.inkFaint, marginTop: 9 }}>Source · CDC National Diabetes Statistics Report</div>
    </div>
  );
}

function Care({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return (
    <div className="a1c-fade" style={{ margin: "-8px 0 22px", padding: "13px 15px", background: tone === "route" ? C.accentTint : C.card, border: `1px solid ${tone === "route" ? C.accent : C.line}`, borderRadius: 6, fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: C.inkSoft }}>
      {children}
    </div>
  );
}

function Note({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return <div style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.5, color: tone === "warn" ? C.warn : C.inkFaint, marginTop: 9 }}>{children}</div>;
}

const lead: React.CSSProperties = { fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 24px" };
const inp: React.CSSProperties  = { fontFamily: MONO, fontSize: 16, padding: "10px 12px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 5, color: C.ink };
const sel: React.CSSProperties  = { fontFamily: SERIF, fontSize: 15.5, padding: "11px 12px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 5, color: C.ink, width: "100%", boxSizing: "border-box" };

export default function EnrollmentIntakePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [token, setToken] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [enrollError, setEnrollError] = useState<string | null>(null);

  // eligibility
  const [age18, setAge18] = useState<boolean | null>(null);
  const [pregnant, setPregnant] = useState<boolean | null>(null);
  const [hasA1c, setHasA1c] = useState<boolean | null>(null);

  // baseline (step 1)
  const [a1c, setA1c] = useState("");
  const [a1cMonth, setA1cMonth] = useState("");
  const [a1cHow, setA1cHow] = useState("");
  const [diabetesType, setDiabetesType] = useState("");
  const [glucoseMonType, setGlucoseMonType] = useState("");
  const [fruct, setFruct] = useState("");
  const [fructHow, setFructHow] = useState("");

  // starting (step 2)
  const [wb, setWb] = useState<Record<string, number>>({});
  const [dose, setDose] = useState(40);

  // details (step 3)
  const [ageBand, setAgeBand] = useState("");  // schema value e.g. "18-29"
  const [ageCtxDismissed, setAgeCtxDismissed] = useState(false);
  const [sex, setSex] = useState("");
  const [country, setCountry] = useState("");
  const [ethnicity, setEthnicity] = useState("");
  const [nation, setNation] = useState("");
  const [careApproach, setCareApproach] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2400);
    return () => clearTimeout(t);
  }, [toast]);

  const a1cNum = parseFloat(a1c);
  const a1cValid = !isNaN(a1cNum) && a1cNum >= 5.7 && a1cNum <= 20;
  const a1cBelow = !isNaN(a1cNum) && a1cNum < 5.7;
  const eligGate = age18 === true && pregnant === false && hasA1c === true;
  const aianSelected = ethnicity === "american_indian_alaska_native";

  const canContinue = () => {
    if (step === 0) return eligGate;
    if (step === 1) return a1cValid && !!a1cMonth && !!a1cHow && !!diabetesType && !!glucoseMonType && (!fruct || !!fructHow);
    if (step === 2) return true;
    if (step === 3) return !!ageBand && !!country && !!careApproach && (!aianSelected || !!nation);
    return false;
  };

  const next = async () => {
    if (step < 3) { setStep(step + 1); return; }

    setLoading(true);
    setEnrollError(null);
    try {
      const { month: baselineA1cMonth, year: baselineA1cYear } = deriveA1cMonthYear(a1cMonth);

      const payload = {
        ageRange:           ageBand,
        biologicalSex:      sex ? SEX_MAP[sex] ?? "prefer_not_to_say" : "prefer_not_to_say",
        ethnicity:          ethnicity || undefined,
        tribalNation:       aianSelected ? nation || undefined : undefined,
        countryRegion:      country,
        diabetesType,
        baselineA1c:        parseFloat(a1c),
        baselineA1cTestType: A1C_TEST_MAP[a1cHow] ?? a1cHow,
        baselineA1cMonth,
        baselineA1cYear,
        baselineFructosamine:         fruct ? parseFloat(fruct) : undefined,
        baselineFructosamineTestType: fruct ? (FRUCT_TEST_MAP[fructHow] ?? undefined) : undefined,
        glucoseMonitoringType: glucoseMonType,
        careApproach,
        // Medications: defaulted — UI doesn't ask; medNone=true satisfies NOT NULL
        medMetformin: false, medGlp1: false, medSglt2: false,
        medInsulin: false, medSulfonylurea: false, medNone: true,
        hempIntendedDailyG: dose,
        // Conditions: defaulted — UI doesn't ask; condNone=true satisfies NOT NULL
        condNafld: false, condPcos: false, condHypertension: false, condHypothyroid: false,
        condIbdCrohns: false, condIbs: false, condFibromyalgia: false,
        condAnxietyDepression: false, condSleepDisorder: false, condDyslipidemia: false,
        condChronicPain: false, condPancreatitisHistory: false, condNone: true,
        wbBaselineEnergy:     wb.energy     ?? null,
        wbBaselineMood:       wb.mood       ?? null,
        wbBaselineDigestion:  wb.digestion  ?? null,
        wbBaselineSleep:      wb.sleep      ?? null,
        wbBaselineHydration:  wb.hydration  ?? null,
        wbBaselinePain:       wb.comfort    ?? null,
      };

      const res = await api.post("/participants/enroll", payload) as { token: string };
      setPendingToken(res.token);
      setToken(res.token);
      setStep(4);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details) {
          setEnrollError(Object.values(err.details).join(" · "));
        } else {
          setEnrollError(err.error === "STUDY_CLOSED"
            ? "Enrollment is currently closed. Check back soon."
            : err.error);
        }
      } else {
        setEnrollError("Something went wrong — please try again.");
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
        .a1c-btn,.a1c-opt,.a1c-scale { transition: background-color .12s, color .12s, border-color .12s, transform .07s; }
        .a1c-primary:enabled:hover { background: ${C.accentDeep}; }
        .a1c-opt:hover:not(.on),.a1c-scale:hover:not(.on) { border-color: ${C.accent}; }
        .a1c-ghost:hover { color: ${C.ink}; }
        .a1c-btn:active { transform: translateY(1px); }
        .a1c-fade { animation: a1cFade .35s ease both; }
        @media (prefers-reduced-motion: reduce){ .a1c-fade{ animation:none; } }
        @keyframes a1cFade { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;} }
        select,input { font-family: ${MONO}; }
      `}</style>

      {step < 4 && (
        <div style={{ flexShrink: 0, borderBottom: `1px solid ${C.line}`, background: C.pageBg }}>
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "20px 22px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.18em", textTransform: "uppercase", color: C.inkSoft }}>
                Enrol · The A1C Challenge
              </span>
              <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.inkFaint }}>step {step + 1} of 4</span>
            </div>
            <div style={{ display: "flex", gap: 5, marginTop: 12 }}>
              {STEPS.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= step ? C.accent : C.line }} />
              ))}
            </div>
            <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 27, letterSpacing: "-0.01em", margin: "16px 0 0" }}>{STEPS[step]}</h1>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: step < 4 ? "22px 22px 28px" : "0" }}>

          {step === 0 && (
            <div className="a1c-fade">
              <p style={lead}>A few quick checks — for your safety, and to be sure the study fits where you are right now.</p>
              <YesNo q="Are you 18 or older?" v={age18} set={setAge18} />
              {age18 === false && <Care>This study is for adults 18 and over. Thank you for your interest — take good care.</Care>}
              <YesNo q="Are you currently pregnant?" v={pregnant} set={setPregnant} yes="Yes" no="No" />
              {pregnant === true && <Care>We don&rsquo;t include pregnancy in this study, for your safety. You&rsquo;re welcome to take part another time.</Care>}
              <YesNo q="Do you have an A1C reading from the last two months?" v={hasA1c} set={setHasA1c} />
              {hasA1c === false && (
                <Care tone="route">
                  You&rsquo;ll want a recent reading first. A home kit, pharmacy, or clinic all work. Come back when you have a number — enrolment will be here.
                </Care>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="a1c-fade">
              <p style={lead}>This is your starting line. A1C reflects about three months of blood sugar, so this one number anchors everything.</p>

              <Field label="Your A1C">
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input inputMode="decimal" value={a1c} onChange={(e) => setA1c(e.target.value.replace(/[^0-9.]/g, ""))} placeholder=""
                         style={{ ...inp, width: 96, fontSize: 19 }} />
                  <span style={{ fontFamily: MONO, fontSize: 16, color: C.inkSoft }}>%</span>
                </div>
                {a1cBelow && <Note tone="warn">That&rsquo;s below 5.7% — good news for you, and it means this particular study isn&rsquo;t a fit. It includes people at 5.7% and above.</Note>}
              </Field>

              <Field label="When was it measured?">
                <select value={a1cMonth} onChange={(e) => setA1cMonth(e.target.value)} style={sel}>
                  <option value="">Select…</option>
                  <option>This month</option>
                  <option>Last month</option>
                  <option>Two months ago</option>
                </select>
              </Field>

              <Field label="How was it measured?">
                <Choice options={["Lab", "Home kit", "Pharmacy / clinic"]} value={a1cHow} set={setA1cHow} />
              </Field>

              <Field label="Diabetes status">
                <EnumButtons pairs={DIABETES_OPTIONS} value={diabetesType} set={setDiabetesType} />
              </Field>

              <Field label="Glucose monitoring">
                <EnumButtons pairs={GLUCOSE_MON_OPTIONS} value={glucoseMonType} set={setGlucoseMonType} />
                <Note>This helps us know which glucose fields make sense for you.</Note>
              </Field>

              <Field label="Fructosamine" optional>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <input inputMode="decimal" value={fruct} onChange={(e) => setFruct(e.target.value.replace(/[^0-9.]/g, ""))} placeholder="—"
                         style={{ ...inp, width: 96 }} />
                  <span style={{ fontFamily: MONO, fontSize: 13.5, color: C.inkFaint }}>µmol/L, if you have one</span>
                </div>
                {fruct && (
                  <div className="a1c-fade" style={{ marginTop: 10 }}>
                    <div style={{ fontFamily: SERIF, fontSize: 14, color: C.inkSoft, marginBottom: 7 }}>How was it measured?</div>
                    <Choice options={["Lab", "Home kit", "Clinic"]} value={fructHow} set={setFructHow} />
                  </div>
                )}
              </Field>
            </div>
          )}

          {step === 2 && (
            <div className="a1c-fade">
              <p style={lead}>How you feel today, so there&rsquo;s something to compare against later. Each is 1 to 5 — blank is a fine answer.</p>
              {WELLBEING.map(({ id, ...rest }) => (
                <Scale key={id} {...rest} value={wb[id]} onPick={(v) => setWb({ ...wb, [id]: v })} />
              ))}
              <div style={{ height: 1, background: C.lineSoft, margin: "24px 0 20px" }} />
              <Field label="Hemp seed you intend to eat daily">
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <input type="range" min={30} max={60} step={10} value={dose} onChange={(e) => setDose(Number(e.target.value))}
                         style={{ flex: 1, accentColor: C.accent }} />
                  <span style={{ fontFamily: MONO, fontSize: 16, color: C.ink, width: 116, textAlign: "right" }}>
                    {dose} g <span style={{ color: C.inkFaint }}>· {dose / 10} tbsp</span>
                  </span>
                </div>
                <Note>About a tablespoon per 10 grams. A starting intention, not a promise — you&rsquo;ll record what you actually eat each week.</Note>
              </Field>
            </div>
          )}

          {step === 3 && (
            <div className="a1c-fade">
              <p style={lead}>A little context for the data — kept coarse on purpose, so nothing here can point back to you.</p>

              <Field label="Age">
                <select value={ageBand} onChange={(e) => { setAgeBand(e.target.value); setAgeCtxDismissed(false); }} style={sel}>
                  <option value="">Select…</option>
                  {AGE_BAND_LABELS.map(([label, val]) => <option key={val} value={val}>{label}</option>)}
                </select>
                {ageBand && AGE_CONTEXT[ageBand] && !ageCtxDismissed && (
                  <AgeContext ctx={AGE_CONTEXT[ageBand]} onDismiss={() => setAgeCtxDismissed(true)} />
                )}
              </Field>

              <Field label="Sex" optional>
                <Choice options={["Female", "Male", "Intersex", "Prefer not to say"]} value={sex} set={setSex} wrap />
              </Field>

              <Field label="Country">
                <select value={country} onChange={(e) => setCountry(e.target.value)} style={sel}>
                  <option value="">Select…</option>
                  {[
                    "Australia", "Austria", "Belgium", "Brazil", "Canada", "Chile", "Colombia",
                    "Costa Rica", "Czech Republic", "Denmark", "Finland", "France", "Germany",
                    "Greece", "Hungary", "Iceland", "India", "Ireland", "Israel", "Italy",
                    "Japan", "Luxembourg", "Malta", "Mexico", "Netherlands", "New Zealand",
                    "Norway", "Peru", "Poland", "Portugal", "Romania", "Singapore", "Slovenia",
                    "South Africa", "South Korea", "Spain", "Sweden", "Switzerland", "Thailand",
                    "United Kingdom", "United States", "Uruguay", "Other",
                  ].map((c) => <option key={c}>{c}</option>)}
                </select>
                <Note>Country only — never anything more local.</Note>
              </Field>

              <Field label="Ethnicity" optional>
                <select value={ethnicity} onChange={(e) => setEthnicity(e.target.value)} style={sel}>
                  <option value="">Select…</option>
                  {ETHNICITY_OPTIONS.map(([label, val]) => <option key={val} value={val}>{label}</option>)}
                </select>
              </Field>

              {aianSelected && (
                <Field label="Tribal nation">
                  <input value={nation} onChange={(e) => setNation(e.target.value)} placeholder="—"
                         style={{ ...inp, width: "100%", boxSizing: "border-box" }} />
                  <Note>Shown only in groups; rare nations are pooled so no one is identifiable.</Note>
                </Field>
              )}

              <Field label="How you&rsquo;re approaching cannabis/hemp">
                <EnumButtons pairs={CARE_OPTIONS} value={careApproach} set={setCareApproach} />
                <Note>Your standard diabetes care isn&rsquo;t changing — this is about how hemp/cannabis fits alongside or instead of it.</Note>
              </Field>

              {enrollError && (
                <div style={{ padding: "13px 15px", background: "#FEF2EE", border: `1px solid ${C.warn}`, borderRadius: 6, fontFamily: SERIF, fontSize: 14.5, color: C.warn, marginTop: 8 }}>
                  {enrollError}
                </div>
              )}
            </div>
          )}

          {step === 4 && token && (
            <TokenReveal
              token={token}
              saved={saved}
              setSaved={setSaved}
              onCopy={() => { try { navigator.clipboard?.writeText(token); } catch { } setToast("Copied"); }}
              onContinue={() => { persistToken(); router.push("/day-one"); }}
            />
          )}
        </div>
      </div>

      {step < 4 && (
        <div style={{ flexShrink: 0, borderTop: `1px solid ${C.line}`, background: C.card }}>
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "14px 22px 16px", display: "flex", alignItems: "center", gap: 14 }}>
            {step > 0 ? (
              <button className="a1c-ghost" onClick={() => setStep(step - 1)}
                      style={{ fontFamily: SERIF, fontSize: 15, color: C.inkSoft, background: "none", border: "none", cursor: "pointer", padding: "6px 2px" }}>← Back</button>
            ) : <span />}
            <button className="a1c-btn a1c-primary" disabled={!canContinue() || loading} onClick={next}
                    style={{ marginLeft: "auto", fontFamily: SERIF, fontSize: 16.5, fontWeight: 700, color: C.card, background: canContinue() && !loading ? C.accent : C.line, border: "none", borderRadius: 6, padding: "13px 26px", cursor: canContinue() && !loading ? "pointer" : "not-allowed" }}>
              {loading ? "Enrolling…" : step === 3 ? "Create my code" : "Continue"}
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="a1c-fade" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 90, background: C.ink, color: C.card, fontFamily: MONO, fontSize: 13, padding: "10px 16px", borderRadius: 6, zIndex: 60 }}>{toast}</div>
      )}
    </div>
  );
}
