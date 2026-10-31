import { Percent, Scale, Sigma, Split } from "lucide-react";
import { oneMeanZTest, oneProportionZTest, twoMeansZTest, twoProportionsZTest } from "@/lib/stats";

/**
 * @typedef {object} FieldDef
 * @property {string} name     Key passed to the stats function.
 * @property {string} label
 * @property {string} symbol
 * @property {boolean} [integer]
 * @property {string} [hint]
 * @property {string} [group]  Column heading for two-sample tests.
 */

/**
 * Test definitions. `nullField` is the input that holds the value in H₀
 * (null for the two-proportion test, where H₀: p₁ − p₂ = 0 is fixed).
 */
export const TESTS = {
  "one-mean": {
    id: "one-mean",
    title: "One mean",
    subtitle: "μ, σ known",
    description:
      "Compare a sample mean x̄ with a hypothesized population mean μ₀ when the population standard deviation σ is known.",
    icon: Sigma,
    parameter: "μ",
    nullField: { name: "mu0", label: "Hypothesized mean", symbol: "μ₀" },
    fields: [
      { name: "sampleMean", label: "Sample mean", symbol: "x̄" },
      {
        name: "sigma",
        label: "Population standard deviation",
        symbol: "σ",
        hint: "Must be greater than 0",
      },
      { name: "n", label: "Sample size", symbol: "n", integer: true },
    ],
    run: oneMeanZTest,
    example: {
      values: { mu0: "500", sampleMean: "510", sigma: "30", n: "36" },
      tail: "two",
      alpha: "0.05",
      statements: {
        h0: "The mean battery life is 500 hours.",
        ha: "The mean battery life is different from 500 hours.",
      },
      story:
        "A manufacturer claims its batteries last 500 hours on average (σ = 30). A sample of 36 batteries has a mean life of 510 hours.",
    },
  },
  "one-proportion": {
    id: "one-proportion",
    title: "One proportion",
    subtitle: "p",
    description: "Compare a sample proportion p̂ with a hypothesized population proportion p₀.",
    icon: Percent,
    parameter: "p",
    nullField: {
      name: "p0",
      label: "Hypothesized proportion",
      symbol: "p₀",
      hint: "Between 0 and 1, e.g. 0.6",
    },
    modes: {
      counts: [
        { name: "successes", label: "Number of successes", symbol: "x", integer: true },
        { name: "n", label: "Sample size", symbol: "n", integer: true },
      ],
      proportions: [
        {
          name: "sampleProportion",
          label: "Sample proportion",
          symbol: "p̂",
          hint: "Between 0 and 1",
        },
        { name: "n", label: "Sample size", symbol: "n", integer: true },
      ],
    },
    run: oneProportionZTest,
    example: {
      values: { p0: "0.6", successes: "130", n: "250" },
      tail: "left",
      alpha: "0.05",
      statements: {
        h0: "The passing rate is 60%.",
        ha: "The passing rate is less than 60%.",
      },
      story:
        "A school claims 60% of students pass the qualifying exam. In a random sample of 250 students, 130 passed.",
    },
  },
  "two-means": {
    id: "two-means",
    title: "Two means",
    subtitle: "μ₁ − μ₂, σ known",
    description:
      "Compare the means of two independent samples when both population standard deviations are known.",
    icon: Scale,
    parameter: "μ₁ − μ₂",
    nullField: {
      name: "delta0",
      label: "Hypothesized difference",
      symbol: "D₀",
      hint: "Usually 0 (no difference)",
    },
    fields: [
      { name: "mean1", label: "Mean", symbol: "x̄₁", group: "Sample 1" },
      { name: "sigma1", label: "Population SD", symbol: "σ₁", group: "Sample 1" },
      { name: "n1", label: "Sample size", symbol: "n₁", integer: true, group: "Sample 1" },
      { name: "mean2", label: "Mean", symbol: "x̄₂", group: "Sample 2" },
      { name: "sigma2", label: "Population SD", symbol: "σ₂", group: "Sample 2" },
      { name: "n2", label: "Sample size", symbol: "n₂", integer: true, group: "Sample 2" },
    ],
    run: twoMeansZTest,
    example: {
      values: {
        delta0: "0",
        mean1: "85",
        sigma1: "6",
        n1: "36",
        mean2: "82",
        sigma2: "8",
        n2: "64",
      },
      tail: "two",
      alpha: "0.05",
      statements: {
        h0: "The two sections have the same mean score.",
        ha: "The two sections have different mean scores.",
      },
      story:
        "Section A (n = 36, σ = 6) averaged 85 on a test; Section B (n = 64, σ = 8) averaged 82.",
    },
  },
  "two-proportions": {
    id: "two-proportions",
    title: "Two proportions",
    subtitle: "p₁ − p₂",
    description: "Compare the proportions of successes in two independent samples (pooled z-test).",
    icon: Split,
    parameter: "p₁ − p₂",
    nullField: null,
    modes: {
      counts: [
        { name: "x1", label: "Successes", symbol: "x₁", integer: true, group: "Sample 1" },
        { name: "n1", label: "Sample size", symbol: "n₁", integer: true, group: "Sample 1" },
        { name: "x2", label: "Successes", symbol: "x₂", integer: true, group: "Sample 2" },
        { name: "n2", label: "Sample size", symbol: "n₂", integer: true, group: "Sample 2" },
      ],
      proportions: [
        { name: "p1", label: "Sample proportion", symbol: "p̂₁", group: "Sample 1" },
        { name: "n1", label: "Sample size", symbol: "n₁", integer: true, group: "Sample 1" },
        { name: "p2", label: "Sample proportion", symbol: "p̂₂", group: "Sample 2" },
        { name: "n2", label: "Sample size", symbol: "n₂", integer: true, group: "Sample 2" },
      ],
    },
    run: twoProportionsZTest,
    example: {
      values: { x1: "45", n1: "100", x2: "30", n2: "100" },
      tail: "right",
      alpha: "0.05",
      statements: {
        h0: "The new and old designs have the same click-through rate.",
        ha: "The new design has a higher click-through rate than the old design.",
      },
      story:
        "45 of 100 visitors clicked the new design (sample 1) and 30 of 100 clicked the old design (sample 2).",
    },
  },
};

