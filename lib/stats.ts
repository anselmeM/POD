// ============================================================
// Statistical significance — frequentist helpers for A/B
// ============================================================

function erf(x: number): number {
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741,
        a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const sign = x < 0 ? -1 : 1;
  const abs = Math.abs(x);
  const t = 1 / (1 + p * abs);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-abs * abs);
  return sign * y;
}

function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

export interface ProportionStats {
  p: number; // conversion rate 0-1
  visitors: number;
  conversions: number;
}

/** Wilson 95% interval for a proportion */
export function wilsonCI(conversions: number, visitors: number, z = 1.96): { lower: number; upper: number; p: number } {
  if (visitors === 0) return { lower: 0, upper: 0, p: 0 };
  const p = conversions / visitors;
  const n = visitors;
  const denom = 1 + (z * z) / n;
  const centre = p + (z * z) / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p) + (z * z) / (4 * n)) / n);
  return {
    p,
    lower: Math.max(0, (centre - margin) / denom),
    upper: Math.min(1, (centre + margin) / denom),
  };
}

export interface SignificanceResult {
  pValue: number;
  z: number;
  significant: boolean; // p < 0.05
  confidence: number; // 1 - pValue
  delta: number; // pB - pA
  lift: number; // delta / pA
}

/** Two-proportion z-test (pooled) between variant A and B */
export function significance(control: ProportionStats, challenger: ProportionStats): SignificanceResult {
  const p1 = control.visitors ? control.conversions / control.visitors : 0;
  const p2 = challenger.visitors ? challenger.conversions / challenger.visitors : 0;
  const n1 = control.visitors, n2 = challenger.visitors;
  if (n1 === 0 || n2 === 0) return { pValue: 1, z: 0, significant: false, confidence: 0, delta: p2 - p1, lift: p1 ? (p2 - p1) / p1 : 0 };
  const pooled = (control.conversions + challenger.conversions) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));
  if (se === 0) return { pValue: 1, z: 0, significant: false, confidence: 0, delta: p2 - p1, lift: p1 ? (p2 - p1) / p1 : 0 };
  const z = (p2 - p1) / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));
  return { z, pValue, significant: pValue < 0.05, confidence: 1 - pValue, delta: p2 - p1, lift: p1 ? (p2 - p1) / p1 : 0 };
}

/** Minimum per-variant sample size for detecting p1 vs p2 (two-tailed, equal split) */
export function sampleSize(p1: number, p2: number, alpha = 0.05, power = 0.8): number {
  const zAlpha = 1.96; // 0.05 two-tailed
  const zBeta = 0.84;  // 80% power
  void alpha; void power;
  const pBar = (p1 + p2) / 2;
  const numerator = Math.pow(zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) + zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)), 2);
  const denom = Math.pow(p2 - p1, 2);
  if (denom === 0) return 0;
  return Math.ceil(numerator / denom);
}

export function formatPValue(p: number): string {
  if (p < 0.001) return "p<0.001";
  return `p=${p.toFixed(3)}`;
}
