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

/** Top KPI row: equation, r, r², strength. */
export function RegressionKpis({ result }) {
  const { decimals } = useSettings();
  const equation = equationText(result.intercept, result.slope, decimals);
  const DirectionIcon =
    result.direction === "positive"
      ? TrendingUp
      : result.direction === "negative"
        ? TrendingDown
        : Minus;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <ResultCard
        label="Regression equation"
        icon={Sigma}
        className="sm:col-span-2"
        valueClassName="text-xl sm:text-2xl"
        hint={
          <span className="font-mono">
            a (intercept) = {formatNumber(result.intercept, decimals, { fixed: true })} · b (slope)
            = {formatNumber(result.slope, decimals, { fixed: true })}
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
            speed={28}
            revealDirection="start"
            useOriginalCharsOnly={false}
            characters="0123456789.+−XŶ"
          />
        </span>
      </ResultCard>
      <ResultCard
        label="Correlation coefficient (r)"
        icon={Activity}
        hint={result.r === null ? "Undefined: all Y values are equal" : "Ranges from −1 to +1"}
      >
        {result.r === null ? "Undefined" : <AnimatedNumber value={result.r} decimals={decimals} />}
      </ResultCard>
      <ResultCard
        label="Coefficient of determination (r²)"
        icon={Gauge}
        hint={
          result.rSquared === null
            ? "—"
            : `${formatPercent(result.rSquared, decimals)} of the variation in Y is explained`
        }
      >
        {result.rSquared === null ? (
          "Undefined"
        ) : (
          <AnimatedNumber value={result.rSquared} decimals={decimals} />
        )}
      </ResultCard>
      <ResultCard
        label="Strength of relationship"
        icon={DirectionIcon}
        className="sm:col-span-2"
        valueClassName="font-sans text-xl sm:text-2xl"
        hint={
          result.r === null
            ? "r is undefined when Y does not vary."
            : "Based on |r| using the interpretation scale below."
        }
      >
        {result.strength === null
          ? "Not defined"
          : result.strength === "None"
            ? "No linear relationship"
            : `${result.strength} ${result.direction}`}
      </ResultCard>
    </div>
  );
}

/** Everything below the KPI row once a regression has been computed. */
export function RegressionDetails({ result, labels }) {
  const [showResiduals, setShowResiduals] = useState(false);

  return (
    <div className="space-y-6">
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
        <Card>
          <CardHeader>
            <CardTitle>Scatter diagram</CardTitle>
            <CardDescription>
              Each point is one observation; the line is the least-squares fit Ŷ = a + bX.
            </CardDescription>
            <CardAction>
              <div className="flex items-center gap-2">
                <Switch
                  id="show-residuals"
                  checked={showResiduals}
                  onCheckedChange={setShowResiduals}
                />
                <Label
                  htmlFor="show-residuals"
                  className="text-xs font-normal text-muted-foreground"
                >
                  Residuals
                </Label>
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <RegressionScatterChart result={result} labels={labels} showResiduals={showResiduals} />
          </CardContent>
        </Card>
      </Reveal>

      {result.r !== null && result.rSquared !== null ? (
        <Reveal className="grid gap-6 md:grid-cols-5">
          <Card className="md:col-span-3">
            <CardHeader>
              <CardTitle>Strength of relationship</CardTitle>
              <CardDescription>Where r falls on the −1 to +1 scale.</CardDescription>
            </CardHeader>
            <CardContent>
              <StrengthMeter
                r={result.r}
                strength={result.strength ?? "None"}
                direction={result.direction}
              />
            </CardContent>
          </Card>
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Variation explained</CardTitle>
              <CardDescription>r² as a share of the total variation in {labels.y}.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 items-center">
              <RSquaredGauge rSquared={result.rSquared} yLabel={labels.y} />
            </CardContent>
          </Card>
        </Reveal>
      ) : null}
    </div>
  );
}

/** Full-width section: solution, table, residuals, prediction, interpretation. */
export function RegressionSolution({ result, labels }) {
  return (
    <div className="space-y-6">
      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle>Step-by-step solution</CardTitle>
            <CardDescription>
              The same steps you would follow by hand, with your data substituted into each formula.
            </CardDescription>
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

      <Reveal className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Residuals</CardTitle>
            <CardDescription>How far each actual Y is from the predicted Ŷ.</CardDescription>
          </CardHeader>
          <CardContent>
            <ResidualChart result={result} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Predict Y</CardTitle>
            <CardDescription>Use the regression equation.</CardDescription>
          </CardHeader>
          <CardContent>
            <PredictionCard result={result} labels={labels} />
          </CardContent>
        </Card>
      </Reveal>

      <Reveal>
        <Card>
          <CardHeader>
            <CardTitle>Interpretation</CardTitle>
            <CardDescription>
              What the numbers mean for {labels.x} and {labels.y}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Interpretation result={result} labels={labels} />
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
