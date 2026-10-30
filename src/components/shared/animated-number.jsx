"use client";

import { useReducedMotion } from "motion/react";
import CountUp from "@/components/reactbits/CountUp";
import { formatNumber, formatPValue, roundHalfUp } from "@/lib/format";

const PLAIN = /^−?[\d,]+(\.\d+)?$/;

/**
 * Animated, correctly rounded number. The final text is always identical to
 * formatNumber / formatPValue; scientific notation and "< 0.0001" render
 * statically because they cannot be counted.
 *
 * @param {{ value: number | null, decimals: number, kind?: 'number' | 'fixed' | 'p', suffix?: string, className?: string, duration?: number }} props
 */
export function AnimatedNumber({
  value,
  decimals,
  kind = "fixed",
  suffix = "",
  className = "",
  duration = 1.1,
}) {
  const reduce = useReducedMotion();
  const text =
    kind === "p"
      ? formatPValue(value ?? Number.NaN, decimals)
      : formatNumber(value, decimals, { fixed: kind === "fixed" });

  if (value === null || reduce || !PLAIN.test(text)) {
    return (
      <span className={`tabular-nums ${className}`}>
        {text}
        {suffix}
      </span>
    );
  }

  const places = text.includes(".") ? text.split(".")[1].length : 0;
  const magnitude = Math.abs(roundHalfUp(value, places));
  return (
    <CountUp
      key={`${text}${suffix}`}
      to={magnitude}
      decimals={places}
      separator=","
      prefix={text.startsWith("−") ? "−" : ""}
      suffix={suffix}
      duration={duration}
      trigger="load"
      className={className}
    />
  );
}
