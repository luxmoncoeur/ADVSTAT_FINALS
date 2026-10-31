"use client";

import { useSettings } from "@/components/providers";
import {
  ReportDialog,
  ReportFacts,
  ReportSection,
  ReportSteps,
} from "@/components/shared/report-dialog";
import { formatExact, formatNumber, formatPValue } from "@/lib/format";
import { claimConclusion } from "../claim";
import { TAILS, TESTS } from "../config";
import { NormalCurveChart } from "./normal-curve-chart";

/**
 * The given values in the order the form shows them, labelled with their
 * symbols, e.g. [["x̄ (Sample mean)", "510"], …].
 */
export function givenValues(testId, input) {
  const test = TESTS[testId];
  const defs = [
    ...(test.nullField ? [test.nullField] : []),
    ...(test.fields ?? []),
    ...Object.values(test.modes ?? {}).flat(),
  ];
  const seen = new Set();
  return defs
    .filter((field) => {
      if (seen.has(field.name) || typeof input[field.name] !== "number") return false;
      seen.add(field.name);
      return true;
    })
    .map((field) => [
      `${field.symbol} · ${field.group ? `${field.group} ` : ""}${field.label.toLowerCase()}`,
      formatExact(/** @type {number} */ (input[field.name])),
    ]);
}

/** Print-ready z-test report: problem, hypotheses, verdict, curve and solution. */
export function HypothesisReport({ result, submitted }) {
  const { decimals } = useSettings();
  const test = TESTS[submitted.testId];
  const tail = TAILS.find((t) => t.value === result.tail);
  const zc = /** @type {number} */ (
    result.tail === "left" ? result.critical.lower : result.critical.upper
  );
  const critical =
    result.tail === "two"
      ? `±${formatNumber(Math.abs(zc), decimals, { fixed: true })}`
      : formatNumber(zc, decimals, { fixed: true });
  const { statements, claimSide } = submitted;

  return (
    <ReportDialog title={`${test.title} z-test`} subtitle={`${tail?.label} · α = ${result.alpha}`}>
      <ReportSection number={1} title="Hypotheses">
        <div className="grid gap-2 font-mono text-sm sm:grid-cols-2">
          {[
            ["h0", "H₀", result.hypotheses.null, statements?.h0],
            ["ha", "Hₐ", result.hypotheses.alternative, statements?.ha],
          ].map(([side, label, formula, words]) => (
            <div key={side} className="rounded-md border px-3 py-2">
              <p>
                <span className="text-muted-foreground">{label}: </span>
                <span className="font-semibold">{formula}</span>
                {claimSide === side ? (
                  <span className="ml-2 font-sans text-xs font-semibold">(claim)</span>
                ) : null}
              </p>
              {words ? <p className="mt-1 font-sans text-sm">{words}</p> : null}
            </div>
          ))}
        </div>
      </ReportSection>

      <ReportSection number={2} title="Given">
        <ReportFacts
          items={[...givenValues(submitted.testId, submitted.input), ["α", String(result.alpha)]]}
        />
      </ReportSection>

      <ReportSection number={3} title="Decision">
        <ReportFacts
          items={[
            ["Test statistic z", formatNumber(result.z, decimals, { fixed: true })],
            ["Critical z", critical],
            ["p-value", formatPValue(result.pValue, decimals)],
            ["Decision", result.reject ? "Reject H₀" : "Fail to reject H₀"],
          ]}
        />
        <p className="rounded-md border-l-4 border-foreground bg-muted px-4 py-3 text-sm leading-relaxed">
          {result.conclusion}
          {claimSide ? <strong> {claimConclusion(claimSide, result.reject)}</strong> : null}
        </p>
      </ReportSection>

      <ReportSection number={4} title="Normal curve">
        <NormalCurveChart result={result} showPValue />
      </ReportSection>

      <ReportSection number={5} title="Step-by-step solution">
        <ReportSteps steps={result.steps} />
      </ReportSection>
    </ReportDialog>
  );
}
