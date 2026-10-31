"use client";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export function RegressionWorkspace() {
  const regression = useRegression();
  const { labels, parsed, outcome, stale } = regression;
  const result = outcome?.ok ? outcome.value : null;
  const pickExample = (example) =>
    regression.loadData(example.x, example.y, { x: example.xLabel, y: example.yLabel });

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
          <Card className="gap-4 py-4">
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
                    <label
                      htmlFor={`label-${key}`}
                      className="text-xs font-medium text-muted-foreground"
                    >
                      {key === "x" ? "X variable (independent)" : "Y variable (dependent)"}
                    </label>
                    <Input
                      id={`label-${key}`}
                      value={labels[key]}
                      maxLength={40}
                      onChange={(event) =>
                        regression.setLabels({ ...labels, [key]: event.target.value })
                      }
                      placeholder={key === "x" ? "e.g. Hours studied" : "e.g. Exam score"}
                      className="h-8 text-sm"
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
              <Button variant="ghost" size="sm" onClick={regression.clear}>
                <Eraser className="size-4" aria-hidden="true" /> Clear
              </Button>
              <Badge variant="outline" className="font-mono tabular-nums">
                n = {parsed.xs.length}
              </Badge>
              <ComputeButton onClick={regression.compute} className="ml-auto" />
            </CardFooter>
          </Card>
        </Reveal>

        <div className="min-w-0 space-y-4 xl:col-span-8" aria-live="polite">
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
        <RegressionSolution
          result={result}
          labels={labels}
          action={<RegressionReport result={result} labels={labels} />}
        />
      ) : null}
    </div>
  );
}
