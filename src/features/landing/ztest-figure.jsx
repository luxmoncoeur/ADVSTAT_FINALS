"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { buildCurve } from "@/features/hypothesis/components/normal-curve-chart";
import { formatNumber, formatPValue } from "@/lib/format";
import { oneMeanZTest } from "@/lib/stats";
import { trackSpotlight } from "@/components/shared/spotlight";

const MU0 = 40;
const SIGMA = 5;
const N = 36;

const ALPHAS = ["0.10", "0.05", "0.01"];
const TAILS = [
  { value: "left", label: "Left", aria: "Left-tailed, alternative μ < μ₀" },
  { value: "two", label: "Two", aria: "Two-tailed, alternative μ ≠ μ₀" },
  { value: "right", label: "Right", aria: "Right-tailed, alternative μ > μ₀" },
];

export function ZTestFigure() {
  const sliderId = useId();
  const [mean, setMean] = useState(41.8);
  const [alpha, setAlpha] = useState("0.05");
  const [tail, setTail] = useState("two");

  const result = useMemo(() => {
    const res = oneMeanZTest({
      sampleMean: mean,
      mu0: MU0,
      sigma: SIGMA,
      n: N,
      alpha: Number(alpha),
      tail,
    });
    return res.ok ? res.value : null;
  }, [mean, alpha, tail]);

  const curve = useMemo(
    () => (result ? buildCurve(result.tail, result.critical, result.z, 4) : []),
    [result],
  );
  if (!result) return null;

  const critical =
    tail === "two"
      ? `±${formatNumber(result.critical.upper, 3)}`
      : formatNumber(tail === "left" ? result.critical.lower : result.critical.upper, 3);

  return (
    <div
      className="panel overflow-hidden rounded-2xl border bg-card"
      data-spotlight
      onPointerMove={trackSpotlight}
    >
      <div className="grid gap-5 border-b p-4 sm:p-5 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="grid gap-2">
          <label htmlFor={sliderId} className="flex items-baseline justify-between text-sm">
            <span className="font-medium">Sample mean x̄</span>
            <span className="font-mono text-foreground tabular-nums">{formatNumber(mean, 1, { fixed: true })}</span>
          </label>
          <input
            id={sliderId}
            type="range"
            min={37}
            max={43}
            step={0.1}
            value={mean}
            onChange={(e) => setMean(Number(e.target.value))}
            className="h-8 w-full cursor-pointer accent-primary"
          />
        </div>
        <div className="grid gap-2">
          <span id="alpha-label" className="text-sm font-medium">
            Significance α
          </span>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            spacing={0}
            value={alpha}
            onValueChange={(v) => v && setAlpha(v)}
            aria-labelledby="alpha-label"
            className="w-full"
          >
            {ALPHAS.map((a) => (
              <ToggleGroupItem key={a} value={a} className="h-8 flex-1 font-mono text-[13px]">
                {a}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <div className="grid gap-2">
          <span id="tail-label" className="text-sm font-medium">
            Alternative
          </span>
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            spacing={0}
            value={tail}
            onValueChange={(v) => v && setTail(v)}
            aria-labelledby="tail-label"
            className="w-full"
          >
            {TAILS.map((t) => (
              <ToggleGroupItem
                key={t.value}
                value={t.value}
                aria-label={t.aria}
                className="h-8 flex-1 text-[13px]"
              >
                {t.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <div className="px-2 pt-4 pb-1 sm:px-4">
        <ChartContainer config={{}} className="aspect-auto h-56 w-full sm:h-64" aria-hidden="true">
          <AreaChart data={curve} margin={{ top: 8, right: 16, bottom: 4, left: 16 }} accessibilityLayer={false}>
            <CartesianGrid vertical horizontal={false} strokeDasharray="2 4" stroke="var(--border)" />
            <XAxis
              dataKey="x"
              type="number"
              domain={[-4, 4]}
              ticks={[-3, -2, -1, 0, 1, 2, 3]}
              tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis hide domain={[0, 0.43]} />
            <Area
              dataKey="accept"
              type="monotone"
              stroke="var(--muted-foreground)"
              strokeWidth={1.25}
              fill="var(--accept)"
              fillOpacity={0.16}
              connectNulls={false}
              isAnimationActive={false}
            />
            <Area
              dataKey="reject"
              type="monotone"
              stroke="var(--reject)"
              strokeWidth={2}
              fill="var(--reject)"
              fillOpacity={0.4}
              connectNulls={false}
              isAnimationActive={false}
            />
            <ReferenceLine x={result.z} stroke="var(--primary)" strokeWidth={2.5} />
          </AreaChart>
        </ChartContainer>
      </div>

      <div className="grid gap-4 border-t bg-muted/40 px-4 py-4 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6 sm:px-5">
        <p
          className={`font-heading text-2xl font-semibold tracking-[-0.02em] ${
            result.reject ? "text-reject" : "text-accept"
          }`}
          aria-live="polite"
        >
          {result.reject ? "Reject H₀" : "Fail to reject H₀"}
        </p>
        <p className="font-mono text-sm leading-6 text-muted-foreground tabular-nums">
          z = {formatNumber(result.z, 3)} · critical z* = {critical}
          <br />p = {formatPValue(result.pValue, 4)} {result.pValue <= Number(alpha) ? "≤" : ">"} α ={" "}
          {alpha}
        </p>
        <Button asChild size="sm" variant="outline">
          <Link href="/hypothesis">
            Run your own
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
