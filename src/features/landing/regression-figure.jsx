"use client";

import { useReducedMotion } from "motion/react";
import { useMemo } from "react";
import { CartesianGrid, ComposedChart, Line, Scatter, XAxis, YAxis } from "recharts";
import { ChartContainer } from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { REGRESSION_EXAMPLES } from "@/features/regression/examples";
import { formatNumber } from "@/lib/format";
import { linearRegression } from "@/lib/stats";
import { trackSpotlight } from "@/components/shared/spotlight";

/** Short labels for the datasets offered in the hero figure. */
export const HERO_DATASETS = [
  { id: "study-hours", label: "Study hours" },
  { id: "absences", label: "Absences" },
  { id: "advertising", label: "Ad spend" },
  { id: "car-age", label: "Car age" },
];

const byId = Object.fromEntries(REGRESSION_EXAMPLES.map((d) => [d.id, d]));

/** Fit a dataset by id with the same engine the workspace uses. */
export function useFit(datasetId) {
  return useMemo(() => {
    const dataset = byId[datasetId];
    const res = linearRegression(dataset.x, dataset.y);
    return { dataset, fit: res.ok ? res.value : null };
  }, [datasetId]);
}

const signed = (value, decimals) =>
  `${value < 0 ? "−" : "+"} ${formatNumber(Math.abs(value), decimals)}`;

export function RegressionFigure({ datasetId, onDatasetChange }) {
  const reduceMotion = useReducedMotion();
  const { dataset, fit } = useFit(datasetId);
  if (!fit) return null;

  const points = fit.rows.map((r) => ({ x: r.x, y: r.y }));
  const line = [fit.minX, fit.maxX].map((x) => ({ x, y: fit.intercept + fit.slope * x }));

  return (
    <figure
      className="panel overflow-hidden rounded-2xl border bg-card"
      data-spotlight
      onPointerMove={trackSpotlight}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-5">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={datasetId}
          onValueChange={(v) => v && onDatasetChange(v)}
          aria-label="Choose a sample dataset"
          className="w-full sm:w-auto"
        >
          {HERO_DATASETS.map((d) => (
            <ToggleGroupItem key={d.id} value={d.id} className="h-8 flex-auto px-2 text-[13px] sm:flex-none sm:px-3">
              {d.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <span className="hidden font-mono text-xs text-muted-foreground tabular-nums sm:inline">n = {fit.n}</span>
      </div>

      <div className="px-2 pt-4 pb-1 sm:px-4">
        <ChartContainer config={{}} className="aspect-auto h-64 w-full sm:h-80" aria-hidden="true">
          <ComposedChart margin={{ top: 8, right: 16, bottom: 4, left: 0 }} accessibilityLayer={false}>
            <CartesianGrid strokeDasharray="2 4" stroke="var(--border)" />
            <XAxis
              type="number"
              dataKey="x"
              domain={["dataMin - 1", "dataMax + 1"]}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <YAxis
              type="number"
              dataKey="y"
              domain={["dataMin - 5", "dataMax + 5"]}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={40}
              allowDecimals={false}
            />
            <Line
              key={datasetId}
              data={line}
              dataKey="y"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={false}
              isAnimationActive={!reduceMotion}
              animationDuration={650}
              animationEasing="ease-out"
              style={{ pointerEvents: "none" }}
            />
            <Scatter data={points} fill="var(--foreground)" isAnimationActive={false} />
          </ComposedChart>
        </ChartContainer>
      </div>

      <figcaption className="grid gap-3 border-t bg-muted/40 px-4 py-4 sm:px-5">
        <p
          className="flex flex-wrap items-baseline gap-x-5 gap-y-1 font-mono text-[15px] text-foreground tabular-nums"
          aria-live="polite"
        >
          <span>
            Ŷ = {formatNumber(fit.intercept, 2)} {signed(fit.slope, 2)}X
          </span>
          <span className="text-muted-foreground">r = {formatNumber(fit.r, 3)}</span>
          <span className="text-muted-foreground">R² = {formatNumber(fit.rSquared, 3)}</span>
          {/* On phones the header has no room for n, so it joins the stats line. */}
          <span className="text-muted-foreground sm:hidden">n = {fit.n}</span>
        </p>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{dataset.xLabel}</span> against{" "}
          <span className="font-medium text-foreground">{dataset.yLabel}</span>. Sample values for
          practice.
        </p>
      </figcaption>
    </figure>
  );
}
