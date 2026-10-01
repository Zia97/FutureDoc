// ============================================================================
// UCAT score estimation — single source of truth
// ============================================================================
//
// What this module does
// ---------------------
// Converts raw practice-test percentages into estimated UCAT scaled scores
// (300–900) and percentiles, plus the SJ band lookup. Every results screen,
// analytics screen, and test list card in the app reads from here so that
// "your scaled score" means the same thing everywhere.
//
// Why "estimated"
// ---------------
// The real UCAT does NOT use a simple formula. Pearson VUE uses Item Response
// Theory (Rasch model since 2011) with item-level calibration, anchored back
// to a 2006 reference scale. Each test form has its own raw → scaled
// conversion table, generated before the testing window opens. Two candidates
// with identical raw scores on different forms can receive different scaled
// scores. The conversion tables are proprietary and not published.
//
// No third-party app — including this one — can replicate UCAT scoring
// exactly. We do the next best thing: piecewise-linear interpolation (VR)
// or z-score transformation (DM/QR) anchored against the 2025 official UCAT
// statistics published by the UCAT Consortium.
//
// Sources used to calibrate the helpers below
// -------------------------------------------
//   • UCAT Consortium 2025 statistics (means, SDs, deciles by section)
//     — published at ucat.ac.uk
//   • Pearson VUE Annual Technical Report 2023 (VR SD = 77.94, DM SD = 90.35,
//     QR SD = 87.13, SEM ≈ 39–46 per subtest)
//   • MedicHut community-derived raw → scaled anchor table for VR
//     (validated against the 2025 official deciles below)
//
// Confidence
// ----------
// Standard error of measurement is roughly ±40 scaled-score points per
// subtest on the real UCAT. We surface this as `SCORE_UNCERTAINTY` and
// recommend that all consumer screens display the score with this implied
// margin (e.g. "estimate", "approx").
//
// What we deliberately do NOT do
// ------------------------------
//   • We do not affiliate with or claim equivalence to Pearson VUE scoring.
//   • We do not store cohort-relative percentile rankings of *our own* user
//     base. Percentiles surfaced here are against the published 2025 UK
//     candidate cohort (~41,354 sitters), not our app's users.
//   • We do not refine the formula based on year-over-year drift. The 2025
//     anchors are baked in. Update this file when newer official data lands.
// ============================================================================

// ── Official 2025 UK UCAT cohort statistics ─────────────────────────────────
// Source: ucat.ac.uk official statistics, 41,354 candidates.
// First cohort under the new 3-subtest format (AR removed).

export const VR_2025_MEAN    = 602;
export const DM_2025_MEAN    = 628;
export const QR_2025_MEAN    = 661;
export const TOTAL_2025_MEAN = 1891;

// Section standard deviations.
// VR/DM/QR values are taken from Pearson VUE 2023 technical report and
// extrapolated against 2025 decile spreads. QR's SD widened in 2025.
export const VR_2025_SD = 78;
export const DM_2025_SD = 86;
export const QR_2025_SD = 117;

// Standard error of measurement per cognitive subtest (Pearson VUE 2023).
// Used as the displayed confidence interval around any estimated score.
export const SCORE_UNCERTAINTY = 40;

// 2025 official decile tables. Each entry is the scaled score at the
// corresponding percentile boundary. Source: ucat.ac.uk 2025 statistics.
// Used for getPercentile() lookups so users see "you're at the ~57th
// percentile" rather than just a delta from the mean.
const DECILE_PERCENTILES = [10, 20, 30, 40, 50, 60, 70, 80, 90];

export const VR_DECILES_2025 = [500, 540, 560, 580, 600, 620, 640, 670, 700];
export const DM_DECILES_2025 = [520, 560, 590, 610, 630, 650, 670, 700, 740];
export const QR_DECILES_2025 = [520, 570, 590, 630, 650, 680, 710, 750, 820];

// ── VR: piecewise-linear interpolation ──────────────────────────────────────
// Anchor table sourced from MedicHut's community raw → scaled mapping for the
// 44-item VR format and cross-checked against the 2025 official deciles:
//
//   raw correct  →  scaled  (matches 2025 percentile)
//   ──────────────────────────────────────────────────
//        0       →   300    (floor)
//       17       →   500    (10th percentile)
//       23       →   600    (≈ mean of 602)
//       30       →   700    (90th percentile)
//       36       →   800
//       41       →   900    (ceiling)
//
// Naturally produces an S-curve with steeper slope through the middle of
// the ability range, matching IRT-shaped conversions.

