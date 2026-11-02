"use client";

import { CircleCheck, CircleX, Lightbulb } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/components/providers";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Reveal } from "@/components/shared/reveal";
import { SolutionSteps } from "@/components/shared/solution-steps";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { explainResult } from "../explain";
import { NormalCurveChart } from "./normal-curve-chart";
import { ZTableLookup } from "./z-table-lookup";

function criticalText(result, decimals) {
  const { tail, critical } = result;
  if (tail === "two")
    return `±${formatNumber(/** @type {number} */ (critical.upper), decimals, { fixed: true })}`;
  return formatNumber(
    /** @type {number} */ (tail === "left" ? critical.lower : critical.upper),
    decimals,
    { fixed: true },
  );
}

function Stat({ label, children, tone, tooltip }) {
  const dtContent = (
    <dt
      className={cn(
        "text-[11px] font-medium whitespace-nowrap text-muted-foreground",
        tooltip &&
          "focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
      )}
      tabIndex={tooltip ? 0 : undefined}
    >
      {label}
    </dt>
  );

  return (
    <div className="rounded-md border border-border/80 bg-card/80 px-3 py-2 shadow-2xs">
      {tooltip ? (
        <Tooltip>
          <TooltipTrigger render={dtContent} />
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      ) : (
        dtContent
      )}
      <dd
        className={cn(
          "mt-0.5 font-mono text-base font-semibold whitespace-nowrap tabular-nums sm:text-lg",
          tone,
        )}
      >
        {children}
      </dd>
    </div>
  );
}

/**
 * At-a-glance verdict: the decision, the four key numbers, and three plain
 * sentences explaining why.
 */
export function VerdictCard({ result, statements }) {
  const { decimals } = useSettings();
  const reject = result.reject;
  const Icon = reject ? CircleX : CircleCheck;
  const text = explainResult(result, decimals);
  const inWords = reject ? statements?.ha : statements?.h0;

  return (
    <Card
      className={cn(
        "rounded-xl border shadow-xs transition-colors",
        reject ? "border-destructive/40 bg-destructive/5" : "border-accept/40 bg-accept-soft/10",
      )}
    >
      <section aria-labelledby="verdict-title" className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-lg",
                reject ? "bg-reject-soft text-reject" : "bg-accept-soft text-accept",
              )}
              aria-hidden="true"
            >
              <Icon className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Verdict
              </p>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <h2
                      id="verdict-title"
                      tabIndex={0}
                      className={cn(
                        "text-2xl font-bold tracking-tight whitespace-nowrap focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none sm:text-3xl",
                        reject ? "text-reject" : "text-accept",
                      )}
                    >
                      {reject ? "Reject H₀" : "Fail to reject H₀"}
                    </h2>
                  }
                />
                <TooltipContent>
                  {reject
                    ? "p-value ≤ α: Sufficient evidence to reject null hypothesis H₀"
                    : "p-value > α: Insufficient evidence to reject null hypothesis H₀"}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 2xl:min-w-[26rem]">
            <Stat
              label="z statistic"
              tooltip="Standardized test score: number of standard errors the sample result is from the hypothesized mean"
            >
              <AnimatedNumber value={result.z} decimals={decimals} />
            </Stat>
            <Stat
              label="Critical z"
              tone="text-reject"
              tooltip="Cutoff boundary score(s) determined by α separating acceptance and rejection regions"
            >
              {criticalText(result, decimals)}
            </Stat>
            <Stat
              label="p-value"
              tooltip="Probability of obtaining a test statistic at least as extreme as observed, assuming H₀ is true"
            >
              <AnimatedNumber value={result.pValue} decimals={decimals} kind="p" />
            </Stat>
            <Stat
              label="α"
              tooltip="Significance level: maximum allowable probability of rejecting a true null hypothesis (Type I error)"
            >
              {result.alpha}
            </Stat>
          </dl>
        </div>
        <div>
          <p className="text-sm leading-relaxed font-medium text-foreground sm:text-base">
            {text.headline}
          </p>
          {inWords ? (
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              “{inWords}” {reject ? "is supported." : "cannot be ruled out."}
            </p>
          ) : null}
        </div>
        <div className="rounded-lg border border-border/80 bg-muted/30 p-3.5 sm:p-4">
          <p className="mb-2.5 flex items-center gap-2 text-xs font-semibold sm:text-sm">
            <Lightbulb className="size-4 text-chart-3" aria-hidden="true" /> Why?
          </p>
          <ol className="grid gap-3 text-xs leading-relaxed sm:text-sm md:grid-cols-3">
            {[text.where, text.cutoff, text.chance].map((sentence, index) => (
              <li key={index} className="flex gap-2">
                <span
                  className="mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-md border border-border/80 bg-background font-mono text-[10px] font-semibold text-foreground"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <span>{sentence}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </Card>
  );
}

/** Curve, formal conclusion, z-table and worked solution. */
export function ZTestDetails({ result }) {
  const [showPValue, setShowPValue] = useState(true);
  const zc = /** @type {number} */ (
    result.tail === "left" ? result.critical.lower : result.critical.upper
  );

  return (
    <div className="space-y-4">
      {result.warnings.length > 0 ? (
        <Alert>
          <AlertTitle>Check the assumptions</AlertTitle>
          <AlertDescription>
            {result.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </AlertDescription>
        </Alert>
      ) : null}

      <Reveal>
        <Card className="gap-4 shadow-xs">
          <CardHeader>
            <CardTitle>Where z falls on the normal curve</CardTitle>
            <CardDescription>
              Red tails are the rejection region (α). Hover the curve to read areas.
            </CardDescription>
            <CardAction>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className="flex items-center gap-2">
                      <Switch id="show-p" checked={showPValue} onCheckedChange={setShowPValue} />
                      <Label
                        htmlFor="show-p"
                        className="text-xs font-normal text-muted-foreground"
                      >
                        p-value area
                      </Label>
                    </div>
                  }
                />
                <TooltipContent>
                  Shade the tail probability corresponding to the observed test statistic z
                </TooltipContent>
              </Tooltip>
            </CardAction>
          </CardHeader>
          <CardContent>
            <NormalCurveChart result={result} showPValue={showPValue} />
          </CardContent>
        </Card>
      </Reveal>

      <Reveal>
        <Card className="gap-4 shadow-xs">
          <CardHeader>
            <CardTitle>Show the work</CardTitle>
            <CardDescription>
              Formal conclusion, the step-by-step solution and the z-table lookup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-xs leading-relaxed font-medium text-foreground sm:text-sm">
              {result.conclusion}
            </p>
            <Tabs defaultValue="steps">
              <TabsList>
                <TabsTrigger value="steps">Solution</TabsTrigger>
                <TabsTrigger value="ztable">Z-table value</TabsTrigger>
              </TabsList>
              <TabsContent value="steps" className="pt-3">
                <SolutionSteps steps={result.steps} />
              </TabsContent>
              <TabsContent value="ztable" className="pt-3">
                <ZTableLookup alpha={result.alpha} tail={result.tail} critical={Math.abs(zc)} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
