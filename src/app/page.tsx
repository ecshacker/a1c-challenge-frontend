"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { C, SERIF, MONO } from "@/lib/theme";

const SITE_URL = "https://a1c-challenge.org";
const SHARE_TEXT = "The A1C Challenge — a shared, open look at whether hemp seed and raw cannabis flower shift blood-sugar control over four weeks.";

/* ---- icon paths ---- */
function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  );
}
function IconLinkedIn() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect x="2" y="9" width="4" height="12"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  );
}
function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
    </svg>
  );
}
function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="currentColor" aria-hidden>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.89a8.18 8.18 0 0 0 4.84 1.55V7a4.85 4.85 0 0 1-1.07-.31z"/>
    </svg>
  );
}
function IconOSF() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9"/>
      <text x="12" y="16" textAnchor="middle" fontSize="7" fontWeight="700" fill="currentColor" stroke="none" fontFamily="ui-monospace,monospace">OSF</text>
    </svg>
  );
}
function IconZenodo() {
  return (
    <svg viewBox="0 0 24 24" width={18} height={18} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="3"/>
      <text x="12" y="16.5" textAnchor="middle" fontSize="10" fontWeight="800" fill="currentColor" stroke="none" fontFamily="ui-monospace,monospace">Z</text>
    </svg>
  );
}
function IconDocument() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
    </svg>
  );
}

function IconBtn({ label, href, onClick, children }: {
  label: string;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const style: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 34, height: 34, borderRadius: 6,
    color: C.inkFaint, background: "none", border: "none",
    cursor: "pointer", textDecoration: "none",
    transition: "color 0.15s, background 0.15s",
  };
  if (href) return (
    <a href={href} target="_blank" rel="noopener noreferrer" title={label} aria-label={label} style={style}
       onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = C.accentDeep; (e.currentTarget as HTMLElement).style.background = C.accentTint; }}
       onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = C.inkFaint; (e.currentTarget as HTMLElement).style.background = "none"; }}>
      {children}
    </a>
  );
  return (
    <button onClick={onClick} title={label} aria-label={label} style={style}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = C.accentDeep; (e.currentTarget as HTMLElement).style.background = C.accentTint; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = C.inkFaint; (e.currentTarget as HTMLElement).style.background = "none"; }}>
      {children}
    </button>
  );
}

function SiteFooter() {
  const [shareToast, setShareToast] = useState("");

  const flashToast = useCallback((msg: string) => {
    setShareToast(msg);
    setTimeout(() => setShareToast(""), 2600);
  }, []);

  const copyShare = useCallback(async (platform: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: "The A1C Challenge", text: SHARE_TEXT, url: SITE_URL });
        return;
      } catch { /* user cancelled or not supported */ }
    }
    try {
      await navigator.clipboard.writeText(SITE_URL);
      flashToast(`Link copied — share on ${platform}`);
    } catch {
      flashToast("Copy the link: " + SITE_URL);
    }
  }, [flashToast]);

  return (
    <div style={{ marginTop: 48, paddingTop: 20, borderTop: `1px solid ${C.line}` }}>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "space-between", alignItems: "center" }}>

        {/* Left: identity + terms */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.inkFaint }}>
            The A1C Challenge · a1c-challenge.org
          </span>
          <Link href="/terms" title="Terms & Disclosures"
                style={{ display: "inline-flex", alignItems: "center", gap: 4, fontFamily: MONO, fontSize: 12, color: C.inkFaint, textDecoration: "none" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = C.accentDeep)}
                onMouseLeave={(e) => (e.currentTarget.style.color = C.inkFaint)}>
            <IconDocument /> Terms
          </Link>
        </div>

        {/* Right: icon groups */}
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Share icons */}
          <IconBtn label="Share on Facebook"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(SITE_URL)}`}>
            <IconFacebook />
          </IconBtn>
          <IconBtn label="Share on LinkedIn"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(SITE_URL)}`}>
            <IconLinkedIn />
          </IconBtn>
          <IconBtn label="Share on Instagram" onClick={() => copyShare("Instagram")}>
            <IconInstagram />
          </IconBtn>
          <IconBtn label="Share on TikTok" onClick={() => copyShare("TikTok")}>
            <IconTikTok />
          </IconBtn>

          {/* Divider */}
          <span style={{ width: 1, height: 20, background: C.line, margin: "0 6px", display: "inline-block" }} />

          {/* Study links */}
          <IconBtn label="Study pre-registration (OSF)" href="https://osf.io/r4ufg/overview">
            <IconOSF />
          </IconBtn>
          <IconBtn label="Open dataset (Zenodo)" href="https://zenodo.org/records/20653093">
            <IconZenodo />
          </IconBtn>
        </div>
      </div>

      {shareToast && (
        <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.inkSoft, textAlign: "right" }}>
          {shareToast}
        </div>
      )}
    </div>
  );
}

function EnrollCTA() {
  return null;
}

function EnrollCard({ open }: { open: boolean | null }) {
  if (open === null) return <div style={{ height: 48 }} />;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 26, color: C.ink, marginBottom: 12 }}>Ready to take part?</div>
      {!open && (
        <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 20px" }}>
          Enrollment opens by Friday — check back soon.
        </p>
      )}
      {open && (
        <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 24px" }}>
          No name. No email. You get a code — that&rsquo;s your whole identity here.<br />
          Enroll now; start the weeks once you&rsquo;ve sourced everything.
        </p>
      )}
      <Link href="/before-you-begin"
            style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: C.card, background: C.accent, borderRadius: 6, padding: "14px 32px", textDecoration: "none", display: "inline-block" }}>
        Learn more and enroll →
      </Link>
    </div>
  );
}

function HypothesisBlock() {
  const [curious, setCurious] = useState(false);
  return (
    <div style={{ marginTop: 44, padding: "26px 18px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 8 }}>
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
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "28px 18px 24px" }}>
          <div style={{ fontFamily: MONO, fontSize: 13.5, letterSpacing: "0.18em", textTransform: "uppercase", color: C.inkSoft, marginBottom: 14 }}>
            The A1C Challenge
          </div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: "clamp(34px, 6vw, 52px)", lineHeight: 1.07, letterSpacing: "-0.02em", margin: "0 0 18px", color: C.ink }}>
            A shared, open look at blood-sugar control
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.65, color: C.inkSoft, margin: 0 }}>
            When hemp seed and raw cannabis flower are eaten as food — raw, the flower never heated — does blood-sugar control shift over four weeks? This study asks that question in the open, with every record available for anyone to examine.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 0px 64px" }}>

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
        <div style={{ marginTop: 44, padding: "26px 18px", background: C.accentTint, border: `1px solid ${C.accent}`, borderRadius: 8 }}>
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
        <SiteFooter />
      </div>
    </div>
  );
}
