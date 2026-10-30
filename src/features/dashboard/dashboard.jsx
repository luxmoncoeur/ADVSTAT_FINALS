"use client";

import {
  ArrowRight,
  BookOpenText,
  ChartScatter,
  FlaskConical,
  ListChecks,
  Ruler,
  ShieldCheck,
  Sigma,
  TableProperties,
} from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { Area, AreaChart, Line, Scatter, ComposedChart, XAxis, YAxis } from "recharts";
import { useSettings } from "@/components/providers";
import Aurora from "@/components/reactbits/Aurora";
import BlurText from "@/components/reactbits/BlurText";
import ShinyText from "@/components/reactbits/ShinyText";
import SpotlightCard from "@/components/reactbits/SpotlightCard";
import StarBorder from "@/components/reactbits/StarBorder";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Reveal } from "@/components/shared/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer } from "@/components/ui/chart";
import { REGRESSION_EXAMPLES } from "@/features/regression/examples";
import { buildCurve } from "@/features/hypothesis/components/normal-curve-chart";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { formatNumber } from "@/lib/format";
import { THEME_HEX } from "@/lib/theme-colors";
import { criticalZ, linearRegression, oneMeanZTest } from "@/lib/stats";

const AURORA = {
  light: { colorStops: ["#c7d2fe", "#a5f3fc", "#ddd6fe"], blend: 0.6, opacity: 0.9 },
  dark: { colorStops: ["#4f46e5", "#0e7490", "#6d28d9"], blend: 0.55, opacity: 0.65 },
};

const sample = REGRESSION_EXAMPLES[0];

function useSamples() {
  return useMemo(() => {
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
    <ChartContainer config={{}} className="aspect-auto h-36 w-full" aria-hidden="true">
      <ComposedChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }} accessibilityLayer={false}>
        <XAxis type="number" dataKey="x" domain={["dataMin - 1", "dataMax + 1"]} hide />
        <YAxis type="number" dataKey="y" domain={["dataMin - 5", "dataMax + 5"]} hide />
        <Line
          data={line}
          dataKey="y"
          stroke="var(--chart-3)"
          strokeWidth={2.5}
          dot={false}
          isAnimationActive
          animationDuration={1200}
        />
        <Scatter data={points} fill="var(--chart-1)" isAnimationActive animationDuration={900} />
      </ComposedChart>
    </ChartContainer>
  );
}

