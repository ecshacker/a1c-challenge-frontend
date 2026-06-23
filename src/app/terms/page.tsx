import Link from "next/link";
import { C, SERIF, MONO } from "@/lib/theme";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 36 }}>
      <div style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: "0.16em", textTransform: "uppercase", color: C.accentDeep, marginBottom: 12, paddingBottom: 8, borderBottom: `1px solid ${C.line}` }}>
        {title}
      </div>
      {children}
    </div>
  );
}

const body: React.CSSProperties = { fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.7, color: C.inkSoft, margin: "0 0 14px" };

export default function TermsPage() {
  return (
    <div style={{ background: C.pageBg, minHeight: "100vh", color: C.ink }}>
      <div style={{ maxWidth: 660, margin: "0 auto", padding: "40px 24px 72px" }}>

        <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: C.inkSoft, marginBottom: 16 }}>
          <Link href="/" style={{ color: C.inkFaint, textDecoration: "none" }}>The A1C Challenge</Link>
          {" "}·{" "}
          <span style={{ color: C.inkSoft }}>Terms &amp; Disclosures</span>
        </div>
        <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 36, lineHeight: 1.08, letterSpacing: "-0.02em", margin: "0 0 8px" }}>
          Terms &amp; Disclosures
        </h1>
        <p style={{ fontFamily: MONO, fontSize: 13, color: C.inkFaint, margin: "0 0 4px" }}>
          Effective date: June 2025 · Last updated: June 2025
        </p>

        {/* Competing interests — front and center */}
        <div style={{ marginTop: 32, padding: "20px 22px", background: C.card, border: `1px solid ${C.line}`, borderRadius: 8 }}>
          <div style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: "0.14em", textTransform: "uppercase", color: C.accentDeep, marginBottom: 12 }}>Competing interests</div>
          <p style={{ fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.7, color: C.inkSoft, margin: 0 }}>
            <em>One author (J.B.) is the author of a commercially available book describing the dietary protocol examined in this work and operates a related commerce website. This constitutes a financial and intellectual interest in findings consistent with the protocol&rsquo;s premise. This research received no external funding. The study is pre-registered with a public analysis plan and a stated commitment to open reporting of null results; all data are released openly to permit independent verification.</em>
          </p>
        </div>

        <Section title="Privacy">
          <p style={body}>
            This study is anonymous by design. When you enroll, a random code is generated — it is not derived from or linked to your name, email address, device identifier, or precise location. That code is your entire identity in this system. Write it down; no one, including the study operators, can recover it for you.
          </p>
          <p style={body}>
            The only information stored in your browser is that code, held in <code style={{ fontFamily: MONO, fontSize: 14 }}>localStorage</code>. This application sets no tracking cookies. The only server-side storage is your study responses and the generated code — a random string with no external reference.
          </p>
          <p style={body}>
            Location is collected at enrollment at the country level only. Nothing more granular is recorded. No data is sold, licensed, or shared with third parties.
          </p>
        </Section>

        <Section title="Your data">
          <p style={body}>
            All study data is released publicly under <a href="https://creativecommons.org/publicdomain/zero/1.0/" target="_blank" rel="noopener noreferrer" style={{ color: C.accentDeep }}>CC0</a> (no rights reserved) via the{" "}
            <a href="https://zenodo.org/records/20653093" target="_blank" rel="noopener noreferrer" style={{ color: C.accentDeep }}>Zenodo dataset</a>.
            Records are reviewed before release; none should contain identifying information by design.
          </p>
          <p style={body}>
            The dataset is append-only: once a record is published it is not altered or deleted. This is a deliberate constraint to prevent post-hoc adjustment of results.
          </p>
          <p style={body}>
            By enrolling you consent to your anonymized responses being released under CC0 and used for any purpose, including commercial research, without further notice.
          </p>
        </Section>

        <Section title="Not medical advice">
          <p style={body}>
            Nothing on this site or in the study constitutes medical advice, diagnosis, or treatment. The study is observational — you eat, you measure, you record. You are not being treated. Consult a qualified clinician before making any change to your diet or care, especially if you take medication that affects blood sugar.
          </p>
          <p style={body}>
            You may withdraw from the study at any time by simply stopping. There is no mechanism to delete already-published open data, but no further data will be collected after you stop.
          </p>
        </Section>

        <Section title="Open source">
          <p style={body}>
            The frontend and backend source code are published under the{" "}
            <a href="https://www.gnu.org/licenses/agpl-3.0.en.html" target="_blank" rel="noopener noreferrer" style={{ color: C.accentDeep }}>GNU AGPLv3</a>{" "}
            at{" "}
            <a href="https://github.com/ecshacker/a1c-challenge-frontend" target="_blank" rel="noopener noreferrer" style={{ color: C.accentDeep }}>github.com/ecshacker</a>.
            The implementation is open for inspection, audit, and reuse under those license terms.
          </p>
        </Section>

        <Section title="Pre-registration">
          <p style={body}>
            The study is pre-registered at{" "}
            <a href="https://osf.io/r4ufg/overview" target="_blank" rel="noopener noreferrer" style={{ color: C.accentDeep }}>OSF</a>{" "}
            with a public analysis plan filed before data collection. Deviations from the plan, if any, will be disclosed. Results will be reported regardless of direction — null, negative, or positive — as committed in the pre-registration.
          </p>
        </Section>

        <Section title="Changes to this document">
          <p style={body}>
            Material changes will be noted with an updated effective date above. As this is an anonymous study with no way to contact participants, you are responsible for reviewing this page if it matters to your decision to participate.
          </p>
        </Section>

        <div style={{ marginTop: 48, paddingTop: 20, borderTop: `1px solid ${C.line}` }}>
          <Link href="/" style={{ fontFamily: MONO, fontSize: 13, color: C.accentDeep, textDecoration: "none" }}>
            ← Back to The A1C Challenge
          </Link>
        </div>

      </div>
    </div>
  );
}
