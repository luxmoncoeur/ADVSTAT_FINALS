/**
 * Claim → H₀ / Hₐ. Turns the comparison in a claim ("at least", "more than",
 * "is different from"…) into the two hypotheses, the tail, and the reasons, the
 * way it is taught: H₀ always holds the equality, Hₐ is its complement, and the
 * claim can sit in either one.
 */

/**
 * @typedef {'eq' | 'ne' | 'gt' | 'lt' | 'ge' | 'le'} Relation
 * @typedef {'h0' | 'ha'} ClaimSide
 */

/** @type {Record<Relation, { symbol: string, words: string, claimIn: ClaimSide, haSymbol: string, h0Textbook: string, tail: 'two' | 'left' | 'right' }>} */
export const RELATIONS = {
  eq: {
    symbol: "=",
    words: "is equal to",
    claimIn: "h0",
    haSymbol: "≠",
    h0Textbook: "=",
    tail: "two",
  },
  ne: {
    symbol: "≠",
    words: "is different from",
    claimIn: "ha",
    haSymbol: "≠",
    h0Textbook: "=",
    tail: "two",
  },
  gt: {
    symbol: ">",
    words: "is more than",
    claimIn: "ha",
    haSymbol: ">",
    h0Textbook: "≤",
    tail: "right",
  },
  lt: {
    symbol: "<",
    words: "is less than",
    claimIn: "ha",
    haSymbol: "<",
    h0Textbook: "≥",
    tail: "left",
  },
  ge: {
    symbol: "≥",
    words: "is at least",
    claimIn: "h0",
    haSymbol: "<",
    h0Textbook: "≥",
    tail: "left",
  },
  le: {
    symbol: "≤",
    words: "is at most",
    claimIn: "h0",
    haSymbol: ">",
    h0Textbook: "≤",
    tail: "right",
  },
};

export const RELATION_ORDER = /** @type {Relation[]} */ (["eq", "ne", "gt", "lt", "ge", "le"]);

/**
 * Comparison phrases found in word problems. When phrases overlap the longer
 * one wins, so "no more than" (≤) beats "more than" (>) and "is not less than"
 * (≥) beats "is not" (≠).
 * @type {Record<Relation, string[]>}
 */
const PHRASES = {
  ge: [
    "at least",
    "no less than",
    "not less than",
    "no fewer than",
    "not fewer than",
    "a minimum of",
    "or more",
    "or higher",
    "is not below",
  ],
  le: [
    "at most",
    "no more than",
    "not more than",
    "no greater than",
    "not greater than",
    "a maximum of",
    "does not exceed",
    "do not exceed",
    "not exceed",
    "or less",
    "or fewer",
    "or lower",
    "is not above",
  ],
  gt: [
    "more than",
    "greater than",
    "higher than",
    "larger than",
    "longer than",
    "taller than",
    "better than",
    "exceeds",
    "exceed",
    "above",
    "increased",
    "increases",
    "raises",
    "improves",
    "improved",
  ],
  lt: [
    "less than",
    "fewer than",
    "lower than",
    "smaller than",
    "shorter than",
    "below",
    "decreased",
    "decreases",
    "reduced",
    "reduces",
    "underfills",
  ],
  ne: [
    "different from",
    "differs",
    "differ",
    "not equal",
    "has changed",
    "is not",
    "biased",
    "not fair",
  ],
  eq: [
    "equal to",
    "equals",
    "the same as",
    "is exactly",
    "has not changed",
    "no difference",
    "unchanged",
    "is fair",
  ],
};

const escape = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Every phrase with its relation, longest first. */
const PHRASE_LIST = RELATION_ORDER.flatMap((relation) =>
  PHRASES[relation].map((phrase) => ({ phrase, relation })),
).sort((a, b) => b.phrase.length - a.phrase.length);

/**
 * The number written right after a phrase ("at least 500 hours" → 500,
 * "more than 60% of" → 0.6 with `percent`). Looks at most a few words ahead.
 * @param {string} rest text following the phrase
 * @returns {{ value: number, percent: boolean } | null}
 */
