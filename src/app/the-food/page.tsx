import Link from "next/link";
import { C, SERIF, MONO } from "@/lib/theme";

const body: React.CSSProperties = { fontFamily: SERIF, fontSize: 15.5, lineHeight: 1.72, color: C.inkSoft, margin: "0 0 16px" };
const h2style: React.CSSProperties = { fontFamily: SERIF, fontWeight: 800, fontSize: 22, color: C.ink, margin: "0 0 14px", lineHeight: 1.2 };

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginTop: 40, paddingTop: 28, borderTop: `1px solid ${C.line}` }}>
      <h2 style={h2style}>{title}</h2>
      {children}
    </div>
  );
}

function Callout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ margin: "20px 0", padding: "14px 18px", background: C.accentTint, border: `1px solid ${C.accent}`, borderRadius: 6 }}>
      <p style={{ ...body, margin: 0, color: C.accentDeep }}>{children}</p>
    </div>
  );
}

export default function TheFoodPage() {
  return (
    <div style={{ background: C.pageBg, minHeight: "100vh", color: C.ink, overflowX: "hidden" }}>
      <div style={{ maxWidth: 660, width: "100%", margin: "0 auto", padding: "40px 18px 72px", boxSizing: "border-box" }}>

        <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", color: C.inkSoft, marginBottom: 16 }}>
          <Link href="/before-you-begin" style={{ color: C.inkFaint, textDecoration: "none" }}>Before you begin</Link>
          {" "}·{" "}
          <span style={{ color: C.inkSoft }}>The food</span>
        </div>

        <h1 style={{ fontFamily: SERIF, fontWeight: 800, fontSize: 38, lineHeight: 1.08, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
          The food
        </h1>
        <p style={{ ...body, fontSize: 17, margin: "0 0 4px" }}>
          Two foods, eaten raw. Here is what to look for, how to use them, and what to avoid.
        </p>

        {/* Hemp Hearts */}
        <Section title="Hemp Hearts">
          <p style={body}>
            Hemp hearts are hulled hemp seeds — the shell and the interior of the hemp seed separated, ready to eat without any preparation. They have a mild, nutty flavor and a soft texture. Some people describe a mild butter flavor, and when heated they do caramelize to produce a mild buttery note. They can be added to virtually any food without significantly altering its taste, and it is fine to cook the hemp seeds — just don&rsquo;t heat the raw flower.
          </p>
          <p style={body}>
            They don&rsquo;t need to be cooked and can be eaten raw. Add them to smoothies, stir into yogurt, sprinkle over salads, mix into oatmeal, or eat directly by the spoonful.
          </p>
          <p style={body}>
            When shopping, give preference to product with seed shells left in — it adds fiber. Store in a refrigerator or sealed airtight container. Keep them frozen for long-term storage if you order in bulk. Hemp&rsquo;s fatty acid profile — its most valuable nutritional attribute — is vulnerable to oxidation; heat and light degrade it. Look for hemp hearts that are light green to tan in color; dark or gray seeds have likely oxidized somewhat (still perfectly acceptable, just slightly degraded). The label should list no ingredients other than hemp seeds.
          </p>
          <Callout>
            Hemp hearts marketed for human consumption can be expensive depending on where you shop. An equivalent product — hulled hemp seed with the hull still in the mix — is often available as equine feed at a fraction of the cost. It is the same food, and the hull adds fiber that is nutritionally beneficial.
          </Callout>
        </Section>

        {/* Raw Cannabis Leaf and Flower */}
        <Section title="Raw Cannabis Leaf and Flower">
          <p style={body}>
            The raw leaf and flower of the Cannabis plant — including what is commonly called bud or flower — contains the acidic cannabinoid vitamers that hemp seed does not. The acidic cannabinoids THCA, CBDA, and CBGA are present in meaningful quantities only in the above-ground plant material, not in the seed.
          </p>
          <p style={body}>
            In states and jurisdictions where Cannabis is legal for recreational or medical use, raw flower is available at dispensaries. For the nutritional application described here, strain selection is less critical than freshness and processing temperature. What matters is that the plant material has not been heated — cured flower stored at room temperature is acceptable; anything that has been decarboxylated (deliberately heated to activate THC) is not nutritionally equivalent.
          </p>
          <Callout>
            Heat is the line. Raw and unheated means it is the food this study is about. Once heated — smoked, vaped, cooked, or decarboxylated — it becomes something else entirely. Whether raw flower is legal and appropriate where you are is yours to know; this study makes no recommendation on that question.
          </Callout>
        </Section>

        {/* What to Avoid */}
        <Section title="What to Avoid">
          <p style={body}>
            CBD isolates, broad-spectrum extracts, and full-spectrum oils are not equivalent substitutes for raw plant material. Processing typically involves heat, which destroys the acidic vitamers. What remains is decarboxylated CBD — useful in specific therapeutic contexts, but not nutritionally equivalent to the whole-plant acidic profile.
          </p>
          <p style={body}>
            &ldquo;Minimally processed&rdquo; or &ldquo;cold processed&rdquo; is what you want — just as nature designed it. The nutritional protocol requires the acidic forms, and heat eliminates them across the spectrum of cooking temperatures.
          </p>
          <p style={body}>
            For daily nutritional use, the goal is unheated plant material.
          </p>
        </Section>

        <div style={{ marginTop: 48, paddingTop: 20, borderTop: `1px solid ${C.line}`, display: "flex", gap: 24, flexWrap: "wrap", alignItems: "baseline" }}>
          <Link href="/before-you-begin"
                style={{ fontFamily: MONO, fontSize: 13, color: C.accentDeep, textDecoration: "none", fontWeight: 600 }}>
            ← Back to Before you begin
          </Link>
          <Link href="/getting-set-up"
                style={{ fontFamily: MONO, fontSize: 13, color: C.inkFaint, textDecoration: "none" }}>
            Sourcing guide →
          </Link>
        </div>

      </div>
    </div>
  );
}
