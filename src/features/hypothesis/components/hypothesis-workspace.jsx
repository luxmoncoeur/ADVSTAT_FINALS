"use client";

import { Check, Eraser, FlaskConical, Play, RefreshCw, Sparkles } from "lucide-react";
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
import { formatExact } from "@/lib/format";
import { parseNumber } from "@/lib/stats";
import { cn } from "@/lib/utils";
import { TAILS, scenariosFor } from "../config";
import { useZTest } from "../hooks/use-ztest";
import { VerdictCard, ZTestDetails } from "./hypothesis-results";
import { AlphaPanel, HypothesesPanel, SampleInputs, TestPicker } from "./test-inputs";

const STEPS = [
  { key: "hypotheses", label: "Hypotheses" },
  { key: "alpha", label: "Significance α" },
  { key: "sample", label: "Sample results" },
  { key: "result", label: "Verdict" },
];

function ProgressSteps({ progress }) {
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Progress">
      {STEPS.map((step, index) => {
        const done = progress[step.key];
        return (
          <li key={step.key} className="flex items-center gap-2">
            <span
              className={cn(
                "grid size-6 shrink-0 place-items-center rounded-full border font-mono text-xs font-semibold transition-colors",
                done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "bg-card text-muted-foreground",
              )}
              aria-hidden="true"
            >
              {done ? <Check className="size-3.5" /> : index + 1}
            </span>
            <span
              className={cn(
                "hidden truncate text-xs sm:inline",
                done ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
            <span className="sr-only">
              {step.label}: {done ? "done" : "not done"}
            </span>
            {index < STEPS.length - 1 ? (
              <span
                className={cn("h-px flex-1 transition-colors", done ? "bg-primary" : "bg-border")}
                aria-hidden="true"
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function SectionTitle({ number, id, children }) {
  return (
    <h2 id={id} className="flex items-center gap-2 text-sm font-semibold">
      <span
        className="grid size-5 shrink-0 place-items-center rounded-full bg-primary font-mono text-[11px] text-primary-foreground"
        aria-hidden="true"
      >
        {number}
      </span>
      {children}
    </h2>
  );
}

/** "Testing whether μ ≠ 500 at α = 0.05 (two-tailed)." built from the current inputs. */
function TestingSentence({ zt }) {
  const nullText = zt.test.nullField ? (zt.values[zt.test.nullField.name] ?? "") : "0";
  const parsed = parseNumber(nullText);
  const shown = parsed === null ? (zt.test.nullField?.symbol ?? "0") : formatExact(parsed);
  const tail = TAILS.find((t) => t.value === zt.tail);
  return (
    <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm" aria-live="polite">
      Testing whether{" "}
      <span className="font-mono font-semibold">
        {zt.test.parameter} {tail?.operator} {shown}
      </span>{" "}
      at <span className="font-mono font-semibold">α = {zt.alpha.value ?? "?"}</span> (
      {tail?.label.toLowerCase()}).
    </p>
  );
}

function ScenarioPanel({ zt }) {
  const scenarios = scenariosFor(zt.testId);
  return (
    <div className="space-y-4">
      <Card className="gap-4">
        <CardHeader>
          <CardTitle>Try a scenario</CardTitle>
          <CardDescription>
            Each one fills in the form and runs the test, so you can see a full answer right away.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="grid gap-3 md:grid-cols-3">
            {scenarios.map((scenario) => {
              const tail = TAILS.find((t) => t.value === scenario.tail);
              return (
                <li key={scenario.id}>
                  <button
                    type="button"
                    onClick={() => zt.loadScenario(scenario, { autoCompute: true })}
                    className="group flex h-full w-full flex-col gap-2 rounded-xl border bg-card p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none motion-reduce:hover:translate-y-0"
                  >
                    <span className="font-medium">{scenario.title}</span>
                    <span className="flex-1 text-xs leading-relaxed text-muted-foreground">
                      {scenario.story}
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="secondary" className="font-mono text-[11px]">
                        Hₐ: {tail?.operator}
                      </Badge>
                      <Badge variant="secondary" className="font-mono text-[11px]">
                        α = {scenario.alpha}
                      </Badge>
                      <span className="ml-auto flex items-center gap-1 text-xs font-medium text-primary">
                        <Play className="size-3" aria-hidden="true" /> Run
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
      <Card className="gap-3">
        <CardHeader>
          <CardTitle>How to read the result</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="grid gap-3 text-sm sm:grid-cols-3">
            {[
              ["z", "How many standard errors your sample is from the value in H₀."],
              ["Critical z", "The cut-off set by α. Beyond it is the red rejection region."],
              ["p-value", "Chance of a result this extreme if H₀ is true. If p ≤ α, reject H₀."],
            ].map(([term, text]) => (
              <li key={term} className="rounded-lg border p-3">
                <span className="font-mono text-sm font-semibold">{term}</span>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

export function HypothesisWorkspace() {
  const zt = useZTest();
  const result = zt.outcome?.ok ? zt.outcome.value : null;

  return (
    <div className="mx-auto w-full max-w-[1600px] space-y-4 p-4 sm:p-6">
      <PageHeader
        eyebrow="Module 2"
        icon={FlaskConical}
        title="Hypothesis Testing (Z-test)"
        description="Choose a test, state H₀ and Hₐ, pick α and enter your sample. You get a clear verdict with the reason, the normal curve and the full solution."
      />

      <ProgressSteps progress={zt.progress} />
      <TestPicker value={zt.testId} onChange={zt.chooseTest} />

      <div className="grid items-start gap-4 xl:grid-cols-12">
        <Reveal className="xl:col-span-5" distance={16}>
          <Card className="gap-4 py-4">
            <CardHeader className="px-4">
              <CardTitle>{zt.test.title} z-test</CardTitle>
              <CardDescription>{zt.test.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-4">
              <TestingSentence zt={zt} />
              <section aria-labelledby="sec-hyp" className="space-y-3">
                <SectionTitle number={1} id="sec-hyp">
                  Hypotheses
                </SectionTitle>
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
                <SectionTitle number={2} id="sec-alpha">
                  Level of significance (α)
                </SectionTitle>
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
                <SectionTitle number={3} id="sec-sample">
                  Sample results
                </SectionTitle>
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
            <CardFooter className="gap-2 border-t px-4 pt-4">
              <Button variant="outline" size="sm" onClick={zt.loadExample}>
                <Sparkles className="size-4" aria-hidden="true" /> Load example
              </Button>
              <Button variant="ghost" size="sm" onClick={zt.reset}>
                <Eraser className="size-4" aria-hidden="true" /> Clear
              </Button>
              <ComputeButton onClick={zt.compute} className="ml-auto" />
            </CardFooter>
          </Card>
        </Reveal>

        <div className="min-w-0 space-y-4 xl:col-span-7" aria-live="polite">
          {zt.stale && result ? (
            <Alert>
              <RefreshCw aria-hidden="true" />
              <AlertTitle>The inputs have changed</AlertTitle>
              <AlertDescription>Press Compute to update the verdict.</AlertDescription>
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
              <VerdictCard result={result} statements={zt.submitted?.statements} />
              <ZTestDetails result={result} />
            </>
          ) : (
            <ScenarioPanel zt={zt} />
          )}
        </div>
      </div>
    </div>
  );
}
