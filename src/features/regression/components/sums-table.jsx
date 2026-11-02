"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/components/providers";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatExact, formatNumber } from "@/lib/format";

const PAGE_SIZE = 25;

/**
 * Computation table: X, Y, XY, X², Y² for every point with the column totals —
 * the table a student builds by hand before applying the formulas.
 * @param {{ result: import('@/lib/stats/regression').RegressionResult, labels: { x: string, y: string } }} props
 */
export function SumsTable({ result, labels }) {
  const { decimals } = useSettings();
  const [page, setPage] = useState(0);
  const pages = Math.ceil(result.rows.length / PAGE_SIZE);
  const current = Math.min(page, pages - 1);
  const start = current * PAGE_SIZE;
  const visible = result.rows.slice(start, start + PAGE_SIZE);
  const num = (value) => formatNumber(value, decimals);

  return (
    <div className="space-y-3">
      <div
        className="overflow-x-auto rounded-md border border-border/80 bg-card"
        tabIndex={0}
        role="region"
        aria-label="Computation table"
      >
        <table className="w-full min-w-[560px] text-sm">
          <caption className="sr-only">
            Computation table for {labels.x} (X) and {labels.y} (Y) with column sums
          </caption>
          <thead className="bg-muted/70">
            <tr className="text-right font-mono text-xs text-muted-foreground">
              <th scope="col" className="px-3 py-2 text-center font-medium">
                #
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                X
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                Y
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span
                        tabIndex={0}
                        className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        XY
                      </span>
                    }
                  />
                  <TooltipContent>Product of X and Y for each point</TooltipContent>
                </Tooltip>
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span
                        tabIndex={0}
                        className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        X²
                      </span>
                    }
                  />
                  <TooltipContent>
                    Square of X (used to calculate slope and correlation)
                  </TooltipContent>
                </Tooltip>
              </th>
              <th scope="col" className="px-3 py-2 font-medium">
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <span
                        tabIndex={0}
                        className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                      >
                        Y²
                      </span>
                    }
                  />
                  <TooltipContent>
                    Square of Y (used to calculate total sum of squares)
                  </TooltipContent>
                </Tooltip>
              </th>
            </tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {visible.map((row, i) => (
              <tr
                key={start + i}
                className="border-t border-border/60 text-right transition-colors hover:bg-muted/40"
              >
                <td className="px-3 py-1.5 text-center text-xs text-muted-foreground">
                  {start + i + 1}
                </td>
                <td className="px-3 py-1.5">{formatExact(row.x)}</td>
                <td className="px-3 py-1.5">{formatExact(row.y)}</td>
                <td className="px-3 py-1.5">{num(row.xy)}</td>
                <td className="px-3 py-1.5">{num(row.x2)}</td>
                <td className="px-3 py-1.5">{num(row.y2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="font-mono tabular-nums">
            <tr className="border-t bg-muted/60 text-right font-semibold text-foreground">
              <th scope="row" className="px-3 py-2 text-center">
                Σ
              </th>
              <td className="px-3 py-2">
                <span className="sr-only">ΣX = </span>
                {num(result.sumX)}
              </td>
              <td className="px-3 py-2">
                <span className="sr-only">ΣY = </span>
                {num(result.sumY)}
              </td>
              <td className="px-3 py-2">
                <span className="sr-only">ΣXY = </span>
                {num(result.sumXY)}
              </td>
              <td className="px-3 py-2">
                <span className="sr-only">ΣX² = </span>
                {num(result.sumX2)}
              </td>
              <td className="px-3 py-2">
                <span className="sr-only">ΣY² = </span>
                {num(result.sumY2)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <p className="font-mono">
          n = {result.n} · X̄ = {num(result.meanX)} · Ȳ = {num(result.meanY)}
        </p>
        {pages > 1 ? (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="size-7 rounded-md"
              onClick={() => setPage(current - 1)}
              disabled={current === 0}
              aria-label="Previous rows"
            >
              <ChevronLeft className="size-3.5" aria-hidden="true" />
            </Button>
            <span className="px-2 font-mono tabular-nums" aria-live="polite">
              Rows {start + 1}–{Math.min(start + PAGE_SIZE, result.rows.length)} of{" "}
              {result.rows.length}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="size-7 rounded-md"
              onClick={() => setPage(current + 1)}
              disabled={current === pages - 1}
              aria-label="Next rows"
            >
              <ChevronRight className="size-3.5" aria-hidden="true" />
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
