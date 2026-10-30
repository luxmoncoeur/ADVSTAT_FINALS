"use client";

import { useMemo } from "react";
import { CartesianGrid, ComposedChart, Line, ReferenceLine, Scatter, XAxis, YAxis } from "recharts";
import { useSettings } from "@/components/providers";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { downsample, formatTick, niceScale } from "@/lib/chart-utils";
import { formatExact, formatNumber } from "@/lib/format";

const MAX_DRAWN_POINTS = 2000;
const MAX_RESIDUAL_LINES = 80;

function PointTooltip({ active, payload, labels, decimals }) {
  const point = payload?.find((item) => item.payload?.index !== undefined)?.payload;
  if (!active || !point) return null;
  return (
    <div className="grid min-w-44 gap-1.5 rounded-lg border bg-popover px-3 py-2 text-xs shadow-xl">
      <p className="font-medium">Point #{point.index + 1}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 font-mono tabular-nums">
        <dt className="text-muted-foreground">{labels.x}</dt>
        <dd className="text-right">{formatExact(point.x)}</dd>
        <dt className="text-muted-foreground">{labels.y}</dt>
        <dd className="text-right">{formatExact(point.y)}</dd>
        <dt className="text-muted-foreground">Ŷ</dt>
        <dd className="text-right">{formatNumber(point.predicted, decimals)}</dd>
        <dt className="text-muted-foreground">Y − Ŷ</dt>
        <dd className="text-right">{formatNumber(point.residual, decimals)}</dd>
      </dl>
    </div>
  );
}

/**
 * Scatter diagram with the least-squares regression line.
 * @param {{ result: import('@/lib/stats/regression').RegressionResult, labels: { x: string, y: string }, showResiduals: boolean }} props
 */
export function RegressionScatterChart({ result, labels, showResiduals }) {
  const { decimals } = useSettings();
  const { points, line, xScale, yScale } = useMemo(() => {
    const all = result.rows.map((row, index) => ({
      index,
      x: row.x,
      y: row.y,
      predicted: row.predicted,
      residual: row.residual,
    }));
    const x = niceScale(all.map((p) => p.x));
    const lineValue = x.domain.map((value) => ({
      x: value,
      y: result.intercept + result.slope * value,
    }));
    return {
      points: downsample(all, MAX_DRAWN_POINTS),
      line: lineValue,
      xScale: x,
      yScale: niceScale([...all.map((p) => p.y), ...result.rows.map((row) => row.predicted)]),
    };
  }, [result]);

  const config = {
    points: { label: labels.y, color: "var(--chart-1)" },
    line: { label: "Regression line", color: "var(--chart-3)" },
  };

  return (
    <figure className="space-y-2">
      <ChartContainer
        config={config}
        className="aspect-auto h-[300px] w-full sm:h-[360px]"
        role="img"
        aria-label={`Scatter diagram of ${result.n} points of ${labels.y} against ${labels.x}, with the regression line Ŷ = ${formatNumber(result.intercept, decimals)} + ${formatNumber(result.slope, decimals)}X.`}
      >
        <ComposedChart margin={{ top: 12, right: 16, bottom: 28, left: 4 }} accessibilityLayer>
          <CartesianGrid strokeDasharray="4 4" />
          <XAxis
            type="number"
            dataKey="x"
            domain={xScale.domain}
            ticks={xScale.ticks}
            tickFormatter={formatTick}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            allowDataOverflow
            label={{
              value: labels.x,
              position: "insideBottom",
              offset: -18,
              className: "fill-muted-foreground text-xs",
            }}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={yScale.domain}
            ticks={yScale.ticks}
            tickFormatter={formatTick}
            tickLine={false}
            axisLine={false}
            width={56}
            allowDataOverflow
            label={{
              value: labels.y,
              angle: -90,
              position: "insideLeft",
              offset: 12,
              className: "fill-muted-foreground text-xs",
            }}
          />
          <ChartTooltip
            cursor={{ strokeDasharray: "3 3" }}
            content={<PointTooltip labels={labels} decimals={decimals} />}
          />
          {showResiduals
            ? points.slice(0, MAX_RESIDUAL_LINES).map((p) => (
                <ReferenceLine
                  key={p.index}
                  segment={[
                    { x: p.x, y: p.y },
                    { x: p.x, y: p.predicted },
                  ]}
                  stroke="var(--chart-5)"
                  strokeDasharray="3 3"
                  strokeWidth={1.5}
                  ifOverflow="extendDomain"
                />
              ))
            : null}
          <Line
            data={line}
            dataKey="y"
            type="linear"
            stroke="var(--color-line)"
            strokeWidth={2.5}
            dot={false}
            activeDot={false}
            isAnimationActive
            animationDuration={900}
          />
          <Scatter
            data={points}
            dataKey="y"
            fill="var(--color-points)"
            stroke="var(--card)"
            strokeWidth={1.5}
            isAnimationActive
            animationDuration={700}
          />
        </ComposedChart>
      </ChartContainer>
      <figcaption className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-full bg-chart-1" aria-hidden="true" /> Observed (
          {labels.x}, {labels.y})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-4 rounded bg-chart-3" aria-hidden="true" /> Regression line Ŷ = a
          + bX
        </span>
        {showResiduals ? (
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-0 border-l-2 border-dashed border-chart-5" aria-hidden="true" />{" "}
            Residual (Y − Ŷ)
          </span>
        ) : null}
        {result.n > MAX_DRAWN_POINTS ? (
          <span>
            Showing {MAX_DRAWN_POINTS.toLocaleString("en-US")} of {result.n.toLocaleString("en-US")}{" "}
            points; all are used in the calculation.
          </span>
        ) : null}
      </figcaption>
    </figure>
  );
}
