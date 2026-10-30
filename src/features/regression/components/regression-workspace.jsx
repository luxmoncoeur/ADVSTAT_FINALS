"use client";

import {
  ChartScatter,
  ClipboardPaste,
  Eraser,
  FlaskConical,
  RefreshCw,
  Sparkles,
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
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { REGRESSION_EXAMPLES } from "../examples";
import { useRegression } from "../hooks/use-regression";
import { DataTableEditor } from "./data-table-editor";
import { PastePanel, UploadPanel } from "./import-panels";
import { RegressionDetails, RegressionKpis, RegressionSolution } from "./regression-results";

function ExamplesMenu({ onPick, variant = "outline" }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm">
          <Sparkles className="size-4" aria-hidden="true" /> Load example
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Sample datasets</DropdownMenuLabel>
        {REGRESSION_EXAMPLES.map((example) => (
          <DropdownMenuItem key={example.id} onSelect={() => onPick(example)}>
            <span className="flex flex-col">
              <span>{example.name}</span>
              <span className="text-xs text-muted-foreground">{example.x.length} points</span>
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function EmptyState({ onPick }) {
  return (
    <Card className="relative overflow-hidden">
      <div
        className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        aria-hidden="true"
      />
      <CardContent className="relative flex flex-col items-center gap-4 py-16 text-center">
        <span className="grid size-14 place-items-center rounded-2xl bg-accent text-accent-foreground shadow-sm">
          <ChartScatter className="size-6" aria-hidden="true" />
        </span>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold">No results yet</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Enter at least two (X, Y) pairs and press{" "}
            <strong className="text-foreground">Compute</strong>, or start from a sample dataset.
          </p>
        </div>
        <ExamplesMenu onPick={onPick} variant="default" />
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
    <div className="mx-auto w-full max-w-[1440px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Module 1"
        icon={ChartScatter}
        title="Simple Linear Regression"
        description="Find the regression equation Ŷ = a + bX, the correlation coefficient r, and how strong the relationship is, with every step of the solution shown."
      />

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <Reveal className="xl:col-span-5" distance={20}>
          <Card>
            <CardHeader>
              <CardTitle>Data</CardTitle>
              <CardDescription>Type, paste or upload paired observations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {["x", "y"].map((key) => (
                  <div key={key} className="grid gap-1.5">
                    <label htmlFor={`label-${key}`} className="text-sm font-medium">
                      {key === "x" ? "Independent variable (X)" : "Dependent variable (Y)"}
                    </label>
                    <Input
                      id={`label-${key}`}
                      value={labels[key]}
                      maxLength={40}
                      onChange={(event) =>
                        regression.setLabels({ ...labels, [key]: event.target.value })
                      }
                      placeholder={key === "x" ? "e.g. Hours studied" : "e.g. Exam score"}
                    />
                  </div>
                ))}
              </div>
              <Tabs defaultValue="table">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="table">
                    <Table2 className="size-4" aria-hidden="true" /> Table
                  </TabsTrigger>
                  <TabsTrigger value="paste">
                    <ClipboardPaste className="size-4" aria-hidden="true" /> Paste
                  </TabsTrigger>
                  <TabsTrigger value="upload">
                    <Upload className="size-4" aria-hidden="true" /> CSV
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="table" className="pt-3">
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
                <TabsContent value="paste" className="pt-3">
                  <PastePanel onLoad={regression.loadData} />
                </TabsContent>
                <TabsContent value="upload" className="pt-3">
                  <UploadPanel onLoad={regression.loadData} />
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 border-t sm:flex-row sm:items-center">
              <div className="flex w-full items-center gap-2 sm:w-auto">
                <ExamplesMenu onPick={pickExample} />
                <Button variant="ghost" size="sm" onClick={regression.clear}>
                  <Eraser className="size-4" aria-hidden="true" /> Clear
                </Button>
                <Badge variant="outline" className="ml-auto font-mono tabular-nums sm:hidden">
                  n = {parsed.xs.length}
                </Badge>
              </div>
              <Badge
                variant="outline"
                className="hidden font-mono tabular-nums sm:ml-auto sm:inline-flex"
              >
                n = {parsed.xs.length}
              </Badge>
              <ComputeButton onClick={regression.compute} className="w-full sm:w-auto" />
            </CardFooter>
          </Card>
        </Reveal>

        <div className="space-y-6 xl:col-span-7" aria-live="polite">
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
              <RegressionDetails result={result} labels={labels} />
            </>
          ) : (
            <EmptyState onPick={pickExample} />
          )}
        </div>
      </div>

      {result ? <RegressionSolution result={result} labels={labels} /> : null}
    </div>
  );
}
