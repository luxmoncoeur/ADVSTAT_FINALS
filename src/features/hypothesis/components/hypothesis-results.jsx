"use client";

import { CircleCheck, CircleX, Crosshair, Gauge, Target } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/components/providers";
import BorderGlow from "@/components/reactbits/BorderGlow";
import { AnimatedNumber } from "@/components/shared/animated-number";
import { Reveal } from "@/components/shared/reveal";
import { ResultCard } from "@/components/shared/result-card";
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
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { formatNumber, formatPValue } from "@/lib/format";
import { THEME_HEX } from "@/lib/theme-colors";
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

function DecisionCard({ result }) {
  const theme = useResolvedTheme();
  const colors = THEME_HEX[theme];
  const reject = result.reject;
  const tone = reject ? colors.reject : colors.accept;
  const Icon = reject ? CircleX : CircleCheck;
  return (
    <BorderGlow
      backgroundColor={colors.card}
      borderRadius={14}
      glowColor={reject ? "350 85 62" : "160 70 45"}
      colors={[tone, colors.primary, tone]}
      glowIntensity={0.9}
      edgeSensitivity={25}
      animated
      className="h-full"
    >
      <div className="flex h-full flex-col gap-2 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">Decision</p>
          <span
            className={`grid size-8 place-items-center rounded-lg ${reject ? "bg-reject-soft text-reject" : "bg-accept-soft text-accept"}`}
            aria-hidden="true"
          >
            <Icon className="size-4" />
          </span>
        </div>
        <p
          className={`text-2xl font-semibold tracking-tight ${reject ? "text-reject" : "text-accept"}`}
        >
          {reject ? "Reject H₀" : "Fail to reject H₀"}
        </p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {reject ? "z falls in the rejection region." : "z falls in the acceptance region."}
        </p>
      </div>
    </BorderGlow>
  );
}

/** KPI row: z, critical value, p-value, decision. */
export function ZTestKpis({ result }) {
  const { decimals } = useSettings();
  return (
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
      <ResultCard
        label="Test statistic (z)"
        icon={Crosshair}
        hint={`SE = ${formatNumber(result.standardError, decimals)}`}
      >
        <AnimatedNumber value={result.z} decimals={decimals} />
      </ResultCard>
      <ResultCard
        label="Critical value"
        icon={Target}
        tone="reject"
        hint={`${result.tail === "two" ? "Two" : result.tail === "left" ? "Left" : "Right"}-tailed, α = ${result.alpha}`}
      >
        {criticalText(result, decimals)}
      </ResultCard>
      <ResultCard
        label="p-value"
        icon={Gauge}
        tone={result.rejectByPValue ? "reject" : "accept"}
        hint={`p ${result.pValue <= result.alpha ? "≤" : ">"} α = ${result.alpha}`}
      >
        <AnimatedNumber value={result.pValue} decimals={decimals} kind="p" />
      </ResultCard>
      <DecisionCard result={result} />
    </div>
  );
}

/** Curve, conclusion, z-table, solution. */
export function ZTestDetails({ result, statements }) {
  const { decimals } = useSettings();
  const [showPValue, setShowPValue] = useState(true);
  const zc = /** @type {number} */ (
    result.tail === "left" ? result.critical.lower : result.critical.upper
  );

  return (
    <div className="space-y-6">
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
        <Card>
          <CardHeader>
            <CardTitle>Normal curve</CardTitle>
            <CardDescription>
              Standard normal distribution with the rejection region for α = {result.alpha}. Hover
              the curve to read areas.
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
        <Card className={result.reject ? "border-reject/40" : "border-accept/40"}>
          <CardHeader>
            <CardTitle>Conclusion</CardTitle>
            <CardDescription>Both decision rules agree.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-base leading-relaxed text-pretty sm:text-lg">{result.conclusion}</p>
            {statements?.ha || statements?.h0 ? (
              <p className="rounded-lg bg-muted/60 p-3 text-sm leading-relaxed">
                {result.reject
                  ? `In words: the data support the claim that ${lowerFirst(statements.ha || "the alternative hypothesis is true.")}`
                  : `In words: the data do not provide enough evidence against the claim that ${lowerFirst(statements.h0 || "the null hypothesis is true.")}`}
              </p>
            ) : null}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs font-medium text-muted-foreground">Critical-value rule</p>
                <p className="mt-1 font-mono text-sm">
                  {result.tail === "two"
                    ? `|z| = ${formatNumber(Math.abs(result.z), decimals)}`
                    : `z = ${formatNumber(result.z, decimals)}`}{" "}
                  {result.tail === "left" ? (result.reject ? "≤" : ">") : result.reject ? "≥" : "<"}{" "}
                  {formatNumber(result.tail === "two" ? Math.abs(zc) : zc, decimals)}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs font-medium text-muted-foreground">p-value rule</p>
                <p className="mt-1 font-mono text-sm">
                  p = {formatPValue(result.pValue, decimals)} {result.rejectByPValue ? "≤" : ">"} α
                  = {result.alpha}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle>Z-table value</CardTitle>
            <CardDescription>
              Reading the critical value from a standard normal table.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ZTableLookup alpha={result.alpha} tail={result.tail} critical={Math.abs(zc)} />
          </CardContent>
        </Card>
      </Reveal>

      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle>Step-by-step solution</CardTitle>
            <CardDescription>
              The standard procedure, with your values substituted at each step.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SolutionSteps steps={result.steps} />
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}

/** @param {string} text */
function lowerFirst(text) {
  return text.charAt(0).toLowerCase() + text.slice(1);
}
