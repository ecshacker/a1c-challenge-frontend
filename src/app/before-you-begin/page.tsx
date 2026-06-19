"use client"; // Required at the very top since views track local states via hooks

import React, { useState, useEffect } from "react";

/**
 * A1C Challenge — "Before you begin"
 *
 * The page between the educational/enablement arc and enrollment. It does three
 * jobs: lands the unlearn beat (food, raw, observation — not a drug, not a
 * treatment), enables the two real-world prerequisites (the food, a way to
 * measure) as first-class content rather than fine print, and sets honest
 * expectations — including that you enroll now and start the weeks once you've
 * sourced everything (the enrollment / exposure-start runway).
 *
 * Same design system as the check-in: Merriweather as the study's voice,
 * monospace as the data/label voice, cool bone + sage.
 */

const C = {
  pageBg: "#E6E5DD",
  card: "#F7F6F2",
  ink: "#222420",
  inkSoft: "#595C50",
  inkFaint: "#8A8C80",
  line: "#D4D3C8",
  lineSoft: "#E0DFD6",
  accent: "#586B4D",
  accentDeep: "#43543A",
  accentTint: "#EAEDE3",
};
const SERIF = "'Merriweather', Georgia, 'Times New Roman', serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const PATH = [
  { id: "in", kind: "enroll" },
  { id: "1", kind: "week" },
  { id: "2", kind: "week" },
  { id: "3", kind: "week" },
  { id: "4", kind: "milestone" },
  { id: "·", kind: "gap" },
  { id: "8", kind: "milestone" },
];

function Section({ label, children }) {
  return (
      <div style={{ marginTop: 30 }}>
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: C.accentDeep, fontWeight: 600, marginBottom: 14, paddingBottom: 9, borderBottom: `1px solid ${C.line}` }}>
          {label}
        </div>
        {children}
      </div>
  );
}

function Prereq({ title, summary, children, open, onToggle }) {
  return (
      <div className="a1c-row" style={{ border: `1px solid ${C.line}`, borderRadius: 6, background: open ? C.card : "transparent", marginBottom: 10, overflow: "hidden" }}>
        <button onClick={onToggle} aria-expanded={open}
                style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "15px 16px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
        <span>
          <span style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: C.ink }}>{title}</span>
          <span style={{ display: "block", fontFamily: SERIF, fontSize: 15, color: C.inkSoft, marginTop: 3 }}>{summary}</span>
        </span>
          <span style={{ fontFamily: MONO, fontSize: 18, color: C.inkFaint, lineHeight: 1 }}>{open ? "–" : "+"}</span>
        </button>
        {open && (
            <div className="a1c-fade" style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.6, color: C.inkSoft, padding: "0 16px 16px" }}>
              {children}
            </div>
        )}
      </div>
  );
}

function Link({ children }) {
  return (
      <a href="#" onClick={(e) => e.preventDefault()} className="a1c-link"
         style={{ display: "inline-block", marginTop: 11, fontFamily: MONO, fontSize: 12.5, color: C.accentDeep, textDecoration: "none", fontWeight: 600 }}>
        {children} ↗
      </a>
  );
}

function Step({ n, head, children }) {
  return (
      <div style={{ display: "flex", gap: 14, marginBottom: 16 }}>
        <div style={{ fontFamily: MONO, fontSize: 13, color: C.card, background: C.accent, width: 24, height: 24, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{n}</div>
        <div>
          <div style={{ fontFamily: SERIF, fontSize: 16.5, fontWeight: 700, color: C.ink }}>{head}</div>
          <div style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.55, color: C.inkSoft, marginTop: 2 }}>{children}</div>
        </div>
      </div>
  );
}

function Ethos({ head, children }) {
  return (
      <div style={{ marginBottom: 15, paddingLeft: 14, borderLeft: `2px solid ${C.accent}` }}>
        <div style={{ fontFamily: SERIF, fontSize: 16.5, fontWeight: 700, color: C.ink }}>{head}</div>
        <div style={{ fontFamily: SERIF, fontSize: 15, lineHeight: 1.58, color: C.inkSoft, marginTop: 2 }}>{children}</div>
      </div>
  );
}

