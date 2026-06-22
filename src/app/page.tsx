"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { C, SERIF, MONO } from "@/lib/theme";

function EnrollCTA({ open }: { open: boolean | null }) {
  if (open === null) return <div style={{ height: 52 }} />;
  if (!open) return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
      <span style={{ fontFamily: SERIF, fontSize: 16, color: C.inkSoft, fontStyle: "italic" }}>
        Enrollment is not yet open — check back soon.
      </span>
      <Link href="/before-you-begin"
            style={{ fontFamily: MONO, fontSize: 13, color: C.accentDeep, textDecoration: "none", fontWeight: 600 }}>
        I already have a code →
      </Link>
    </div>
  );
  return (
    <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
      <Link href="/before-you-begin"
            style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: C.card, background: C.accent, borderRadius: 6, padding: "14px 28px", textDecoration: "none", display: "inline-block" }}>
        Learn more and enroll →
      </Link>
      <Link href="/before-you-begin"
            style={{ fontFamily: MONO, fontSize: 13, color: C.accentDeep, textDecoration: "none", fontWeight: 600 }}>
        I already have a code →
      </Link>
    </div>
  );
}

function EnrollCard({ open }: { open: boolean | null }) {
  if (open === null) return <div style={{ height: 48 }} />;
  if (!open) return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 26, color: C.ink, marginBottom: 12 }}>Ready to take part?</div>
      <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 16px" }}>
        Enrollment isn&rsquo;t open yet. Check back soon — or{" "}
        <Link href="/before-you-begin" style={{ color: C.accentDeep, textDecoration: "none", fontWeight: 600 }}>enter your code</Link>
        {" "}if you already have one.
      </p>
    </div>
  );
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 26, color: C.ink, marginBottom: 12 }}>Ready to take part?</div>
      <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 24px" }}>
        No name. No email. You get a code — that&rsquo;s your whole identity here.<br />
        Enroll now; start the weeks once you&rsquo;ve sourced everything.
      </p>
      <Link href="/before-you-begin"
            style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: C.card, background: C.accent, borderRadius: 6, padding: "14px 32px", textDecoration: "none", display: "inline-block" }}>
        Begin enrollment →
      </Link>
    </div>
  );
}

