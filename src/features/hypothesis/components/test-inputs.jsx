"use client";

import { NumberField } from "@/components/shared/number-field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatExact } from "@/lib/format";
import { parseNumber } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { TAILS, TESTS, TEST_ORDER } from "../config";

const TAIL_TOOLTIPS = {
  two: "Two-tailed (≠): checks whether the parameter differs in either direction",
  left: "Left-tailed (<): checks whether the parameter is strictly less than the null value",
  right: "Right-tailed (>): checks whether the parameter is strictly greater than the null value",
};

const ALPHA_TOOLTIPS = {
  "0.10": "10% significance level (90% confidence)",
  0.05: "5% significance level (95% confidence, standard)",
  0.01: "1% significance level (99% confidence, stringent)",
  custom: "Specify a custom significance level (0 < α ≤ 0.5)",
};

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
              "flex cursor-pointer items-center gap-2.5 rounded-lg border bg-card px-3 py-2.5 shadow-xs transition-colors hover:border-primary/40 hover:bg-muted/30 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring",
              active && "border-primary bg-primary/5 hover:border-primary hover:bg-primary/5",
            )}
          >
            <span
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground transition-colors",
                active && "bg-primary text-primary-foreground",
              )}
              aria-hidden="true"
            >
              <test.icon className="size-4" />
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block text-xs font-semibold sm:text-sm">{test.title}</span>
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
    <div className="space-y-4">
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
        <p className="rounded-lg border border-border/80 bg-muted/40 p-3 text-xs text-muted-foreground sm:text-sm">
          The pooled two-proportion test always uses H₀: p₁ − p₂ = 0 (the two proportions are
          equal).
        </p>
      )}

      <div className="space-y-1.5">
        <Label id="alt-label" className="text-xs font-medium text-foreground">
          Alternative hypothesis Hₐ
        </Label>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={tail}
          onValueChange={(val) => {
            if (val) onTailChange(val);
          }}
          aria-label="Direction of the alternative hypothesis"
          className="h-8 w-full"
        >
          {TAILS.map((t) => (
            <Tooltip key={t.value}>
              <TooltipTrigger
                render={
                  <ToggleGroupItem value={t.value} className="h-8 flex-1 px-2 font-mono text-xs">
                    <span className="mr-1.5 font-bold">{t.operator}</span>
                    <span className="font-sans">{t.label}</span>
                  </ToggleGroupItem>
                }
              />
              <TooltipContent>{TAIL_TOOLTIPS[t.value]}</TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
      </div>

      <div
        className="grid gap-2 rounded-lg border border-border/80 bg-muted/30 p-3 font-mono text-xs sm:grid-cols-2 sm:text-sm"
        aria-live="polite"
      >
        <Tooltip>
          <TooltipTrigger
            render={
              <p
                tabIndex={0}
                className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="text-muted-foreground">H₀: </span>
                {test.parameter} = {shown}
              </p>
            }
          />
          <TooltipContent>
            Null hypothesis: assumption that no effect or difference exists
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger
            render={
              <p
                tabIndex={0}
                className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="text-muted-foreground">Hₐ: </span>
                {test.parameter} {operator} {shown}
              </p>
            }
          />
          <TooltipContent>
            Alternative hypothesis: research claim to support if H₀ is rejected
          </TooltipContent>
        </Tooltip>
      </div>

      <details className="group rounded-lg border border-border/80 bg-card">
        <summary className="cursor-pointer list-none rounded-lg px-3.5 py-2.5 text-xs font-medium outline-none select-none group-open:rounded-b-none group-open:border-b group-open:border-border/60 focus-visible:ring-2 focus-visible:ring-ring sm:text-sm [&::-webkit-details-marker]:hidden">
          <span
            className="mr-2 inline-block transition-transform group-open:rotate-90"
            aria-hidden="true"
          >
            ›
          </span>
          State the hypotheses in words{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </summary>
        <div className="grid gap-3 p-3.5">
          {[
            ["h0", "Null hypothesis H₀", "e.g. The mean battery life is 40 hours."],
            [
              "ha",
              "Alternative hypothesis Hₐ",
              "e.g. The mean battery life is different from 40 hours.",
            ],
          ].map(([key, label, placeholder]) => (
            <div key={key} className="grid gap-1.5">
              <Label htmlFor={`statement-${key}`} className="text-xs font-medium text-foreground">
                {label}
              </Label>
              <Textarea
                id={`statement-${key}`}
                rows={2}
                maxLength={200}
                value={statements[key]}
                placeholder={placeholder}
                onChange={(event) =>
                  onStatementsChange({ ...statements, [key]: event.target.value })
                }
                className="rounded-md text-xs sm:text-sm"
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
      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        spacing={0}
        value={choice}
        onValueChange={(val) => {
          if (val) onChoiceChange(val);
        }}
        aria-label="Level of significance α"
        className="h-8 w-full font-mono text-xs"
      >
        {[
          { value: "0.10", label: "0.10" },
          { value: "0.05", label: "0.05" },
          { value: "0.01", label: "0.01" },
          { value: "custom", label: "Custom" },
        ].map((item) => (
          <Tooltip key={item.value}>
            <TooltipTrigger
              render={
                <ToggleGroupItem value={item.value} className="h-8 flex-1 px-2 font-mono text-xs">
                  {item.label}
                </ToggleGroupItem>
              }
            />
            <TooltipContent>{ALPHA_TOOLTIPS[item.value]}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
      {choice === "custom" ? (
        <div className="grid gap-1.5">
          <Label htmlFor="custom-alpha" className="text-xs font-medium text-foreground">
            Custom α
          </Label>
          <Input
            id="custom-alpha"
            inputMode="decimal"
            autoComplete="off"
            value={customText}
            placeholder="e.g. 0.025"
            onChange={(event) => onCustomChange(event.target.value)}
            aria-invalid={error ? true : undefined}
            aria-describedby="custom-alpha-msg"
            className="h-8 rounded-md font-mono text-xs sm:h-9 sm:text-sm"
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
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          spacing={0}
          value={mode}
          onValueChange={(val) => {
            if (val) onModeChange(val);
          }}
          aria-label="How to enter the sample result"
          className="h-8 w-full text-xs"
        >
          {[
            { value: "counts", label: "Counts (x and n)" },
            { value: "proportions", label: "Proportions (p̂)" },
          ].map((item) => (
            <ToggleGroupItem
              key={item.value}
              value={item.value}
              className="h-8 flex-1 px-2 text-xs"
            >
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      ) : null}
      <div className={cn("grid gap-4", groups.length > 1 && "md:grid-cols-2")}>
        {groups.map((group) => (
          <fieldset key={group || "sample"} className="grid content-start gap-3">
            {group ? (
              <legend className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
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
