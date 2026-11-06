"use client";

import { ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import GradientASCII from "@/components/reactbits/GradientASCII";
import TechText from "@/components/reactbits/TechText";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  TypographyBlockquote,
  TypographyDisplay,
  TypographyEyebrow,
  TypographyH2,
  TypographyInlineCode,
  TypographyLead,
  TypographyMuted,
  TypographyP,
} from "@/components/ui/typography";
import { Reveal } from "@/components/shared/reveal";
import { DatasetIndex, LandingHeader } from "./landing-parts";
import { RegressionFigure } from "./regression-figure";
import { Worksheet } from "./worksheet";
import { ZTestFigure } from "./ztest-figure";

const FAQ = [
  [
    "Do I need an account?",
    "No. There is no sign-up and no login. Open the workspace and start calculating. Your numbers are computed in the browser tab you are using.",
  ],
  [
    "What can it calculate?",
    "Simple linear regression (Ŷ = a + bX, r, R², standard error, predictions and residuals) and Z-tests for means and proportions, with left, right and two-tailed decisions at α = 0.10, 0.05 or 0.01.",
  ],
  [
    "How do I know the answers are right?",
    "The calculations are tested against reference values from SciPy and statsmodels. Results are rounded only when they are displayed, never during the calculation.",
  ],
  [
    "Can I use my own data?",
    "Yes. Type pairs into the table, or paste CSV, TSV or JSON. Practice datasets are there if you only want to see how a method behaves.",
  ],
  [
    "Can I hand in the working?",
    "Every analysis can be opened as a report that prints cleanly, with the formulas, substitutions and decision rule written out.",
  ],
];

const section = "border-t";
const container = "mx-auto w-full max-w-6xl px-5 sm:px-8";

