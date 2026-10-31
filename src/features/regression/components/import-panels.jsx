"use client";

import { FileSpreadsheet, Upload } from "lucide-react";
import { useId, useRef, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MAX_POINTS, parsePairs } from "@/lib/stats";

const LAYOUTS = [
  { value: "auto", label: "Detect automatically" },
  { value: "columns", label: "Columns: X and Y on each line" },
  { value: "rows", label: "Rows: all X, then all Y" },
];

/**
 * @param {string} text
 * @param {string} layout
 * @param {(xs: number[], ys: number[], labels?: { x: string, y: string }) => void} onLoad
 * @returns {string | null} error message
 */
function importText(text, layout, onLoad) {
  const result = parsePairs(text, { layout: /** @type {any} */ (layout) });
  if (!result.ok) return result.error.message;
  const { xs, ys, warnings, header } = result.value;
  if (xs.length > MAX_POINTS)
    return `Too many rows: ${xs.length.toLocaleString("en-US")}. The limit is ${MAX_POINTS.toLocaleString("en-US")}.`;
  onLoad(xs, ys, header ? { x: header[0], y: header[1] } : undefined);
  toast.success(`Loaded ${xs.length.toLocaleString("en-US")} data points`, {
    description: warnings.join(" ") || undefined,
  });
  return null;
}

export function PastePanel({ onLoad }) {
  const id = useId();
  const [text, setText] = useState("");
  const [layout, setLayout] = useState("auto");
  const [error, setError] = useState(/** @type {string | null} */ (null));

  return (
    <div className="space-y-3">
      <label htmlFor={`${id}-text`} className="text-sm font-medium">
        Paste from a spreadsheet, CSV or worksheet
      </label>
      <Textarea
        id={`${id}-text`}
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={8}
        spellCheck={false}
        placeholder={
          "Hours\tScore\n2\t62\n3\t65\n5\t70\n\nor two rows:\nX: 1 2 3 4 5\nY: 2 4 5 4 5"
        }
        className="font-mono text-sm"
        aria-describedby={error ? `${id}-error` : `${id}-hint`}
        aria-invalid={error ? true : undefined}
      />
      <p id={`${id}-hint`} className="text-xs text-muted-foreground">
        Separate values with tabs, commas, semicolons or spaces. Use a period for decimals (2.5). A
        header row is detected automatically.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select value={layout} onValueChange={setLayout}>
          <SelectTrigger className="sm:w-64" aria-label="Data layout">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LAYOUTS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          className="sm:ml-auto"
          disabled={text.trim() === ""}
          onClick={() => setError(importText(text, layout, onLoad))}
        >
          Use this data
        </Button>
      </div>
      {error ? (
        <Alert variant="destructive" id={`${id}-error`}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

export function UploadPanel({ onLoad }) {
  const inputRef = useRef(/** @type {HTMLInputElement | null} */ (null));
  const [error, setError] = useState(/** @type {string | null} */ (null));
  const [fileName, setFileName] = useState("");
  const [dragging, setDragging] = useState(false);

  const readFile = async (/** @type {File | undefined} */ file) => {
    if (!file) return;
    setFileName(file.name);
    if (file.size > 2_000_000) {
      setError("The file is larger than 2 MB. Use a smaller file.");
      return;
    }
    setError(importText(await file.text(), "columns", onLoad));
  };

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          readFile(event.dataTransfer.files[0]);
        }}
        className={`flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors hover:border-primary/60 hover:bg-accent/40 ${dragging ? "border-primary bg-accent/60" : "border-border"}`}
      >
        <span className="grid size-12 place-items-center rounded-full bg-accent text-accent-foreground">
          <Upload className="size-5" aria-hidden="true" />
        </span>
        <span className="text-sm font-medium">Drop a CSV file here or click to browse</span>
        <span className="text-xs text-muted-foreground">
          First column = X, second column = Y. A header row is optional. .csv or .txt, up to 2 MB.
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.txt,text/csv,text/plain"
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
        onChange={(event) => {
          readFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      {fileName && !error ? (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileSpreadsheet className="size-4" aria-hidden="true" /> {fileName}
        </p>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertDescription>
            {fileName ? `${fileName}: ` : ""}
            {error}
          </AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}
