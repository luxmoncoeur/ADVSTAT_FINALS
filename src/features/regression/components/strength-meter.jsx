"use client";

import { motion, useReducedMotion } from "motion/react";
import { useSettings } from "@/components/providers";
import { formatNumber } from "@/lib/format";
import { STRENGTH_SCALE } from "@/lib/stats";
import { cn } from "@/lib/utils";

const TICKS = [-1, -0.8, -0.6, -0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1];

/**
 * Correlation scale from −1 to +1 with an animated marker at r, and the
 * interpretation table with the matching band highlighted.
 * @param {{ r: number, strength: string, direction: string }} props
 */
export function StrengthMeter({ r, strength, direction }) {
  const { decimals } = useSettings();
  const reduce = useReducedMotion();
  const position = ((r + 1) / 2) * 100;

  return (
    <div className="space-y-4">
      <div
        role="img"
        aria-label={`Correlation coefficient r = ${formatNumber(r, decimals)} on a scale from −1 to +1: ${strength.toLowerCase()} ${direction === "none" ? "" : direction} relationship.`}
        className="pt-9"
      >
        <div className="relative">
          <div className="h-3 rounded-full bg-[linear-gradient(90deg,var(--chart-5),color-mix(in_oklch,var(--chart-5)_25%,var(--muted))_40%,var(--muted)_50%,color-mix(in_oklch,var(--chart-1)_25%,var(--muted))_60%,var(--chart-1))]" />
          {TICKS.map((tick) => (
            <span
              key={tick}
              className="absolute top-0 h-3 w-px bg-background/80"
              style={{ left: `${((tick + 1) / 2) * 100}%` }}
              aria-hidden="true"
            />
          ))}
          <motion.div
            className="absolute -top-9 w-0"
            initial={reduce ? false : { left: "50%", opacity: 0 }}
            animate={{ left: `${position}%`, opacity: 1 }}
            transition={{ type: "spring", stiffness: 90, damping: 16, mass: 0.8 }}
            aria-hidden="true"
          >
            {/* The label slides from left-aligned (r = −1) to right-aligned (r = +1) so it never leaves the card. */}
            <span
              className="absolute top-0 left-0 rounded-md bg-foreground px-2 py-0.5 font-mono text-xs font-semibold whitespace-nowrap text-background tabular-nums shadow-lg"
              style={{ transform: `translateX(-${position}%)` }}
            >
              r = {formatNumber(r, decimals, { fixed: true })}
            </span>
            <span className="absolute top-6 left-0 h-4 w-0.5 -translate-x-1/2 bg-foreground" />
            <span className="absolute top-[2.4rem] left-0 size-3 -translate-x-1/2 rounded-full border-2 border-background bg-foreground" />
          </motion.div>
        </div>
        <div
          className="mt-2 flex justify-between text-[11px] text-muted-foreground"
          aria-hidden="true"
        >
          <span>
            <span className="font-mono">−1</span> Negative
          </span>
          <span>
            <span className="font-mono">0</span> None
          </span>
          <span>
            Positive <span className="font-mono">+1</span>
          </span>
        </div>
      </div>

      <table className="w-full text-xs">
        <caption className="sr-only">Interpretation scale for the correlation coefficient</caption>
        <thead>
          <tr className="text-left text-xs text-muted-foreground">
            <th scope="col" className="pb-2 font-medium">
              |r|
            </th>
            <th scope="col" className="pb-2 font-medium">
              Strength
            </th>
          </tr>
        </thead>
        <tbody>
          {STRENGTH_SCALE.map((band) => {
            const active = band.label === strength;
            return (
              <tr
                key={band.label}
                className={cn(
                  "border-t transition-colors",
                  active && "bg-accent text-accent-foreground",
                )}
                aria-current={active ? "true" : undefined}
              >
                <td className="py-1 pr-2 pl-2 font-mono text-[11px] whitespace-nowrap tabular-nums">
                  {band.range}
                </td>
                <td className="py-1 pr-2 font-medium">
                  {band.label}
                  {active ? <span className="sr-only"> (this result)</span> : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
