"use client";

import { useMemo } from "react";
import { Area, ComposedChart, ReferenceLine, XAxis, YAxis } from "recharts";
import { useSettings } from "@/components/providers";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { formatNumber, formatPValue } from "@/lib/format";
import { normalCdf, normalPdf } from "@/lib/stats";

const SAMPLES = 320;
const MAX_HALF_WIDTH = 6;

/**
 * @param {number} x
 * @param {import('@/lib/stats/normal').Tail} tail
 * @param {{ lower: number | null, upper: number | null }} critical
 */
function inRejection(x, tail, critical) {
  if (tail === "two")
    return (
      x <= /** @type {number} */ (critical.lower) || x >= /** @type {number} */ (critical.upper)
    );
  if (tail === "right") return x >= /** @type {number} */ (critical.upper);
  return x <= /** @type {number} */ (critical.lower);
}

/**
 * @param {number} x
 * @param {import('@/lib/stats/normal').Tail} tail
 * @param {number} z
 */
function asExtreme(x, tail, z) {
  if (tail === "two") return Math.abs(x) >= Math.abs(z);
  if (tail === "right") return x >= z;
  return x <= z;
}

/**
 * Build the curve: dense samples plus the exact critical values and z so every
 * shaded region starts exactly at its boundary.
 */
export function buildCurve(tail, critical, z, halfWidth) {
  const boundaries = [critical.lower, critical.upper, z, -z].filter(
    (v) => v !== null && Math.abs(v) <= halfWidth,
  );
  const xs = Array.from(
    { length: SAMPLES + 1 },
    (_, i) => -halfWidth + (2 * halfWidth * i) / SAMPLES,
  );
  const all = [...new Set([...xs, ...boundaries])].sort((a, b) => a - b);
  return all.map((x) => {
    const density = normalPdf(x);
    const onBoundary = boundaries.includes(x);
    const reject = inRejection(x, tail, critical);
    return {
      x,
      density,
      reject: reject || onBoundary ? density : null,
      accept: !reject || onBoundary ? density : null,
      pArea:
        asExtreme(x, tail, z) || (onBoundary && Math.abs(Math.abs(x) - Math.abs(z)) < 1e-12)
          ? density
          : null,
    };
  });
}

function CurveTooltip({ active, payload, decimals }) {
  const point = payload?.[0]?.payload;
  if (!active || !point) return null;
  return (
    <div className="grid gap-1 rounded-lg border bg-popover px-3 py-2 font-mono text-xs tabular-nums shadow-xl">
      <p>z = {formatNumber(point.x, 2, { fixed: true })}</p>
      <p className="text-muted-foreground">
        P(Z ≤ z) = {formatNumber(normalCdf(point.x), decimals, { fixed: true })}
      </p>
      <p className="text-muted-foreground">
        P(Z ≥ z) = {formatNumber(normalCdf(-point.x), decimals, { fixed: true })}
      </p>
    </div>
  );
}

/**
 * Standard normal curve with the rejection region(s) for α, the acceptance
 * region, the critical value(s), the observed z and (optionally) the p-value area.
 * @param {{ result: import('@/lib/stats/ztest').ZTestResult, showPValue: boolean }} props
 */
