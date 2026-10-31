"use client";

import {
  ArrowRight,
  BookOpenText,
  ChartScatter,
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
  Scatter,
  XAxis,
  YAxis,
} from "recharts";
import { useSettings } from "@/components/providers";
import Aurora from "@/components/reactbits/Aurora";
import BlurText from "@/components/reactbits/BlurText";
import RubberSegment from "@/components/reactbits/RubberSegment";
import ShinyText from "@/components/reactbits/ShinyText";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import StarBorder from "@/components/reactbits/StarBorder";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { NumberField } from "@/components/shared/number-field";
import { Reveal } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer } from "@/components/ui/chart";
import { buildCurve } from "@/features/hypothesis/components/normal-curve-chart";
import { REGRESSION_EXAMPLES } from "@/features/regression/examples";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { formatNumber } from "@/lib/format";
import {
  classifyCorrelation,
  criticalZ,
  linearRegression,
  oneMeanZTest,
  parseNumber,
} from "@/lib/stats";
import { THEME_HEX } from "@/lib/theme-colors";
import { cn } from "@/lib/utils";

const AURORA = {
  light: { colorStops: ["#c7d2fe", "#a5f3fc", "#ddd6fe"], blend: 0.6, opacity: 0.85 },
  dark: { colorStops: ["#4f46e5", "#0e7490", "#6d28d9"], blend: 0.55, opacity: 0.55 },
};

const SEGMENT = {
  trackColor: "var(--muted)",
  thumbColor: "var(--card)",
  textColor: "var(--foreground)",
  activeTextColor: "var(--foreground)",
};

function useSamples() {
  return useMemo(() => {
    const sample = REGRESSION_EXAMPLES[0];
    const regression = linearRegression(sample.x, sample.y);
    const ztest = oneMeanZTest({
      sampleMean: 510,
      mu0: 500,
      sigma: 30,
      n: 36,
      alpha: 0.05,
      tail: "two",
    });
    if (!regression.ok || !ztest.ok) throw new Error("Sample data must compute");
    return { regression: regression.value, ztest: ztest.value };
  }, []);
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
        <XAxis type="number" dataKey="x" domain={["dataMin - 1", "dataMax + 1"]} hide />
        <YAxis type="number" dataKey="y" domain={["dataMin - 5", "dataMax + 5"]} hide />
        <Line
          data={line}
          dataKey="y"
          stroke="var(--chart-3)"
          strokeWidth={2.5}
          dot={false}
          animationDuration={1200}
        />
        <Scatter data={points} fill="var(--chart-1)" animationDuration={900} />
      </ComposedChart>
    </ChartContainer>
  );
}

function MiniCurve({ result }) {
  const data = useMemo(() => buildCurve(result.tail, result.critical, result.z, 4), [result]);
  return (
    <ChartContainer config={{}} className="aspect-auto h-32 w-full" aria-hidden="true">
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
        accessibilityLayer={false}
      >
        <CartesianGrid vertical horizontal={false} strokeDasharray="3 3" />
        <XAxis dataKey="x" type="number" domain={[-4, 4]} ticks={[-3, -2, -1, 0, 1, 2, 3]} hide />
        <YAxis hide domain={[0, 0.43]} />
        <Area
          dataKey="accept"
          type="linear"
          stroke="none"
          fill="var(--accept)"
          fillOpacity={0.22}
          connectNulls={false}
          animationDuration={1000}
        />
        <Area
          dataKey="reject"
          type="linear"
          stroke="none"
          fill="var(--reject)"
          fillOpacity={0.45}
          connectNulls={false}
          animationDuration={1000}
        />
        <Area
          dataKey="density"
          type="linear"
          stroke="var(--foreground)"
          strokeWidth={1.75}
          fill="none"
          isAnimationActive={false}
        />
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
      className={cn("group h-full rounded-2xl", className)}
      style={{
        "--spotlight-card-surface": "var(--card)",
        "--spotlight-card-border": "var(--border)",
      }}
    >
      <Link
        href={href}
        className="flex h-full flex-col gap-3 rounded-2xl p-4 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-5"
      >
        <div className="flex items-center gap-3">
          <span
            className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[0_6px_18px_-8px_var(--primary)]"
            aria-hidden="true"
          >
            <Icon className="size-4.5" />
          </span>
          <h2 className="font-semibold tracking-tight">{title}</h2>
          <Badge variant="secondary" className="ml-auto rounded-full">
            {eyebrow}
          </Badge>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        <div className="flex min-h-32 flex-1 rounded-xl border bg-background/60 p-1.5 [&>[data-slot=chart]]:h-full">
          {preview}
        </div>
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="font-mono text-xs text-muted-foreground">{footer}</span>
          <span className="flex items-center gap-1 font-medium text-primary">
            Open{" "}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </SpotlightCard>
  );
}

/** Quick tool: critical z for any common α and tail, computed with the same engine. */
function CriticalZTool() {
  const { decimals } = useSettings();
  const [alpha, setAlpha] = useState("0.05");
  const [tail, setTail] = useState("two");
  const critical = criticalZ(Number(alpha), /** @type {'two'|'left'|'right'} */ (tail));
  const value = /** @type {number} */ (tail === "left" ? critical.lower : critical.upper);
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Crosshair className="size-4 text-primary" aria-hidden="true" /> Critical z finder
        </CardTitle>
        <CardDescription className="text-xs">No z-table needed.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5 px-4">
        <RubberSegment
          aria-label="Level of significance"
          items={["0.10", "0.05", "0.01"]}
          value={alpha}
          onChange={setAlpha}
          size="sm"
          className="w-full font-mono"
          {...SEGMENT}
        />
        <RubberSegment
          aria-label="Tail"
          items={[
            { value: "left", label: "Left" },
            { value: "two", label: "Two" },
            { value: "right", label: "Right" },
          ]}
          value={tail}
          onChange={setTail}
          size="sm"
          className="w-full"
          {...SEGMENT}
        />
        <p className="pt-1 font-mono text-2xl font-semibold tracking-tight" aria-live="polite">
          z = {tail === "two" ? "±" : ""}
          <AnimatedNumber
            value={tail === "two" ? Math.abs(value) : value}
            decimals={decimals}
            duration={0.5}
          />
        </p>
      </CardContent>
    </Card>
  );
}

