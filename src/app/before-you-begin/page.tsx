"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, ApiError, type ParticipantSelf } from "@/lib/api";
import { getToken, setPendingToken, persistToken, clearToken } from "@/lib/token";

import { C, SERIF, MONO } from "@/lib/theme";

const PATH = [
  { id: "in", kind: "enroll" }, { id: "1", kind: "week" }, { id: "2", kind: "week" },
  { id: "3", kind: "week" }, { id: "4", kind: "milestone" }, { id: "·", kind: "gap" },
  { id: "8", kind: "milestone" },
];

function destinationFor(p: ParticipantSelf): string {
  if (p.startDate && p.studyWeek != null && p.studyWeek >= 1) return "/check-in";
  return "/day-one";
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: C.accentDeep, fontWeight: 600, marginBottom: 14, paddingBottom: 9, borderBottom: `1px solid ${C.line}` }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function Prereq({ title, summary, children, open, onToggle }: { title: string; summary: string; children: React.ReactNode; open: boolean; onToggle: () => void }) {
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

function ExtLink({ children, href }: { children: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="a1c-link"
       style={{ display: "inline-block", marginTop: 11, fontFamily: MONO, fontSize: 13.5, color: C.accentDeep, textDecoration: "none", fontWeight: 600 }}>
      {children} →
    </Link>
  );
}

function Step({ n, head, children }: { n: string; head: string; children: React.ReactNode }) {
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

function Ethos({ head, children }: { head: string; children: React.ReactNode }) {
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
      <div style={{ fontFamily: MONO, fontSize: 13.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 9 }}>the four weeks</div>
      <div style={{ display: "flex", alignItems: "center", fontFamily: MONO, fontSize: 13.5, whiteSpace: "nowrap" }}>
        {PATH.map((n, i) => {
          if (n.kind === "gap") return <span key={i} style={{ color: C.line, padding: "0 7px" }}>···</span>;
          const isMile = n.kind === "milestone";
          const isEnroll = n.kind === "enroll";
          return (
            <React.Fragment key={n.id}>
              {i > 0 && PATH[i - 1].kind !== "gap" && <span style={{ color: C.line, padding: "0 5px" }}>─</span>}
              <span title={isMile ? `A1C at week ${n.id}` : isEnroll ? "Enroll" : `Week ${n.id}`}
                    style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 24, height: 24, padding: "0 5px", borderRadius: isMile ? 3 : 12, background: isEnroll ? C.accentTint : "transparent", color: isEnroll ? C.accentDeep : C.inkFaint, border: `1px solid ${isEnroll ? C.accent : C.line}` }}>
                {isMile ? `${n.id}◆` : n.id}
              </span>
            </React.Fragment>
          );
        })}
      </div>
      <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.inkFaint, marginTop: 8 }}>◆ = an A1C reading · the rest are weekly check-ins</div>
    </div>
  );
}

