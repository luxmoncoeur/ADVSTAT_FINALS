"use client";

import { Lightbulb, Printer } from "lucide-react";
import { useSettings } from "@/components/providers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatToken } from "@/lib/format";

/**
 * "Print / PDF" button that opens a paper-style preview of a report. The
 * report always uses the light palette and, when printed, is the only thing
 * on the page (see the print rules in globals.css).
 *
 * @param {{ title: string, subtitle: string, children: import('react').ReactNode }} props
 */
export function ReportDialog({ title, subtitle, children }) {
  const today = new Date().toLocaleDateString(undefined, { dateStyle: "long" });
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Printer className="size-4" aria-hidden="true" /> Print / PDF
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={false}
        className="max-h-[92vh] gap-0 overflow-y-auto p-0 sm:max-w-[880px] print:max-h-none print:overflow-visible"
      >
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border-b bg-popover/95 px-5 py-3 backdrop-blur print:hidden">
          <div className="min-w-0 flex-1">
            <DialogTitle>Printable report</DialogTitle>
            <DialogDescription className="text-xs">
              Print it, or choose “Save as PDF” as the printer.
            </DialogDescription>
          </div>
          <Button size="sm" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden="true" /> Print / Save as PDF
          </Button>
          <DialogClose asChild>
            <Button variant="ghost" size="sm">
              Close
            </Button>
          </DialogClose>
        </div>
        <article
          data-print-report
          className="light-scope space-y-7 bg-card px-6 py-8 text-card-foreground sm:px-10"
        >
          <header className="flex flex-wrap items-end justify-between gap-3 border-b-2 border-foreground pb-3">
            <div>
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                ADVSTAT · Statistics Lab
              </p>
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
            <p className="text-sm text-muted-foreground">{today}</p>
          </header>
          {children}
          <footer className="border-t pt-3 text-xs text-muted-foreground">
            Computed by ADVSTAT in double precision; values shown rounded. Formulas and algorithms
            are listed on the Formulas &amp; Z-Table page.
          </footer>
        </article>
      </DialogContent>
    </Dialog>
  );
}

/** A numbered report section that avoids splitting across printed pages where it can. */
export function ReportSection({ number, title, children }) {
  return (
    <section className="break-inside-avoid-page space-y-3">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <span className="grid size-6 place-items-center rounded-full bg-foreground font-mono text-xs text-background">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** Label / value pairs in a compact grid. */
export function ReportFacts({ items }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-4">
      {items.map(([label, value]) => (
        <div key={label} className="border-l-2 pl-3">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="font-mono text-sm font-semibold tabular-nums">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/** The worked solution, fully expanded, for paper. */
export function ReportSteps({ steps }) {
  const { decimals } = useSettings();
  return (
    <ol className="space-y-4">
      {steps.map((step, index) => (
        <li key={step.id} className="break-inside-avoid space-y-1.5">
          <p className="font-medium">
            {index + 1}. {step.title}
          </p>
          <p className="font-mono text-xs text-muted-foreground">{step.formula}</p>
          <p className="rounded-md bg-muted px-3 py-2 font-mono text-sm break-words whitespace-pre-wrap tabular-nums">
            {step.substitution.map((token, i) => (
              <span key={i} className={typeof token === "string" ? undefined : "font-semibold"}>
                {formatToken(token, decimals)}
              </span>
            ))}
          </p>
          <p className="flex gap-2 text-sm text-muted-foreground">
            <Lightbulb className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>{step.explanation}</span>
          </p>
        </li>
      ))}
    </ol>
  );
}
