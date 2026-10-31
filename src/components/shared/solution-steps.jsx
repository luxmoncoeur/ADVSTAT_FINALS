"use client";

import { Lightbulb } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/components/providers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { formatToken } from "@/lib/format";

/**
 * Worked solution: every step shows the formula, the formula with the user's
 * values substituted, and what the result means.
 *
 * @param {{ steps: { id: string, title: string, formula: string, substitution: (string | { value: number, exact?: boolean })[], explanation: string }[] }} props
 */
export function SolutionSteps({ steps }) {
  const { decimals } = useSettings();
  const allIds = steps.map((step) => step.id);
  const [open, setOpen] = useState(allIds);
  const allOpen = open.length === allIds.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Values are computed at full precision and shown to {decimals} decimal places.
        </p>
        <Button variant="ghost" size="sm" onClick={() => setOpen(allOpen ? [] : allIds)}>
          {allOpen ? "Collapse all" : "Expand all"}
        </Button>
      </div>
      <Accordion
        type="multiple"
        value={open}
        onValueChange={setOpen}
        className="rounded-xl border bg-card"
      >
        {steps.map((step, index) => (
          <AccordionItem key={step.id} value={step.id} className="px-4 last:border-b-0 sm:px-5">
            <AccordionTrigger className="gap-3 py-4 hover:no-underline">
              <span className="flex items-center gap-3 text-left">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-accent font-mono text-xs font-semibold text-accent-foreground">
                  {index + 1}
                </span>
                <span className="font-medium">{step.title}</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-5 pl-0 sm:pl-10">
              <p className="font-mono text-xs text-muted-foreground sm:text-sm">{step.formula}</p>
              <p className="rounded-lg bg-muted/70 px-3 py-2.5 font-mono text-sm leading-relaxed break-words whitespace-pre-wrap text-foreground tabular-nums sm:text-base">
                {step.substitution.map((token, i) => (
                  <span key={i} className={typeof token === "string" ? undefined : "font-semibold"}>
                    {formatToken(token, decimals)}
                  </span>
                ))}
              </p>
              <p className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-chart-3" aria-hidden="true" />
                <span>{step.explanation}</span>
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
