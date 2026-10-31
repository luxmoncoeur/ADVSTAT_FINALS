"use client";

import {
  ArrowRight,
  BookOpenText,
  ChartScatter,
  ChevronLeft,
  ChevronRight,
  Crosshair,
  FlaskConical,
  ListChecks,
  Ruler,
  ShieldCheck,
  Sigma,
  Activity,
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
import Aurora from "@/components/reactbits/Aurora";
import BlurText from "@/components/reactbits/BlurText";
import RubberSegment from "@/components/reactbits/RubberSegment";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { NumberField } from "@/components/shared/number-field";
import { Reveal } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { Slider } from "@/components/ui/slider";
import { buildCurve } from "@/features/hypothesis/components/normal-curve-chart";
import { equationText } from "@/features/regression/components/regression-results";
import { REGRESSION_EXAMPLES } from "@/features/regression/examples";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { paddedDomain } from "@/lib/chart-utils";
import { formatNumber, formatPValue } from "@/lib/format";
import { classifyCorrelation, linearRegression, parseNumber } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { whatIfZTest } from "./what-if";

const AURORA = {
  light: { colorStops: ["#c7d2fe", "#a5f3fc", "#ddd6fe"], blend: 0.6, opacity: 0.85 },
  dark: { colorStops: ["#4f46e5", "#0e7490", "#6d28d9"], blend: 0.55, opacity: 0.55 },
};

const Z_RANGE = 4;
const TAIL_NAMES = { two: "two-tailed", left: "left-tailed", right: "right-tailed" };

/** r as plain ASCII text so the r interpreter's parser accepts it. */
const rText = (r) => (r === null ? "" : r.toFixed(4));

/** @param {number} index */
function computeRegression(index) {
  const dataset = REGRESSION_EXAMPLES[index];
  const outcome = linearRegression(dataset.x, dataset.y);
  if (!outcome.ok) throw new Error(`Dataset ${dataset.id} must compute`);
  return outcome.value;
}

function MiniScatter({ result }) {
  const points = result.rows.map((row) => ({ x: row.x, y: row.y }));
  const line = [result.minX, result.maxX].map((x) => ({
    x,
    y: result.intercept + result.slope * x,
  }));
  return (
    <ChartContainer config={{}} className="aspect-auto h-32 w-full" aria-hidden="true">
      <ComposedChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }} accessibilityLayer={false}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" dataKey="x" domain={paddedDomain(points.map((p) => p.x))} hide />
        <YAxis
          type="number"
          dataKey="y"
          domain={paddedDomain([...points, ...line].map((p) => p.y))}
          hide
        />
        <Line
          data={line}
          dataKey="y"
          stroke="var(--chart-3)"
          strokeWidth={2.5}
          dot={false}
          animationDuration={600}
        />
        <Scatter data={points} fill="var(--chart-1)" animationDuration={500} />
      </ComposedChart>
    </ChartContainer>
  );
}

function MiniCurve({ result }) {
  const data = useMemo(() => buildCurve(result.tail, result.critical, result.z, Z_RANGE), [result]);
  return (
    <ChartContainer config={{}} className="aspect-auto h-32 w-full" aria-hidden="true">
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
        accessibilityLayer={false}
      >
        <CartesianGrid vertical horizontal={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="x"
          type="number"
          domain={[-Z_RANGE, Z_RANGE]}
          ticks={[-3, -2, -1, 0, 1, 2, 3]}
          hide
        />
        <YAxis hide domain={[0, 0.43]} />
        {/* The curve follows the slider, so its fills update without re-animating. */}
        <Area
          dataKey="accept"
          type="linear"
          stroke="none"
          fill="var(--accept)"
          fillOpacity={0.22}
          connectNulls={false}
          isAnimationActive={false}
        />
        <Area
          dataKey="reject"
          type="linear"
          stroke="none"
          fill="var(--reject)"
          fillOpacity={0.45}
          connectNulls={false}
          isAnimationActive={false}
        />
        <Area
          dataKey="density"
          type="linear"
          stroke="var(--foreground)"
          strokeWidth={1.75}
          fill="none"
          isAnimationActive={false}
        />
        <ReferenceLine x={result.z} stroke="var(--primary)" strokeWidth={2.5} />
      </AreaChart>
    </ChartContainer>
  );
}

function ModuleCard({
  href,
  icon: Icon,
  eyebrow,
  title,
  description,
  preview,
  controls,
  footer,
  theme,
  className,
}) {
  return (
    <SpotlightCard
      theme={theme}
      spotlightColor="var(--primary)"
      intensity={theme === "dark" ? 0.2 : 0.5}
      spotlightSize={300}
      className={cn("h-full rounded-2xl", className)}
      style={{
        "--spotlight-card-surface": "var(--card)",
        "--spotlight-card-border": "var(--border)",
      }}
    >
      <div className="flex h-full flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <span
            className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_4px_14px_-4px_var(--primary)]"
            aria-hidden="true"
          >
            <Icon className="size-4.5" />
          </span>
          <h2 className="font-semibold tracking-[-0.015em] text-foreground">{title}</h2>
          <Badge variant="secondary" className="ml-auto rounded-full font-medium">
            {eyebrow}
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="flex min-h-32 flex-1 rounded-xl border border-border/60 bg-background/60 p-1.5 [&>[data-slot=chart]]:h-full">
          {preview}
        </div>
        {controls}
        <div className="flex items-center justify-between gap-3 border-t pt-3 text-sm">
          <span className="min-w-0 truncate font-mono text-xs text-muted-foreground tabular-nums">
            {footer}
          </span>
          <Link
            href={href}
            aria-label={`Open ${title}`}
            className="group flex shrink-0 items-center gap-1 rounded-md font-medium text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Open{" "}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </SpotlightCard>
  );
}

