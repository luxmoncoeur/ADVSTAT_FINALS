"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import {
  ChartScatter,
  ClipboardPaste,
  Eraser,
  FlaskConical,
  RefreshCw,
  Table2,
  Upload,
} from "lucide-react";
import { ComputeButton } from "@/components/shared/compute-button";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REGRESSION_EXAMPLES } from "../examples";
import { useRegression } from "../hooks/use-regression";
import { DataTableEditor } from "./data-table-editor";
import { DatasetDialog, DatasetGrid } from "./dataset-gallery";
import { PastePanel, UploadPanel } from "./import-panels";
import { RegressionReport } from "./regression-report";
import { RegressionKpis, RegressionSolution, RegressionVisuals } from "./regression-results";

function StartPanel({ onPick }) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle>Start with a dataset</CardTitle>
        <CardDescription>
          Pick a sample to see a full worked example, or type your own data on the left and press
          Compute.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <DatasetGrid onPick={onPick} columns="sm:grid-cols-2 2xl:grid-cols-3" />
      </CardContent>
    </Card>
  );
}

const sameValues = (a, b) => a.length === b.length && a.every((value, i) => value === b[i]);

export function RegressionWorkspace() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // Dashboard links open a dataset with `?example=<id>` (`?dataset=<id>` also works).
  const exampleId = searchParams.get("example") || searchParams.get("dataset");
  const initialPreset = useMemo(
    () => REGRESSION_EXAMPLES.find((item) => item.id === exampleId) ?? null,
    [exampleId],
  );

  const regression = useRegression(initialPreset);
  const { labels, parsed, outcome, stale } = regression;
  const result = outcome?.ok ? outcome.value : null;

  // Name the sample only while the computed data is still exactly that sample.
  const activePreset = useMemo(() => {
    if (!result || stale) return null;
    return (
      REGRESSION_EXAMPLES.find(
        (item) => sameValues(item.x, parsed.xs) && sameValues(item.y, parsed.ys),
      ) ?? null
    );
  }, [parsed, result, stale]);

  const pickExample = (example) => {
    regression.loadData(example.x, example.y, { x: example.xLabel, y: example.yLabel });
  };

  // A new `?example=` while the page is open (client navigation) loads that dataset.
  const lastLoadedIdRef = useRef(initialPreset?.id ?? null);
  useEffect(() => {
    if (!initialPreset || lastLoadedIdRef.current === initialPreset.id) return;
    lastLoadedIdRef.current = initialPreset.id;
    pickExample(initialPreset);
    // Only react to the URL, not to a new pickExample identity on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPreset]);

  useEffect(() => {
    if (!initialPreset) return;
    const timer = setTimeout(() => {
      const target =
        document.getElementById(window.location.hash.slice(1) || "results") ??
        document.getElementById("results");
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
    return () => clearTimeout(timer);
  }, [initialPreset]);

  const clear = () => {
    regression.clear();
    // Drop `?example=` too, or the URL would point at a dataset that is no longer loaded.
    lastLoadedIdRef.current = null;
    if (exampleId) router.replace(pathname, { scroll: false });
  };

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader
        eyebrow="Module 1"
        icon={ChartScatter}
        title="Simple Linear Regression"
        description="Enter paired X and Y values to get the regression equation Ŷ = a + bX, the correlation coefficient r, and the strength of the relationship, with every step shown."
      />

      <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-12">
        <Reveal className="min-w-0 xl:col-span-4" distance={16}>
          <Card className="gap-4 py-4 shadow-xs">
            <CardHeader className="px-4">
              <CardTitle>Data</CardTitle>
              <CardDescription>Type, paste or upload pairs.</CardDescription>
              <CardAction>
                <DatasetDialog onPick={pickExample} />
              </CardAction>
            </CardHeader>
            <CardContent className="space-y-3 px-4">
              <div className="grid grid-cols-2 gap-2">
                {["x", "y"].map((key) => (
                  <div key={key} className="grid gap-1">
                    <Label
                      htmlFor={`label-${key}`}
                      className="text-xs font-medium text-muted-foreground"
                    >
                      {key === "x" ? "X (independent)" : "Y (dependent)"}
                    </Label>
                    <Input
                      id={`label-${key}`}
                      value={labels[key]}
                      maxLength={40}
                      onChange={(event) =>
                        regression.setLabels({ ...labels, [key]: event.target.value })
                      }
                      placeholder={key === "x" ? "e.g. Hours studied" : "e.g. Exam score"}
                      className="h-8 rounded-md text-xs sm:text-sm"
                    />
                  </div>
                ))}
              </div>
              <Tabs defaultValue="table" className="gap-3">
                <TabsList className="grid h-8 w-full grid-cols-3">
                  <TabsTrigger value="table" className="text-xs">
                    <Table2 className="size-3.5" aria-hidden="true" /> Table
                  </TabsTrigger>
                  <TabsTrigger value="paste" className="text-xs">
                    <ClipboardPaste className="size-3.5" aria-hidden="true" /> Paste
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="text-xs">
                    <Upload className="size-3.5" aria-hidden="true" /> CSV
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="table">
                  <DataTableEditor
                    rows={regression.rows}
                    labels={labels}
                    errors={parsed.errors}
                    showErrors={regression.showErrors}
                    onCellChange={regression.updateCell}
                    onAddRow={regression.addRow}
                    onRemoveRow={regression.removeRow}
                  />
                </TabsContent>
                <TabsContent value="paste">
                  <PastePanel onLoad={regression.loadData} />
                </TabsContent>
                <TabsContent value="upload">
                  <UploadPanel onLoad={regression.loadData} />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="gap-2 border-t px-4 pt-4">
              <Button variant="ghost" size="sm" className="h-8 rounded-md text-xs" onClick={clear}>
                <Eraser className="size-3.5" aria-hidden="true" /> Clear
              </Button>
              <Badge variant="outline" className="h-8 rounded-md font-mono text-xs tabular-nums">
                n = {parsed.xs.length}
              </Badge>
              <ComputeButton onClick={regression.compute} className="ml-auto" />
            </CardFooter>
          </Card>
        </Reveal>

        <div
          id="results"
          className="min-w-0 scroll-mt-20 space-y-4 xl:col-span-8"
          aria-live="polite"
        >
          {activePreset ? (
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/80 bg-muted/40 px-3.5 py-2.5 shadow-2xs">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="rounded-md font-mono text-[11px]">
                  {activePreset.category}
                </Badge>
                <span className="text-xs font-semibold text-foreground">{activePreset.name}</span>
                <span className="font-mono text-xs text-muted-foreground">
                  ({activePreset.x.length} pairs: {activePreset.xLabel} → {activePreset.yLabel})
                </span>
              </div>
              <Badge
                variant="outline"
                className="rounded-md font-mono text-[11px] text-emerald-700 dark:text-emerald-400"
              >
                ✓ Computed from sample
              </Badge>
            </div>
          ) : null}
          {stale && result ? (
            <Alert>
              <RefreshCw aria-hidden="true" />
              <AlertTitle>The data has changed</AlertTitle>
              <AlertDescription>Press Compute to update the results below.</AlertDescription>
            </Alert>
          ) : null}
          {outcome && !outcome.ok ? (
            <Alert variant="destructive">
              <FlaskConical aria-hidden="true" />
              <AlertTitle>Cannot compute the regression</AlertTitle>
              <AlertDescription>{outcome.error.message}</AlertDescription>
            </Alert>
          ) : null}
          {result ? (
            <>
              <RegressionKpis result={result} />
              <RegressionVisuals result={result} labels={labels} />
            </>
          ) : (
            <StartPanel onPick={pickExample} />
          )}
        </div>
      </div>

      {result ? (
        <div id="solution" className="scroll-mt-20">
          <RegressionSolution
            result={result}
            labels={labels}
            action={<RegressionReport result={result} labels={labels} />}
          />
        </div>
      ) : null}
    </div>
  );
}