function HypothesisBlock() {
  const [curious, setCurious] = useState(false);
  return (
    <div style={{ marginTop: 44, padding: "26px 28px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 8 }}>
      <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accentDeep, marginBottom: 18 }}>Why would food move blood sugar at all?</div>
      <p style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.65, color: C.inkSoft, margin: "0 0 16px" }}>
        Consider scurvy. For centuries it looked like a disease — sailors wasted away from it — until it turned out to be something simpler: a missing nutrient. Give the body vitamin C, and it repairs itself. No drug. Just the input it had been lacking.
      </p>
      <p style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.65, color: C.inkSoft, margin: "0 0 16px" }}>
        This study asks a careful version of that question for blood sugar. Not whether a food can push the number down — but whether the body&rsquo;s been missing an input, and rights itself once it has it back.
      </p>
      <p style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.65, color: C.ink, margin: "0 0 20px", fontStyle: "italic" }}>
        The study is built so that if the answer is no, that shows too — in public.
      </p>
      <button onClick={() => setCurious(!curious)}
              style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.12em", textTransform: "uppercase", color: C.accentDeep, fontWeight: 600 }}>
          For the curious: how we&rsquo;d tell
        </span>
        <span style={{ fontFamily: MONO, fontSize: 16, color: C.accentDeep, lineHeight: 1 }}>{curious ? "–" : "+"}</span>
      </button>
      {curious && (
        <div className="a1c-fade" style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${C.lineSoft}` }}>
          <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 12 }}>How will we know?</div>
            <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.65, color: C.inkSoft, margin: "0 0 12px" }}>
                Blood sugar leaves two marks at two speeds: fructosamine reflects the last few weeks, A1C the last few months. Both can move — a drug that simply holds glucose down would move them too. So the question isn&rsquo;t whether they move, but in what order.
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.65, color: C.inkSoft, margin: "0 0 12px" }}>
                If the correction is real and upstream, the faster mark shifts first and the slower one follows. That ordering is the signature of a nutritional correction — the pattern you&rsquo;d expect if a condition like Type 2 Diabetes had a nutritional component, not only a glucose to be pushed down.
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.65, color: C.inkSoft, margin: "0 0 12px" }}>
                Even then it wouldn&rsquo;t be proof: if both marks move more than standard care would predict, that&rsquo;s striking — and still doesn&rsquo;t rule out other explanations. The ordering is the fingerprint we&rsquo;re watching for, and four weeks is just long enough to see it begin.
            </p>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const [studyOpen, setStudyOpen] = useState<boolean | null>(null);

  useEffect(() => {
    api.publicGet("/study/status")
      .then((d) => setStudyOpen((d as { status: string }).status === "OPEN"))
      .catch(() => setStudyOpen(false));
  }, []);

  return (
    <div style={{ background: C.pageBg, minHeight: "100vh", color: C.ink }}>
{/* Hero */}
      <div style={{ borderBottom: `1px solid ${C.line}`, background: C.card }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 44px" }}>
          <div style={{ fontFamily: MONO, fontSize: 13.5, letterSpacing: "0.18em", textTransform: "uppercase", color: C.inkSoft, marginBottom: 18 }}>
            The A1C Challenge
          </div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: "clamp(34px, 6vw, 52px)", lineHeight: 1.07, letterSpacing: "-0.02em", margin: "0 0 22px", color: C.ink }}>
            A shared, open look at blood-sugar control
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.65, color: C.inkSoft, margin: "0 0 32px", maxWidth: 580 }}>
            When hemp seed and raw cannabis flower are eaten as food — raw, the flower never heated — does blood-sugar control shift over four weeks? This study asks that question in the open, with every record available for anyone to examine.
          </p>
          <EnrollCTA open={studyOpen} />
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 64px" }}>

        {/* The hypothesis */}
        <HypothesisBlock />

        {/* The shape of it */}
        <div style={{ marginTop: 44 }}>
          <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accentDeep, marginBottom: 14, paddingBottom: 10, borderBottom: `1px solid ${C.line}` }}>The shape of it</div>
          <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.65, color: C.inkSoft, margin: 0 }}>
            A starting A1C, four weeks of the food with a five-minute check-in each week, then a second A1C. That before-and-after — yours, and the crowd&rsquo;s — is the whole study. No name, no email.
          </p>
        </div>

        {/* Open science */}
        <div style={{ marginTop: 44, padding: "26px 28px", background: C.accentTint, border: `1px solid ${C.accent}`, borderRadius: 8 }}>
          <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accentDeep, marginBottom: 14 }}>Open science</div>
          <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.65, color: C.inkSoft, margin: "0 0 14px" }}>
            This app is open-source and feeds an append-only{" "}
            <a className="a1c-link" href="https://zenodo.org/records/20653093" target="_blank" rel="noopener noreferrer">Zenodo dataset</a>.
            {" "}The visualization and extract layer reads from that same open-access data. Everything — spec, implementation, and data — is available for anyone to analyze or repurpose.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.65, color: C.inkSoft, margin: "0 0 14px" }}>
            The study is built to the published specifications at{" "}
            <a className="a1c-link" href="https://osf.io/r4ufg/overview" target="_blank" rel="noopener noreferrer">OSF</a>{" "}
            and{" "}
            <a className="a1c-link" href="https://zenodo.org/records/20653093" target="_blank" rel="noopener noreferrer">Zenodo</a>,
            {" "}with matching implementation documentation for those who wish to follow the methodology.
          </p>
        </div>

        {/* What you need */}
        <div style={{ marginTop: 44 }}>
          <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accentDeep, marginBottom: 20, paddingBottom: 10, borderBottom: `1px solid ${C.line}` }}>What you&rsquo;ll need</div>
          {[
            { head: "The food", body: "Hemp seed (whole or shelled, raw, kept cold) and raw cannabis flower — flower that has never been heated or decarboxylated. Heat changes it from the food we're looking at into something else." },
            { head: "A way to measure", body: "An A1C reading at the start and again at week 4. A home kit, a pharmacy, or a clinic — whatever you can reach. Fructosamine is optional but valuable if you have access." },
          ].map(({ head, body }) => (
            <div key={head} style={{ marginBottom: 18, paddingLeft: 16, borderLeft: `2px solid ${C.accent}` }}>
              <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 5 }}>{head}</div>
              <div style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft }}>{body}</div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{ marginTop: 48, padding: "32px 28px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 8 }}>
          <EnrollCard open={studyOpen} />
        </div>

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.line}`, display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontFamily: MONO, fontSize: 13, color: C.inkFaint }}>
            The A1C Challenge · a1c-challenge.org
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            <a className="a1c-link" href="https://osf.io/r4ufg/overview" target="_blank" rel="noopener noreferrer"
               style={{ fontFamily: MONO, fontSize: 13, color: C.inkFaint, textDecoration: "none" }}>
              Study spec (OSF)
            </a>
            <a className="a1c-link" href="https://zenodo.org/records/20653093" target="_blank" rel="noopener noreferrer"
               style={{ fontFamily: MONO, fontSize: 13, color: C.inkFaint, textDecoration: "none" }}>
              Dataset (Zenodo)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
