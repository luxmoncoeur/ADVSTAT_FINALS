"use client";

import { Info } from "lucide-react";
import { useSettings } from "@/components/providers";
import { formatNumber, formatPercent } from "@/lib/format";

/**
 * Plain-language reading of the results, using the variable names.
 * @param {{ result: import('@/lib/stats/regression').RegressionResult, labels: { x: string, y: string } }} props
 */
export function Interpretation({ result, labels }) {
  const { decimals } = useSettings();
  const n = (value) => formatNumber(value, decimals);
  const { r, rSquared, strength, direction, slope, intercept } = result;
  const zeroInRange = result.minX <= 0 && result.maxX >= 0;

  /** @type {import('react').ReactNode[]} */
  const points = [];
  if (r === null || rSquared === null) {
    points.push(
      <>
        Every {labels.y} value is the same, so {labels.y} does not vary with {labels.x}. The line is
        flat (b = 0) and r cannot be computed.
      </>,
    );
  } else {
    points.push(
      strength === "None" ? (
        <>
          There is <strong>no linear relationship</strong> between {labels.x} and {labels.y} (r ={" "}
          {n(r)}).
        </>
      ) : (
        <>
          There is a{" "}
          <strong>
            {strength?.toLowerCase()} {direction}
          </strong>{" "}
          linear relationship between {labels.x} and {labels.y} (r = {n(r)}).
        </>
      ),
      <>
        r² = {n(rSquared)}: about <strong>{formatPercent(rSquared, decimals)}</strong> of the
        variation in {labels.y} is explained by its linear relationship with {labels.x}.
      </>,
    );
  }
  points.push(
    slope === 0 ? (
      <>
        The slope is 0, so the predicted {labels.y} does not change as {labels.x} changes.
      </>
    ) : (
      <>
        Slope b = {n(slope)}: for each 1-unit increase in {labels.x}, the predicted {labels.y}{" "}
        {slope > 0 ? "increases" : "decreases"} by {n(Math.abs(slope))}.
      </>
    ),
    <>
      Intercept a = {n(intercept)}: when {labels.x} = 0, the predicted {labels.y} is {n(intercept)}
      {zeroInRange
        ? "."
        : " (X = 0 is outside the observed data, so treat this as a mathematical anchor rather than a real prediction)."}
    </>,
  );

  return (
    <div className="space-y-3">
      <ul className="space-y-2.5 text-sm leading-relaxed">
        {points.map((point, i) => (
          <li key={i} className="flex gap-2.5">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
      <p className="flex gap-2 rounded-lg border border-dashed p-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="size-4 shrink-0" aria-hidden="true" />
        Correlation measures association, not cause and effect. A strong r does not prove that{" "}
        {labels.x} causes changes in {labels.y}.
      </p>
    </div>
  );
}