/** Quick tool: interpret any r on the strength scale. */
function RInterpreterTool() {
  const [text, setText] = useState("0.85");
  const r = parseNumber(text);
  const valid = r !== null && r >= -1 && r <= 1;
  const reading = valid ? classifyCorrelation(r) : null;
  return (
    <Card className="gap-3 py-4">
      <CardHeader className="px-4">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Activity className="size-4 text-primary" aria-hidden="true" /> r interpreter
        </CardTitle>
        <CardDescription className="text-xs">How strong is a correlation?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2.5 px-4">
        <NumberField
          name="quick-r"
          label="Correlation r"
          symbol="−1 to 1"
          value={text}
          onChange={setText}
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
  const colors = THEME_HEX[theme];
  const { decimals } = useSettings();
  const { regression, ztest } = useSamples();

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 sm:p-6">
      <section
        className="relative isolate overflow-hidden rounded-2xl border bg-card"
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
          className="absolute inset-0 -z-10 bg-gradient-to-r from-card via-card/80 to-card/30"
          aria-hidden="true"
        />
        <div
          className="bg-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_right,transparent,black_70%)] opacity-50"
          aria-hidden="true"
        />

        <div className="grid items-center gap-6 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div className="max-w-2xl space-y-3">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full bg-card/80 px-3 py-1 backdrop-blur"
            >
              <Sigma className="size-3.5" aria-hidden="true" />
              <ShinyText
                text="ADVSTAT · Statistics Lab"
                color={colors.foreground}
                shineColor={colors.primary}
                speed={3}
                delay={3}
                className="text-xs font-medium"
              />
            </Badge>
            <h1
              id="hero-title"
              className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
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
            <div className="flex flex-wrap gap-2 pt-1">
              <StarBorder
                as={Link}
                href="/regression"
                theme={theme}
                color={theme === "dark" ? "#ffffff" : colors.primary}
                backgroundColor="var(--primary)"
                textColor="var(--primary-foreground)"
                borderColor="color-mix(in oklch, var(--primary) 70%, transparent)"
                radius={10}
                className="gap-2 px-4 py-2.5 text-sm font-semibold"
              >
                <ChartScatter className="size-4" aria-hidden="true" /> Linear regression
              </StarBorder>
              <Button
                asChild
                variant="outline"
                className="h-auto rounded-[10px] bg-card/80 px-4 py-2.5 backdrop-blur"
              >
                <Link href="/hypothesis">
                  <FlaskConical className="size-4" aria-hidden="true" /> Hypothesis test
                </Link>
              </Button>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
            {[
              ["Sample r", <AnimatedNumber key="r" value={regression.r} decimals={decimals} />],
              [
                "Sample r²",
                <AnimatedNumber key="r2" value={regression.rSquared} decimals={decimals} />,
              ],
              ["Sample z", <AnimatedNumber key="z" value={ztest.z} decimals={decimals} />],
              [
                "p-value",
                <AnimatedNumber key="p" value={ztest.pValue} decimals={decimals} kind="p" />,
              ],
            ].map(([label, value]) => (
              <div
                key={String(label)}
                className="min-w-[8.5rem] rounded-xl border bg-card/80 px-3.5 py-2.5 backdrop-blur"
              >
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-0.5 font-mono text-xl font-semibold tracking-tight">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-12">
        <Reveal className="h-full xl:col-span-5" distance={16}>
          <ModuleCard
            theme={theme}
            href="/regression"
            icon={ChartScatter}
            eyebrow="Module 1"
            title="Linear Regression"
            description="Equation, r, strength of relationship and a scatter diagram with the fitted line."
            preview={<MiniScatter result={regression} />}
            footer={`Ŷ = ${formatNumber(regression.intercept, 2, { fixed: true })} + ${formatNumber(regression.slope, 2, { fixed: true })}X · ${REGRESSION_EXAMPLES.length} datasets`}
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
            footer={`z = ${formatNumber(ztest.z, 2, { fixed: true })} · ${ztest.reject ? "Reject H₀" : "Fail to reject H₀"}`}
          />
        </Reveal>
        <Reveal
          className="grid gap-4 md:col-span-2 md:grid-cols-2 xl:col-span-3 xl:grid-cols-1"
          distance={16}
          delay={0.12}
        >
          <CriticalZTool />
          <RInterpreterTool />
        </Reveal>
      </div>

      <Reveal className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" distance={12}>
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3"
          >
            <feature.icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
            <p className="text-sm">
              <span className="font-medium">{feature.title}.</span>{" "}
              <span className="text-muted-foreground">{feature.text}</span>
            </p>
          </div>
        ))}
        <Link
          href="/learn"
          className="group flex items-center gap-3 rounded-xl border border-dashed px-4 py-3 transition-colors hover:border-primary/60 hover:bg-accent/40"
        >
          <BookOpenText className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="text-sm font-medium">Formulas & z-table</span>
          <ArrowRight
            className="ml-auto size-4 text-primary transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            aria-hidden="true"
          />
        </Link>
      </Reveal>
    </div>
  );
}