function PathwayPreview() {
  return (
      <div style={{ overflowX: "auto" }}>
        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 9 }}>the four weeks</div>
        <div style={{ display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 12.5, whiteSpace: "nowrap" }}>
          {PATH.map((n, i) => {
            if (n.kind === "gap") return <span key={i} style={{ color: C.line, padding: "0 7px" }}>···</span>;
            const isMile = n.kind === "milestone";
            const isEnroll = n.kind === "enroll";
            return (
                <React.Fragment key={n.id}>
                  {i > 0 && PATH[i - 1].kind !== "gap" && <span style={{ color: C.line, padding: "0 5px" }}>─</span>}
                  <span title={isMile ? `A1C at week ${n.id}` : isEnroll ? "Enroll" : `Week ${n.id}`}
                        style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 24, height: 24, padding: "0 5px", borderRadius: isMile ? 3 : 12, background: isEnroll ? C.accentTint : "transparent", color: isEnroll ? C.accentDeep : C.inkFaint, border: `1px solid ${isEnroll ? C.accent : C.line}` }}>
                {isMile ? `${n.id}\u25C6` : n.id}
              </span>
                </React.Fragment>
            );
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.inkFaint, marginTop: 8 }}>◆ = an A1C reading · the rest are weekly check-ins</div>
      </div>
  );
}

