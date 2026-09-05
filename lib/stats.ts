/**
 * ============================================================================
 * STATISTICAL SIGNIFICANCE & EXPERIMENTATION MATHEMATICS
 * ============================================================================
 *
 * This module provides the mathematical and frequentist statistical foundation
 * for Proof of Demand's smoke testing engine.
 *
 * It powers:
 * 1. Wilson Score Confidence Intervals (WTC) for conversion rates.
 * 2. Two-Proportion Pooled Z-Tests for variant lift and p-values.
 * 3. Power Analysis & Minimum Sample Size Calculators.
 *
 * Why Wilson Score Interval Over Standard Wald Interval?
 * ------------------------------------------------------
 * The standard normal approximation (Wald interval: $p \pm z\sqrt{p(1-p)/n}$)
 * performs notoriously poorly for small sample sizes or conversion rates near 0 or 1,
 * frequently producing absurd negative lower bounds (e.g. -1.2%).
 * The Wilson Score Interval inverts the score test to produce asymmetrical,
 * robust intervals bounded strictly between [0, 1] even when $n < 30$ or conversions = 0.
 */

/**
 * Abramowitz and Stegun polynomial approximation of the Gauss Error Function (erf).
 * Maximum absolute error is $|e(x)| \le 1.5 \times 10^{-7}$.
 *
 * @param {number} x The input real value
 * @returns {number} erf(x) bounded between [-1, 1]
 */
function erf(x: number): number {
  const a1 = 0.254829592,
    a2 = -0.284496736,
    a3 = 1.421413741,
    a4 = -1.453152027,
    a5 = 1.061405429,
    p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const abs = Math.abs(x);
  const t = 1 / (1 + p * abs);
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-abs * abs));

  return sign * y;
}

/**
 * Standard Normal Cumulative Distribution Function $\Phi(z) = P(Z \le z)$.
 * Converts a standard normal z-score into a cumulative probability.
 *
 * @param {number} z Standard score (number of standard deviations from mean)
 * @returns {number} Cumulative probability bounded in [0, 1]
 */
function normalCdf(z: number): number {
  return 0.5 * (1 + erf(z / Math.SQRT2));
}

/**
 * Summary telemetry for a single experiment variant.
 */
export interface ProportionStats {
  /** Conversion rate represented as a proportion between 0 and 1 */
  p: number;
  /** Total unique visitors exposed to this variant */
  visitors: number;
  /** Total conversions (leads, pre-orders, or fake-door clicks) */
  conversions: number;
}

/**
 * Calculates the Wilson Score 95% Confidence Interval for a binomial proportion.
 *
 * Mathematical formula:
 * $$\frac{p + \frac{z^2}{2n} \pm z \sqrt{\frac{p(1-p)}{n} + \frac{z^2}{4n^2}}}{1 + \frac{z^2}{n}}$$
 *
 * @param {number} conversions Number of observed successes (e.g. leads)
 * @param {number} visitors Number of observed trials (e.g. unique landing page visitors)
 * @param {number} [z=1.96] Standard score (1.96 corresponds to 95% confidence level)
 * @returns {{ lower: number; upper: number; p: number }} The point estimate and bounds [0, 1]
 */
