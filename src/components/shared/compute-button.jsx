"use client";

import { Button } from "@/components/ui/button";

/**
 * Primary "Compute" action button with Apple tactile response.
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
      onClick={onClick}
      disabled={disabled}
      className={`h-8 w-auto shrink-0 rounded-[10px] bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-xs transition-all hover:bg-primary/90 active:scale-[0.97] motion-reduce:active:scale-100 ${className}`}
    >
      {children}
    </Button>
  );
}
