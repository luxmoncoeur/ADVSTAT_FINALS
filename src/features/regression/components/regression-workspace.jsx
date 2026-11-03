"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

export function RegressionWorkspace() {
  const searchParams = useSearchParams();
  const exampleId = searchParams?.get("example") || searchParams?.get("dataset");
  const initialPreset = useMemo(
    () => (exampleId ? REGRESSION_EXAMPLES.find((item) => item.id === exampleId) || null : null),
    [exampleId],
  );

  const regression = useRegression(initialPreset);
  const { labels, parsed, outcome, stale } = regression;
  const result = outcome?.ok ? outcome.value : null;

  const activePreset = useMemo(() => {
    if (!result) return null;
    return (
      REGRESSION_EXAMPLES.find(
        (item) =>
          item.id === exampleId ||
          (item.xLabel === labels.x &&
            item.yLabel === labels.y &&
            item.x.length === parsed.xs.length &&
            item.x.every((val, i) => val === parsed.xs[i])),
      ) || null
    );
  }, [exampleId, labels, parsed, result]);

  const pickExample = (example) => {
    regression.loadData(example.x, example.y, { x: example.xLabel, y: example.yLabel });
  };

  const lastLoadedIdRef = useRef(initialPreset?.id || null);

  useEffect(() => {
    if (!exampleId || lastLoadedIdRef.current === exampleId) return;
    const match = REGRESSION_EXAMPLES.find((item) => item.id === exampleId);
    if (match) {
      lastLoadedIdRef.current = exampleId;
      regression.loadData(match.x, match.y, { x: match.xLabel, y: match.yLabel });
    }
  }, [exampleId, regression]);

  useEffect(() => {
    if (initialPreset && typeof window !== "undefined") {
      const timer = setTimeout(() => {
        const hash = window.location.hash ? window.location.hash.slice(1) : "results";
        const target = document.getElementById(hash) || document.getElementById("results");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [initialPreset]);

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-5 p-4 sm:p-6">
      <PageHeader
        eyebrow="Module 1"
        icon={ChartScatter}
        title="Simple Linear Regression"
        description="Enter paired X and Y values to get the regression equation Ŷ = a + bX, the correlation coefficient r, and the strength of the relationship, with every step shown."
      />

      <div className="grid items-start gap-4 xl:grid-cols-12">
        <Reveal className="xl:col-span-4" distance={16}>
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
                      {key === "x" ? "X variable (independent)" : "Y variable (dependent)"}
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
              <Button
                variant="ghost"
                size="sm"
                className="h-8 rounded-md text-xs"
                onClick={() => {
                  lastLoadedIdRef.current = null;
                  regression.clear();
                }}
              >
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
          {activePreset && result ? (
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
          <RegressionSolution result={result} labels={labels} />
        </div>
      ) : null}
    </div>
  );
}
