"use client";

import { Label, PolarGrid, PolarRadiusAxis, RadialBar, RadialBarChart } from "recharts";
import { useSettings } from "@/components/providers";
import { ChartContainer } from "@/components/ui/chart";
import { formatPercent } from "@/lib/format";

/**
 * Radial gauge of r² (share of the variation in Y explained by X).
 * @param {{ rSquared: number, yLabel: string }} props
 */
export function RSquaredGauge({ rSquared, yLabel }) {
  const { decimals } = useSettings();
  const percent = formatPercent(rSquared, decimals);
  const data = [{ name: "explained", value: rSquared * 100, fill: "var(--color-explained)" }];

  return (
    <ChartContainer
      config={{ explained: { label: "Explained", color: "var(--chart-4)" } }}
      className="mx-auto aspect-square w-full max-w-[170px]"
      role="img"
      aria-label={`r squared: ${percent} of the variation in ${yLabel} is explained.`}
    >
      <RadialBarChart
        data={data}
        startAngle={90}
        endAngle={90 - 360 * rSquared}
        innerRadius="72%"
        outerRadius="100%"
      >
        <PolarGrid
          gridType="circle"
          radialLines={false}
          stroke="none"
          className="first:fill-muted last:fill-card"
          polarRadius={[86, 74]}
        />
        <RadialBar dataKey="value" background cornerRadius={12} animationDuration={1100} />
        <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
          <Label
            content={({ viewBox }) =>
              viewBox && "cx" in viewBox ? (
                <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                  <tspan
                    x={viewBox.cx}
                    y={viewBox.cy}
                    className="fill-foreground font-mono text-2xl font-semibold"
                  >
                    {percent}
                  </tspan>
                  <tspan
                    x={viewBox.cx}
                    y={(viewBox.cy ?? 0) + 22}
                    className="fill-muted-foreground text-xs"
                  >
                    explained
                  </tspan>
                </text>
              ) : null
            }
          />
        </PolarRadiusAxis>
      </RadialBarChart>
    </ChartContainer>
  );
}
