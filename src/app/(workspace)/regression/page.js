import { Suspense } from "react";
import { RegressionWorkspace } from "@/features/regression/components/regression-workspace";

export const metadata = { title: "Simple Linear Regression" };

export default function RegressionPage() {
  return (
    <Suspense fallback={null}>
      <RegressionWorkspace />
    </Suspense>
  );
}