export function numberAfter(rest) {
  const match = /^[^\d\n.;]{0,20}?(-?\d+(?:,\d{3})*(?:\.\d+)?)\s*(%|percent)?/i.exec(rest);
  if (!match) return null;
  const value = Number(match[1].replaceAll(",", ""));
  if (!Number.isFinite(value)) return null;
  return { value, percent: Boolean(match[2]) };
}

/**
 * Find the comparison phrases in a claim or word problem, in reading order,
 * without overlaps.
 * @param {string} text
 * @returns {{ phrase: string, relation: Relation, start: number, end: number, number: { value: number, percent: boolean } | null }[]}
 */
export function detectClaims(text) {
  const lower = text.toLowerCase();
  /** @type {{ phrase: string, relation: Relation, start: number, end: number, number: { value: number, percent: boolean } | null }[]} */
  const found = [];
  for (const { phrase, relation } of PHRASE_LIST) {
    const pattern = new RegExp(`\\b${escape(phrase)}\\b`, "g");
    for (const match of lower.matchAll(pattern)) {
      const start = match.index;
      const end = start + phrase.length;
      if (found.some((item) => start < item.end && end > item.start)) continue;
      found.push({
        phrase: text.slice(start, end),
        relation,
        start,
        end,
        number: numberAfter(text.slice(end)),
      });
    }
  }
  return found.sort((a, b) => a.start - b.start);
}

/**
 * Hypotheses and reasoning for a claim.
 * @param {Relation} relation
 * @param {{ parameter: string, value: string }} subject e.g. { parameter: "μ", value: "500" }
 */
export function hypothesesFromClaim(relation, { parameter, value }) {
  const info = RELATIONS[relation];
  const claim = `${parameter} ${info.symbol} ${value}`;
  const h0 = `${parameter} = ${value}`;
  const ha = `${parameter} ${info.haSymbol} ${value}`;
  const tailWords = {
    two: "two-tailed: reject H₀ if z is far from 0 on either side",
    left: "left-tailed: reject H₀ only if z is far below 0",
    right: "right-tailed: reject H₀ only if z is far above 0",
  }[info.tail];

  const reasons = [
    `The claim says ${parameter} ${info.words} ${value}, written ${claim}.`,
    info.claimIn === "h0"
      ? `${info.symbol} includes equality, so the claim is the null hypothesis H₀ (H₀ always holds the equal sign).`
      : `${info.symbol} has no equality, so the claim is the alternative hypothesis Hₐ and H₀ takes the equal sign.`,
    `Hₐ uses ${info.haSymbol}, so the test is ${tailWords}.`,
  ];
  if (info.h0Textbook !== "=") {
    reasons.push(
      `Some textbooks write H₀: ${parameter} ${info.h0Textbook} ${value}. It is tested at the boundary ${h0}, so z and the decision are the same.`,
    );
  }
  return { claim, claimIn: info.claimIn, h0, ha, tail: info.tail, reasons };
}

/**
 * The value a detected number puts into H₀ for this test, or null when the
 * number cannot be H₀'s value (two-sample tests compare against D₀ / 0).
 * @param {{ id: string }} test
 * @param {{ value: number, percent: boolean } | null} number
 */
export function nullValueFrom(test, number) {
  if (!number) return null;
  if (test.id === "one-mean") return number.value;
  if (test.id === "one-proportion") {
    const p = number.percent ? number.value / 100 : number.value;
    return p > 0 && p < 1 ? Number(p.toPrecision(12)) : null;
  }
  return null;
}

/**
 * The textbook sentence about the claim for each of the four outcomes.
 * @param {ClaimSide} claimIn
 * @param {boolean} reject
 */
export function claimConclusion(claimIn, reject) {
  if (claimIn === "h0")
    return reject
      ? "There is enough evidence to reject the claim."
      : "There is not enough evidence to reject the claim.";
  return reject
    ? "There is enough evidence to support the claim."
    : "There is not enough evidence to support the claim.";
}
