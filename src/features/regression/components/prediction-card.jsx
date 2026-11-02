"use client";

import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/components/providers";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { NumberField } from "@/components/shared/number-field";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
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
        label={`Value of ${labels.x || "X"}`}
        symbol="X"
        value={text}
        onChange={setText}
        error={error}
        placeholder={result.rows[0] ? `e.g. ${formatExact(result.rows[0].x)}` : "e.g. 10"}
        hint={`Observed range: ${formatExact(result.minX)} to ${formatExact(result.maxX)}`}
      />
      <div className="rounded-lg border border-border/80 bg-muted/30 p-4" aria-live="polite">
        {prediction?.ok ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Predicted {labels.y || "Y"}</p>
            <p className="font-mono text-2xl font-semibold tracking-tight sm:text-3xl">
              <Tooltip>
                <TooltipTrigger
                  render={
                    <span
                      tabIndex={0}
                      className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                    >
                      Ŷ
                    </span>
                  }
                />
                <TooltipContent>
                  Ŷ (Y-hat): predicted value from the regression model Ŷ = a + bX
                </TooltipContent>
              </Tooltip>{" "}
              ={" "}
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
              <p className="flex gap-2 rounded-md border border-chart-3/30 bg-chart-3/10 p-2.5 text-xs leading-relaxed text-foreground">
                <TriangleAlert className="size-4 shrink-0 text-chart-3" aria-hidden="true" />
                This X is outside the observed range, so the prediction is an extrapolation and may
                be unreliable.
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground sm:text-sm">
            Enter a value of {labels.x || "X"} to predict {labels.y || "Y"} with Ŷ = a + bX.
          </p>
        )}
      </div>
    </div>
  );
}