export function NormalCurveChart({ result, showPValue }) {
  const { decimals } = useSettings();
  const { tail, critical, z, alpha } = result;
  const zc = /** @type {number} */ (tail === "left" ? critical.lower : critical.upper);
  const halfWidth = Math.min(
    MAX_HALF_WIDTH,
    Math.max(4, Math.ceil(Math.abs(z) + 0.6), Math.ceil(Math.abs(zc) + 0.6)),
  );
  const offChart = Math.abs(z) > halfWidth;
  const data = useMemo(
    () => buildCurve(tail, critical, z, halfWidth),
    [tail, critical, z, halfWidth],
  );
  const ticks = Array.from({ length: 2 * halfWidth + 1 }, (_, i) => i - halfWidth);
  const markerX = offChart ? Math.sign(z) * halfWidth : z;

  const config = {
    accept: {
      label: `Acceptance region (1 − α = ${formatNumber(1 - alpha, 4)})`,
      color: "var(--accept)",
    },
    reject: { label: `Rejection region (α = ${alpha})`, color: "var(--reject)" },
    pArea: { label: "p-value area", color: "var(--chart-3)" },
  };

  const criticalLabel = (value) => formatNumber(value, Math.min(decimals, 4), { fixed: true });

  return (
    <figure className="space-y-3">
      <ChartContainer
        config={config}
        className="aspect-auto h-[280px] w-full sm:h-[340px]"
        role="img"
        aria-label={`Standard normal curve. ${
          tail === "two"
            ? `Rejection regions below ${criticalLabel(-zc)} and above ${criticalLabel(zc)}`
            : `Rejection region ${tail === "right" ? "above" : "below"} ${criticalLabel(zc)}`
        }. The test statistic z = ${formatNumber(z, decimals)} ${result.reject ? "falls in the rejection region" : "falls in the acceptance region"}.`}
      >
        <ComposedChart data={data} margin={{ top: 28, right: 12, bottom: 4, left: 12 }}>
          <defs>
            <pattern
              id="p-hatch"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="6" height="6" fill="var(--color-pArea)" fillOpacity="0.12" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--color-pArea)" strokeWidth="2.5" />
            </pattern>
          </defs>
          <XAxis
            dataKey="x"
            type="number"
            domain={[-halfWidth, halfWidth]}
            ticks={ticks}
            tickLine={false}
            axisLine={{ stroke: "var(--border)" }}
            tickMargin={8}
            allowDataOverflow
          />
          <YAxis hide domain={[0, 0.43]} />
          <ChartTooltip
            cursor={{ stroke: "var(--muted-foreground)", strokeDasharray: "3 3" }}
            content={<CurveTooltip decimals={decimals} />}
          />
          <Area
            dataKey="accept"
            type="linear"
            stroke="none"
            fill="var(--color-accept)"
            fillOpacity={0.22}
            isAnimationActive
            animationDuration={900}
            connectNulls={false}
          />
          <Area
            dataKey="reject"
            type="linear"
            stroke="none"
            fill="var(--color-reject)"
            fillOpacity={0.4}
            isAnimationActive
            animationDuration={900}
            connectNulls={false}
          />
          {showPValue ? (
            <Area
              dataKey="pArea"
              type="linear"
              stroke="none"
              fill="url(#p-hatch)"
              fillOpacity={1}
              isAnimationActive
              animationDuration={600}
              connectNulls={false}
            />
          ) : null}
          <Area
            dataKey="density"
            type="linear"
            stroke="var(--foreground)"
            strokeWidth={2}
            fill="none"
            isAnimationActive={false}
            activeDot={{ r: 4, fill: "var(--foreground)" }}
          />
          {[critical.lower, critical.upper]
            .filter((value) => value !== null)
            .map((value) => (
              <ReferenceLine
                key={value}
                x={value}
                stroke="var(--reject)"
                strokeDasharray="5 4"
                strokeWidth={1.5}
                label={{
                  value: criticalLabel(value),
                  position: "top",
                  className: "fill-reject font-mono text-[11px] font-semibold",
                }}
              />
            ))}
          <ReferenceLine
            x={markerX}
            stroke="var(--primary)"
            strokeWidth={2.5}
            label={{
              value: `z = ${formatNumber(z, Math.min(decimals, 4), { fixed: true })}${offChart ? (z > 0 ? " →" : " ←") : ""}`,
              position:
                Math.abs(markerX) > halfWidth - 1.2
                  ? markerX > 0
                    ? "insideTopRight"
                    : "insideTopLeft"
                  : "top",
              offset: 14,
              className: "fill-primary font-mono text-xs font-semibold",
            }}
          />
        </ComposedChart>
      </ChartContainer>
      <figcaption className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-reject/40 ring-1 ring-reject" aria-hidden="true" />{" "}
          Rejection region (α = {alpha})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-sm bg-accept/25 ring-1 ring-accept" aria-hidden="true" />{" "}
          Acceptance region
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-0 border-l-2 border-dashed border-reject" aria-hidden="true" />{" "}
          Critical value
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-0.5 bg-primary" aria-hidden="true" /> Observed z
        </span>
        {showPValue ? (
          <span className="flex items-center gap-1.5">
            <span
              className="size-3 rounded-sm bg-[repeating-linear-gradient(45deg,var(--chart-3)_0_2px,transparent_2px_5px)] ring-1 ring-chart-3"
              aria-hidden="true"
            />{" "}
            p-value area = {formatPValue(result.pValue, decimals)}
          </span>
        ) : null}
        {offChart ? (
          <span>z is beyond ±{halfWidth}, so its marker is pinned to the edge.</span>
        ) : null}
      </figcaption>
    </figure>
  );
}
