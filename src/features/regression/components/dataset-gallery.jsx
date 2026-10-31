"use client";

import { Library } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatNumber } from "@/lib/format";
import { linearRegression } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { DATASET_CATEGORIES, REGRESSION_EXAMPLES } from "../examples";

/** Each dataset with its regression computed once (for the r badge and preview). */
function useDatasets() {
  return useMemo(
    () =>
      REGRESSION_EXAMPLES.map((dataset) => {
        const result = linearRegression(dataset.x, dataset.y);
        return { ...dataset, result: result.ok ? result.value : null };
      }),
    [],
  );
}

/** Tiny scatter + fitted line drawn with plain SVG (cheap enough for a grid of cards). */
function MiniPlot({ dataset }) {
  const { x, y, result } = dataset;
  const [minX, maxX] = [Math.min(...x), Math.max(...x)];
  const fitted = result
    ? [result.intercept + result.slope * minX, result.intercept + result.slope * maxX]
    : [];
  const ys = [...y, ...fitted];
  const [minY, maxY] = [Math.min(...ys), Math.max(...ys)];
  const sx = (v) => 6 + ((v - minX) / (maxX - minX || 1)) * 88;
  const sy = (v) => 34 - ((v - minY) / (maxY - minY || 1)) * 28;
  return (
    <svg viewBox="0 0 100 40" className="h-12 w-full" aria-hidden="true">
      {[10, 20, 30].map((line) => (
        <line
          key={line}
          x1="0"
          x2="100"
          y1={line}
          y2={line}
          className="stroke-border"
          strokeWidth="0.5"
        />
      ))}
      {result ? (
        <line
          x1={sx(minX)}
          y1={sy(fitted[0])}
          x2={sx(maxX)}
          y2={sy(fitted[1])}
          className="stroke-chart-3"
          strokeWidth="1.5"
        />
      ) : null}
      {x.map((value, i) => (
        <circle key={i} cx={sx(value)} cy={sy(y[i])} r="1.6" className="fill-chart-1" />
      ))}
    </svg>
  );
}

function strengthTone(strength) {
  if (strength === "Perfect" || strength === "Very strong" || strength === "Strong")
    return "bg-accept-soft text-accept";
  if (strength === "Moderate") return "bg-chart-3/15 text-foreground";
  return "bg-muted text-muted-foreground";
}

/**
 * Grid of sample datasets grouped by category.
 * @param {{ onPick: (dataset: (typeof REGRESSION_EXAMPLES)[number]) => void, columns?: string }} props
 */
export function DatasetGrid({ onPick, columns = "sm:grid-cols-2 xl:grid-cols-3" }) {
  const datasets = useDatasets();
  return (
    <div className="space-y-5">
      {DATASET_CATEGORIES.map((category) => (
        <section key={category} aria-label={category} className="space-y-2">
          <h3 className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            {category}
          </h3>
          <ul className={cn("grid gap-2", columns)}>
            {datasets
              .filter((dataset) => dataset.category === category)
              .map((dataset) => (
                <li key={dataset.id}>
                  <button
                    type="button"
                    onClick={() => onPick(dataset)}
                    className="group flex h-full w-full flex-col gap-1.5 rounded-xl border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:hover:translate-y-0"
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="text-sm leading-snug font-medium">{dataset.name}</span>
                      <span className="shrink-0 font-mono text-xs text-muted-foreground">
                        n={dataset.x.length}
                      </span>
                    </span>
                    <MiniPlot dataset={dataset} />
                    {dataset.result?.r != null ? (
                      <span className="flex items-center gap-2 text-xs">
                        <span className="font-mono tabular-nums">
                          r = {formatNumber(dataset.result.r, 2, { fixed: true })}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-0.5 font-medium",
                            strengthTone(dataset.result.strength),
                          )}
                        >
                          {dataset.result.strength === "None"
                            ? "No relationship"
                            : `${dataset.result.strength} ${dataset.result.direction}`}
                        </span>
                      </span>
                    ) : null}
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

/** "Datasets" button that opens the gallery in a dialog. */
export function DatasetDialog({ onPick, variant = "outline", size = "sm", className }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Library className="size-4" aria-hidden="true" /> Datasets
          <Badge
            variant="secondary"
            className="ml-0.5 h-5 rounded-full px-1.5 font-mono text-[10px]"
          >
            {REGRESSION_EXAMPLES.length}
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Sample datasets</DialogTitle>
          <DialogDescription>
            Illustrative practice data. Pick one to load it into the table and compute.
          </DialogDescription>
        </DialogHeader>
        <DatasetGrid
          columns="sm:grid-cols-2 lg:grid-cols-3"
          onPick={(dataset) => {
            onPick(dataset);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
