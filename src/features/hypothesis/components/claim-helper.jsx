"use client";

import { Lightbulb, Wand2 } from "lucide-react";
import { useId, useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatExact } from "@/lib/format";
import { parseNumber } from "@/lib/stats";
import { cn } from "@/lib/utils";
import {
  RELATIONS,
  RELATION_ORDER,
  detectClaims,
  hypothesesFromClaim,
  nullValueFrom,
} from "../claim";

/** Highlights the detected phrases inside the claim text. */
function MarkedText({ text, matches }) {
  const parts = [];
  let cursor = 0;
  for (const match of matches) {
    if (match.start > cursor) parts.push(text.slice(cursor, match.start));
    parts.push(
      <mark key={match.start} className="rounded bg-primary/15 px-0.5 font-medium text-foreground">
        {text.slice(match.start, match.end)}
      </mark>,
    );
    cursor = match.end;
  }
  parts.push(text.slice(cursor));
  return <p className="text-sm leading-relaxed text-muted-foreground">{parts}</p>;
}

/**
 * Claim → H₀ / Hₐ helper. Reads the comparison in a claim, explains where the
 * claim goes and why, and applies the result to the form.
 */
export function ClaimHelper({ test, values, onApply }) {
  const id = useId();
  const [text, setText] = useState("");
  const [picked, setPicked] = useState(/** @type {import('../claim').Relation | ""} */ (""));
  const matches = useMemo(() => detectClaims(text), [text]);

  // Follow the first phrase found until the user picks a relation themselves.
  const [pickedFor, setPickedFor] = useState("");
  const relation = pickedFor === text && picked ? picked : (matches[0]?.relation ?? picked);
  const activeMatch = matches.find((match) => match.relation === relation) ?? null;

  const detectedValue = nullValueFrom(test, activeMatch?.number ?? null);
  const typed = test.nullField ? parseNumber(values[test.nullField.name] ?? "") : 0;
  const shownValue =
    detectedValue !== null
      ? formatExact(detectedValue)
      : typed !== null
        ? formatExact(typed)
        : (test.nullField?.symbol ?? "0");

  const plan = relation
    ? hypothesesFromClaim(relation, { parameter: test.parameter, value: shownValue })
    : null;

  const choose = (next) => {
    setPicked(next);
    setPickedFor(text);
  };

  const apply = () => {
    if (!plan || !relation) return;
    onApply({
      tail: plan.tail,
      side: plan.claimIn,
      nullValue: detectedValue,
      sentence: text.trim() || null,
    });
    toast.success("Hypotheses set from the claim", {
      description: `H₀: ${plan.h0} · Hₐ: ${plan.ha} (${plan.tail === "two" ? "two" : plan.tail}-tailed)`,
    });
  };

  return (
    <div className="space-y-4 px-4 pb-4">
      <div className="grid gap-1.5">
        <label htmlFor={`${id}-claim`} className="text-sm font-medium">
          The claim or word problem
        </label>
        <Textarea
          id={`${id}-claim`}
          rows={2}
          maxLength={400}
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="e.g. A company claims its batteries last at least 500 hours."
        />
        {text.trim() ? (
          matches.length > 0 ? (
            <MarkedText text={text} matches={matches} />
          ) : (
            <p className="text-xs text-muted-foreground">
              No comparison phrase found. Pick what the claim says below.
            </p>
          )
        ) : null}
      </div>

      <div className="space-y-2">
        <p id={`${id}-rel`} className="text-sm font-medium">
          The claim says the {test.parameter === "μ" ? "mean" : "parameter"}…
        </p>
        <ToggleGroup
          type="single"
          value={relation}
          onValueChange={(next) => next && choose(next)}
          aria-labelledby={`${id}-rel`}
          className="grid w-full grid-cols-2 gap-1.5 sm:grid-cols-3"
        >
          {RELATION_ORDER.map((key) => (
            <ToggleGroupItem
              key={key}
              value={key}
              variant="outline"
              className="h-auto justify-start gap-2 px-2.5 py-1.5 text-left data-[state=on]:border-primary data-[state=on]:bg-accent data-[state=on]:text-accent-foreground"
            >
              <span className="font-mono text-base font-semibold" aria-hidden="true">
                {RELATIONS[key].symbol}
              </span>
              <span className="text-xs">{RELATIONS[key].words}</span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {plan ? (
        <div className="space-y-3 rounded-xl border bg-muted/40 p-3.5" aria-live="polite">
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["h0", "H₀", plan.h0],
              ["ha", "Hₐ", plan.ha],
            ].map(([side, label, formula]) => (
              <div
                key={side}
                className={cn(
                  "flex items-center gap-2 rounded-lg border bg-card px-3 py-2 font-mono text-sm",
                  plan.claimIn === side && "border-primary",
                )}
              >
                <span className="text-muted-foreground">{label}:</span>
                <span className="font-semibold">{formula}</span>
                {plan.claimIn === side ? (
                  <Badge className="ml-auto font-sans text-[11px]">claim</Badge>
                ) : null}
              </div>
            ))}
          </div>
          <ol className="space-y-1.5 text-sm leading-relaxed">
            {plan.reasons.map((reason, index) => (
              <li key={reason} className="flex gap-2">
                {index === 3 ? (
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-chart-3" aria-hidden="true" />
                ) : (
                  <span
                    className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-background font-mono text-[10px] font-semibold"
                    aria-hidden="true"
                  >
                    {index + 1}
                  </span>
                )}
                <span className={index === 3 ? "text-muted-foreground" : undefined}>{reason}</span>
              </li>
            ))}
          </ol>
          <Button size="sm" onClick={apply} className="w-full sm:w-auto">
            <Wand2 className="size-4" aria-hidden="true" /> Use these hypotheses
          </Button>
        </div>
      ) : null}
    </div>
  );
}
