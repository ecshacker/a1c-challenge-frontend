import Link from "next/link";

const C = {
  pageBg:    "#E6E5DD",
  card:      "#F7F6F2",
  ink:       "#222420",
  inkSoft:   "#595C50",
  inkFaint:  "#8A8C80",
  line:      "#D4D3C8",
  accent:    "#586B4D",
  accentDeep:"#43543A",
  accentTint:"#EAEDE3",
};
const SERIF = "'Merriweather', Georgia, 'Times New Roman', serif";
const MONO  = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export default function LandingPage() {
  return (
    <div style={{ background: C.pageBg, minHeight: "100vh", color: C.ink }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Merriweather:ital,opsz,wght@0,18..144,300..900;1,18..144,300..900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        a.a1c-link { color: ${C.accentDeep}; text-decoration: underline; text-underline-offset: 3px; }
        a.a1c-link:hover { color: ${C.accent}; }
      `}</style>

      {/* Hero */}
      <div style={{ borderBottom: `1px solid ${C.line}`, background: C.card }}>
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 24px 44px" }}>
          <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: "0.18em", textTransform: "uppercase", color: C.inkSoft, marginBottom: 18 }}>
            The A1C Challenge
          </div>
          <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: "clamp(34px, 6vw, 52px)", lineHeight: 1.07, letterSpacing: "-0.02em", margin: "0 0 22px", color: C.ink }}>
            A shared, open look at blood-sugar control
          </h1>
          <p style={{ fontFamily: SERIF, fontSize: 18, lineHeight: 1.65, color: C.inkSoft, margin: "0 0 32px", maxWidth: 580 }}>
            When hemp seed and raw cannabis flower are eaten as food — raw, never heated — does blood-sugar control shift over four weeks? This study asks that question in the open, with every record available for anyone to examine.
          </p>
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
        </div>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "0 24px 64px" }}>

        {/* The hypothesis */}
        <div style={{ marginTop: 44, padding: "26px 28px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 8 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accentDeep, marginBottom: 14 }}>The hypothesis</div>
          <p style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.65, color: C.inkSoft, margin: "0 0 16px" }}>
            If a faster biomarker moves ahead of a slower one, that ordering is consistent with an upstream correction rather than downstream glucose suppression. It doesn&rsquo;t rule out other explanations.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.65, color: C.inkSoft, margin: "0 0 16px" }}>
            What we&rsquo;re testing is whether a nutritional correction behaves that way — the pattern you&rsquo;d expect if a condition like Type 2 Diabetes had a nutritional component, the way scurvy does.
          </p>
          <p style={{ fontFamily: SERIF, fontSize: 16.5, lineHeight: 1.65, color: C.ink, margin: 0, fontStyle: "italic" }}>
            The cohort is built to let that prediction fail in public if it&rsquo;s wrong.
          </p>
        </div>

        {/* How it works */}
        <div style={{ marginTop: 44 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accentDeep, marginBottom: 20, paddingBottom: 10, borderBottom: `1px solid ${C.line}` }}>How it works</div>
          {[
            { n: "1", head: "Enroll and set a baseline", body: "Any day works. You give a starting A1C and a few details — no name, no email. You get a code; that's your whole identity here." },
            { n: "2", head: "Start on a Monday", body: "Once you've sourced the food, pick a Monday to begin. Your weeks run Monday to Sunday from there, so nothing is half a week." },
            { n: "3", head: "Five minutes, once a week", body: "A short check-in: what you ate, and how the week felt. You can fix last week while this week is still open." },
            { n: "4", head: "A second A1C at week 4", body: "One more reading closes the four weeks. That comparison — baseline to week 4 — is the whole point. A week-8 reading is welcome but optional." },
          ].map(({ n, head, body }) => (
            <div key={n} style={{ display: "flex", gap: 16, marginBottom: 22 }}>
              <div style={{ fontFamily: MONO, fontSize: 13, color: C.card, background: C.accent, width: 26, height: 26, borderRadius: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>{n}</div>
              <div>
                <div style={{ fontFamily: SERIF, fontSize: 17, fontWeight: 700, color: C.ink, marginBottom: 4 }}>{head}</div>
                <div style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft }}>{body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Open science */}
        <div style={{ marginTop: 44, padding: "26px 28px", background: C.accentTint, border: `1px solid ${C.accent}`, borderRadius: 8 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accentDeep, marginBottom: 14 }}>Open science</div>
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
          <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.6, color: C.inkSoft, margin: 0 }}>
            An N=1 case report is coming to Zenodo preprints. Stay tuned.
          </p>
        </div>

        {/* What you need */}
        <div style={{ marginTop: 44 }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accentDeep, marginBottom: 20, paddingBottom: 10, borderBottom: `1px solid ${C.line}` }}>What you&rsquo;ll need</div>
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
        <div style={{ marginTop: 48, padding: "32px 28px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 8, textAlign: "center" }}>
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

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: `1px solid ${C.line}`, display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "space-between", alignItems: "baseline" }}>
          <div style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint }}>
            The A1C Challenge · a1c-challenge.org
          </div>
          <div style={{ display: "flex", gap: 18 }}>
            <a className="a1c-link" href="https://osf.io/r4ufg/overview" target="_blank" rel="noopener noreferrer"
               style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint, textDecoration: "none" }}>
              Study spec (OSF)
            </a>
            <a className="a1c-link" href="https://zenodo.org/records/20653093" target="_blank" rel="noopener noreferrer"
               style={{ fontFamily: MONO, fontSize: 12, color: C.inkFaint, textDecoration: "none" }}>
              Dataset (Zenodo)
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
