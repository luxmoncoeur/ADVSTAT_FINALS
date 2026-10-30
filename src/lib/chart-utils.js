// @ts-check

/**
 * Axis domain with a little breathing room around the data.
 * @param {number[]} values
 * @param {number} [padding] fraction of the range added on each side
 * @returns {[number, number]}
 */
export function paddedDomain(values, padding = 0.08) {
  let min = Infinity;
  let max = -Infinity;
  for (const value of values) {
    if (value < min) min = value;
    if (value > max) max = value;
  }
  const range = max - min || Math.abs(max) || 1;
  return [min - range * padding, max + range * padding];
}

/**
 * "Nice" axis: round the padded range outward to a 1-2-5 step so ticks read
 * like a hand-drawn graph (0, 20, 40 …) instead of 56.42, 71.42 ….
 * @param {number[]} values
 * @param {number} [count] approximate number of ticks
 * @returns {{ domain: [number, number], ticks: number[] }}
 */
export function niceScale(values, count = 5) {
  const [low, high] = paddedDomain(values, 0.04);
  const rough = (high - low) / Math.max(1, count - 1);
  const power = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 2.5, 5, 10].map((m) => m * power).find((candidate) => candidate >= rough) ?? 10 * power;
  const start = Math.floor(low / step) * step;
  const end = Math.ceil(high / step) * step;
  const ticks = [];
  for (let i = 0; start + i * step <= end + step / 2; i += 1)
    ticks.push(Number((start + i * step).toPrecision(12)));
  return { domain: [ticks[0], ticks[ticks.length - 1]], ticks };
}

const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });
const standard = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const small = new Intl.NumberFormat("en-US", { maximumSignificantDigits: 3 });

/** Short axis tick label (ticks are visual guides; exact values are in tooltips and tables). */
export function formatTick(/** @type {number} */ value) {
  const abs = Math.abs(value);
  if (abs >= 100000) return compact.format(value);
  if (abs > 0 && abs < 0.01) return small.format(value);
  return standard.format(value);
}

/**
 * Keep at most `limit` points for drawing, evenly spaced, always keeping the
 * first and last. Statistics are always computed on the full data.
 * @template T
 * @param {T[]} items
 * @param {number} limit
 * @returns {T[]}
 */
export function downsample(items, limit) {
  if (items.length <= limit) return items;
  const step = (items.length - 1) / (limit - 1);
  return Array.from({ length: limit }, (_, i) => items[Math.round(i * step)]);
}
