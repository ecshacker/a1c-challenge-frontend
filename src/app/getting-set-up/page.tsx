"use client"; // Required at the very top since your views track local states via hooks

import React, { useState, useEffect } from "react";

/**
 * A1C Challenge — "Getting set up" (sourcing & testing enablement)
 *
 * Upstream of everything: no food and no way to test means no data. Three
 * prerequisites — hemp seed, raw cannabis flower, a way to measure — each with
 * plain "what to look for" guidance and slots for vetted external resources.
 *
 * Lines held by design:
 *  - Hemp seed is food: easy, safe, led with.
 *  - Raw cannabis: teaches what "raw" means and what to look for WHERE legal;
 *    no legal advice, no how-to-obtain. Legality is the participant's to know.
 *  - Testing: ways to get an A1C, no medical advice; "keep your clinician in."
 *  - No health claims anywhere.
 *  - External resources are curated/vetted slots, not ads — the same content-
 *    sanitizing the localized stats will need.
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
  clay: "#9A5A3C",
  clayTint: "#EFE6DF",
};
const SERIF = "'Merriweather', Georgia, 'Times New Roman', serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

function Sect({ n, title, summary, children, open, onToggle }) {
  return (
    <div className="a1c-row" style={{ border: `1px solid ${C.line}`, borderRadius: 8, background: open ? C.card : "transparent", marginTop: 12, overflow: "hidden" }}>
      <button onClick={onToggle} aria-expanded={open}
        style={{ width: "100%", textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: "15px 16px", display: "flex", gap: 13, alignItems: "flex-start" }}>
        <span style={{ fontFamily: MONO, fontSize: 13, color: C.card, background: C.accent, width: 24, height: 24, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{n}</span>
        <span style={{ flex: 1 }}>
          <span style={{ fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: C.ink }}>{title}</span>
          <span style={{ display: "block", fontFamily: SERIF, fontSize: 14.5, color: C.inkSoft, marginTop: 3 }}>{summary}</span>
        </span>
        <span style={{ fontFamily: MONO, fontSize: 18, color: C.inkFaint, lineHeight: 1 }}>{open ? "–" : "+"}</span>
      </button>
      {open && <div className="a1c-fade" style={{ padding: "0 16px 17px 53px" }}>{children}</div>}
    </div>
  );
}

function Look({ points }) {
  return (
    <div style={{ marginBottom: 4 }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: C.accentDeep, marginBottom: 9 }}>What to look for</div>
      {points.map((p, i) => (
        <div key={i} style={{ display: "flex", gap: 9, marginBottom: 10 }}>
          <span style={{ color: C.accent, fontFamily: MONO, fontSize: 14, lineHeight: 1.5 }}>·</span>
          <span style={{ fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.55, color: C.inkSoft }}>{p}</span>
        </div>
      ))}
    </div>
  );
}

function Where({ children }) {
  return (
    <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${C.lineSoft}` }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 7 }}>Where to find it</div>
      <p style={{ fontFamily: SERIF, fontSize: 14, lineHeight: 1.55, color: C.inkSoft, margin: 0 }}>{children}</p>
    </div>
  );
}

function Caveat({ children, tone }) {
  const col = tone === "legal" ? C.clay : C.accentDeep;
  const bg = tone === "legal" ? C.clayTint : C.accentTint;
  return (
    <div style={{ margin: "14px 0", padding: "12px 14px", background: bg, border: `1px solid ${col}`, borderRadius: 6 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: col, marginBottom: 6 }}>{tone === "legal" ? "On legality" : "On testing"}</div>
      <p style={{ fontFamily: SERIF, fontSize: 13.5, lineHeight: 1.55, color: C.inkSoft, margin: 0 }}>{children}</p>
    </div>
  );
}

const body = { fontFamily: SERIF, fontSize: 14.5, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 14px" };
const bold = { color: C.ink, fontWeight: 700 };

export default function GettingSetUpPage() {
  const [open, setOpen] = useState(0);
  const [toast, setToast] = useState("");
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2400); return () => clearTimeout(t); }, [toast]);
  const tog = (i) => setOpen(open === i ? null : i);

  // Return root JSX element
  return (
      <div style={{
        background: C.pageBg,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        color: C.ink,
        overflow: "hidden"
      }} className="a1c-root">
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap');
        .a1c-root *:focus-visible { outline: 2px solid ${C.accent}; outline-offset: 2px; border-radius: 2px; }
        .a1c-btn,.a1c-row,.a1c-loc { transition: background-color .12s, color .12s, border-color .12s, transform .07s; }
        .a1c-primary:hover { background: ${C.accentDeep}; }
        .a1c-link:hover { color: ${C.accentDeep}; }
        .a1c-row:hover { border-color: ${C.accent}; }
        .a1c-loc:hover { border-color: ${C.accent}; }
        .a1c-btn:active { transform: translateY(1px); }
        .a1c-fade { animation: a1cFade .3s ease both; }
        @media (prefers-reduced-motion: reduce){ .a1c-fade{ animation:none; } }
        @keyframes a1cFade { from{opacity:0; transform:translateY(6px);} to{opacity:1; transform:none;} }
      `}</style>

        <div style={{flex: 1, overflowY: "auto", WebkitOverflowScrolling: "touch"}}>
          <div style={{maxWidth: 560, margin: "0 auto", padding: "24px 22px 28px"}}>
          <span style={{
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: C.inkSoft
          }}>
            Getting set up ·{" "}
            <button className="a1c-link" onClick={() => setToast("← Before you begin")} style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: C.accentDeep,
              background: "none",
              border: "none",
              padding: 0,
              cursor: "pointer"
            }}>
              The A1C Challenge ↩
            </button>
          </span>

            <h1 style={{
              fontFamily: SERIF,
              fontWeight: 800,
              fontSize: 38,
              lineHeight: 1.08,
              letterSpacing: "-0.02em",
              margin: "13px 0 0"
            }}>Getting set up</h1>
            <p style={{fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.6, color: C.inkSoft, margin: "15px 0 0"}}>
              Two foods and a way to measure — that&rsquo;s all the study needs from you. Here&rsquo;s how to get each,
              honestly. None of it has to be in hand to enrol; you can sort it during your sourcing runway.
            </p>

            {/* location hook */}
            <button className="a1c-loc"
                    onClick={() => setToast("→ set location (localizes legality & testing options)")}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      marginTop: 18,
                      padding: "12px 14px",
                      borderRadius: 7,
                      background: C.card,
                      border: `1px solid ${C.line}`,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10
                    }}>
              <span style={{fontFamily: SERIF, fontSize: 14.5, color: C.inkSoft}}>This guidance is general. Set where you are for what applies locally.</span>
              <span style={{
                fontFamily: MONO,
                fontSize: 12,
                color: C.accentDeep,
                whiteSpace: "nowrap"
              }}>set location →</span>
            </button>

            {/* 1 — hemp seed */}
            <Sect n="1" title="Hemp seed" summary="Whole or shelled, raw, kept cold. Easy to find." open={open === 0}
                  onToggle={() => tog(0)}>
              <Look points={[
                "Raw — not toasted or roasted. Whole seeds or shelled (often sold as “hemp hearts”).",
                "Kept cold. The oils turn rancid warm, so buy fresh and refrigerate or freeze after opening.",
              ]}/>
              <Where>Natural-foods groceries and online carry it widely, and it&rsquo;s inexpensive. Curated, vetted
                sources will appear here.</Where>
            </Sect>

            {/* 2 — raw cannabis flower */}
            <Sect n="2" title="Raw cannabis flower"
                  summary="Flower that has never been heated. Availability depends on where you live." open={open === 1}
                  onToggle={() => tog(1)}>
              <p style={body}>
                <strong style={bold}>&ldquo;Raw&rdquo; is the whole point.</strong> Heat converts the acids in fresh
                flower into their activated forms — a different molecule, and a different thing entirely. Unheated, it
                stays the food this study is about. So it&rsquo;s never smoked, vaped, or cooked here; it&rsquo;s eaten
                raw and kept cold.
              </p>
              <Look points={[
                "Look for fresh or raw flower. Avoid anything heated, decarboxylated, “activated,” or prepared for smoking or vaping.",
                "Store it cold, and eat it raw — heat undoes the very thing being studied.",
              ]}/>
              <Caveat tone="legal">
                Whether you can get this, and how, depends entirely on the laws where you live — and that&rsquo;s yours
                to know. This study is about the food science. It isn&rsquo;t a nudge to break any law, and we
                can&rsquo;t advise you on what&rsquo;s legal where you are.
              </Caveat>
              <Where>Where it&rsquo;s legally available, some sources carry fresh or raw flower. Vetted, location-aware
                options will appear here once you set where you are.</Where>
            </Sect>

            {/* 3 — a way to measure */}
            <Sect n="3" title="A way to measure"
                  summary="An A1C at the start and again at week 4. Home kit, pharmacy, or clinic." open={open === 2}
                  onToggle={() => tog(2)}>
              <Look points={[
                "A1C: a home kit (mail-in lab or instant fingerstick), many pharmacies, or a clinic or lab all work. You need one reading to start and one at week 4 — a week-8 reading is welcome but optional.",
                "Fructosamine is optional and harder to find — fewer places run it, so ask your lab or clinician. It&rsquo;s the faster-moving marker, so it&rsquo;s worth asking about, but the study works without it.",
              ]}/>
              <Caveat tone="med">
                None of this is medical advice, and a home reading doesn&rsquo;t replace your clinician. Keep them in
                the loop — especially if you take medication that affects blood sugar.
              </Caveat>
              <Where>If cost or access is the barrier, mail-in and pharmacy options are usually the cheapest. Vetted,
                location-aware testing options will appear here.</Where>
            </Sect>

            {/* transparency / sanitizing principle */}
            <div style={{
              marginTop: 24,
              padding: "15px 17px",
              background: C.card,
              border: `1px solid ${C.line}`,
              borderRadius: 8
            }}>
              <div style={{
                fontFamily: MONO,
                fontSize: 10.5,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: C.inkFaint,
                marginBottom: 8
              }}>What we link, and why
              </div>
              <p style={{fontFamily: SERIF, fontSize: 14, lineHeight: 1.6, color: C.inkSoft, margin: 0}}>
                Every source here is checked: accurate, no health claims, no commission to us, and nothing that sells a
                product over the science. Links are chosen to help you get set up — not to sell you anything. If
                something looks off, tell us and it comes down.
              </p>
            </div>
          </div>
        </div>

        {/* sticky */}
        <div style={{borderTop: `1px solid ${C.line}`, background: C.card, flexShrink: 0}}>
          <div style={{maxWidth: 560, margin: "0 auto", padding: "14px 22px 16px"}}>
            <button className="a1c-btn a1c-primary" onClick={() => setToast("→ enrolment")}
                    style={{
                      width: "100%",
                      fontFamily: SERIF,
                      fontSize: 17,
                      fontWeight: 700,
                      color: C.card,
                      background: C.accent,
                      border: "none",
                      borderRadius: 6,
                      padding: "15px",
                      cursor: "pointer"
                    }}>
              When you&rsquo;re set, enrol
            </button>
            <p style={{fontFamily: SERIF, fontSize: 13, color: C.inkFaint, margin: "10px 2px 0", textAlign: "center"}}>
              You can enrol and give a baseline now, and start the weeks once you&rsquo;ve gathered everything.
            </p>
          </div>
        </div>

        {toast && (
            <div className="a1c-fade" style={{
              position: "fixed",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: 92,
              background: C.ink,
              color: C.card,
              fontFamily: MONO,
              fontSize: 12.5,
              padding: "10px 16px",
              borderRadius: 6,
              zIndex: 60,
              maxWidth: 340,
              textAlign: "center"
            }}>{toast}</div>
        )}
      </div>
  );
}
