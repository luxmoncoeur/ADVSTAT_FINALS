"use client";

import { motion, useReducedMotion } from "motion/react";
import { useSettings } from "@/components/providers";
import { formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const SIZE = 170;
const CENTER = SIZE / 2;
const RADIUS = 66;
const STROKE_WIDTH = 14;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Radial gauge of r² (share of the variation in Y explained by X).
 * Uses a single concentric SVG ring pair so the track and value arc share
 * exact geometry without outer-ring bleed or 100% cap pinching.
 *
 * @param {{ rSquared: number, yLabel: string }} props
 */
export function RSquaredGauge({ rSquared, yLabel }) {
  const { decimals } = useSettings();
  const reduce = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, Number.isFinite(rSquared) ? rSquared : 0));
  const percent = formatPercent(clamped, decimals);
  const targetOffset = CIRCUMFERENCE * (1 - clamped);

  return (
    <div
      className="relative mx-auto aspect-square w-full max-w-[170px]"
      role="img"
      aria-label={`r squared: ${percent} of the variation in ${yLabel} is explained.`}
    >
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="size-full -rotate-90" aria-hidden="true">
        {/* Background track ring */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={STROKE_WIDTH}
        />
        {/* Active explained variation arc */}
        {clamped > 0 ? (
          <motion.circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            fill="none"
            stroke="var(--chart-4)"
            strokeWidth={STROKE_WIDTH}
            strokeLinecap={clamped >= 0.9999 ? "butt" : "round"}
            strokeDasharray={CIRCUMFERENCE}
            initial={
              reduce ? { strokeDashoffset: targetOffset } : { strokeDashoffset: CIRCUMFERENCE }
            }
            animate={{ strokeDashoffset: targetOffset }}
            transition={reduce ? { duration: 0 } : { duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        ) : null}
      </svg>
      <div
        className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
        aria-hidden="true"
      >
        <span
          className={cn(
            "font-mono leading-none font-semibold tracking-tight text-foreground tabular-nums",
            percent.length > 8 ? "text-lg" : "text-xl",
          )}
        >
          {percent}
        </span>
        <span className="mt-1.5 text-xs leading-none text-muted-foreground">explained</span>
      </div>
    </div>
  );
}
