"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { linearRegression, parseNumber } from "@/lib/stats";

let nextId = 0;
const newRow = (x = "", y = "") => ({ id: `row-${(nextId += 1)}`, x, y });
const blankRows = (count) => Array.from({ length: count }, () => newRow());

/**
 * Validate the editable table. Fully empty rows are ignored; every other row
 * needs a valid X and Y.
 * @param {{ id: string, x: string, y: string }[]} rows
 */
export function readRows(rows) {
  /** @type {Record<string, { x?: string, y?: string }>} */
  const errors = {};
  const xs = [];
  const ys = [];
  for (const row of rows) {
    const xText = row.x.trim();
    const yText = row.y.trim();
    if (xText === "" && yText === "") continue;
    const x = parseNumber(xText);
    const y = parseNumber(yText);
    if (x === null)
      errors[row.id] = { ...errors[row.id], x: xText === "" ? "Missing X" : "Not a number" };
    if (y === null)
      errors[row.id] = { ...errors[row.id], y: yText === "" ? "Missing Y" : "Not a number" };
    if (x !== null && y !== null) {
      xs.push(x);
      ys.push(y);
    }
  }
  return { xs, ys, errors, filled: xs.length + Object.keys(errors).length };
}

/** State and actions for the regression workspace. */
export function useRegression() {
  const [rows, setRows] = useState(() => blankRows(5));
  const [labels, setLabels] = useState({ x: "X", y: "Y" });
  const [submitted, setSubmitted] = useState(
    /** @type {{ xs: number[], ys: number[] } | null} */ (null),
  );
  const [showErrors, setShowErrors] = useState(false);

  const parsed = useMemo(() => readRows(rows), [rows]);
  const outcome = useMemo(
    () => (submitted ? linearRegression(submitted.xs, submitted.ys) : null),
    [submitted],
  );
  const stale =
    submitted !== null &&
    (submitted.xs.length !== parsed.xs.length ||
      submitted.xs.some((x, i) => x !== parsed.xs[i] || submitted.ys[i] !== parsed.ys[i]) ||
      Object.keys(parsed.errors).length > 0);

  const updateCell = useCallback((id, key, value) => {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, [key]: value } : row)));
  }, []);
  const addRow = useCallback(() => setRows((current) => [...current, newRow()]), []);
  const removeRow = useCallback(
    (id) =>
      setRows((current) => (current.length > 1 ? current.filter((row) => row.id !== id) : current)),
    [],
  );

  const loadData = useCallback((xs, ys, nextLabels) => {
    setRows(xs.map((x, i) => newRow(String(x), String(ys[i]))));
    if (nextLabels) setLabels(nextLabels);
    setShowErrors(false);
    setSubmitted({ xs, ys });
  }, []);

  const clear = useCallback(() => {
    setRows(blankRows(5));
    setSubmitted(null);
    setShowErrors(false);
  }, []);

  const compute = useCallback(() => {
    setShowErrors(true);
    const errorCount = Object.keys(parsed.errors).length;
    if (errorCount > 0) {
      toast.error(
        `Fix ${errorCount} row${errorCount > 1 ? "s" : ""} with missing or invalid values.`,
      );
      return;
    }
    if (parsed.xs.length < 2) {
      toast.error("Enter at least two (X, Y) data points.");
      return;
    }
    setSubmitted({ xs: parsed.xs, ys: parsed.ys });
  }, [parsed]);

  return {
    rows,
    labels,
    setLabels,
    parsed,
    outcome,
    stale,
    showErrors,
    updateCell,
    addRow,
    removeRow,
    loadData,
    clear,
    compute,
  };
}
