"use client";

import { Calculator } from "lucide-react";
import ClickSpark from "@/components/reactbits/ClickSpark";
import StarBorder from "@/components/reactbits/StarBorder";
import { useResolvedTheme } from "@/hooks/use-resolved-theme";
import { THEME_HEX } from "@/lib/theme-colors";

/** Primary "Compute" action: a star tracing the border (StarBorder) + click sparks (ClickSpark). */
export function ComputeButton({
  onClick,
  children = "Compute",
  disabled = false,
  className = "",
  type = "button",
}) {
  const theme = useResolvedTheme();
  const colors = THEME_HEX[theme];
  return (
    <ClickSpark
      sparkColor={colors.primary}
      sparkCount={10}
      sparkRadius={26}
      sparkSize={9}
      duration={450}
      className={`inline-flex ${className}`}
    >
      <StarBorder
        type={type}
        onClick={onClick}
        disabled={disabled}
        theme={theme}
        color={theme === "dark" ? "#ffffff" : colors.primary}
        backgroundColor="var(--primary)"
        textColor="var(--primary-foreground)"
        borderColor="color-mix(in oklch, var(--primary) 70%, transparent)"
        radius={10}
        duration={3.5}
        className="w-full gap-2 px-5 py-2.5 text-sm font-semibold shadow-[0_8px_24px_-10px_var(--primary)] transition-transform active:scale-[0.98]"
      >
        <Calculator className="size-4" aria-hidden="true" />
        {children}
      </StarBorder>
    </ClickSpark>
  );
}
