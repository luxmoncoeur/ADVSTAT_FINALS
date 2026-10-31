"use client";

import { Activity, Gauge, Minus, Sigma, TrendingDown, TrendingUp } from "lucide-react";
import { useState } from "react";
import { useSettings } from "@/components/providers";
import DecryptedText from "@/components/reactbits/DecryptedText";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber, formatPercent } from "@/lib/format";
import { Interpretation } from "./interpretation";
import { PredictionCard } from "./prediction-card";
import { RSquaredGauge } from "./r-squared-gauge";
import { ResidualChart } from "./residual-chart";
import { RegressionScatterChart } from "./scatter-chart";
import { StrengthMeter } from "./strength-meter";
import { SumsTable } from "./sums-table";

/** "Ŷ = 2.2000 + 0.6000X" with a proper minus sign for negative slopes. */
export function equationText(intercept, slope, decimals) {
  const sign = slope < 0 ? "−" : "+";
  return `Ŷ = ${formatNumber(intercept, decimals, { fixed: true })} ${sign} ${formatNumber(Math.abs(slope), decimals, { fixed: true })}X`;
}

/** One-row KPI strip: equation (wide), r, r², strength. */
export function RegressionKpis({ result }) {
  const { decimals } = useSettings();
  const equation = equationText(result.intercept, result.slope, decimals);
  const DirectionIcon =
    result.direction === "positive"
      ? TrendingUp
      : result.direction === "negative"
        ? TrendingDown
        : Minus;
  const strengthText =
    result.strength === null
      ? "Not defined"
      : result.strength === "None"
        ? "No linear relationship"
        : `${result.strength} ${result.direction}`;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-6 2xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)]">
      <ResultCard
        label="Regression equation"
        icon={Sigma}
        className="col-span-2 sm:col-span-4 2xl:col-span-1"
        valueClassName="text-lg sm:text-xl"
        hint={
          <span className="font-mono">
            a = {formatNumber(result.intercept, decimals, { fixed: true })} · b ={" "}
            {formatNumber(result.slope, decimals, { fixed: true })}
          </span>
        }
      >
        <span className="sr-only">{equation}</span>
        <span aria-hidden="true">
          <DecryptedText
            key={equation}
            text={equation}
            animateOn="view"
            sequential
            speed={24}
            revealDirection="start"
            characters="0123456789.+−XŶ"
          />
        </span>
      </ResultCard>
      <ResultCard
        label="Strength"
        icon={DirectionIcon}
        className="col-span-2 sm:col-span-2 2xl:col-span-1"
        valueClassName="font-sans text-lg"
        hint="From |r| on the scale"
      >
        {strengthText}
      </ResultCard>
      <ResultCard
        label="Correlation (r)"
        className="sm:col-span-3 2xl:col-span-1"
        icon={Activity}
        valueClassName="text-xl"
        hint={result.r === null ? "All Y values are equal" : "−1 ≤ r ≤ +1"}
      >
        {result.r === null ? "Undefined" : <AnimatedNumber value={result.r} decimals={decimals} />}
      </ResultCard>
      <ResultCard
        label="Determination (r²)"
        className="sm:col-span-3 2xl:col-span-1"
        icon={Gauge}
        valueClassName="text-xl"
        hint={
          result.rSquared === null
            ? "—"
            : `${formatPercent(result.rSquared, decimals)} of variation explained`
        }
      >
        {result.rSquared === null ? (
          "Undefined"
        ) : (
          <AnimatedNumber value={result.rSquared} decimals={decimals} />
        )}
      </ResultCard>
    </div>
  );
}

function ChartToggle({ id, label, checked, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="text-xs font-normal text-muted-foreground">
        {label}
      </Label>
    </div>
  );
}

