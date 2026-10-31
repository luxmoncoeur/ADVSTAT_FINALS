"use client";

import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  ReferenceLine,
  XAxis,
  YAxis,
} from "recharts";
import { useSettings } from "@/components/providers";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { downsample, formatTick } from "@/lib/chart-utils";
import { formatNumber } from "@/lib/format";

/**
 * Residual (Y − Ŷ) per observation. The largest residual is highlighted, as in
 * the "highlighted bar" dashboard pattern.
 * @param {{ result: import('@/lib/stats/regression').RegressionResult }} props
 */
export function ResidualChart({ result }) {
  const { decimals } = useSettings();
  const { data, largest } = useMemo(() => {
    const rows = result.rows.map((row, index) => ({
      label: `#${index + 1}`,
      index,
      residual: row.residual,
    }));
    const top = rows.reduce(
      (best, row) => (Math.abs(row.residual) > Math.abs(best.residual) ? row : best),
      rows[0],
    );
    return { data: downsample(rows, 60), largest: top };
  }, [result]);

  const config = { residual: { label: "Residual (Y − Ŷ)", color: "var(--chart-1)" } };

  return (
    <figure className="space-y-2">
      <ChartContainer
        config={config}
        className="aspect-auto h-[220px] w-full"
        role="img"
        aria-label={`Residual bar chart. The largest residual is point ${largest.index + 1} with Y − Ŷ = ${formatNumber(largest.residual, decimals)}.`}
      >
        <BarChart data={data} margin={{ top: 22, right: 8, bottom: 0, left: 0 }} accessibilityLayer>
          <CartesianGrid vertical={false} strokeDasharray="4 4" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            interval="preserveStartEnd"
            minTickGap={8}
          />
          <YAxis tickFormatter={formatTick} tickLine={false} axisLine={false} width={48} />
          <ReferenceLine y={0} stroke="var(--border)" strokeWidth={1.5} />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.6 }}
            content={
              <ChartTooltipContent
                formatter={(value) => (
                  <span className="font-mono tabular-nums">
                    {formatNumber(Number(value), decimals)}
                  </span>
                )}
              />
            }
          />
          <Bar dataKey="residual" radius={4} maxBarSize={36} animationDuration={800}>
            {data.map((entry) => (
              <Cell
                key={entry.index}
                fill={entry.residual >= 0 ? "var(--chart-1)" : "var(--chart-5)"}
                fillOpacity={entry.index === largest.index ? 1 : 0.7}
                stroke={entry.index === largest.index ? "var(--foreground)" : "none"}
                strokeWidth={entry.index === largest.index ? 1.5 : 0}
              />
            ))}
            {data.length <= 16 ? (
              <LabelList
                dataKey="residual"
                position="top"
                className="fill-muted-foreground font-mono text-[10px]"
                formatter={(value) =>
                  Number(value) === largest.residual
                    ? formatNumber(Number(value), Math.min(decimals, 2))
                    : ""
                }
              />
            ) : null}
          </Bar>
        </BarChart>
      </ChartContainer>
      <figcaption className="text-xs text-muted-foreground">
        Bars above zero: the actual Y is higher than predicted. Highlighted: largest residual (point
        #{largest.index + 1}).
      </figcaption>
    </figure>
  );
}
