"use client";

import { Eraser, FlaskConical, RefreshCw, Sparkles } from "lucide-react";
import { ComputeButton } from "@/components/shared/compute-button";
import { PageHeader } from "@/components/shared/page-header";
import { Reveal } from "@/components/shared/reveal";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useZTest } from "../hooks/use-ztest";
import { ZTestDetails, ZTestKpis } from "./hypothesis-results";
import { AlphaPanel, HypothesesPanel, SampleInputs, TestPicker } from "./test-inputs";

function SectionNumber({ children }) {
  return (
    <span
      className="grid size-6 shrink-0 place-items-center rounded-full bg-primary font-mono text-xs font-semibold text-primary-foreground"
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

function EmptyState({ onExample, test }) {
  return (
    <Card className="relative overflow-hidden">
      <div
        className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]"
        aria-hidden="true"
      />
      <CardContent className="relative flex flex-col items-center gap-4 py-16 text-center">
        <svg viewBox="0 0 200 80" className="h-20 w-48 text-primary" aria-hidden="true">
          <path
            d="M5 75 C60 75 70 8 100 8 S140 75 195 75"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          />
          <path d="M150 62 C165 72 175 75 195 75 L150 75 Z" className="fill-reject/40" />
          <path d="M5 75 C25 75 35 72 50 62 L50 75 Z" className="fill-reject/40" />
        </svg>
        <div className="space-y-1.5">
          <h2 className="text-lg font-semibold">Ready when you are</h2>
          <p className="max-w-sm text-sm text-muted-foreground">
            Fill in the hypotheses, choose α, enter the sample results and press{" "}
            <strong className="text-foreground">Compute</strong>.
          </p>
        </div>
        <Button onClick={onExample}>
          <Sparkles className="size-4" aria-hidden="true" /> Try the {test.title.toLowerCase()}{" "}
          example
        </Button>
      </CardContent>
    </Card>
  );
}

export function HypothesisWorkspace() {
  const zt = useZTest();
  const result = zt.outcome?.ok ? zt.outcome.value : null;

  return (
    <div className="mx-auto w-full max-w-[1440px] space-y-6 p-4 sm:p-6 lg:p-8">
      <PageHeader
        eyebrow="Module 2"
        icon={FlaskConical}
        title="Hypothesis Testing (Z-test)"
        description="State H₀ and Hₐ, choose α, and the z statistic, critical value, p-value and decision are worked out for you, with the normal curve and every step shown."
      />

      <Reveal distance={20}>
        <TestPicker value={zt.testId} onChange={zt.chooseTest} />
      </Reveal>
      <p className="-mt-2 text-sm text-muted-foreground">{zt.test.description}</p>

      <div className="grid items-start gap-6 xl:grid-cols-12">
        <Reveal className="xl:col-span-5" distance={20}>
          <Card>
            <CardHeader>
              <CardTitle>Inputs</CardTitle>
              <CardDescription>
                All fields accept decimals with a period (e.g. 2.5).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-7">
              <section aria-labelledby="sec-hyp" className="space-y-3">
                <h2 id="sec-hyp" className="flex items-center gap-2 text-sm font-semibold">
                  <SectionNumber>1</SectionNumber> Hypotheses
                </h2>
                <HypothesesPanel
                  test={zt.test}
                  tail={zt.tail}
                  onTailChange={zt.setTail}
                  values={zt.values}
                  onValueChange={zt.setValue}
                  statements={zt.statements}
                  onStatementsChange={zt.setStatements}
                  errors={zt.fieldErrors}
                />
              </section>
              <section aria-labelledby="sec-alpha" className="space-y-3">
                <h2 id="sec-alpha" className="flex items-center gap-2 text-sm font-semibold">
                  <SectionNumber>2</SectionNumber> Level of significance (α)
                </h2>
                <AlphaPanel
                  choice={zt.alphaChoice}
                  onChoiceChange={zt.setAlphaChoice}
                  customText={zt.customAlpha}
                  onCustomChange={zt.setCustomAlpha}
                  error={
                    zt.alphaChoice === "custom" && zt.customAlpha !== ""
                      ? zt.alpha.error
                      : zt.fieldErrors.alpha
                  }
                />
              </section>
              <section aria-labelledby="sec-sample" className="space-y-3">
                <h2 id="sec-sample" className="flex items-center gap-2 text-sm font-semibold">
                  <SectionNumber>3</SectionNumber> Sample results
                </h2>
                <SampleInputs
                  test={zt.test}
                  mode={zt.mode}
                  onModeChange={zt.setMode}
                  fields={zt.fields}
                  values={zt.values}
                  onValueChange={zt.setValue}
                  errors={zt.fieldErrors}
                />
              </section>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 border-t sm:flex-row">
              <div className="flex w-full gap-2 sm:w-auto">
                <Button variant="outline" size="sm" onClick={zt.loadExample}>
                  <Sparkles className="size-4" aria-hidden="true" /> Load example
                </Button>
                <Button variant="ghost" size="sm" onClick={zt.reset}>
                  <Eraser className="size-4" aria-hidden="true" /> Clear
                </Button>
              </div>
              <ComputeButton onClick={zt.compute} className="w-full sm:ml-auto sm:w-auto" />
            </CardFooter>
          </Card>
        </Reveal>

        <div className="space-y-6 xl:col-span-7" aria-live="polite">
          {zt.stale && result ? (
            <Alert>
              <RefreshCw aria-hidden="true" />
              <AlertTitle>The inputs have changed</AlertTitle>
              <AlertDescription>Press Compute to update the results.</AlertDescription>
            </Alert>
          ) : null}
          {zt.outcome && !zt.outcome.ok ? (
            <Alert variant="destructive">
              <FlaskConical aria-hidden="true" />
              <AlertTitle>Cannot run the test</AlertTitle>
              <AlertDescription>{zt.outcome.error.message}</AlertDescription>
            </Alert>
          ) : null}
          {result ? (
            <>
              <ZTestKpis result={result} />
              <ZTestDetails result={result} statements={zt.submitted?.statements} />
            </>
          ) : (
            <EmptyState onExample={zt.loadExample} test={zt.test} />
          )}
        </div>
      </div>
    </div>
  );
}