const VR_ANCHORS = [
  { correct: 0,  scaled: 300 },
  { correct: 17, scaled: 500 },
  { correct: 23, scaled: 600 },
  { correct: 30, scaled: 700 },
  { correct: 36, scaled: 800 },
  { correct: 41, scaled: 900 },
];

const VR_TOTAL_ITEMS = 44;

/**
 * Estimate the UCAT VR scaled score (300–900) from a raw percentage.
 * Uses piecewise-linear interpolation against MedicHut anchor data,
 * validated against the 2025 official deciles. Most accurate of the
 * four section helpers because we have empirical anchor points.
 *
 * @param {number} rawPct  Raw percent correct, 0–100.
 * @returns {number}       Estimated scaled score, 300–900.
 */
export function getVRScaledScore(rawPct) {
  if (rawPct == null || Number.isNaN(rawPct)) return 300;
  const correct = (Math.max(0, Math.min(100, rawPct)) / 100) * VR_TOTAL_ITEMS;
  return interpolateAnchors(correct, VR_ANCHORS);
}

// ── DM / QR: z-score transformation ─────────────────────────────────────────
// We do not have empirical raw → scaled anchor data for DM or QR, so we use
// a z-score model: assume the raw % is normally distributed with mean ≈ 50%
// and SD ≈ 18% across the UK cohort, then map to scaled space using the
// official section mean and SD. This preserves the cohort spread (i.e. the
// compression at the tails) without pretending we know more than we do.
//
// Less accurate than the VR piecewise approach. Code comments mark it.

const ASSUMED_RAW_MEAN = 0.5;   // proportion correct, not %
const ASSUMED_RAW_SD   = 0.18;

function zScoreScaled(rawPct, mean, sd) {
  if (rawPct == null || Number.isNaN(rawPct)) return 300;
  const z = (rawPct / 100 - ASSUMED_RAW_MEAN) / ASSUMED_RAW_SD;
  const scaled = mean + z * sd;
  return Math.max(300, Math.min(900, Math.round(scaled)));
}

/**
 * Estimate the UCAT DM scaled score (300–900) from a raw percentage.
 * Z-score transform anchored at the 2025 mean (628) and SD (86).
 * Coarser approximation than VR — we lack empirical raw → scaled anchors
 * for DM, so the mean-of-50% assumption is the same one a linear formula
 * would make implicitly.
 */
export function getDMScaledScore(rawPct) {
  return zScoreScaled(rawPct, DM_2025_MEAN, DM_2025_SD);
}

/**
 * Estimate the UCAT QR scaled score (300–900) from a raw percentage.
 * Z-score transform anchored at the 2025 mean (661) and SD (117).
 * Same caveats as getDMScaledScore.
 */
export function getQRScaledScore(rawPct) {
  return zScoreScaled(rawPct, QR_2025_MEAN, QR_2025_SD);
}

// ── SJ: UK band lookup ──────────────────────────────────────────────────────
// SJ uses a different scoring model entirely. UK SJ is reported as a band
// (1–4), not a scaled score. Band boundaries are reset annually based on the
// previous year's distribution, so we use community-derived approximate
// thresholds.
//
// Documented intended distribution (Pearson VUE 2023):
//   Band 1  ≈ 20–22% of candidates  — Excellent
//   Band 2  ≈ 36–39%                — Good
//   Band 3  ≈ 26–33%                — Modest
//   Band 4  ≈  9–16%                — Lower

export const SJ_UK_BANDS = [
  { band: 1, minPct: 80, color: '#16a34a', description: 'Excellent — judgement very closely aligned with expert panel' },
  { band: 2, minPct: 65, color: '#2563eb', description: 'Good — mostly appropriate judgement shown' },
  { band: 3, minPct: 50, color: '#d97706', description: 'Modest — appropriate judgement in some areas' },
  { band: 4, minPct: 0,  color: '#dc2626', description: 'Lower performance — limited appropriate judgement' },
];

/**
 * Estimate the UK SJ band from a raw mark percentage. The raw percentage
 * should already account for partial credit (4/2/0 marks per question).
 *
 * @param {number} rawPct  0–100, with partial-credit marks already applied.
 * @returns {{band, minPct, color, description}}
 */
export function getSJBand(rawPct) {
  if (rawPct == null || Number.isNaN(rawPct)) return SJ_UK_BANDS[3];
  return SJ_UK_BANDS.find((b) => rawPct >= b.minPct) ?? SJ_UK_BANDS[3];
}