/** Previous / next through the sample datasets. */
function DatasetStepper({ index, onChange }) {
  const dataset = REGRESSION_EXAMPLES[index];
  const count = REGRESSION_EXAMPLES.length;
  const step = (delta) => onChange((index + delta + count) % count);
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        className="size-8 shrink-0"
        onClick={() => step(-1)}
        aria-label="Previous dataset"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
      </Button>
      <div className="min-w-0 flex-1 text-center" aria-live="polite">
        <p className="truncate text-sm font-medium">{dataset.name}</p>
        <p className="text-xs text-muted-foreground">
          {dataset.category} · {index + 1} of {count}
        </p>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="size-8 shrink-0"
        onClick={() => step(1)}
        aria-label="Next dataset"
      >
        <ChevronRight className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

/** Drag an observed z and watch it cross between the regions. */
function ZSlider({ value, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between text-sm">
        <span id="what-if-z" className="font-medium">
          Try a z value
        </span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          z = {formatNumber(value, 2, { fixed: true })}
        </span>
      </div>
      <Slider
        min={-Z_RANGE}
        max={Z_RANGE}
        step={0.01}
        value={[value]}
        onValueChange={([next]) => onChange(next)}
        thumbLabel="Observed z"
        aria-labelledby="what-if-z"
        className="py-1.5 [&_[data-slot=slider-thumb]]:size-4 [&_[data-slot=slider-track]]:h-1.5"
      />
    </div>
  );
}

/** Quick tool: critical z for any common α and tail; also drives the curve. */
function CriticalZTool({ alpha, tail, onAlphaChange, onTailChange, critical }) {
  const { decimals } = useSettings();
  const value = /** @type {number} */ (tail === "left" ? critical.lower : critical.upper);
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Crosshair className="size-4 text-primary" aria-hidden="true" /> Critical z finder
        </CardTitle>
        <CardDescription className="text-xs">
          Also sets α and the tail of the curve.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5 px-4">
        <RubberSegment
          aria-label="Level of significance"
          items={["0.10", "0.05", "0.01"]}
          value={alpha}
          onChange={onAlphaChange}
          size="sm"
          className="w-full font-mono"
        />
        <RubberSegment
          aria-label="Tail"
          items={[
            { value: "left", label: "Left" },
            { value: "two", label: "Two" },
            { value: "right", label: "Right" },
          ]}
          value={tail}
          onChange={onTailChange}
          size="sm"
          className="w-full"
        />
        <p className="pt-1 font-mono text-2xl font-semibold tracking-tight" aria-live="polite">
          z = {tail === "two" ? "±" : ""}
          <AnimatedNumber
            value={tail === "two" ? Math.abs(value) : value}
            decimals={decimals}
            duration={0.4}
          />
        </p>
      </CardContent>
    </Card>
  );
}