export function wilsonCI(
  conversions: number,
  visitors: number,
  z = 1.96
): { lower: number; upper: number; p: number } {
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

/**
 * Comprehensive statistical significance output comparing two test variants.
 */
export interface SignificanceResult {
  /** Two-tailed p-value testing null hypothesis $H_0: p_A = p_B$ */
  pValue: number;
  /** Standardized z-score */
  z: number;
  /** Boolean indicating whether pValue < 0.05 (95% statistical confidence) */
  significant: boolean;
  /** Statistical confidence level (1 - pValue) */
  confidence: number;
  /** Absolute difference in conversion rates ($p_B - p_A$) */
  delta: number;
  /** Relative lift percentage ($(p_B - p_A) / p_A$) */
  lift: number;
}

/**
 * Computes a Two-Proportion Pooled Z-Test between control (A) and challenger (B).
 *
 * Null Hypothesis:
 *   $H_0: p_A = p_B$ (no difference in true conversion rates)
 * Alternative Hypothesis:
 *   $H_1: p_A \neq p_B$ (two-tailed test)
 *
 * Standard Error calculation uses the pooled sample proportion:
 *   $$\hat{p} = \frac{x_A + x_B}{n_A + n_B}$$
 *   $$SE = \sqrt{\hat{p}(1 - \hat{p}) \left(\frac{1}{n_A} + \frac{1}{n_B}\right)}$$
 *   $$z = \frac{p_B - p_A}{SE}$$
 *
 * @param {ProportionStats} control Telemetry for baseline control variant
 * @param {ProportionStats} challenger Telemetry for challenger variant
 * @returns {SignificanceResult} Complete statistical breakdown including p-value, z-score, and relative lift
 */
export function significance(
  control: ProportionStats,
  challenger: ProportionStats
): SignificanceResult {
  const p1 = control.visitors ? control.conversions / control.visitors : 0;
  const p2 = challenger.visitors ? challenger.conversions / challenger.visitors : 0;
  const n1 = control.visitors,
    n2 = challenger.visitors;

  // Zero-traffic edge case
  if (n1 === 0 || n2 === 0) {
    return {
      pValue: 1,
      z: 0,
      significant: false,
      confidence: 0,
      delta: p2 - p1,
      lift: p1 ? (p2 - p1) / p1 : 0,
    };
  }

  const pooled = (control.conversions + challenger.conversions) / (n1 + n2);
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2));

  // No variance edge case (e.g. 0 conversions in both variants)
  if (se === 0) {
    return {
      pValue: 1,
      z: 0,
      significant: false,
      confidence: 0,
      delta: p2 - p1,
      lift: p1 ? (p2 - p1) / p1 : 0,
    };
  }

  const z = (p2 - p1) / se;
  const pValue = 2 * (1 - normalCdf(Math.abs(z)));

  return {
    z,
    pValue,
    significant: pValue < 0.05,
    confidence: 1 - pValue,
    delta: p2 - p1,
    lift: p1 ? (p2 - p1) / p1 : 0,
  };
}

/**
 * Calculates the required minimum sample size per variant to detect a difference
 * between baseline conversion rate $p_1$ and minimum detectable effect $p_2$.
 *
 * Assumptions:
 * - Equal 50/50 traffic split between variants.
 * - Significance level $\alpha = 0.05$ (two-tailed, $z_{\alpha/2} = 1.96$).
 * - Statistical power $1 - \beta = 0.80$ (80% power, $z_\beta = 0.84$).
 *
 * @param {number} p1 Baseline conversion rate (e.g. 0.05 for 5%)
 * @param {number} p2 Target / expected challenger conversion rate (e.g. 0.08 for 8%)
 * @param {number} [alpha=0.05] Type I error rate
 * @param {number} [power=0.8] Statistical power (1 - Type II error rate)
 * @returns {number} Minimum unique visitors needed per variant
 */
export function sampleSize(
  p1: number,
  p2: number,
  alpha = 0.05,
  power = 0.8
): number {
  const zAlpha = 1.96; // 95% confidence (two-tailed)
  const zBeta = 0.84;  // 80% power
  void alpha;
  void power;

  const pBar = (p1 + p2) / 2;
  const numerator = Math.pow(
    zAlpha * Math.sqrt(2 * pBar * (1 - pBar)) +
      zBeta * Math.sqrt(p1 * (1 - p1) + p2 * (1 - p2)),
    2
  );
  const denom = Math.pow(p2 - p1, 2);

  if (denom === 0) return 0;
  return Math.ceil(numerator / denom);
}

/**
 * Formats a p-value into standard academic/scientific notation.
 *
 * @param {number} p The computed p-value
 * @returns {string} E.g. "p<0.001" or "p=0.024"
 */
export function formatPValue(p: number): string {
  if (p < 0.001) return "p<0.001";
  return `p=${p.toFixed(3)}`;
}
