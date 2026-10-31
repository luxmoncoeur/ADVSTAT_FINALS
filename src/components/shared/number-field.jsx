"use client";

import { useId } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Labelled numeric text input. Uses type="text" + inputMode so the exact text
 * the user typed is kept (no browser rounding or locale reformatting); parsing
 * and validation happen in src/lib/stats.
 *
 * @param {{ label: string, symbol?: string, value: string, onChange: (value: string) => void, error?: string | null,
 *   hint?: string, placeholder?: string, integer?: boolean, className?: string, name: string }} props
 */
export function NumberField({
  label,
  symbol,
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
  return (
    <div className={cn("grid gap-1.5", className)}>
      <label htmlFor={id} className="flex items-baseline justify-between gap-2 text-sm font-medium">
        <span>{label}</span>
        {symbol ? <span className="font-mono text-xs text-muted-foreground">{symbol}</span> : null}
      </label>
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
        className="h-10 font-mono tabular-nums"
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
