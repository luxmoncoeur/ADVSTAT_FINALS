"use client";

import { useSettings } from "@/components/providers";
import {
  ReportDialog,
  ReportFacts,
  ReportSection,
  ReportSteps,
} from "@/components/shared/report-dialog";
import { formatNumber, formatPercent } from "@/lib/format";
import { Interpretation } from "./interpretation";
import { equationText } from "./regression-results";
import { RegressionScatterChart } from "./scatter-chart";
import { SumsTable } from "./sums-table";

/** Print-ready regression report: results, scatter diagram, table and solution. */
export function RegressionReport({ result, labels }) {
  const { decimals } = useSettings();
  const value = (number) =>
    number === null ? "Undefined" : formatNumber(number, decimals, { fixed: true });
  const strength =
    result.strength === null
      ? "Not defined"
      : result.strength === "None"
        ? "No linear relationship"
        : `${result.strength} ${result.direction}`;

  return (
    <ReportDialog
      title="Simple Linear Regression"
      subtitle={`${labels.y} (Y) on ${labels.x} (X) · n = ${result.n}`}
    >
      <ReportSection number={1} title="Results">
        <p className="font-mono text-lg font-semibold">
          {equationText(result.intercept, result.slope, decimals)}
        </p>
        <ReportFacts
          items={[
            ["Correlation r", value(result.r)],
            ["Determination r²", value(result.rSquared)],
            [
              "Variation explained",
              result.rSquared === null ? "—" : formatPercent(result.rSquared, decimals),
            ],
            ["Strength", strength],
          ]}
        />
        <Interpretation result={result} labels={labels} />
      </ReportSection>

      <ReportSection number={2} title="Scatter diagram">
        <RegressionScatterChart
          result={result}
          labels={labels}
          showResiduals={false}
          showMeans={false}
        />
      </ReportSection>

      <ReportSection number={3} title="Computation table">
        <SumsTable result={result} labels={labels} />
      </ReportSection>

      <ReportSection number={4} title="Step-by-step solution">
        <ReportSteps steps={result.steps} />
      </ReportSection>
    </ReportDialog>
  );
}