/** Quick tool: interpret any r on the strength scale; follows the dataset until edited. */
function RInterpreterTool({ text, onChange, source }) {
  const r = parseNumber(text);
  const valid = r !== null && r >= -1 && r <= 1;
  const reading = valid ? classifyCorrelation(r) : null;
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="size-4 text-primary" aria-hidden="true" /> r interpreter
        </CardTitle>
        <CardDescription className="truncate text-xs">
          {source ? `From “${source}”. Type any r.` : "How strong is a correlation?"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5 px-4">
        <NumberField
          name="quick-r"
          label="Correlation r"
          symbol="−1 to 1"
          value={text}
          onChange={onChange}
          error={text.trim() !== "" && !valid ? "Enter a number from −1 to 1" : null}
        />
        <div className="space-y-1.5" aria-live="polite">
          <div
            className="relative h-2 rounded-full bg-[linear-gradient(90deg,var(--chart-5),var(--muted)_50%,var(--chart-1))]"
            aria-hidden="true"
          >
            {valid ? (
              <span
                className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-foreground transition-[left] duration-500 motion-reduce:transition-none"
                style={{ left: `${((r + 1) / 2) * 100}%` }}
              />
            ) : null}
          </div>
          <p className="text-sm font-medium">
            {reading
              ? reading.strength === "None"
                ? "No linear relationship"
                : `${reading.strength} ${reading.direction}`
              : "—"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

const FEATURES = [
  { icon: ListChecks, title: "Step-by-step", text: "Every formula with your numbers." },
  { icon: Ruler, title: "Precise", text: "Double precision, 2–6 decimals shown." },
  { icon: ShieldCheck, title: "Verified", text: "Checked against SciPy & statsmodels." },
];

export function Dashboard() {
  const theme = useResolvedTheme();
  const { decimals } = useSettings();

  // Shared state: the dataset drives the scatter, r, r² and the r interpreter;
  // α, the tail and the z slider drive the curve, z, p-value and verdict.
  const [datasetIndex, setDatasetIndex] = useState(0);
  const [rInput, setRInput] = useState(() => rText(computeRegression(0).r));
  const [rFromDataset, setRFromDataset] = useState(true);
  const [alpha, setAlpha] = useState("0.05");
  const [tail, setTail] = useState(/** @type {'two'|'left'|'right'} */ ("two"));
  const [z, setZ] = useState(2);

  const dataset = REGRESSION_EXAMPLES[datasetIndex];
  const regression = useMemo(() => computeRegression(datasetIndex), [datasetIndex]);
  const ztest = useMemo(() => whatIfZTest(z, Number(alpha), tail), [z, alpha, tail]);

  const pickDataset = (index) => {
    setDatasetIndex(index);
    setRInput(rText(computeRegression(index).r));
    setRFromDataset(true);
  };
  const typeR = (text) => {
    setRInput(text);
    setRFromDataset(false);
  };

  const verdictTone = ztest.reject ? "text-reject" : "text-accept";
  const stats = [
    {
      label: "Correlation r",
      value:
        regression.r === null ? (
          "—"
        ) : (
          <AnimatedNumber value={regression.r} decimals={decimals} duration={0.6} />
        ),
    },
    {
      label: "r²",
      value:
        regression.rSquared === null ? (
          "—"
        ) : (
          <AnimatedNumber value={regression.rSquared} decimals={decimals} duration={0.6} />
        ),
    },
    // z and p follow the slider, so they update instantly instead of counting up.
    {
      label: "Test z",
      value: (
        <span className="tabular-nums">{formatNumber(ztest.z, decimals, { fixed: true })}</span>
      ),
    },
    {
      label: "p-value",
      value: (
        <span className={cn("tabular-nums", verdictTone)}>
          {formatPValue(ztest.pValue, decimals)}
        </span>
      ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 sm:p-6">
      <section
        className="relative isolate overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)] dark:border-white/10 dark:shadow-[0_4px_24px_-6px_rgba(0,0,0,0.35)]"
        aria-labelledby="hero-title"
      >
        <div className="absolute inset-0 -z-10" aria-hidden="true">
          <Aurora
            {...AURORA[theme]}
            amplitude={0.9}
            speed={0.5}
            lightMode={theme === "light"}
            height={0.6}
          />
        </div>
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-r from-card via-card/85 to-card/40"
          aria-hidden="true"
        />

        <div className="grid items-center gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-2xl space-y-3">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full border-border/60 bg-card/80 px-3 py-1 backdrop-blur-md"
            >
              <Sigma className="size-3.5 text-primary" aria-hidden="true" />
              <span className="text-xs font-semibold tracking-tight text-foreground">
                ADVSTAT · Statistics Lab
              </span>
            </Badge>
            <h1
              id="hero-title"
              className="text-3xl font-semibold tracking-[-0.025em] text-balance text-foreground sm:text-4xl"
            >
              <span className="sr-only">Statistics, solved step by step.</span>
              <span aria-hidden="true">
                <BlurText
                  text="Statistics, solved step by step."
                  animateBy="words"
                  delay={90}
                  trigger="load"
                />
              </span>
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-pretty text-muted-foreground sm:text-base">
              Regression and z-tests with your own data, a clear verdict, and every formula worked
              out.
            </p>
            <div className="flex flex-wrap gap-2.5 pt-1">
              <Button
                asChild
                className="h-auto rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_14px_-4px_var(--primary)] hover:bg-primary/90"
              >
                <Link href="/regression">
                  <ChartScatter className="size-4" aria-hidden="true" /> Linear regression
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto rounded-xl border-border/80 bg-card/80 px-4 py-2.5 backdrop-blur-md hover:bg-muted/70"
              >
                <Link href="/hypothesis">
                  <FlaskConical className="size-4" aria-hidden="true" /> Hypothesis test
                </Link>
              </Button>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-2">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="min-w-[8.5rem] rounded-xl border border-border/60 bg-card/85 px-3.5 py-2.5 shadow-xs backdrop-blur-md dark:border-white/10"
              >
                <dt className="text-xs font-medium text-muted-foreground">{stat.label}</dt>
                <dd className="mt-0.5 font-mono text-xl font-semibold tracking-tight text-foreground tabular-nums">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
        <Reveal className="h-full xl:col-span-5" distance={16}>
          <ModuleCard
            theme={theme}
            href={`/regression?dataset=${dataset.id}`}
            icon={ChartScatter}
            eyebrow="Module 1"
            title="Linear Regression"
            description="Equation, r, strength of relationship and a scatter diagram with the fitted line."
            preview={<MiniScatter result={regression} />}
            controls={<DatasetStepper index={datasetIndex} onChange={pickDataset} />}
            footer={`${equationText(regression.intercept, regression.slope, 2)} · n = ${regression.n}`}
          />
        </Reveal>
        <Reveal className="h-full xl:col-span-4" distance={16} delay={0.06}>
          <ModuleCard
            theme={theme}
            href="/hypothesis"
            icon={FlaskConical}
            eyebrow="Module 2"
            title="Hypothesis Testing"
            description="Four z-tests with a plain-language verdict, the normal curve and critical values."
            preview={<MiniCurve result={ztest} />}
            controls={<ZSlider value={z} onChange={setZ} />}
            footer={
              <>
                α = {alpha} · {TAIL_NAMES[tail]} ·{" "}
                <span className={cn("font-semibold", verdictTone)} aria-live="polite">
                  {ztest.reject ? "Reject H₀" : "Fail to reject H₀"}
                </span>
              </>
            }
          />
        </Reveal>
        <Reveal
          className="grid gap-4 md:col-span-2 md:grid-cols-2 xl:col-span-3 xl:grid-cols-1"
          distance={16}
          delay={0.12}
        >
          <CriticalZTool
            alpha={alpha}
            tail={tail}
            onAlphaChange={setAlpha}
            onTailChange={setTail}
            critical={ztest.critical}
          />
          <RInterpreterTool
            text={rInput}
            onChange={typeR}
            source={rFromDataset ? dataset.name : null}
          />
        </Reveal>
      </div>

      <Reveal className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" distance={12}>
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card px-4 py-3 shadow-xs"
          >
            <feature.icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm">
              <span className="font-semibold text-foreground">{feature.title}.</span>{" "}
              <span className="text-muted-foreground">{feature.text}</span>
            </p>
          </div>
        ))}
        <Link
          href="/learn"
          className="group flex items-center gap-3 rounded-2xl border border-dashed border-border/80 px-4 py-3 transition-all duration-120 hover:border-primary/60 hover:bg-accent/40 active:scale-[0.985] motion-reduce:active:scale-100"
        >
          <BookOpenText className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">Formulas & z-table</span>
          <ArrowRight
            className="ml-auto size-4 text-primary transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Link>
      </Reveal>
    </div>
  );
}
