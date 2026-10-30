"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAX_EDITABLE_ROWS = 200;

/**
 * Editable X/Y grid. Enter moves to the next row (adding one at the end) so
 * data can be typed quickly from a worksheet.
 */
export function DataTableEditor({
  rows,
  labels,
  errors,
  showErrors,
  onCellChange,
  onAddRow,
  onRemoveRow,
}) {
  const visible = rows.slice(0, MAX_EDITABLE_ROWS);

  const focusCell = (rowIndex, column) => {
    requestAnimationFrame(() => {
      document.querySelector(`[data-cell="${rowIndex}-${column}"]`)?.focus();
    });
  };

  const handleKeyDown = (event, rowIndex, column) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    if (column === "x") return focusCell(rowIndex, "y");
    if (rowIndex === rows.length - 1) onAddRow();
    focusCell(rowIndex + 1, "x");
  };

  return (
    <div className="space-y-3">
      <div className="max-h-[420px] overflow-auto rounded-lg border">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Data points. Press Enter to move to the next cell.</caption>
          <thead className="sticky top-0 z-10 bg-muted/95 backdrop-blur">
            <tr className="text-left text-xs font-medium text-muted-foreground">
              <th scope="col" className="w-10 px-3 py-2 text-center">
                #
              </th>
              <th scope="col" className="px-2 py-2">
                {labels.x || "X"} <span className="font-mono">(X)</span>
              </th>
              <th scope="col" className="px-2 py-2">
                {labels.y || "Y"} <span className="font-mono">(Y)</span>
              </th>
              <th scope="col" className="w-10 px-2 py-2">
                <span className="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {visible.map((row, index) => {
              const rowErrors = showErrors ? errors[row.id] : undefined;
              return (
                <tr key={row.id} className="border-t transition-colors hover:bg-muted/40">
                  <td className="px-3 py-1.5 text-center font-mono text-xs text-muted-foreground tabular-nums">
                    {index + 1}
                  </td>
                  {["x", "y"].map((column) => (
                    <td key={column} className="px-2 py-1.5">
                      <Input
                        data-cell={`${index}-${column}`}
                        value={row[column]}
                        onChange={(event) => onCellChange(row.id, column, event.target.value)}
                        onKeyDown={(event) => handleKeyDown(event, index, column)}
                        inputMode="decimal"
                        autoComplete="off"
                        spellCheck={false}
                        aria-label={`Row ${index + 1}, ${column.toUpperCase()}`}
                        aria-invalid={rowErrors?.[column] ? true : undefined}
                        title={rowErrors?.[column]}
                        placeholder="—"
                        className={cn(
                          "h-9 font-mono tabular-nums",
                          rowErrors?.[column] && "border-destructive",
                        )}
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => onRemoveRow(row.id)}
                      disabled={rows.length === 1}
                      aria-label={`Remove row ${index + 1}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {rows.length > MAX_EDITABLE_ROWS ? (
        <p className="text-xs text-muted-foreground">
          Showing the first {MAX_EDITABLE_ROWS} of {rows.length.toLocaleString("en-US")} rows for
          editing. All rows are used in the analysis.
        </p>
      ) : null}
      <Button variant="outline" size="sm" onClick={onAddRow} className="w-full border-dashed">
        <Plus className="size-4" aria-hidden="true" /> Add row
      </Button>
    </div>
  );
}
