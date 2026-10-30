"use client";

import SpotlightCard from "@/components/reactbits/SpotlightCard";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { cn } from "@/lib/utils";

const TONES = {
  default: { spot: "var(--primary)", icon: "bg-accent text-accent-foreground" },
  accept: { spot: "var(--accept)", icon: "bg-accept-soft text-accept" },
  reject: { spot: "var(--reject)", icon: "bg-reject-soft text-reject" },
};

/**
 * KPI card with a pointer-following spotlight (React Bits SpotlightCard).
 *
 * @param {{ label: string, icon?: import('react').ElementType, tone?: keyof typeof TONES, hint?: import('react').ReactNode,
 *   children: import('react').ReactNode, className?: string, valueClassName?: string }} props
 */
export function ResultCard({
  label,
  icon: Icon,
  tone = "default",
  hint,
  children,
  className,
  valueClassName,
}) {
  const theme = useResolvedTheme();
  const palette = TONES[tone];
  return (
    <SpotlightCard
      theme={theme}
      spotlightColor={palette.spot}
      intensity={theme === "dark" ? 0.18 : 0.5}
      spotlightSize={260}
      className={cn("rounded-xl border-0 p-4 sm:p-5", className)}
      style={{
        "--spotlight-card-surface": "var(--card)",
        "--spotlight-card-border": "var(--border)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        {Icon ? (
          <span
            className={cn("grid size-8 shrink-0 place-items-center rounded-lg", palette.icon)}
            aria-hidden="true"
          >
            <Icon className="size-4" />
          </span>
        ) : null}
      </div>
      <div
        className={cn(
          "mt-2 font-mono text-2xl font-semibold tracking-tight break-words text-card-foreground sm:text-[1.7rem]",
          valueClassName,
        )}
      >
        {children}
      </div>
      {hint ? (
        <div className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{hint}</div>
      ) : null}
    </SpotlightCard>
  );
}
