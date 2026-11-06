"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useState } from "react";
import { BrandMark } from "@/components/layout/brand-mark";
import GradientASCII from "@/components/reactbits/GradientASCII";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  TypographyBlockquote,
  TypographyDisplay,
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
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              WebkitMaskImage:
                "radial-gradient(125% 95% at 68% 45%, #000 32%, rgba(0,0,0,0.45) 68%, transparent 96%)",
              maskImage:
                "radial-gradient(125% 95% at 68% 45%, #000 32%, rgba(0,0,0,0.45) 68%, transparent 96%)",
            }}
          >
            <GradientASCII
              colors={
                isDark
                  ? ["#1e3fd8", "#4f46e5", "#38bdf8", "#e0f2fe"]
                  : ["#2544d8", "#6366f1", "#7dd3fc", "#eef4ff"]
              }
              shape="horizon"
              characters=" .=+xX0S8#@"
              cellSize={18}
              density={0.8}
              glyphOpacity={isDark ? 0.85 : 0.6}
              gradientOpacity={isDark ? 0.78 : 0.5}
              glow={isDark ? 0.24 : 0.12}
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
            className="pointer-events-none absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(52% 64% at 24% 46%, var(--background) 36%, color-mix(in oklch, var(--background) 78%, transparent) 68%, transparent 100%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-24 bg-linear-to-t from-background to-transparent"
          />

          <div
            className={`${container} grid gap-12 pt-14 pb-20 sm:pt-20 lg:grid-cols-12 lg:items-center lg:gap-10 lg:pb-28`}
          >
            <Reveal className="lg:col-span-5">
              <TypographyDisplay>Statistics you can check, line by line.</TypographyDisplay>
              <TypographyLead className="mt-6">
                Fit a regression line or run a Z-test, then read every sum, formula and decision
                rule behind the answer, right beside the graph it describes.
              </TypographyLead>
              <div className="mt-8 flex flex-wrap items-center gap-3">
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
              <TypographyMuted className="mt-5">
                Free to use. Nothing to sign up for.
              </TypographyMuted>
            </Reveal>
            <Reveal delay={0.08} distance={24} className="min-w-0 lg:col-span-7">
              <RegressionFigure datasetId={datasetId} onDatasetChange={setDatasetId} />
            </Reveal>
          </div>
        </section>

        {/* Worksheet */}
        <section className={section} aria-labelledby="worksheet-title">
          <div className={`${container} grid gap-10 py-20 sm:py-24 lg:grid-cols-12 lg:gap-14`}>
            <div className="lg:col-span-4">
              <TypographyH2 id="worksheet-title">Every number shows its source.</TypographyH2>
              <TypographyP className="mt-5">
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
          <div className={`${container} grid gap-10 py-20 sm:py-24 lg:grid-cols-12 lg:gap-14`}>
            <div className="lg:order-2 lg:col-span-4">
              <TypographyH2 id="ztest-title">Watch the decision form.</TypographyH2>
              <TypographyP className="mt-5">
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
          <div className={`${container} py-20 sm:py-24`}>
            <div className="mb-10 grid gap-4 lg:grid-cols-12 lg:gap-14">
              <TypographyH2 id="datasets-title" className="lg:col-span-5">
                Start from a dataset, not a blank table.
              </TypographyH2>
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
          <div className={`${container} grid gap-12 py-20 sm:py-24 lg:grid-cols-12 lg:gap-14`}>
            <div className="lg:col-span-5">
              <TypographyBlockquote>
                Checked against SciPy and statsmodels, so the answer on screen matches the one in
                your textbook.
              </TypographyBlockquote>
              <TypographyH2 id="faq-title" className="mt-14 text-2xl sm:text-3xl">
                Common questions
              </TypographyH2>
            </div>
            <div className="lg:col-span-7 lg:pt-1">
              <Accordion type="single" collapsible className="border-y">
                {FAQ.map(([q, a]) => (
                  <AccordionItem key={q} value={q}>
                    <AccordionTrigger className="rounded-none py-4 text-base hover:no-underline">
                      {q}
                    </AccordionTrigger>
                    <AccordionContent className="text-base leading-7 text-muted-foreground">
                      {a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* Closing call */}
        <section className="border-t bg-muted/40">
          <div className={`${container} flex flex-col items-start justify-between gap-8 py-20 sm:py-24 md:flex-row md:items-end`}>
            <TypographyH2 className="max-w-[18ch] text-4xl sm:text-5xl">
              Bring the problem set.
            </TypographyH2>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-11 px-5 text-[15px]">
                <Link href="/dashboard">
                  Open the workspace
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-11 px-5 text-[15px]">
                <Link href="/learn">Read the formulas</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className={`${container} flex flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between`}>
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark className="size-6" />
            <span className="text-sm font-semibold tracking-[-0.02em]">ADVSTAT</span>
            <span className="text-sm text-muted-foreground">Advanced Statistics Workstation</span>
          </Link>
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            {[
              ["Dashboard", "/dashboard"],
              ["Regression", "/regression"],
              ["Hypothesis testing", "/hypothesis"],
              ["Formulas & Z-table", "/learn"],
            ].map(([label, href]) => (
              <Link key={href} href={href} className="transition-colors hover:text-foreground">
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </footer>
    </>
  );
}