export function LandingPage() {
  const [datasetId, setDatasetId] = useState("study-hours");
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <>
      <LandingHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {/* Hero with interactive WebGL2 GradientASCII field */}
        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden="true"
            className="hero-field-mask pointer-events-none absolute inset-0 -z-10"
          >
            <GradientASCII
              colors={
                isDark
                  ? ["#1e3fd8", "#4f46e5", "#38bdf8", "#e0f2fe"]
                  : ["#1e3fd8", "#4f46e5", "#60a5fa", "#c7d2fe"]
              }
              shape="horizon"
              characters=" .=+xX0S8#@"
              mix={0.45}
              cellSize={18}
              density={0.8}
              glyphOpacity={isDark ? 0.85 : 0.8}
              gradientOpacity={isDark ? 0.78 : 0.62}
              glow={isDark ? 0.24 : 0.16}
              softness={0.58}
              flow={0.5}
              speed={0.85}
              lightMode={!isDark}
              mouseInteraction
              clickEffect="wave"
            />
          </div>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 hidden lg:block"
            style={{
              background:
                "radial-gradient(52% 64% at 24% 46%, var(--background) 36%, color-mix(in oklch, var(--background) 78%, transparent) 68%, transparent 100%)",
            }}
          />
          {/* Below lg the layout stacks: keep the field faint behind the copy at the top and let
              it come through around the chart underneath. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10 lg:hidden"
            style={{
              background:
                "linear-gradient(to bottom, color-mix(in oklch, var(--background) 88%, transparent) 0%, color-mix(in oklch, var(--background) 76%, transparent) 40%, transparent 64%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-background to-transparent"
          />

          <div
            className={`${container} grid gap-10 pt-10 pb-12 sm:pt-16 sm:pb-16 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pt-14 lg:pb-20`}
          >
            <Reveal className="lg:col-span-6">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border bg-background/70 py-1 pr-3 pl-2 text-xs text-muted-foreground backdrop-blur-sm">
                <span className="relative flex size-2" aria-hidden="true">
                  <span className="absolute inset-0 rounded-full bg-primary/40 motion-safe:animate-ping [animation-duration:2.4s]" />
                  <span className="relative size-2 rounded-full bg-primary" />
                </span>
                <span className="sm:hidden">Regression · Z-tests</span>
                <span className="hidden sm:inline">
                  Linear regression <span aria-hidden="true">·</span> Z-tests for means and proportions
                </span>
              </p>
              <TypographyDisplay className="lg:text-[2.75rem] xl:text-5xl">
                Statistics you can check, <span className="sr-only">line by line.</span>
              </TypographyDisplay>
              {/* "line by line." drawn on canvas: hover or tap a letter to inspect it.
                  The heading above already carries the words for screen readers. */}
              <div
                aria-hidden="true"
                className="font-heading text-[2.5rem] font-semibold text-foreground sm:text-5xl lg:text-[2.75rem] xl:text-5xl"
              >
                <div
                  className="-my-[0.13em] h-[1.3em]"
                  // TechText keeps a 5% inset on the left; widen it so the letters line up
                  // with the heading's left edge.
                  style={{ width: "calc(100% * 20 / 19)", marginLeft: "calc(-100% / 19 + 0.05em)" }}
                >
                  <TechText
                    text="line by line."
                    align="left"
                    fontSize={120}
                    fontWeight={600}
                    letterSpacing={-0.035}
                    accentColor={isDark ? "oklch(0.68 0.17 277)" : "oklch(0.51 0.23 277)"}
                    reveal="letter"
                    specks={8}
                    labels={false}
                    sweep={false}
                    intro="type"
                    introDuration={1.4}
                  />
                </div>
              </div>
              <TypographyLead className="mt-6">
                Fit a regression line or run a Z-test, then read every sum, formula and decision
                rule behind the answer, right beside the graph it describes.
              </TypographyLead>
              <div className="mt-8 grid gap-3 sm:flex sm:flex-wrap sm:items-center">
                <Button asChild size="lg" className="h-11 px-5 text-[15px]">
                  <Link href="/dashboard">
                    Open the workspace
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="h-11 bg-background/85 px-5 text-[15px] backdrop-blur-xs"
                >
                  <Link href="/regression?example=study-hours#results">See a worked example</Link>
                </Button>
              </div>
              <TypographyMuted className="mt-4">
                Free to use. Nothing to sign up for.
              </TypographyMuted>
            </Reveal>
            <Reveal delay={0.08} distance={24} className="min-w-0 lg:col-span-6">
              <RegressionFigure datasetId={datasetId} onDatasetChange={setDatasetId} />
            </Reveal>
          </div>
        </section>

        {/* Worksheet */}
        <section className={section} aria-labelledby="worksheet-title">
          <div className={`${container} grid gap-8 py-12 sm:py-16 lg:grid-cols-12 lg:gap-14 lg:py-20`}>
            <div className="lg:col-span-4">
              <TypographyEyebrow index="01">Worked sums</TypographyEyebrow>
              <TypographyH2 id="worksheet-title">Every number shows its source.</TypographyH2>
              <TypographyP className="mt-4">
                A calculator hands you <TypographyInlineCode>b = 7.5</TypographyInlineCode> and
                moves on. Here the sums, the sums of squares and the formula for each result sit in
                one table, recomputed the moment you change the data.
              </TypographyP>
            </div>
            <div className="min-w-0 lg:col-span-8">
              <Worksheet datasetId={datasetId} />
            </div>
          </div>
        </section>

        {/* Z-test */}
        <section className={section} aria-labelledby="ztest-title">
          <div className={`${container} grid gap-8 py-12 sm:py-16 lg:grid-cols-12 lg:gap-14 lg:py-20`}>
            <div className="lg:order-2 lg:col-span-4">
              <TypographyEyebrow index="02">Hypothesis testing</TypographyEyebrow>
              <TypographyH2 id="ztest-title">Watch the decision form.</TypographyH2>
              <TypographyP className="mt-4">
                Test whether a mean differs from <TypographyInlineCode>μ₀ = 40</TypographyInlineCode>{" "}
                with σ = 5 and n = 36. Drag the sample mean, change α or the alternative, and the
                rejection region, critical value and p-value move together.
              </TypographyP>
              <TypographyMuted className="mt-4">
                Rejection and acceptance are also labelled in words, so the verdict never depends on
                colour alone.
              </TypographyMuted>
            </div>
            <div className="min-w-0 lg:order-1 lg:col-span-8">
              <ZTestFigure />
            </div>
          </div>
        </section>

        {/* Datasets */}
        <section className={section} aria-labelledby="datasets-title">
          <div className={`${container} py-12 sm:py-16 lg:py-20`}>
            <div className="mb-6 grid gap-3 sm:mb-8 lg:grid-cols-12 lg:gap-14">
              <div className="lg:col-span-5">
                <TypographyEyebrow index="03">Practice data</TypographyEyebrow>
                <TypographyH2 id="datasets-title">Start from a dataset, not a blank table.</TypographyH2>
              </div>
              <TypographyP className="lg:col-span-6 lg:col-start-7 lg:self-end">
                Includes the awkward cases too: a perfect line, and a pair with no relationship at
                all. Pick a row to open it in the regression lab, already solved.
              </TypographyP>
            </div>
            <DatasetIndex />
          </div>
        </section>

        {/* Verification + FAQ */}
        <section className={section} aria-labelledby="faq-title">
          <div className={`${container} grid gap-6 py-12 sm:gap-8 sm:py-16 lg:grid-cols-12 lg:gap-14 lg:py-20`}>
            <div className="lg:sticky lg:top-24 lg:col-span-5 lg:self-start">
              <TypographyEyebrow index="04">Questions</TypographyEyebrow>
              <TypographyH2 id="faq-title">Common questions</TypographyH2>
              <figure className="panel mt-6 rounded-2xl border bg-card p-5 sm:mt-8">
                <ShieldCheck className="size-5 text-primary" aria-hidden="true" />
                <TypographyBlockquote className="mt-3 text-lg sm:text-xl">
                  Checked against SciPy and statsmodels, so the answer on screen matches the one in
                  your textbook.
                </TypographyBlockquote>
              </figure>
            </div>
            <div className="lg:col-span-7 lg:pt-1">
              <Accordion type="single" collapsible className="border-y">
                {FAQ.map(([q, a]) => (
                  <AccordionItem key={q} value={q}>
                    <AccordionTrigger className="gap-4 rounded-none py-4 text-base hover:no-underline">
                      {q}
                    </AccordionTrigger>
                    <AccordionContent className="pb-4 text-base sm:pr-8 leading-7 text-pretty text-muted-foreground">
                      {a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t">
        <div className={`${container} flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between`}>
          <p className="flex items-center gap-2.5">
            <BrandMark className="size-6" />
            <span className="text-sm font-semibold tracking-[-0.02em]">ADVSTAT</span>
            <span className="text-sm text-muted-foreground">Advanced Statistics Workstation</span>
          </p>
          <p className="text-sm text-muted-foreground">
            Made by{" "}
            <Link href="/about" className="font-medium text-foreground underline-offset-4 hover:underline">
              BSIT-3A
            </Link>
            . Checked against SciPy and statsmodels.
          </p>
        </div>
      </footer>
    </>
  );
}