function MiniCurve({ result }) {
  const data = useMemo(() => buildCurve(result.tail, result.critical, result.z, 4), [result]);
  return (
    <ChartContainer config={{}} className="aspect-auto h-36 w-full" aria-hidden="true">
      <AreaChart
        data={data}
        margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
        accessibilityLayer={false}
      >
        <XAxis dataKey="x" type="number" domain={[-4, 4]} hide />
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

function ModuleCard({ href, icon: Icon, eyebrow, title, description, preview, footer, theme }) {
  return (
    <SpotlightCard
      theme={theme}
      spotlightColor="var(--primary)"
      intensity={theme === "dark" ? 0.2 : 0.55}
      spotlightSize={320}
      className="group h-full rounded-2xl"
      style={{
        "--spotlight-card-surface": "var(--card)",
        "--spotlight-card-border": "var(--border)",
      }}
    >
      <Link
        href={href}
        className="flex h-full flex-col gap-4 rounded-2xl p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[0_8px_24px_-10px_var(--primary)]"
            aria-hidden="true"
          >
            <Icon className="size-5" />
          </span>
          <Badge variant="secondary" className="rounded-full">
            {eyebrow}
          </Badge>
        </div>
        <div className="space-y-1.5">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className="rounded-xl border bg-background/60 p-2">{preview}</div>
        <div className="mt-auto flex items-center justify-between gap-3 text-sm">
          <span className="font-mono text-xs text-muted-foreground">{footer}</span>
          <span className="flex items-center gap-1 font-medium text-primary">
            Open{" "}
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </span>
        </div>
      </Link>
    </SpotlightCard>
  );
}

const FEATURES = [
  {
    icon: ListChecks,
    title: "Step-by-step solutions",
    text: "Every formula is shown with your numbers substituted, plus what each result means.",
  },
  {
    icon: TableProperties,
    title: "Z-table lookups",
    text: "See exactly which cell of the standard normal table gives the critical value.",
  },
  {
    icon: Ruler,
    title: "Precise to 15 digits",
    text: "Computed in double precision; you choose 2–6 decimal places for display.",
  },
  {
    icon: ShieldCheck,
    title: "Verified results",
    text: "Checked against SciPy and statsmodels with thousands of automated tests.",
  },
];

export function Dashboard() {
  const theme = useResolvedTheme();
  const colors = THEME_HEX[theme];
  const { decimals } = useSettings();
  const { regression, ztest } = useSamples();
  const z05 = /** @type {number} */ (criticalZ(0.05, "two").upper);

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 p-4 sm:p-6 lg:p-8">
      <section
        className="relative isolate overflow-hidden rounded-3xl border bg-card"
        aria-labelledby="hero-title"
      >
        <div className="absolute inset-x-0 top-0 -z-10 h-[85%]" aria-hidden="true">
          <Aurora {...AURORA[theme]} amplitude={1.1} speed={0.6} lightMode={theme === "light"} />
        </div>
        <div
          className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-card/40 to-card"
          aria-hidden="true"
        />
        <div
          className="bg-grid absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,black,transparent_70%)] opacity-60"
          aria-hidden="true"
        />

        <div className="flex flex-col gap-8 px-5 py-12 sm:px-10 sm:py-16 lg:flex-row lg:items-end lg:justify-between lg:px-14 lg:py-20">
          <div className="max-w-2xl space-y-5">
            <Badge
              variant="outline"
              className="gap-1.5 rounded-full bg-card/70 px-3 py-1 backdrop-blur"
            >
              <Sigma className="size-3.5" aria-hidden="true" />
              <ShinyText
                text="ADVSTAT · Advanced Statistics"
                color={colors.foreground}
                shineColor={colors.primary}
                speed={3}
                className="text-xs font-medium"
              />
            </Badge>
            <h1
              id="hero-title"
              className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
            >
              <span className="sr-only">Statistics, solved step by step.</span>
              <span aria-hidden="true">
                <BlurText
                  text="Statistics, solved step by step."
                  animateBy="words"
                  delay={110}
                  trigger="load"
                />
              </span>
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg">
              Run simple linear regression and Z-based hypothesis tests, see every formula worked
              out with your own data, and understand what the results mean.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <StarBorder
                as={Link}
                href="/regression"
                theme={theme}
                color={theme === "dark" ? "#ffffff" : colors.primary}
                backgroundColor="var(--primary)"
                textColor="var(--primary-foreground)"
                borderColor="color-mix(in oklch, var(--primary) 70%, transparent)"
                radius={12}
                className="gap-2 text-sm font-semibold"
              >
                <ChartScatter className="size-4" aria-hidden="true" /> Start with regression
              </StarBorder>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-auto rounded-xl bg-card/70 py-3.5 backdrop-blur"
              >
                <Link href="/hypothesis">
                  <FlaskConical className="size-4" aria-hidden="true" /> Run a hypothesis test
                </Link>
              </Button>
            </div>
          </div>

          <dl className="grid w-full max-w-md shrink-0 grid-cols-2 gap-3 lg:w-[22rem]">
            {[
              ["Sample r", <AnimatedNumber key="r" value={regression.r} decimals={decimals} />],
              [
                "Sample r²",
                <AnimatedNumber key="r2" value={regression.rSquared} decimals={decimals} />,
              ],
              ["z(0.025)", <AnimatedNumber key="z" value={z05} decimals={decimals} />],
              ["Z-tests", <AnimatedNumber key="n" value={4} decimals={0} kind="number" />],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl border bg-card/75 p-4 backdrop-blur">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 font-mono text-2xl font-semibold tracking-tight">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <Reveal className="h-full">
          <ModuleCard
            theme={theme}
            href="/regression"
            icon={ChartScatter}
            eyebrow="Module 1"
            title="Simple Linear Regression"
            description="Regression equation, correlation coefficient r, strength of relationship and a scatter diagram with the fitted line."
            preview={<MiniScatter result={regression} />}
            footer={`Ŷ = ${formatNumber(regression.intercept, 2, { fixed: true })} + ${formatNumber(regression.slope, 2, { fixed: true })}X`}
          />
        </Reveal>
        <Reveal className="h-full" delay={0.08}>
          <ModuleCard
            theme={theme}
            href="/hypothesis"
            icon={FlaskConical}
            eyebrow="Module 2"
            title="Hypothesis Testing"
            description="One- and two-sample z-tests for means and proportions with critical values, p-values, a decision and the normal curve."
            preview={<MiniCurve result={ztest} />}
            footer={`z = ${formatNumber(ztest.z, 2, { fixed: true })} · ${ztest.reject ? "Reject H₀" : "Fail to reject H₀"}`}
          />
        </Reveal>
      </div>

      <Reveal>
        <section aria-labelledby="how-title" className="rounded-2xl border bg-card p-5 sm:p-8">
          <h2 id="how-title" className="text-lg font-semibold tracking-tight">
            How it works
          </h2>
          <ol className="mt-5 grid gap-6 md:grid-cols-3">
            {[
              [
                "Enter your data",
                "Type values, paste from a spreadsheet, upload a CSV, or load a sample dataset.",
              ],
              [
                "Compute",
                "Results, charts and the decision appear instantly, rounded to the decimals you choose.",
              ],
              [
                "Learn from the solution",
                "Open the step-by-step solution to see each formula with your numbers and what it means.",
              ],
            ].map(([title, text], index) => (
              <li key={title} className="relative flex gap-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-primary font-mono text-sm font-semibold text-primary">
                  {index + 1}
                </span>
                <span className="space-y-1">
                  <span className="block font-medium">{title}</span>
                  <span className="block text-sm leading-relaxed text-muted-foreground">
                    {text}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      </Reveal>

      <Reveal className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" stagger={0.08}>
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-2xl border bg-card p-5 transition-shadow hover:shadow-lg"
          >
            <feature.icon className="size-5 text-primary" aria-hidden="true" />
            <h3 className="mt-3 font-medium">{feature.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{feature.text}</p>
          </div>
        ))}
      </Reveal>

      <Reveal>
        <Link
          href="/learn"
          className="group flex flex-col gap-3 rounded-2xl border border-dashed p-5 transition-colors hover:border-primary/60 hover:bg-accent/40 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-center gap-3">
            <BookOpenText className="size-5 text-primary" aria-hidden="true" />
            <span>
              <span className="block font-medium">Formulas & Z-table reference</span>
              <span className="block text-sm text-muted-foreground">
                Every formula used, the r interpretation scale, critical values and a full z-table.
              </span>
            </span>
          </span>
          <ArrowRight
            className="size-5 text-primary transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </Reveal>
    </div>
  );
}
