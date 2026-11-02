"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Primary "Compute" action button in sleek Shadcn style.
 * Compact, proportional, and fits cleanly into card footers.
 */
export function ComputeButton({
  onClick,
  children = "Compute",
  disabled = false,
  className = "",
  type = "button",
}) {
  return (
    <Button
      type={type}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "h-8 shrink-0 rounded-md px-3.5 text-xs font-medium shadow-xs transition-all active:scale-[0.98] motion-reduce:active:scale-100",
        className,
      )}
    >
      {children}
    </Button>
  );
}
