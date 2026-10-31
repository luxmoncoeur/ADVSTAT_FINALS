"use client";

import RubberSegment from "@/components/reactbits/RubberSegment";
import { NumberField } from "@/components/shared/number-field";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { formatExact } from "@/lib/format";
import { parseNumber } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { TAILS, TESTS, TEST_ORDER } from "../config";








/** Compact selector for the four z-tests (radio group): one row on desktop, 2 × 2 on phones. */
export function TestPicker({ value, onChange }) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      className="grid grid-cols-2 gap-2 lg:grid-cols-4"
      aria-label="Type of z-test"
    >
      {TEST_ORDER.map((id) => {
        const test = TESTS[id];
        const active = id === value;
        return (
          <label
            key={id}
            htmlFor={`test-${id}`}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-xl border bg-card px-3 py-2.5 transition-colors hover:border-primary/50 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
              active && "border-primary bg-accent/60",
            )}
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground transition-colors",
                active && "bg-primary text-primary-foreground",
              )}
              aria-hidden="true"
            >
              <test.icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-sm font-medium">{test.title}</span>
              <span className="block truncate font-mono text-[11px] text-muted-foreground">
                {test.subtitle}
              </span>
            </span>
            <RadioGroupItem id={`test-${id}`} value={id} />
          </label>
        );
      })}
    </RadioGroup>
  );
}

/** H₀ / Hₐ builder: null value input + Hₐ operator, with optional statements in words. */
export function HypothesesPanel({
  test,
  tail,
  onTailChange,
  values,
  onValueChange,
  statements,
  onStatementsChange,
  errors,
}) {
  const nullText = test.nullField ? (values[test.nullField.name] ?? "") : "0";
  const parsed = parseNumber(nullText);
  const shown = parsed === null ? (test.nullField?.symbol ?? "0") : formatExact(parsed);
  const operator = TAILS.find((t) => t.value === tail)?.operator ?? "≠";

  return (
    <div className="space-y-5">
      {test.nullField ? (
        <NumberField
          name={test.nullField.name}
          label={test.nullField.label}
          symbol={test.nullField.symbol}
          value={nullText}
          onChange={(value) => onValueChange(test.nullField.name, value)}
          error={errors[test.nullField.name]}
          hint={test.nullField.hint}
        />
      ) : (
        <p className="rounded-lg bg-muted/60 p-3 text-sm text-muted-foreground">
          The pooled two-proportion test always uses H₀: p₁ − p₂ = 0 (the two proportions are
          equal).
        </p>
      )}

      <div className="space-y-2">
        <p id="alt-label" className="text-sm font-medium">
          Alternative hypothesis Hₐ
        </p>
        <RubberSegment
          aria-label="Direction of the alternative hypothesis"
          items={TAILS.map((t) => ({ value: t.value, label: `${t.operator}  ${t.label}` }))}
          value={tail}
          onChange={onTailChange}
          size="md"
          className="w-full"

        />
      </div>

      <div
        className="grid gap-2 rounded-xl border bg-muted/40 p-4 font-mono text-sm sm:grid-cols-2"
        aria-live="polite"
      >
        <p>
          <span className="text-muted-foreground">H₀: </span>
          {test.parameter} = {shown}
        </p>
        <p>
          <span className="text-muted-foreground">Hₐ: </span>
          {test.parameter} {operator} {shown}
        </p>
      </div>

      <details className="group rounded-lg border">
        <summary className="cursor-pointer list-none rounded-lg px-4 py-3 text-sm font-medium outline-none select-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
          <span
            className="mr-2 inline-block transition-transform group-open:rotate-90"
            aria-hidden="true"
          >
            ›
          </span>
          State the hypotheses in words{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </summary>
        <div className="grid gap-3 px-4 pb-4">
          {[
            ["h0", "Null hypothesis H₀", "e.g. The mean battery life is 500 hours."],
            [
              "ha",
              "Alternative hypothesis Hₐ",
              "e.g. The mean battery life is different from 500 hours.",
            ],
          ].map(([key, label, placeholder]) => (
            <div key={key} className="grid gap-1.5">
              <label htmlFor={`statement-${key}`} className="text-sm">
                {label}
              </label>
              <Textarea
                id={`statement-${key}`}
                rows={2}
                maxLength={200}
                value={statements[key]}
                placeholder={placeholder}
                onChange={(event) =>
                  onStatementsChange({ ...statements, [key]: event.target.value })
                }
              />
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}

/** Level of significance: presets plus a custom value. */
export function AlphaPanel({ choice, onChoiceChange, customText, onCustomChange, error }) {
  return (
    <div className="space-y-3">
      <RubberSegment
        aria-label="Level of significance α"
        items={[
          { value: "0.10", label: "0.10" },
          { value: "0.05", label: "0.05" },
          { value: "0.01", label: "0.01" },
          { value: "custom", label: "Custom" },
        ]}
        value={choice}
        onChange={onChoiceChange}
        className="w-full font-mono"

      />
      {choice === "custom" ? (
        <div className="grid gap-1.5">
          <label htmlFor="custom-alpha" className="text-sm font-medium">
            Custom α
          </label>
          <Input
            id="custom-alpha"
            inputMode="decimal"
            autoComplete="off"
            value={customText}
            placeholder="e.g. 0.025"
            onChange={(event) => onCustomChange(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby="custom-alpha-msg"
            className="h-10 font-mono"
          />
          <p
            id="custom-alpha-msg"
            className={cn(
              "text-xs",
              error ? "font-medium text-destructive" : "text-muted-foreground",
            )}
          >
            {error ?? "Any value greater than 0 and at most 0.5."}
          </p>
        </div>
      ) : null}
      <p className="text-xs leading-relaxed text-muted-foreground">
        α is the probability of rejecting H₀ when it is actually true (a Type I error). 0.05 is the
        most common choice.
      </p>
    </div>
  );
}

/** Sample statistics inputs, grouped by sample for two-sample tests. */
export function SampleInputs({ test, mode, onModeChange, fields, values, onValueChange, errors }) {
  const groups = [...new Set(fields.map((field) => field.group ?? ""))];
  return (
    <div className="space-y-4">
      {test.modes ? (
        <RubberSegment
          aria-label="How to enter the sample result"
          items={[
            { value: "counts", label: "Counts (x and n)" },
            { value: "proportions", label: "Proportions (p̂)" },
          ]}
          value={mode}
          onChange={onModeChange}
          size="sm"
          className="w-full"

        />
      ) : null}
      <div className={cn("grid gap-5", groups.length > 1 && "md:grid-cols-2")}>
        {groups.map((group) => (
          <fieldset key={group || "sample"} className="grid content-start gap-4">
            {group ? (
              <legend className="mb-3 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                {group}
              </legend>
            ) : null}
            {fields
              .filter((field) => (field.group ?? "") === group)
              .map((field) => (
                <NumberField
                  key={field.name}
                  name={field.name}
                  label={field.label}
                  symbol={field.symbol}
                  integer={field.integer}
                  hint={field.hint}
                  value={values[field.name] ?? ""}
                  onChange={(value) => onValueChange(field.name, value)}
                  error={errors[field.name]}
                />
              ))}
          </fieldset>
        ))}
      </div>
    </div>
  );
}