/** Charts card: Scatter / Residuals tabs, with strength and r² beside the chart. */
export function RegressionVisuals({ result, labels }) {
  const [showResiduals, setShowResiduals] = useState(false);
  const [showMeans, setShowMeans] = useState(false);
  const [tab, setTab] = useState("scatter");

  return (
    <div className="space-y-4">
      {result.warnings.length > 0 ? (
        <Alert>
          <AlertTitle>Note</AlertTitle>
          <AlertDescription>
            {result.warnings.map((warning) => (
              <p key={warning}>{warning}</p>
            ))}
          </AlertDescription>
        </Alert>
      ) : null}
      <Reveal>
        <Card className="gap-4">
          <Tabs value={tab} onValueChange={setTab} className="gap-4">
            <CardHeader>
              <CardTitle>Visualize</CardTitle>
              <CardDescription>
                {tab === "scatter"
                  ? "Each point is one observation; the line is the least-squares fit."
                  : "How far each actual Y is from the predicted Ŷ."}
              </CardDescription>
              <CardAction>
                <TabsList className="h-8">
                  <TabsTrigger value="scatter" className="text-xs">
                    Scatter
                  </TabsTrigger>
                  <TabsTrigger value="residuals" className="text-xs">
                    Residuals
                  </TabsTrigger>
                </TabsList>
              </CardAction>
            </CardHeader>
            <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_17rem]">
              <div className="min-w-0 space-y-3">
                <TabsContent value="scatter" className="space-y-3">
                  <div className="flex flex-wrap gap-x-5 gap-y-2">
                    <ChartToggle
                      id="toggle-residuals"
                      label="Residual lines"
                      checked={showResiduals}
                      onChange={setShowResiduals}
                    />
                    <ChartToggle
                      id="toggle-means"
                      label="Mean point (X̄, Ȳ)"
                      checked={showMeans}
                      onChange={setShowMeans}
                    />
                  </div>
                  <RegressionScatterChart
                    result={result}
                    labels={labels}
                    showResiduals={showResiduals}
                    showMeans={showMeans}
                  />
                </TabsContent>
                <TabsContent value="residuals">
                  <ResidualChart result={result} />
                </TabsContent>
              </div>
              <aside
                className="space-y-5 border-t pt-5 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6"
                aria-label="Strength of relationship"
              >
                {result.r !== null && result.rSquared !== null ? (
                  <>
                    <div>
                      <p className="text-sm font-medium">Strength of relationship</p>
                      <StrengthMeter
                        r={result.r}
                        strength={result.strength ?? "None"}
                        direction={result.direction}
                      />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Variation explained (r²)</p>
                      <RSquaredGauge rSquared={result.rSquared} yLabel={labels.y} />
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    r is undefined because every Y value is the same.
                  </p>
                )}
              </aside>
            </CardContent>
          </Tabs>
        </Card>
      </Reveal>
    </div>
  );
}

/** Below the charts: worked solution beside the interpretation and prediction. */
export function RegressionSolution({ result, labels }) {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-12">
      <Reveal className="xl:col-span-7">
        <Card>
          <CardHeader>
            <CardTitle>Step-by-step solution</CardTitle>
            <CardDescription>Each formula with your data substituted.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="steps">
              <TabsList>
                <TabsTrigger value="steps">Solution</TabsTrigger>
                <TabsTrigger value="table">Computation table</TabsTrigger>
              </TabsList>
              <TabsContent value="steps" className="pt-3">
                <SolutionSteps steps={result.steps} />
              </TabsContent>
              <TabsContent value="table" className="pt-3">
                <SumsTable result={result} labels={labels} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </Reveal>
      <div className="space-y-4 xl:col-span-5">
        <Reveal>
          <Card>
            <CardHeader>
              <CardTitle>What it means</CardTitle>
              <CardDescription>
                {labels.x} and {labels.y} in plain language.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Interpretation result={result} labels={labels} />
            </CardContent>
          </Card>
        </Reveal>
        <Reveal>
          <Card>
            <CardHeader>
              <CardTitle>Predict {labels.y}</CardTitle>
              <CardDescription>Plug any X into Ŷ = a + bX.</CardDescription>
            </CardHeader>
            <CardContent>
              <PredictionCard result={result} labels={labels} />
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </div>
  );
}
