"use client";

import { CircleCheck, CircleX, Lightbulb } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/components/providers";
import BorderGlow from "@/components/reactbits/BorderGlow";
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
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { formatNumber } from "@/lib/format";
import { THEME_HEX } from "@/lib/theme-colors";
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

function Stat({ label, children, tone }) {
  return (
    <div className="rounded-lg border bg-background/60 px-3 py-2">
      <dt className="text-xs whitespace-nowrap text-muted-foreground">{label}</dt>
      <dd
        className={`font-mono text-lg font-semibold whitespace-nowrap tabular-nums ${tone ?? ""}`}
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
  const theme = useResolvedTheme();
  const colors = THEME_HEX[theme];
  const reject = result.reject;
  const tone = reject ? colors.reject : colors.accept;
  const Icon = reject ? CircleX : CircleCheck;
  const text = explainResult(result, decimals);
  const inWords = reject ? statements?.ha : statements?.h0;

  return (
    <BorderGlow
      backgroundColor={colors.card}
      borderRadius={16}
      glowColor={reject ? "350 85 62" : "160 70 45"}
      colors={[tone, colors.primary, tone]}
      glowIntensity={0.8}
      edgeSensitivity={25}
      animated
    >
      <section aria-labelledby="verdict-title" className="space-y-4 p-4 sm:p-5">
        <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
          <div className="flex items-center gap-3">
            <span
              className={`grid size-12 shrink-0 place-items-center rounded-xl ${reject ? "bg-reject-soft text-reject" : "bg-accept-soft text-accept"}`}
              aria-hidden="true"
            >
              <Icon className="size-6" />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                Verdict
              </p>
              <h2
                id="verdict-title"
                className={`text-2xl font-semibold tracking-tight whitespace-nowrap sm:text-3xl ${reject ? "text-reject" : "text-accept"}`}
              >
                {reject ? "Reject H₀" : "Fail to reject H₀"}
              </h2>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4 2xl:min-w-[26rem]">
            <Stat label="z statistic">
              <AnimatedNumber value={result.z} decimals={decimals} />
            </Stat>
            <Stat label="Critical z" tone="text-reject">
              {criticalText(result, decimals)}
            </Stat>
            <Stat label="p-value">
              <AnimatedNumber value={result.pValue} decimals={decimals} kind="p" />
            </Stat>
            <Stat label="α">{result.alpha}</Stat>
          </dl>
        </div>
        <div>
          <p className="text-base leading-snug font-medium text-pretty">{text.headline}</p>
          {inWords ? (
            <p className="mt-1 text-sm text-muted-foreground">
              “{inWords}” {reject ? "is supported." : "cannot be ruled out."}
            </p>
          ) : null}
        </div>
        <div className="rounded-xl bg-muted/50 p-4">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold">
            <Lightbulb className="size-4 text-chart-3" aria-hidden="true" /> Why?
          </p>
          <ol className="grid gap-3 text-sm leading-relaxed md:grid-cols-3">
            {[text.where, text.cutoff, text.chance].map((sentence, index) => (
              <li key={index} className="flex gap-2.5">
                <span
                  className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-background font-mono text-[11px] font-semibold"
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
    </BorderGlow>
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
        <Card className="gap-4">
          <CardHeader>
            <CardTitle>Where z falls on the normal curve</CardTitle>
            <CardDescription>
              Red tails are the rejection region (α). Hover the curve to read areas.
            </CardDescription>
            <CardAction>
              <div className="flex items-center gap-2">
                <Switch id="show-p" checked={showPValue} onCheckedChange={setShowPValue} />
                <Label htmlFor="show-p" className="text-xs font-normal text-muted-foreground">
                  p-value area
                </Label>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <NormalCurveChart result={result} showPValue={showPValue} />
          </CardContent>
        </Card>
      </Reveal>

      <Reveal>
        <Card className="gap-4">
          <CardHeader>
            <CardTitle>Show the work</CardTitle>
            <CardDescription>
              Formal conclusion, the step-by-step solution and the z-table lookup.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4 rounded-lg border-l-4 border-primary bg-accent/40 px-4 py-3 text-sm leading-relaxed sm:text-base">
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
