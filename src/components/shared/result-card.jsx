"use client";

import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const TONES = {
  default: { border: "border-border/70", icon: "bg-muted text-muted-foreground" },
  accept: { border: "border-accept/40 bg-accept-soft/10", icon: "bg-accept-soft text-accept" },
  reject: { border: "border-reject/40 bg-reject-soft/10", icon: "bg-reject-soft text-reject" },
};

/**
 * KPI card in sleek Shadcn style.
 *
 * @param {{ label: string, icon?: import('react').ElementType, tone?: keyof typeof TONES, hint?: import('react').ReactNode, tooltip?: string,
 *   children: import('react').ReactNode, className?: string, valueClassName?: string }} props
 */
export function ResultCard({
  label,
  icon: Icon,
  tone = "default",
  hint,
  tooltip,
  children,
  className,
  valueClassName,
}) {
  const palette = TONES[tone] || TONES.default;
  const labelContent = (
    <p
      className={cn(
        "text-xs font-medium tracking-wide text-muted-foreground uppercase",
        tooltip && "focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
      )}
      tabIndex={tooltip ? 0 : undefined}
    >
      {label}
    </p>
  );

  return (
    <Card
      className={cn(
        "gap-0 rounded-xl border bg-card p-4 shadow-xs transition-colors",
        palette.border,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {tooltip ? (
          <Tooltip>
            <TooltipTrigger render={labelContent} />
            <TooltipContent>{tooltip}</TooltipContent>
          </Tooltip>
        ) : (
          labelContent
        )}
        {Icon ? (
          <span
            className={cn("grid size-7 shrink-0 place-items-center rounded-md", palette.icon)}
            aria-hidden="true"
          >
            <Icon className="size-3.5" />
          </span>
        ) : null}
      </div>
      <div
        className={cn(
          "mt-1.5 font-mono font-semibold tracking-tight break-words text-card-foreground",
          // A caller's size replaces the default instead of fighting its sm: breakpoint.
          valueClassName ?? "text-2xl sm:text-[1.7rem]",
        )}
      >
        {children}
      </div>
      {hint ? (
        <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{hint}</div>
      ) : null}
    </Card>
  );
}
