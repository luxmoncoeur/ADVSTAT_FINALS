"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNumber } from "@/lib/format";
import { useFit } from "./regression-figure";
import { trackSpotlight } from "@/components/shared/spotlight";

/** The least-squares solution as a ledger: every line is computed from the dataset above it. */
export function Worksheet({ datasetId }) {
  const { dataset, fit } = useFit(datasetId);
  if (!fit) return null;

  const rows = [
    ["n", "number of pairs", fit.n],
    ["Σx", "sum of x", fit.sumX],
    ["Σy", "sum of y", fit.sumY],
    ["Σxy", "sum of products", fit.sumXY],
    ["Σx²", "sum of squares of x", fit.sumX2],
    ["Sxx", "Σx² − (Σx)² / n", fit.sxx],
    ["Sxy", "Σxy − ΣxΣy / n", fit.sxy],
  ];
  const results = [
    ["b", "Sxy / Sxx", fit.slope],
    ["a", "ȳ − b·x̄", fit.intercept],
    ["r", "Sxy / √(Sxx·Syy)", fit.r],
  ];

  return (
    <div
      className="panel overflow-hidden rounded-2xl border bg-card"
      data-spotlight
      onPointerMove={trackSpotlight}
    >
      <Table className="text-[15px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-20 pl-4 sm:pl-5">Value</TableHead>
            <TableHead>How it is found</TableHead>
            <TableHead className="pr-4 text-right whitespace-normal sm:pr-5">
              <span className="sr-only">Result for </span>
              {dataset.xLabel} → {dataset.yLabel}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map(([symbol, how, value]) => (
            <TableRow key={symbol}>
              <TableCell className="pl-4 font-mono font-medium sm:pl-5">{symbol}</TableCell>
              <TableCell className="text-muted-foreground">{how}</TableCell>
              <TableCell className="pr-4 text-right font-mono tabular-nums sm:pr-5">
                {formatNumber(value, 3)}
              </TableCell>
            </TableRow>
          ))}
          {results.map(([symbol, how, value]) => (
            <TableRow key={symbol} className="bg-accent/60 hover:bg-accent/60">
              <TableCell className="pl-4 font-mono font-semibold text-accent-foreground sm:pl-5">
                {symbol}
              </TableCell>
              <TableCell className="text-accent-foreground/80">{how}</TableCell>
              <TableCell className="pr-4 text-right font-mono font-semibold text-accent-foreground tabular-nums sm:pr-5">
                {formatNumber(value, 4)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/40 px-4 py-3 sm:px-5">
        <p className="text-sm text-muted-foreground">
          Same dataset as the figure above. Pick another to recompute.
        </p>
        <Button asChild size="sm" variant="outline">
          <Link href={`/regression?example=${dataset.id}#results`}>
            Open the full solution
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
