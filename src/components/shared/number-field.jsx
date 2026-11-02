"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const STATISTICAL_SYMBOLS = {
  "μ₀": "Hypothesized population mean under H₀",
  x̄: "Sample mean (arithmetic average of sample data)",
  σ: "Population standard deviation (assumed known)",
  n: "Sample size (number of observations)",
  "p₀": "Hypothesized population proportion under H₀",
  x: "Observed count of successes in the sample",
  p̂: "Sample proportion of successes (x / n)",
  "D₀": "Hypothesized difference between population means (μ₁ − μ₂)",
  "x̄₁": "Sample mean of group 1",
  "x̄₂": "Sample mean of group 2",
  "σ₁": "Known population standard deviation of group 1",
  "σ₂": "Known population standard deviation of group 2",
  "n₁": "Sample size of group 1",
  "n₂": "Sample size of group 2",
  "x₁": "Number of successes in group 1",
  "x₂": "Number of successes in group 2",
  "p̂₁": "Sample proportion of group 1 (x₁ / n₁)",
  "p̂₂": "Sample proportion of group 2 (x₂ / n₂)",
  X: "Independent / explanatory variable value",
  Y: "Dependent / response variable value",
};

/**
 * Labelled numeric text input. Uses type="text" + inputMode so the exact text
 * the user typed is kept (no browser rounding or locale reformatting); parsing
 * and validation happen in src/lib/stats.
 *
 * @param {{ label: string, symbol?: string, symbolTooltip?: string, value: string, onChange: (value: string) => void, error?: string | null,
 *   hint?: string, placeholder?: string, integer?: boolean, className?: string, name: string }} props
 */
export function NumberField({
  label,
  symbol,
  symbolTooltip,
  value,
  onChange,
  error,
  hint,
  placeholder,
  integer = false,
  className,
  name,
}) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const tipText = symbolTooltip || (symbol ? STATISTICAL_SYMBOLS[symbol] : undefined);

  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label
        htmlFor={id}
        className="flex items-baseline justify-between gap-2 text-xs font-medium text-foreground"
      >
        <span>{label}</span>
        {symbol ? (
          tipText ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <span
                    tabIndex={0}
                    className="font-mono text-xs text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {symbol}
                  </span>
                }
              />
              <TooltipContent>{tipText}</TooltipContent>
            </Tooltip>
          ) : (
            <span className="font-mono text-xs text-muted-foreground">{symbol}</span>
          )
        ) : null}
      </Label>
      <Input
        id={id}
        name={name}
        type="text"
        inputMode={integer ? "numeric" : "decimal"}
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint ? hintId : null, error ? errorId : null].filter(Boolean).join(" ") || undefined
        }
        className="h-8 rounded-md font-mono text-xs tabular-nums sm:h-9 sm:text-sm"
      />
      {error ? (
        <p id={errorId} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
