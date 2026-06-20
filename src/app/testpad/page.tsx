"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { api, ApiError } from "@/lib/api";
import { getToken, persistToken, setPendingToken, clearToken } from "@/lib/token";
import { C, SERIF, MONO } from "@/lib/theme";

const TESTPAD_FLAG = "a1c_testpad_session";

const routes = [
  { name: "01a. Before You Begin", path: "/before-you-begin" },
  { name: "01b. Getting Set Up",   path: "/getting-set-up" },
  { name: "02. Enrollment Intake", path: "/enrollment" },
  { name: "03. Start Day One",     path: "/day-one" },
  { name: "04. Weekly Check-In",   path: "/check-in" },
  { name: "05. Milestone (Week 4)", path: "/milestone" },
];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 14 }}>
      <span style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint, textTransform: "uppercase", letterSpacing: "0.1em", minWidth: 100, paddingTop: 3 }}>{label}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

function Chip({ children, color }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{ fontFamily: MONO, fontSize: 13, background: color ?? C.accentTint, color: C.accentDeep, padding: "3px 8px", borderRadius: 4, border: `1px solid ${C.line}` }}>
      {children}
    </span>
  );
}

export default function TestPad() {
  const [token,         setTokenDisplay] = useState<string | null>(null);
  const [tokenInput,    setTokenInput]   = useState("");
  const [studyStatus,   setStudyStatus]  = useState<string>("…");
  const [startDate,     setStartDate]    = useState<string | null>(null);
  const [startInput,    setStartInput]   = useState("");
  const [msg,           setMsg]          = useState("");
  const [participantOk, setParticipantOk] = useState<boolean | null>(null);

  // Set testpad bypass flag so gates let this session through
  useEffect(() => {
    sessionStorage.setItem(TESTPAD_FLAG, "1");
  }, []);

  // Load current token + study status
  useEffect(() => {
    setTokenDisplay(getToken());
    api.publicGet("/study/status")
      .then((d) => setStudyStatus((d as { status: string }).status))
      .catch(() => setStudyStatus("error"));
  }, []);

  // Load participant info when token is set
  useEffect(() => {
    if (!token) { setParticipantOk(null); setStartDate(null); return; }
    api.get("/participants/me")
      .then((d) => {
        setParticipantOk(true);
        setStartDate((d as { startDate: string | null }).startDate);
      })
      .catch(() => { setParticipantOk(false); setStartDate(null); });
  }, [token]);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(""), 3000); };

  const handleSetToken = () => {
    const t = tokenInput.trim().toUpperCase();
    if (!t) { flash("Enter a token first."); return; }
    setPendingToken(t);
    persistToken();
    setTokenDisplay(t);
    setTokenInput("");
    flash("Token saved.");
  };

  const handleClearToken = () => {
    clearToken();
    setTokenDisplay(null);
    setStartDate(null);
    setParticipantOk(null);
    flash("Token cleared.");
  };

  const handleSetStartDate = async () => {
    if (!startInput) { flash("Pick a date first."); return; }
    try {
      await api.patch("/participants/me", { startDate: startInput });
      setStartDate(startInput);
      flash("Start date set.");
    } catch (err) {
      flash(err instanceof ApiError ? err.error : "Error setting start date.");
    }
  };

  const handleClearStartDate = async () => {
    try {
      await api.patch("/participants/me", { startDate: null });
      setStartDate(null);
      flash("Start date cleared.");
    } catch (err) {
      flash(err instanceof ApiError ? err.error : "Error clearing start date.");
    }
  };

  const inp: React.CSSProperties = {
    fontFamily: MONO, fontSize: 14, padding: "8px 10px",
    background: C.pageBg, border: `1px solid ${C.line}`,
    borderRadius: 5, color: C.ink,
  };
  const btn: React.CSSProperties = {
    fontFamily: MONO, fontSize: 13, padding: "8px 14px",
    background: C.accent, color: C.card, border: "none",
    borderRadius: 5, cursor: "pointer",
  };
  const ghostBtn: React.CSSProperties = { ...btn, background: "none", color: C.accentDeep, border: `1px solid ${C.line}` };

  return (
    <div style={{ background: C.pageBg, minHeight: "100vh", padding: "32px 20px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 6 }}>
          A1C Challenge
        </div>
        <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 28, color: C.ink, margin: "0 0 4px" }}>Test Pad</h1>
        <p style={{ fontFamily: SERIF, fontSize: 14.5, color: C.inkSoft, margin: "0 0 28px", lineHeight: 1.5 }}>
          Visiting this page sets a session bypass so enrollment gates open regardless of study status.
          Closes when the tab closes.
        </p>

        {/* State panel */}
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 8, padding: "18px 20px", marginBottom: 28 }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 14 }}>
            Current state
          </div>

          <Row label="Study">
            <Chip color={studyStatus === "OPEN" ? "#EAEDE3" : "#F5EBE6"}>
              {studyStatus}
            </Chip>
            <span style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint, marginLeft: 10 }}>
              (gates bypassed in this tab)
            </span>
          </Row>

          <Row label="Token">
            {token
              ? <><Chip>{token}</Chip>{participantOk === false && <span style={{ fontFamily: MONO, fontSize: 12, color: "#9A5A3C", marginLeft: 8 }}>not found in DB</span>}</>
              : <span style={{ fontFamily: MONO, fontSize: 13, color: C.inkFaint }}>none</span>}
          </Row>

          <Row label="Start date">
            {startDate
              ? <Chip>{startDate}</Chip>
              : <span style={{ fontFamily: MONO, fontSize: 13, color: C.inkFaint }}>not set</span>}
          </Row>
        </div>

        {/* Token controls */}
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 8, padding: "18px 20px", marginBottom: 16 }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 14 }}>
            Participant token
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input value={tokenInput} onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                   onKeyDown={(e) => e.key === "Enter" && handleSetToken()}
                   placeholder="K7F2-9QXM-4TBN" style={{ ...inp, flex: 1 }} />
            <button onClick={handleSetToken} style={btn}>Set</button>
          </div>
          <button onClick={handleClearToken} style={ghostBtn} disabled={!token}>
            Clear token
          </button>
        </div>

        {/* Start date controls */}
        <div style={{ background: C.card, border: `1px solid ${C.line}`, borderRadius: 8, padding: "18px 20px", marginBottom: 28, opacity: token && participantOk ? 1 : 0.45 }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 14 }}>
            Participant start date {!token && <span style={{ color: "#9A5A3C" }}>(requires token)</span>}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            <input type="date" value={startInput} onChange={(e) => setStartInput(e.target.value)}
                   style={{ ...inp, flex: 1 }} disabled={!token || !participantOk} />
            <button onClick={handleSetStartDate} style={btn} disabled={!token || !participantOk}>Set</button>
          </div>
          <button onClick={handleClearStartDate} style={ghostBtn} disabled={!token || !participantOk || !startDate}>
            Clear start date
          </button>
          <div style={{ fontFamily: SERIF, fontSize: 13, color: C.inkFaint, marginTop: 10 }}>
            Setting a Monday date with studyWeek ≥ 1 routes to /check-in. Clearing routes to /day-one.
          </div>
        </div>

        {/* Route list */}
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: C.inkFaint, marginBottom: 12 }}>
          Views
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {routes.map((route) => (
            <Link key={route.path} href={route.path}
                  style={{ display: "block", padding: "13px 16px", background: C.card, borderRadius: 6, color: C.ink, textDecoration: "none", fontFamily: SERIF, fontWeight: 700, fontSize: 15.5, border: `1px solid ${C.line}` }}>
              {route.name} →
            </Link>
          ))}
        </nav>

        {msg && (
          <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", background: C.ink, color: C.card, fontFamily: MONO, fontSize: 13, padding: "10px 18px", borderRadius: 6, zIndex: 99 }}>
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
