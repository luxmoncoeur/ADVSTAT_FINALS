"use client";

import {
  Activity,
  ArrowRight,
  BookOpenText,
  Calculator,
  ChartScatter,
  Crosshair,
  Database,
  FlaskConical,
  Layers,
  Sigma,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  Scatter,
  XAxis,
  YAxis,
} from "recharts";
import { useSettings } from "@/components/providers";
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
import { ChartContainer } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { buildCurve } from "@/features/hypothesis/components/normal-curve-chart";
import { REGRESSION_EXAMPLES } from "@/features/regression/examples";
import { formatNumber } from "@/lib/format";
import {
  classifyCorrelation,
  criticalZ,
  linearRegression,
  oneMeanZTest,
  parseNumber,
} from "@/lib/stats";

const FEATURED_DATASETS = REGRESSION_EXAMPLES.slice(0, 6);

export function Dashboard() {
  const { decimals } = useSettings();
  const [selectedDatasetId, setSelectedDatasetId] = useState(FEATURED_DATASETS[0].id);

  // Live Z-test workbench controls
  const [sampleMean, setSampleMean] = useState("510");
  const [alpha, setAlpha] = useState("0.05");
  const [tail, setTail] = useState("two");

  // Live Correlation interpreter control
  const [rInput, setRInput] = useState("0.85");

  const activeDataset = useMemo(
    () => FEATURED_DATASETS.find((d) => d.id === selectedDatasetId) || FEATURED_DATASETS[0],
    [selectedDatasetId],
  );

  const regression = useMemo(() => {
    const res = linearRegression(activeDataset.x, activeDataset.y);
    return res.ok ? res.value : null;
  }, [activeDataset]);

  const ztest = useMemo(() => {
    const parsedMean = parseNumber(sampleMean) ?? 510;
    const res = oneMeanZTest({
      sampleMean: parsedMean,
      mu0: 500,
      sigma: 30,
      n: 36,
      alpha: Number(alpha),
      tail: /** @type {'two'|'left'|'right'} */ (tail),
    });
    return res.ok ? res.value : null;
  }, [sampleMean, alpha, tail]);

  const scatterPoints = useMemo(
    () => (regression ? regression.rows.map((r) => ({ x: r.x, y: r.y })) : []),
    [regression],
  );

  const fitLine = useMemo(
    () =>
      regression
        ? [regression.minX, regression.maxX].map((x) => ({
            x,
            y: regression.intercept + regression.slope * x,
          }))
        : [],
    [regression],
  );

  const curveData = useMemo(
    () => (ztest ? buildCurve(ztest.tail, ztest.critical, ztest.z, 4) : []),
    [ztest],
  );

  const parsedR = parseNumber(rInput);
  const validR = parsedR !== null && parsedR >= -1 && parsedR <= 1;
  const rReading = validR ? classifyCorrelation(parsedR) : null;

  if (!regression || !ztest) return null;

  return (
    <div className="mx-auto w-full max-w-[1520px] space-y-5 p-4 sm:p-6">
      {/* Shadcn Dashboard Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Interactive statistical workspace</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="h-8 rounded-md text-xs">
            <Link href="/learn">
              <BookOpenText className="size-3.5" aria-hidden="true" />
              Formulas &amp; Z-Table
            </Link>
          </Button>
          <Button asChild size="sm" className="h-8 rounded-md text-xs">
            <Link href="/regression">
              <ChartScatter className="size-3.5" aria-hidden="true" />
              New Analysis
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Shadcn Tabs Container */}
      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <TabsList className="h-9 rounded-lg bg-muted p-1">
            <TabsTrigger value="overview" className="rounded-md px-3 text-xs">
              <Layers className="size-3.5" aria-hidden="true" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="calculators" className="rounded-md px-3 text-xs">
              <Calculator className="size-3.5" aria-hidden="true" />
              Quick Calculators
            </TabsTrigger>
            <TabsTrigger value="datasets" className="rounded-md px-3 text-xs">
              <Database className="size-3.5" aria-hidden="true" />
              Sample Datasets ({REGRESSION_EXAMPLES.length})
            </TabsTrigger>
          </TabsList>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="text-xs text-muted-foreground">Active preset:</span>
            <Badge variant="secondary" className="rounded-md font-mono text-xs">
              {activeDataset.name}
            </Badge>
          </div>
        </div>

        {/* TAB 1: OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          {/* 4 Classic Shadcn KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="gap-2 rounded-xl py-4 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span
                          tabIndex={0}
                          className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          Correlation (r)
                        </span>
                      }
                    />
                    <TooltipContent>
                      Pearson correlation coefficient: direction and strength of linear relationship
                      (−1 ≤ r ≤ +1)
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <Activity className="size-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl font-bold tracking-tight tabular-nums">
                  {formatNumber(regression.r, decimals)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {regression.strength} {regression.direction} ({activeDataset.name})
                </p>
              </CardContent>
            </Card>

            <Card className="gap-2 rounded-xl py-4 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span
                          tabIndex={0}
                          className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          Determination (R²)
                        </span>
                      }
                    />
                    <TooltipContent>
                      Coefficient of determination: proportion of total variance in Y explained by
                      the model
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <ChartScatter className="size-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl font-bold tracking-tight tabular-nums">
                  {formatNumber(regression.rSquared, decimals)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatNumber(regression.rSquared * 100, 1)}% of Y variance explained by X
                </p>
              </CardContent>
            </Card>

            <Card className="gap-2 rounded-xl py-4 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span
                          tabIndex={0}
                          className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          Z-Statistic (z)
                        </span>
                      }
                    />
                    <TooltipContent>
                      Standardized test score: distance of sample mean from hypothesized mean in
                      standard errors
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <Sigma className="size-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="font-mono text-2xl font-bold tracking-tight tabular-nums">
                  {formatNumber(ztest.z, decimals)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Critical z* ={" "}
                  {tail === "two"
                    ? `±${formatNumber(ztest.critical.upper, 2)}`
                    : formatNumber(
                        tail === "left" ? ztest.critical.lower : ztest.critical.upper,
                        2,
                      )}{" "}
                  at α = {alpha}
                </p>
              </CardContent>
            </Card>

            <Card className="gap-2 rounded-xl py-4 shadow-xs">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                <CardTitle className="text-xs font-medium text-muted-foreground">
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span
                          tabIndex={0}
                          className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          Hypothesis Verdict
                        </span>
                      }
                    />
                    <TooltipContent>
                      Statistical decision rule: reject null hypothesis H₀ when p-value ≤ α
                    </TooltipContent>
                  </Tooltip>
                </CardTitle>
                <FlaskConical className="size-4 text-muted-foreground" aria-hidden="true" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-2xl font-bold tracking-tight tabular-nums">
                    p = {formatNumber(ztest.pValue, 4)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Decision:{" "}
                  <span className="font-medium text-foreground">
                    {ztest.reject ? "Reject H₀" : "Fail to reject H₀"}
                  </span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Two Interactive Workbench Panels */}
          <div className="grid gap-4 lg:grid-cols-7">
            {/* Left 4 cols: Interactive Linear Regression Preview */}
            <Card className="rounded-xl shadow-xs lg:col-span-4">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      Linear Regression Model
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Switch sample datasets below to preview live OLS fit &amp; equation
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="rounded-md font-mono text-xs">
                    Ŷ = {formatNumber(regression.intercept, 2)} +{" "}
                    {formatNumber(regression.slope, 2)}X
                  </Badge>
                </div>

                {/* Preset Switcher Pills */}
                <div
                  className="flex flex-wrap gap-1.5 pt-2"
                  role="group"
                  aria-label="Sample datasets"
                >
                  {FEATURED_DATASETS.map((ds) => (
                    <Button
                      key={ds.id}
                      type="button"
                      variant={ds.id === selectedDatasetId ? "default" : "outline"}
                      size="xs"
                      onClick={() => setSelectedDatasetId(ds.id)}
                      className="h-6 rounded-md px-2.5 text-[11px]"
                    >
                      {ds.name}
                    </Button>
                  ))}
                </div>
              </CardHeader>

              <CardContent>
                <div className="h-56 w-full rounded-lg border border-border/70 bg-muted/20 p-3">
                  <ChartContainer
                    config={{}}
                    className="aspect-auto h-full w-full"
                    aria-hidden="true"
                  >
                    <ComposedChart
                      margin={{ top: 10, right: 12, bottom: 8, left: 8 }}
                      accessibilityLayer={false}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                      <XAxis
                        type="number"
                        dataKey="x"
                        domain={["dataMin - 1", "dataMax + 1"]}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        domain={["dataMin - 5", "dataMax + 5"]}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                        width={36}
                      />
                      <Line
                        data={fitLine}
                        dataKey="y"
                        stroke="var(--primary)"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        className="pointer-events-none"
                        style={{ pointerEvents: "none" }}
                      />
                      <Scatter
                        data={scatterPoints}
                        fill="var(--foreground)"
                        isAnimationActive={false}
                      />
                    </ComposedChart>
                  </ChartContainer>
                </div>
              </CardContent>

              <CardFooter className="justify-between border-t border-border/60 bg-muted/30 py-3">
                <div className="flex flex-wrap items-center gap-4 font-mono text-xs text-muted-foreground">
                  <span>n = {regression.n}</span>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span
                          tabIndex={0}
                          className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          Sxx = {formatNumber(regression.sxx, 1)}
                        </span>
                      }
                    />
                    <TooltipContent>Sum of squared deviations of X from its mean</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span
                          tabIndex={0}
                          className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          Sxy = {formatNumber(regression.sxy, 1)}
                        </span>
                      }
                    />
                    <TooltipContent>Sum of products of deviations for X and Y</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span
                          tabIndex={0}
                          className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          se = {formatNumber(regression.standardError, 2)}
                        </span>
                      }
                    />
                    <TooltipContent>Standard error of the estimate</TooltipContent>
                  </Tooltip>
                </div>
                <Button asChild size="sm" className="h-7 rounded-md px-3 text-xs">
                  <Link href="/regression">
                    Full Regression Lab
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Right 3 cols: Interactive Hypothesis Sandbox */}
            <Card className="rounded-xl shadow-xs lg:col-span-3">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-semibold">
                      One-Mean Z-Test Sandbox
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Adjust sample mean x̄, α, and tail to inspect the critical region
                    </CardDescription>
                  </div>
                  <Badge
                    variant={ztest.reject ? "destructive" : "secondary"}
                    className="rounded-md font-mono text-xs"
                  >
                    {ztest.reject ? "Reject H₀" : "Retain H₀"}
                  </Badge>
                </div>

                {/* Mini Inline Controls */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="space-y-1">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Label
                            htmlFor="workbench-sample-mean"
                            tabIndex={0}
                            className="text-[11px] text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                          >
                            Sample x̄
                          </Label>
                        }
                      />
                      <TooltipContent>
                        Sample mean: arithmetic average of sample data
                      </TooltipContent>
                    </Tooltip>
                    <Input
                      id="workbench-sample-mean"
                      type="text"
                      inputMode="decimal"
                      value={sampleMean}
                      onChange={(e) => setSampleMean(e.target.value)}
                      className="h-7 rounded-md px-2 font-mono text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Label
                            tabIndex={0}
                            className="block text-[11px] font-medium text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                          >
                            Alpha (α)
                          </Label>
                        }
                      />
                      <TooltipContent>
                        Significance level: maximum allowable probability of Type I error
                      </TooltipContent>
                    </Tooltip>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      size="sm"
                      spacing={0}
                      value={alpha}
                      onValueChange={(v) => v && setAlpha(v)}
                      aria-label="Level of significance"
                      className="h-7 w-full"
                    >
                      {[
                        { a: "0.10", desc: "10% significance level (90% confidence)" },
                        { a: "0.05", desc: "5% significance level (95% confidence, standard)" },
                        { a: "0.01", desc: "1% significance level (99% confidence, stringent)" },
                      ].map(({ a, desc }) => (
                        <Tooltip key={a}>
                          <TooltipTrigger
                            render={
                              <ToggleGroupItem
                                value={a}
                                className="h-7 flex-1 px-1 font-mono text-[11px]"
                              >
                                {a}
                              </ToggleGroupItem>
                            }
                          />
                          <TooltipContent>{desc}</TooltipContent>
                        </Tooltip>
                      ))}
                    </ToggleGroup>
                  </div>
                  <div className="space-y-1">
                    <Tooltip>
                      <TooltipTrigger
                        render={
                          <Label
                            tabIndex={0}
                            className="block text-[11px] font-medium text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                          >
                            Tail
                          </Label>
                        }
                      />
                      <TooltipContent>
                        Direction of alternative hypothesis: Left-tailed (&lt;), Two-tailed (≠),
                        Right-tailed (&gt;)
                      </TooltipContent>
                    </Tooltip>
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      size="sm"
                      spacing={0}
                      value={tail}
                      onValueChange={(v) => v && setTail(v)}
                      aria-label="Tail direction"
                      className="h-7 w-full"
                    >
                      {[
                        { v: "left", l: "L", label: "Left-tailed (<)" },
                        { v: "two", l: "2T", label: "Two-tailed (≠)" },
                        { v: "right", l: "R", label: "Right-tailed (>)" },
                      ].map((t) => (
                        <Tooltip key={t.v}>
                          <TooltipTrigger
                            render={
                              <ToggleGroupItem
                                value={t.v}
                                aria-label={t.label}
                                className="h-7 flex-1 px-1 text-[11px]"
                              >
                                {t.l}
                              </ToggleGroupItem>
                            }
                          />
                          <TooltipContent>{t.label}</TooltipContent>
                        </Tooltip>
                      ))}
                    </ToggleGroup>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="h-56 w-full rounded-lg border border-border/70 bg-muted/20 p-3">
                  <ChartContainer
                    config={{}}
                    className="aspect-auto h-full w-full"
                    aria-hidden="true"
                  >
                    <AreaChart
                      data={curveData}
                      margin={{ top: 10, right: 10, bottom: 8, left: 10 }}
                      accessibilityLayer={false}
                    >
                      <CartesianGrid
                        vertical
                        horizontal={false}
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                      />
                      <XAxis
                        dataKey="x"
                        type="number"
                        domain={[-4, 4]}
                        ticks={[-3, -2, -1, 0, 1, 2, 3]}
                        tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis hide domain={[0, 0.43]} />
                      <Area
                        dataKey="accept"
                        type="monotone"
                        stroke="var(--muted-foreground)"
                        strokeWidth={1.25}
                        fill="var(--accept)"
                        fillOpacity={0.18}
                        connectNulls={false}
                        isAnimationActive={false}
                      />
                      <Area
                        dataKey="reject"
                        type="monotone"
                        stroke="var(--reject)"
                        strokeWidth={1.5}
                        fill="var(--reject)"
                        fillOpacity={0.4}
                        connectNulls={false}
                        isAnimationActive={false}
                      />
                      <ReferenceLine x={ztest.z} stroke="var(--primary)" strokeWidth={2} />
                    </AreaChart>
                  </ChartContainer>
                </div>
              </CardContent>

              <CardFooter className="justify-between border-t border-border/60 bg-muted/30 py-3">
                <span className="font-mono text-xs text-muted-foreground">
                  μ₀ = 500 · σ = 30 · n = 36
                </span>
                <Button asChild size="sm" variant="outline" className="h-7 rounded-md px-3 text-xs">
                  <Link href="/hypothesis">
                    Full Z-Test Lab
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: QUICK CALCULATORS */}
        <TabsContent value="calculators" className="grid gap-4 md:grid-cols-2">
          <Card className="rounded-xl shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Crosshair className="size-4 text-primary" aria-hidden="true" />
                Critical Value (z*) Matrix
              </CardTitle>
              <CardDescription className="text-xs">
                Standard normal critical thresholds across significance levels α
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <span
                              tabIndex={0}
                              className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            >
                              Alpha (α)
                            </span>
                          }
                        />
                        <TooltipContent>
                          Level of significance α (Type I error probability)
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="text-xs">Confidence</TableHead>
                    <TableHead className="text-right font-mono text-xs">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <span
                              tabIndex={0}
                              className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            >
                              Left-Tailed
                            </span>
                          }
                        />
                        <TooltipContent>
                          Critical cutoff for Hₐ: μ &lt; μ₀ (lower rejection tail)
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="text-right font-mono text-xs">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <span
                              tabIndex={0}
                              className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            >
                              Right-Tailed
                            </span>
                          }
                        />
                        <TooltipContent>
                          Critical cutoff for Hₐ: μ &gt; μ₀ (upper rejection tail)
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                    <TableHead className="text-right font-mono text-xs">
                      <Tooltip>
                        <TooltipTrigger
                          render={
                            <span
                              tabIndex={0}
                              className="focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                            >
                              Two-Tailed
                            </span>
                          }
                        />
                        <TooltipContent>
                          Critical cutoffs for Hₐ: μ ≠ μ₀ (split rejection tails ±z*)
                        </TooltipContent>
                      </Tooltip>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {["0.10", "0.05", "0.01"].map((a) => {
                    const left = criticalZ(Number(a), "left");
                    const right = criticalZ(Number(a), "right");
                    const two = criticalZ(Number(a), "two");
                    return (
                      <TableRow key={a}>
                        <TableCell className="font-mono text-xs font-medium">{a}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatNumber((1 - Number(a)) * 100, 0)}%
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums">
                          {formatNumber(left.lower, decimals)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs tabular-nums">
                          +{formatNumber(right.upper, decimals)}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold tabular-nums">
                          ±{formatNumber(two.upper, decimals)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-xs">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <SlidersHorizontal className="size-4 text-primary" aria-hidden="true" />
                Correlation Strength Evaluator
              </CardTitle>
              <CardDescription className="text-xs">
                Enter any Pearson r value in [−1, 1] to evaluate direction and R²
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Input
                  value={rInput}
                  onChange={(e) => setRInput(e.target.value)}
                  aria-label="Pearson correlation coefficient r"
                  className="h-9 max-w-[160px] font-mono text-sm"
                  placeholder="0.85"
                />
                {rReading ? (
                  <Badge variant="secondary" className="h-7 rounded-md px-3 text-xs">
                    {rReading.strength === "None"
                      ? "No linear relationship"
                      : `${rReading.strength} ${rReading.direction}`}
                  </Badge>
                ) : (
                  <Badge variant="destructive" className="h-7 rounded-md px-3 text-xs">
                    Out of range [−1, 1]
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 rounded-lg border border-border bg-muted/20 p-3 font-mono text-xs">
                <div>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span
                          tabIndex={0}
                          className="block font-sans text-[11px] text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          r value
                        </span>
                      }
                    />
                    <TooltipContent>Pearson correlation coefficient (−1 ≤ r ≤ +1)</TooltipContent>
                  </Tooltip>
                  <span className="mt-0.5 block text-sm font-semibold">
                    {validR && parsedR !== null ? formatNumber(parsedR, decimals) : "—"}
                  </span>
                </div>
                <div>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span
                          tabIndex={0}
                          className="block font-sans text-[11px] text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          R² (Coefficient)
                        </span>
                      }
                    />
                    <TooltipContent>
                      Coefficient of determination: proportion of variance in Y explained by X
                    </TooltipContent>
                  </Tooltip>
                  <span className="mt-0.5 block text-sm font-semibold">
                    {validR && parsedR !== null ? formatNumber(parsedR * parsedR, decimals) : "—"}
                  </span>
                </div>
                <div>
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <span
                          tabIndex={0}
                          className="block font-sans text-[11px] text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          Shared Variance
                        </span>
                      }
                    />
                    <TooltipContent>
                      Percentage of common variance between X and Y (r² × 100%)
                    </TooltipContent>
                  </Tooltip>
                  <span className="mt-0.5 block text-sm font-semibold">
                    {validR && parsedR !== null
                      ? `${formatNumber(parsedR * parsedR * 100, 1)}%`
                      : "—"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3: SAMPLE DATASETS */}
        <TabsContent value="datasets">
          <Card className="rounded-xl shadow-xs">
            <CardHeader>
              <CardTitle className="text-base">Curated Practice Datasets</CardTitle>
              <CardDescription className="text-xs">
                Inspect bivariate practice datasets or open directly in the Regression workspace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Dataset</TableHead>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Variables (X → Y)</TableHead>
                    <TableHead className="text-right font-mono text-xs">n</TableHead>
                    <TableHead className="text-right font-mono text-xs">Pearson r</TableHead>
                    <TableHead className="text-right text-xs">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {REGRESSION_EXAMPLES.slice(0, 8).map((item) => {
                    const calc = linearRegression(item.x, item.y);
                    const rVal = calc.ok ? calc.value.r : 0;
                    return (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs font-medium">{item.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-md text-[11px]">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {item.xLabel} → {item.yLabel}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {item.x.length}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs font-semibold tabular-nums">
                          {formatNumber(rVal, 3)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="xs" className="rounded-md">
                            <Link href="/regression">Open ↗</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
