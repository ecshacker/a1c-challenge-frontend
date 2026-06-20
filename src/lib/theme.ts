// Shared design tokens — import C, SERIF, MONO into every page.
// Bump MONO sizes here when the responsive pass happens.

export const C = {
  pageBg:     "#E6E5DD",
  card:       "#F7F6F2",
  ink:        "#222420",
  inkSoft:    "#595C50",
  inkFaint:   "#8A8C80",
  line:       "#D4D3C8",
  lineSoft:   "#E0DFD6",
  accent:     "#586B4D",
  accentDeep: "#43543A",
  accentTint: "#EAEDE3",
} as const;

export const SERIF = "'Merriweather', Georgia, 'Times New Roman', serif";
export const MONO  = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

// MONO font sizes — all values ≤ 12 have been bumped +1 from the original
// design. One place to change when adding mobile/tablet breakpoints.
export const MT = {
  // section labels / overlines (was 10, 10.5, 11)
  label:   12,   // was 11   — uppercase overline labels
  labelSm: 11.5, // was 10.5 — smaller overlines
  labelXs: 11,   // was 10   — extra-small labels (milestone wb grid)
  // body / data
  data:    13,   // was 12   — data values, inline metadata
  dataSm:  12.5, // was 11.5 — secondary data, path strip legend
  // interactive
  chip:    13.5, // was 12.5 — button-row chips, pills (already > 12, unchanged)
  code:    15,   // participant code display — already large, unchanged
} as const;
