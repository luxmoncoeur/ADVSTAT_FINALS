"use client";

import { useSettings } from "@/components/providers";
import { formatNumber, roundHalfUp } from "@/lib/format";
import { normalCdf } from "@/lib/stats";
import { cn } from "@/lib/utils";

const COLUMNS = Array.from({ length: 10 }, (_, i) => i / 100);

/**
 * Table value Φ(z) rounded to 4 places, as printed in a z-table.
 * @param {number} z
 */
export const tableValue = (z) => roundHalfUp(normalCdf(z), 4);

/**
 * Find the z-table cell(s) closest to a target cumulative area, exactly as a
 * student would: compare against the 4-decimal printed values. Returns two
 * cells when the target falls exactly halfway between neighbours (0.9500 →
 * 1.64 and 1.65, read as 1.645).
 * @param {number} target  0.5 ≤ target < 1
 */
export function lookupZ(target) {
  const wanted = roundHalfUp(target, 4);
  let best = [];
  let bestDistance = Infinity;
  for (let i = 0; i <= 409; i += 1) {
    const z = i / 100;
    const distance = Math.round(Math.abs(tableValue(z) - wanted) * 1e4);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = [z];
    } else if (distance === bestDistance) {
      best.push(z);
    }
  }
  return { target: wanted, cells: best.slice(0, 2), exact: bestDistance === 0 };
}

/**
 * Excerpt of the standard normal (z) table around the critical value, with the
 * looked-up cell highlighted.
 * @param {{ alpha: number, tail: 'left' | 'right' | 'two', critical: number }} props  critical = |critical z|
 */
export function ZTableLookup({ alpha, tail, critical }) {
  const { decimals } = useSettings();
  const area = tail === "two" ? 1 - alpha / 2 : 1 - alpha;
  const lookup = lookupZ(area);
  const zFromTable =
    lookup.cells.length === 2 ? (lookup.cells[0] + lookup.cells[1]) / 2 : lookup.cells[0];
  // Integer arithmetic so e.g. 2.30 lands in row 2.3 (2.3 * 10 = 22.999… in floating point).
  const centreRow = Math.floor(Math.round(lookup.cells[0] * 100) / 10) / 10;
  const rows = [-2, -1, 0, 1, 2]
    .map((offset) => Math.round((centreRow + offset / 10) * 10) / 10)
    .filter((row) => row >= 0 && row <= 4);
  const highlighted = new Set(lookup.cells.map((z) => z.toFixed(2)));
  const sign = tail === "two" ? "±" : tail === "left" ? "−" : "";
  const outOfTable = critical > 4.09;

  return (
    <div className="space-y-4">
      <ol className="space-y-1.5 text-sm leading-relaxed">
        <li>
          <span className="font-medium">1. Area to the left of the critical value:</span>{" "}
          <span className="font-mono">
            {tail === "two" ? `1 − α/2 = 1 − ${alpha}/2` : `1 − α = 1 − ${alpha}`} ={" "}
            {formatNumber(area, 4, { fixed: true })}
          </span>
        </li>
        <li>
          <span className="font-medium">
            2. Find {formatNumber(lookup.target, 4, { fixed: true })} inside the table
          </span>
          {lookup.cells.length === 2 ? (
            <span className="text-muted-foreground">
              {" "}
              — it falls exactly between{" "}
              {lookup.cells
                .map((z) => formatNumber(tableValue(z), 4, { fixed: true }))
                .join(" and ")}
              , so take the midpoint of z = {lookup.cells.map((z) => z.toFixed(2)).join(" and ")}.
            </span>
          ) : lookup.exact ? null : (
            <span className="text-muted-foreground"> — use the closest printed value.</span>
          )}
        </li>
        <li>
          <span className="font-medium">3. Read the z-value:</span>{" "}
          <span className="font-mono">
            z = {sign}
            {zFromTable.toFixed(lookup.cells.length === 2 ? 3 : 2)}
          </span>{" "}
          <span className="text-muted-foreground">
            (exact: {sign}
            {formatNumber(critical, decimals, { fixed: true })})
          </span>
        </li>
      </ol>

      {tail === "left" ? (
        <p className="text-xs text-muted-foreground">
          For a left-tailed test the critical value is negative: by symmetry, −z cuts off α ={" "}
          {alpha} in the left tail.
        </p>
      ) : null}

      {outOfTable ? (
        <p className="text-sm text-muted-foreground">
          This critical value is beyond the range of a printed z-table (0.00 – 4.09).
        </p>
      ) : (
        <div
          className="overflow-x-auto rounded-xl border"
          tabIndex={0}
          role="region"
          aria-label="Z-table excerpt"
        >
          <table className="w-full min-w-[640px] font-mono text-xs tabular-nums">
            <caption className="sr-only">
              Excerpt of the standard normal table. Rows give z to one decimal; columns give the
              second decimal. Cells show the area to the left of z.
            </caption>
            <thead className="bg-muted/70">
              <tr>
                <th scope="col" className="px-2 py-2 text-left font-semibold">
                  z
                </th>
                {COLUMNS.map((column) => (
                  <th
                    key={column}
                    scope="col"
                    className={cn(
                      "px-2 py-2 text-right font-medium",
                      lookup.cells.some((z) => Math.abs(((z * 100) % 10) - column * 100) < 1e-6) &&
                        "text-primary",
                    )}
                  >
                    {column.toFixed(2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row} className="border-t">
                  <th
                    scope="row"
                    className={cn(
                      "px-2 py-1.5 text-left font-semibold",
                      row === centreRow && "text-primary",
                    )}
                  >
                    {row.toFixed(1)}
                  </th>
                  {COLUMNS.map((column) => {
                    const z = Math.round((row + column) * 100) / 100;
                    const hit = highlighted.has(z.toFixed(2));
                    return (
                      <td
                        key={column}
                        className={cn(
                          "px-2 py-1.5 text-right",
                          hit
                            ? "rounded-md bg-primary font-semibold text-primary-foreground"
                            : "text-muted-foreground",
                        )}
                        aria-current={hit ? "true" : undefined}
                      >
                        {tableValue(z).toFixed(4)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