export default function BeforeYouBeginPage() {
  const [open, setOpen] = useState(null);
  const [reconnect, setReconnect] = useState(false);
  const [code, setCode] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // Return root JSX element
  return (
      <div style={{ background: C.pageBg, height: "100vh", display: "flex", flexDirection: "column", color: C.ink, overflow: "hidden" }} className="a1c-root">
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap');
        .a1c-root *:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; border-radius: 2px; }
        .a1c-btn, .a1c-row { transition: background-color .12s ease, color .12s ease, border-color .12s ease, transform .07s ease; }
        .a1c-primary:hover { background: ${C.accentDeep}; }
        .a1c-link:hover { color: ${C.accentDeep}; }
        .a1c-row:hover { border-color: ${C.accent}; }
        .a1c-btn:active { transform: translateY(1px); }
        .a1c-fade { animation: a1cFade .35s ease both; }
        @media (prefers-reduced-motion: reduce){ .a1c-fade{ animation:none; } }
        @keyframes a1cFade { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;} }
      `}</style>

        {/* SCROLLABLE */}
        <div style={{ flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "26px 22px 28px" }}>
            <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.18em", textTransform: "uppercase", color: C.inkSoft }}>
              The A1C Challenge
            </div>

            <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 40, lineHeight: 1.08, letterSpacing: "-0.02em", margin: "14px 0 0" }}>
              Before you begin
            </h1>

            <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.62, color: C.inkSoft, margin: "18px 0 0" }}>
              This is a shared, open look at one question: when hemp seed and raw cannabis flower are eaten as food — raw, never heated — does blood-sugar control shift over four weeks? It&rsquo;s observational. You&rsquo;re not being treated or told to stop anything. You eat, you measure, you record what happens — and so does everyone else taking part.
            </p>

            {/* Why take part */}
            <Section label="Why take part">
              <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.62, color: C.inkSoft, margin: "0 0 15px" }}>
                We don&rsquo;t yet know the answer — that&rsquo;s the whole reason to ask. Here&rsquo;s what your part adds, and what you take from it.
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 13px" }}>
                <strong style={{ color: C.ink, fontWeight: 700 }}>It&rsquo;s a real question, asked this way for the first time.</strong> Whether these foods, eaten raw, do anything for blood sugar hasn&rsquo;t been studied like this — the usual research machinery isn&rsquo;t pointed at it. A look this specific only exists if enough people each give a little.
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 13px" }}>
                <strong style={{ color: C.ink, fontWeight: 700 }}>Your part becomes everyone&rsquo;s.</strong> Anonymized and open, your month of records joins the rest into something any researcher — or any curious person — can examine for themselves. That&rsquo;s how a crowd answers a question no single lab is asking.
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 13px" }}>
                <strong style={{ color: C.ink, fontWeight: 700 }}>You leave with your own numbers.</strong> However the larger answer turns out, you finish with your own baseline and a week-4 reading, and a record of your month — what you ate, how you felt. Yours to keep, whatever it shows.
              </p>
              <div style={{ marginTop: 18, padding: "14px 16px", background: C.accentTint, border: `1px solid ${C.accent}`, borderRadius: 6 }}>
              <span style={{ fontFamily: SERIF, fontSize: 16, fontStyle: "italic", lineHeight: 1.55, color: C.accentDeep }}>
                We&rsquo;re not promising this works. We&rsquo;re finding out, in the open, together.
              </span>
              </div>
            </Section>

            {/* What you'll need */}
            <Section label="What you'll need">
              <Prereq
                  title="The food"
                  summary="Hemp seed and raw cannabis flower, eaten raw."
                  open={open === 0}
                  onToggle={() => setOpen(open === 0 ? null : 0)}
              >
                Hemp seed is easy to find — whole or shelled, raw, kept cold. Raw cannabis flower means flower that has never been heated or decarboxylated; heat changes it from the food we&rsquo;re looking at into something else. Where and how you can get it depends on the laws where you live.
                <Link>What &ldquo;raw&rdquo; means, and where to look</Link>
              </Prereq>
              <Prereq
                  title="A way to measure"
                  summary="An A1C reading at the start, and again at week 4."
                  open={open === 1}
                  onToggle={() => setOpen(open === 1 ? null : 1)}
              >
                A1C reflects roughly three months of blood sugar, so one reading sets your baseline and a second at week 4 shows the change. You can get it from a home kit, a pharmacy, or a clinic — whatever you can reach. A week-8 reading is welcome but optional.
                <Link>Ways to get an A1C</Link>
              </Prereq>
            </Section>

            {/* How it works */}
            <Section label="How it works">
              <Step n="1" head="Enroll and set a baseline">Any day works. You give a starting A1C and a few details — no name, no email.</Step>
              <Step n="2" head="Start on a Monday">Once you&rsquo;ve got the food, pick a Monday to begin. Your weeks run Monday to Sunday from there, so nothing is half a week.</Step>
              <Step n="3" head="Five minutes, once a week">A short check-in: what you ate, and how the week felt. You can fix last week while this week is open.</Step>
              <Step n="4" head="A second reading at week 4">One more A1C closes the four weeks. That comparison is the whole point.</Step>
              <div style={{ marginTop: 20 }}><PathwayPreview /></div>
            </Section>

            {/* What you're agreeing to */}
            <Section label="What you're agreeing to">
              <Ethos head="You stay anonymous">You get a code — that&rsquo;s your whole identity here. Write it down; it&rsquo;s how you return, on this device or any other.</Ethos>
              <Ethos head="Your record becomes open data">Anonymized and released under CC0 for anyone to study. That&rsquo;s the point — your five minutes a week becomes something everyone can learn from.</Ethos>
              <Ethos head="You can stop any time">This isn&rsquo;t medical care, and nothing here replaces your clinician. Keep them in the loop, and leave whenever you like.</Ethos>
            </Section>
          </div>
        </div>

        {/* STICKY ACTION BAR */}
        <div style={{ borderTop: `1px solid ${C.line}`, background: C.card, flexShrink: 0 }}>
          <div style={{ maxWidth: 560, margin: "0 auto", padding: "14px 22px 16px" }}>
            {!reconnect ? (
                <>
                  <button className="a1c-btn a1c-primary" onClick={() => setToast("→ enrollment")}
                          style={{ width: "100%", fontFamily: SERIF, fontSize: 17.5, fontWeight: 700, color: C.card, background: C.accent, border: "none", borderRadius: 6, padding: "15px", cursor: "pointer" }}>
                    Begin enrollment
                  </button>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 11, gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: SERIF, fontSize: 13, color: C.inkFaint }}>
                  Enroll now; start the weeks once you&rsquo;ve sourced everything.
                </span>
                    <button className="a1c-link" onClick={() => setReconnect(true)}
                            style={{ fontFamily: MONO, fontSize: 12.5, color: C.accentDeep, background: "none", border: "none", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
                      I already have a code →
                    </button>
                  </div>
                </>
            ) : (
                <div className="a1c-fade">
                  <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: C.accentDeep, marginBottom: 9 }}>Reconnect with your code</div>
                  <div style={{ display: "flex", gap: 9 }}>
                    <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="K7F2-9QXM-4TBN" aria-label="Your code"
                           style={{ flex: 1, fontFamily: MONO, fontSize: 15, letterSpacing: "0.05em", padding: "12px 13px", background: C.pageBg, border: `1px solid ${C.line}`, borderRadius: 5, color: C.ink }} />
                    <button className="a1c-btn a1c-primary" onClick={() => setToast(code ? "→ resuming" : "enter your code")}
                            style={{ fontFamily: SERIF, fontSize: 15.5, fontWeight: 700, color: C.card, background: C.accent, border: "none", borderRadius: 5, padding: "0 18px", cursor: "pointer" }}>
                      Continue
                    </button>
                  </div>
                  <button className="a1c-link" onClick={() => setReconnect(false)}
                          style={{ fontFamily: SERIF, fontSize: 13.5, color: C.inkSoft, background: "none", border: "none", cursor: "pointer", marginTop: 10, padding: 0 }}>
                    ← Back
                  </button>
                </div>
            )}
          </div>
        </div>

        {toast && (
            <div className="a1c-fade" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 150, background: C.ink, color: C.card, fontFamily: MONO, fontSize: 13, padding: "10px 16px", borderRadius: 6, zIndex: 60 }}>
              {toast}
            </div>
        )}
      </div>
  );
}


