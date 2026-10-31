// @ts-check
/**
 * Display formatting. All statistics are computed at full float64 precision in
 * src/lib/stats; rounding happens only here, at the moment a value is shown.
 */

const SUPERSCRIPT = {
  "-": "⁻",
  0: "⁰",
  1: "¹",
  2: "²",
  3: "³",
  4: "⁴",
  5: "⁵",
  6: "⁶",
  7: "⁷",
  8: "⁸",
  9: "⁹",
};

/**
 * Round half away from zero on the decimal representation, so 1.005 → 1.01 and
 * 2.675 → 2.68 (as on paper), unlike Number#toFixed which rounds the binary value.
 * Only valid for |value| < 1e15 and decimals ≤ 6; larger values are shown in
 * scientific notation instead.
 *
 * @param {number} value
 * @param {number} decimals
 */
export function roundHalfUp(value, decimals) {
  const text = String(Math.abs(value));
  if (text.includes("e")) return value;
  const rounded = Number(`${Math.round(Number(`${text}e${decimals}`))}e-${decimals}`);
  return value < 0 ? -rounded : rounded;
}

/** @param {string} integerPart */
function group(integerPart) {
  return integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** @param {number} value */
function scientific(value) {
  const [mantissa, exponent] = value.toExponential(3).split("e");
  const power = String(Number(exponent))
    .split("")
    .map((ch) => SUPERSCRIPT[/** @type {keyof typeof SUPERSCRIPT} */ (ch)])
    .join("");
  return `${mantissa} × 10${power}`;
}

/**
 * Format a computed number for display.
 *
 * - Exact integers print without decimals (ΣX = 15, n = 8) unless `fixed` is set.
 * - Other values print with exactly `decimals` places (b = 0.6000).
 * - Non-zero values too small to show at that precision, and very large values,
 *   switch to scientific notation (1.234 × 10⁻⁵) rather than printing 0.0000.
 *
 * @param {number | null | undefined} value
 * @param {number} decimals
 * @param {{ fixed?: boolean }} [options]
 * @returns {string}
 */
export function formatNumber(value, decimals, { fixed = false } = {}) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (value === Infinity) return "∞";
  if (value === -Infinity) return "−∞";
  const abs = Math.abs(value);
  if (abs >= 1e15) return minus(scientific(value));
  if (!fixed && Number.isInteger(value)) return minus(group(String(abs)), value < 0);
  if (value !== 0 && abs < 0.5 * 10 ** -decimals) return minus(scientific(value));
  const rounded = roundHalfUp(value, decimals);
  const [intPart, frac] = Math.abs(rounded).toFixed(decimals).split(".");
  const body = frac ? `${group(intPart)}.${frac}` : group(intPart);
  return minus(body, rounded < 0);
}

/**
 * Use a true minus sign (U+2212) for negatives, which reads better in formulas.
 * @param {string} text
 * @param {boolean} [negative]
 */
function minus(text, negative) {
  if (negative === undefined) return text.replace(/^-/, "−");
  return negative ? `−${text}` : text;
}

/**
 * A value exactly as the user entered it (no rounding), e.g. μ₀ = 500, α = 0.05.
 * @param {number} value
 */
export function formatExact(value) {
  if (!Number.isFinite(value)) return formatNumber(value, 0);
  if (Number.isInteger(value) && Math.abs(value) < 1e15) return formatNumber(value, 0);
  return minus(String(value));
}

/**
 * Format a p-value. Values below the display precision show as "< 0.0001"
 * instead of a misleading 0.0000.
 * @param {number} p
 * @param {number} decimals
 */
export function formatPValue(p, decimals) {
  const floor = 10 ** -decimals;
  if (p > 0 && roundHalfUp(p, decimals) < floor) return `< ${floor.toFixed(decimals)}`;
  return formatNumber(p, decimals, { fixed: true });
}

/**
 * @param {string | { value: number, exact?: boolean }} token
 * @param {number} decimals
 */
export function formatToken(token, decimals) {
  if (typeof token === "string") return token;
  return token.exact ? formatExact(token.value) : formatNumber(token.value, decimals);
}

/**
 * Format as a percentage, e.g. 0.6 → "60.00%".
 * @param {number} value
 * @param {number} decimals
 */
export function formatPercent(value, decimals) {
  return `${formatNumber(value * 100, Math.max(0, decimals - 2), { fixed: true })}%`;
}
