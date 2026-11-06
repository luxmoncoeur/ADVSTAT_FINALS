"use client";

import { ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { ThemeToggle } from "@/components/layout/site-header";
import { BrandMark } from "@/components/layout/brand-mark";
import { Button } from "@/components/ui/button";
import { REGRESSION_EXAMPLES } from "@/features/regression/examples";
import { formatNumber } from "@/lib/format";
import { linearRegression } from "@/lib/stats";

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-30 border-b bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5 rounded-md">
          <BrandMark className="size-7" />
          <span className="text-[15px] font-semibold tracking-[-0.02em]">ADVSTAT</span>
        </Link>
        <nav aria-label="Primary" className="ml-6 hidden items-center gap-1 md:flex">
          {[
            ["Regression", "/regression"],
            ["Hypothesis testing", "/hypothesis"],
            ["Formulas & Z-table", "/learn"],
          ].map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="rounded-md px-3 py-1.5 text-sm whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button asChild size="sm" className="h-8 px-3">
            <Link href="/dashboard">
              <span className="sm:hidden">Open app</span>
              <span className="hidden sm:inline">Open workspace</span>
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

const INDEX_IDS = [
  "study-hours",
  "absences",
  "sleep-reaction",
  "advertising",
  "car-age",
  "shoe-gpa",
  "celsius",
];

/** A plain ruled list: each row is one link into the lab with that dataset loaded. */
export function DatasetIndex() {
  const rows = useMemo(
    () =>
      INDEX_IDS.map((id) => {
        const ds = REGRESSION_EXAMPLES.find((d) => d.id === id);
        const res = linearRegression(ds.x, ds.y);
        return { ds, fit: res.ok ? res.value : null };
      }).filter((r) => r.fit),
    [],
  );

  return (
    <div>
      <ul className="divide-y border-y">
        {rows.map(({ ds, fit }) => (
          <li key={ds.id}>
            <Link
              href={`/regression?example=${ds.id}#results`}
              className="group grid min-h-16 grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 px-1 py-3 transition-colors hover:bg-muted/60 sm:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)_5.5rem_1rem] sm:gap-x-6 sm:px-3"
            >
              <span className="font-medium text-foreground">{ds.name}</span>
              <span className="col-start-1 text-sm text-muted-foreground sm:col-start-auto">
                {ds.xLabel} → {ds.yLabel}
              </span>
              <span className="col-start-2 row-start-1 text-right font-mono text-sm tabular-nums sm:col-start-auto sm:row-start-auto">
                <span className="sr-only">Pearson </span>r = {formatNumber(fit.r, 3)}
              </span>
              <ArrowUpRight
                className="hidden size-4 text-muted-foreground transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground motion-reduce:transition-none sm:block"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm text-muted-foreground">
        Showing {rows.length} of {REGRESSION_EXAMPLES.length} practice datasets. Values are
        illustrative.
      </p>
    </div>
  );
}
