"use client";

import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/components/providers";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { NumberField } from "@/components/shared/number-field";
import { formatExact, formatNumber } from "@/lib/format";
import { parseNumber, predict } from "@/lib/stats";

/**
 * Predict Ŷ for any X, with the substitution shown and an extrapolation warning.
 * @param {{ result: import('@/lib/stats/regression').RegressionResult, labels: { x: string, y: string } }} props
 */
export function PredictionCard({ result, labels }) {
  const { decimals } = useSettings();
  const [text, setText] = useState("");
  const x = parseNumber(text);
  const prediction = x === null ? null : predict(result, x);
  const error =
    text.trim() !== "" && x === null ? "Enter a valid number (use a period for decimals)." : null;

  return (
    <div className="space-y-4">
      <NumberField
        name="predict-x"
        label={`Value of ${labels.x}`}
        symbol="X"
        value={text}
        onChange={setText}
        error={error}
        placeholder={`e.g. ${formatExact(result.rows[0].x)}`}
        hint={`Observed range: ${formatExact(result.minX)} to ${formatExact(result.maxX)}`}
      />
      <div className="rounded-xl border bg-muted/50 p-4" aria-live="polite">
        {prediction?.ok ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Predicted {labels.y}</p>
            <p className="font-mono text-3xl font-semibold tracking-tight">
              Ŷ ={" "}
              <AnimatedNumber
                value={prediction.value.predicted}
                decimals={decimals}
                duration={0.6}
              />
            </p>
            <p className="font-mono text-xs break-words text-muted-foreground sm:text-sm">
              Ŷ = {formatNumber(result.intercept, decimals)} + (
              {formatNumber(result.slope, decimals)})({formatExact(prediction.value.x)}) ={" "}
              {formatNumber(prediction.value.predicted, decimals)}
            </p>
            {prediction.value.extrapolated ? (
              <p className="flex gap-2 rounded-lg bg-chart-3/15 p-2.5 text-xs leading-relaxed text-foreground">
                <TriangleAlert className="size-4 shrink-0 text-chart-3" aria-hidden="true" />
                This X is outside the observed range, so the prediction is an extrapolation and may
                be unreliable.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Enter a value of {labels.x} to predict {labels.y} with Ŷ = a + bX.
          </p>
        )}
      </div>
    </div>
  );
}