export default function BeforeYouBeginPage() {
  const router = useRouter();
  const [open,       setOpen]      = useState<number | null>(null);
  const [reconnect,  setReconnect] = useState(false);
  const [code,       setCode]      = useState("");
  const [toast,      setToast]     = useState("");
  const [codeError,  setCodeError] = useState("");
  const [checking,   setChecking]  = useState(false);
  const [studyOpen,  setStudyOpen] = useState<boolean | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("a1c_testpad_session")) { setStudyOpen(true); return; }
    api.publicGet("/study/status")
      .then((d) => setStudyOpen((d as { status: string }).status === "OPEN"))
      .catch(() => setStudyOpen(false));
  }, []);

  // On load: if a token is already stored, resolve where they should be and redirect
  useEffect(() => {
    const token = getToken();
    if (!token) return;
    api.get("/participants/me")
      .then((data) => {
        router.replace(destinationFor(data as ParticipantSelf));
      })
      .catch(() => {
        // Token is stale or invalid — stay on this page so they can reconnect
      });
  }, [router]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const handleReconnect = async () => {
    const trimmed = code.trim();
    if (!trimmed) { setCodeError("Enter your code first."); return; }
    setChecking(true);
    setCodeError("");
    try {
      // Store temporarily so the API client sends the token header
      setPendingToken(trimmed);
      const data = await api.get("/participants/me");
      // Valid — persist and redirect
      persistToken();
      router.push(destinationFor(data as ParticipantSelf));
    } catch (err) {
      // Clear the pending token — it didn't work
      clearToken();
      if (err instanceof ApiError && (err.status === 401 || err.status === 404)) {
        setCodeError("That code doesn't match any participant. Check for typos.");
      } else {
        setCodeError("Couldn't reach the server — try again in a moment.");
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div style={{ background: C.pageBg, minHeight: "100vh", color: C.ink, overflowX: "hidden" }} className="a1c-root">
      <div>
        <div style={{ maxWidth: 560, width: "100%", margin: "0 auto", padding: "26px 18px 64px", boxSizing: "border-box" }}>
          <div style={{ fontFamily: MONO, fontSize: 13.5, letterSpacing: "0.18em", textTransform: "uppercase", color: C.inkSoft }}>
            The A1C Challenge
          </div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 40, lineHeight: 1.08, letterSpacing: "-0.02em", margin: "14px 0 0" }}>
            Before you begin
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: 17, lineHeight: 1.62, color: C.inkSoft, margin: "18px 0 0" }}>
            This is a shared, open look at one question: when hemp seed and raw cannabis flower are eaten as food — raw, the flower never heated — does blood-sugar control shift over four weeks? It&rsquo;s observational. You&rsquo;re not being treated or told to stop anything. You eat, you measure, you record what happens, stop any time — and so does everyone else taking part.
          </p>

          <Section label="Why take part">
            <p style={{ fontFamily: SERIF, fontSize: 16, lineHeight: 1.62, color: C.inkSoft, margin: "0 0 15px" }}>
              We don&rsquo;t yet know the answer — that&rsquo;s the whole reason to ask.
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 13px" }}>
              <strong style={{ color: C.ink, fontWeight: 700 }}>It&rsquo;s a real question, asked this way for the first time.</strong> Whether these foods, eaten raw, do anything for blood sugar hasn&rsquo;t been studied like this — the usual research machinery isn&rsquo;t pointed at it.
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 13px" }}>
              <strong style={{ color: C.ink, fontWeight: 700 }}>Your part becomes everyone&rsquo;s.</strong> Anonymized and open, your month of records joins the rest into something any researcher — or any curious person — can examine for themselves.
            </p>
            <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 13px" }}>
              <strong style={{ color: C.ink, fontWeight: 700 }}>You leave with your own answer <em>and </em> feed everyone&rsquo;s.</strong> However the larger answer turns out, you finish with your own baseline and a week-4 reading, and a record of your month.
            </p>
            <div style={{ marginTop: 18, padding: "14px 16px", background: C.accentTint, border: `1px solid ${C.accent}`, borderRadius: 6 }}>
              <span style={{ fontFamily: SERIF, fontSize: 16, fontStyle: "italic", lineHeight: 1.55, color: C.accentDeep }}>
                We&rsquo;re not promising this works. We&rsquo;re finding out, in the open, together.
              </span>
            </div>
          </Section>

          <Section label="What you'll need">
            <Prereq title="The food" summary="Hemp seed and raw cannabis flower, eaten raw." open={open === 0} onToggle={() => setOpen(open === 0 ? null : 0)}>
              <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 13px" }}>
                Hemp seed is easy to find — whole or shelled, raw, kept cold. Raw cannabis flower means flower that has never been heated or decarboxylated; heat changes it from the food we&rsquo;re looking at into something else.
              </p>
              <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft, margin: "0 0 13px" }}>
                Raw, unheated flower takes a little planning to source, and whether this is legal and appropriate for you depends on where you are and your own health picture.
              </p>
              <ExtLink href="/the-food">What &ldquo;raw&rdquo; means, and where to look</ExtLink>
            </Prereq>
            <Prereq title="A way to measure" summary="An A1C reading at the start, and again at week 4." open={open === 1} onToggle={() => setOpen(open === 1 ? null : 1)}>
              A1C reflects roughly three months of blood sugar, so one reading sets your baseline and a second at week 4 shows the change. You can get it from a home kit, a pharmacy, or a clinic.
              <ExtLink href="/getting-set-up">Ways to get an A1C</ExtLink>
            </Prereq>
          </Section>

          <Section label="How it works">
            <Step n="1" head="Enroll and set a baseline">Any day works. You give a starting A1C and a few details — no name, no email.</Step>
            <Step n="2" head="Start on a Monday">Once you&rsquo;ve got the food, pick a Monday to begin. Your weeks run Monday to Sunday from there.</Step>
            <Step n="3" head="Five minutes, once a week">A short check-in: what you ate, and how the week felt.</Step>
            <Step n="4" head="A second reading at week 4">One more A1C closes the four weeks. That comparison is the whole point.</Step>
            <div style={{ marginTop: 20 }}><PathwayPreview /></div>
          </Section>

          <Section label="What you’re agreeing to">
            <Ethos head="You stay anonymous">You get a code — that&rsquo;s your whole identity here. Write it down; it&rsquo;s how you return, on this device or any other.</Ethos>
            <Ethos head="Your record becomes open data">Anonymized and released under CC0 for anyone to study.</Ethos>
            <Ethos head="You can stop any time">This isn&rsquo;t medical care, and nothing here replaces your clinician. Leave whenever you like.</Ethos>
          </Section>

          <div style={{ marginTop: 36, paddingTop: 28, borderTop: `1px solid ${C.line}` }}>
          {!reconnect ? (
            <>
              {studyOpen === true && (
                <button className="a1c-btn a1c-primary" onClick={() => router.push("/enrollment")}
                        style={{ width: "100%", fontFamily: SERIF, fontSize: 17.5, fontWeight: 700, color: C.card, background: C.accent, border: "none", borderRadius: 6, padding: "15px", cursor: "pointer" }}>
                  Begin enrollment
                </button>
              )}
              {studyOpen === false && (
                <div style={{ padding: "14px 16px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 6 }}>
                  <span style={{ fontFamily: SERIF, fontSize: 16, color: C.inkSoft, fontStyle: "italic" }}>
                    Enrollment is not yet open — check back soon.
                  </span>
                </div>
              )}
              {studyOpen === null && <div style={{ height: 52 }} />}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 11, gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontFamily: SERIF, fontSize: 13, color: C.inkFaint }}>
                  {studyOpen ? "Enroll now; start the weeks once you’ve sourced everything." : "Already have a code? Reconnect below."}
                </span>
                <button className="a1c-link" onClick={() => setReconnect(true)}
                        style={{ fontFamily: MONO, fontSize: 13.5, color: C.accentDeep, background: "none", border: "none", cursor: "pointer", fontWeight: 600, whiteSpace: "nowrap" }}>
                  I already have a code →
                </button>
              </div>
            </>
          ) : (
            <div className="a1c-fade">
              <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.14em", textTransform: "uppercase", color: C.accentDeep, marginBottom: 9 }}>Reconnect with your code</div>
              <div style={{ display: "flex", gap: 9 }}>
                <input value={code} onChange={(e) => { setCode(e.target.value.toUpperCase()); setCodeError(""); }}
                       onKeyDown={(e) => e.key === "Enter" && handleReconnect()}
                       placeholder="K7F2-9QXM-4TBN" aria-label="Your participant code"
                       style={{ flex: 1, fontFamily: MONO, fontSize: 15, letterSpacing: "0.05em", padding: "12px 13px", background: C.pageBg, border: `1px solid ${codeError ? "#9A5A3C" : C.line}`, borderRadius: 5, color: C.ink }} />
                <button className="a1c-btn a1c-primary" onClick={handleReconnect} disabled={checking}
                        style={{ fontFamily: SERIF, fontSize: 15.5, fontWeight: 700, color: C.card, background: checking ? C.line : C.accent, border: "none", borderRadius: 5, padding: "0 18px", cursor: checking ? "default" : "pointer" }}>
                  {checking ? "…" : "Continue"}
                </button>
              </div>
              {codeError && (
                <div style={{ fontFamily: SERIF, fontSize: 13.5, color: "#9A5A3C", marginTop: 8 }}>{codeError}</div>
              )}
              <button className="a1c-link" onClick={() => { setReconnect(false); setCodeError(""); setCode(""); }}
                      style={{ fontFamily: SERIF, fontSize: 13.5, color: C.inkSoft, background: "none", border: "none", cursor: "pointer", marginTop: 10, padding: 0 }}>
                ← Back
              </button>
            </div>
          )}
          </div>
        </div>
      </div>

      {toast && (
        <div className="a1c-fade" style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 28, background: C.ink, color: C.card, fontFamily: MONO, fontSize: 13, padding: "10px 16px", borderRadius: 6, zIndex: 60 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