// ── Percentile lookup ───────────────────────────────────────────────────────

const SECTION_DECILES = {
  vr: VR_DECILES_2025,
  dm: DM_DECILES_2025,
  qr: QR_DECILES_2025,
};

/**
 * Estimate the percentile rank of a scaled score against the 2025 UK UCAT
 * cohort. Uses linear interpolation between published decile boundaries.
 *
 * Returns one of:
 *   • { kind: 'below', percentile: 10 }   — for scores below the 10th percentile
 *   • { kind: 'above', percentile: 90 }   — for scores above the 90th percentile
 *   • { kind: 'exact', percentile: <num> } — interpolated percentile (10–90)
 *
 * @param {'vr'|'dm'|'qr'} section
 * @param {number} scaled  Estimated scaled score, 300–900.
 */
export function getPercentile(section, scaled) {
  const deciles = SECTION_DECILES[section];
  if (!deciles || scaled == null) return null;

  if (scaled < deciles[0]) return { kind: 'below', percentile: 10 };
  if (scaled >= deciles[deciles.length - 1]) {
    return { kind: 'above', percentile: 90 };
  }

  for (let i = 0; i < deciles.length - 1; i++) {
    const lo = deciles[i];
    const hi = deciles[i + 1];
    if (scaled >= lo && scaled < hi) {
      const span = hi - lo;
      const frac = span > 0 ? (scaled - lo) / span : 0;
      const pLo = DECILE_PERCENTILES[i];
      const pHi = DECILE_PERCENTILES[i + 1];
      return {
        kind: 'exact',
        percentile: Math.round(pLo + frac * (pHi - pLo)),
      };
    }
  }
  return null;
}

/**
 * Human-readable percentile string for any of the cognitive sections.
 * Examples:
 *   "approximately the 57th percentile"
 *   "above the 90th percentile"
 *   "below the 10th percentile"
 */
export function formatPercentile(section, scaled) {
  const p = getPercentile(section, scaled);
  if (!p) return null;
  if (p.kind === 'above') return 'above the 90th percentile';
  if (p.kind === 'below') return 'below the 10th percentile';
  const n = p.percentile;
  const suffix =
    n % 100 >= 11 && n % 100 <= 13
      ? 'th'
      : n % 10 === 1
      ? 'st'
      : n % 10 === 2
      ? 'nd'
      : n % 10 === 3
      ? 'rd'
      : 'th';
  return `approximately the ${n}${suffix} percentile`;
}

// ── Score colour bands ──────────────────────────────────────────────────────
// Anchored to the ~600 mean across all three cognitive subtests. Same
// thresholds used by every screen that needs to colour-code a scaled score.

export function scoreColor(scaled, theme) {
  if (scaled >= 700) return theme?.correct ?? '#16a34a'; // well above mean
  if (scaled >= 600) return theme?.accent  ?? '#1e60d5'; // around / above mean
  if (scaled >= 500) return '#d97706';                   // below mean
  return theme?.danger ?? '#dc2626';                     // significantly below
}

// ── Disclaimer text — used wherever a scaled score is displayed ────────────

export const UCAT_SCORE_DISCLAIMER =
  'Scaled scores in this app are estimates derived from the 2025 UCAT ' +
  'official statistics. The real UCAT uses cohort-relative Item Response ' +
  'Theory scoring with proprietary item parameters that no third-party app ' +
  'can replicate exactly. Treat these numbers as a rough indicator of your ' +
  'performance — not a prediction of your actual UCAT result. ' +
  `Typical uncertainty is ±${SCORE_UNCERTAINTY} points per subtest.`;

export const UCAT_SCORE_DISCLAIMER_SHORT =
  `Estimate only — ±${SCORE_UNCERTAINTY} points typical uncertainty. ` +
  'See About UCAT for details.';

// ── Internal: piecewise-linear interpolation ────────────────────────────────

function interpolateAnchors(value, anchors) {
  if (value <= anchors[0].correct) return anchors[0].scaled;
  if (value >= anchors[anchors.length - 1].correct) {
    return anchors[anchors.length - 1].scaled;
  }
  for (let i = 0; i < anchors.length - 1; i++) {
    const lo = anchors[i];
    const hi = anchors[i + 1];
    if (value >= lo.correct && value < hi.correct) {
      const span = hi.correct - lo.correct;
      const frac = span > 0 ? (value - lo.correct) / span : 0;
      return Math.round(lo.scaled + frac * (hi.scaled - lo.scaled));
    }
  }
  return anchors[anchors.length - 1].scaled;
}