export const TEST_ORDER = ["one-mean", "one-proportion", "two-means", "two-proportions"];

export const TAILS = [
  { value: "two", operator: "≠", label: "Two-tailed" },
  { value: "left", operator: "<", label: "Left-tailed" },
  { value: "right", operator: ">", label: "Right-tailed" },
];

export const ALPHA_PRESETS = ["0.10", "0.05", "0.01"];

const DEFAULT_TITLES = {
  "one-mean": "Battery life claim",
  "one-proportion": "Exam passing rate",
  "two-means": "Two class sections",
  "two-proportions": "Website redesign",
};

/**
 * Extra practice scenarios (illustrative data). Each includes the expected
 * outcome so the cards can be mixed: some reject H₀, some do not.
 */
const EXTRA_SCENARIOS = {
  "one-mean": [
    {
      id: "coffee",
      title: "Coffee machine fill",
      values: { mu0: "250", sampleMean: "248.9", sigma: "4", n: "40" },
      tail: "left",
      alpha: "0.05",
      statements: {
        h0: "The machine fills cups with 250 mL on average.",
        ha: "The machine underfills cups (less than 250 mL).",
      },
      story:
        "A café's machine should dispense 250 mL (σ = 4 mL). 40 cups average 248.9 mL. Is it underfilling?",
    },
    {
      id: "iq",
      title: "Tutoring program",
      values: { mu0: "100", sampleMean: "104", sigma: "15", n: "25" },
      tail: "right",
      alpha: "0.05",
      statements: {
        h0: "The program has no effect: mean score is 100.",
        ha: "The program raises the mean score above 100.",
      },
      story:
        "Test scores have μ = 100 and σ = 15. After a tutoring program, 25 students average 104. Did scores increase?",
    },
  ],
  "one-proportion": [
    {
      id: "coin",
      title: "Is the coin fair?",
      values: { p0: "0.5", successes: "270", n: "500" },
      tail: "two",
      alpha: "0.05",
      statements: { h0: "The coin is fair (p = 0.5).", ha: "The coin is not fair." },
      story: "A coin is flipped 500 times and lands heads 270 times. Is it biased?",
    },
    {
      id: "defects",
      title: "Defect rate",
      values: { p0: "0.05", successes: "38", n: "500" },
      tail: "right",
      alpha: "0.01",
      statements: { h0: "The defect rate is 5%.", ha: "The defect rate is higher than 5%." },
      story:
        "A supplier promises at most 5% defective parts. An inspection finds 38 defects in 500 parts.",
    },
  ],
  "two-means": [
    {
      id: "fertilizer",
      title: "Fertilizer comparison",
      values: {
        delta0: "0",
        mean1: "52.4",
        sigma1: "5",
        n1: "40",
        mean2: "50.9",
        sigma2: "6",
        n2: "45",
      },
      tail: "right",
      alpha: "0.05",
      statements: {
        h0: "Both fertilizers give the same mean plant height.",
        ha: "Fertilizer A gives taller plants than fertilizer B.",
      },
      story:
        "40 plants with fertilizer A average 52.4 cm (σ = 5); 45 plants with B average 50.9 cm (σ = 6).",
    },
    {
      id: "delivery",
      title: "Delivery times",
      values: {
        delta0: "0",
        mean1: "28.5",
        sigma1: "4.2",
        n1: "50",
        mean2: "30.1",
        sigma2: "3.8",
        n2: "60",
      },
      tail: "left",
      alpha: "0.01",
      statements: {
        h0: "Both couriers have the same mean delivery time.",
        ha: "Courier A is faster (lower mean time) than courier B.",
      },
      story:
        "Courier A: 50 deliveries average 28.5 min (σ = 4.2). Courier B: 60 deliveries average 30.1 min (σ = 3.8).",
    },
  ],
  "two-proportions": [
    {
      id: "side-effects",
      title: "Side effects",
      values: { x1: "18", n1: "300", x2: "12", n2: "300" },
      tail: "two",
      alpha: "0.05",
      statements: {
        h0: "Side effects occur at the same rate with both drugs.",
        ha: "The side-effect rates differ.",
      },
      story: "18 of 300 patients on drug A and 12 of 300 on drug B reported side effects.",
    },
    {
      id: "online-class",
      title: "Online vs. onsite",
      values: { x1: "168", n1: "240", x2: "141", n2: "235" },
      tail: "two",
      alpha: "0.05",
      statements: {
        h0: "Online and onsite classes have the same pass rate.",
        ha: "The pass rates differ.",
      },
      story: "168 of 240 online students passed, compared with 141 of 235 onsite students.",
    },
  ],
};

/** Every practice scenario for a test, the built-in example first. */
export function scenariosFor(testId) {
  const test = TESTS[testId];
  return [
    { id: "default", title: DEFAULT_TITLES[testId], ...test.example },
    ...EXTRA_SCENARIOS[testId],
  ];
}
