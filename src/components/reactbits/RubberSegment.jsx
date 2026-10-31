"use client";

import { useId, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

const SIZES = {
  sm: { height: "h-8", font: "text-xs", pad: "px-2.5 py-1" },
  md: { height: "h-9", font: "text-sm", pad: "px-3 py-1.5" },
  lg: { height: "h-10", font: "text-base", pad: "px-4 py-2" },
};

/**
 * Apple-style fluid Segmented Control:
 * Critically damped spring transition, high-contrast elevated active pill,
 * full keyboard navigation, and reliable rendering in both light and dark mode.
 */
export default function RubberSegment({
  items = [],
  value,
  defaultValue,
  onChange,
  size = "md",
  disabled = false,
  className = "",
  "aria-label": ariaLabel = "Segmented control",
}) {
  const generatedId = useId();
  const controlId = `${ariaLabel.replace(/\s+/g, "-").toLowerCase()}-${generatedId.replace(/:/g, "")}`;
  const list = items.map((item) =>
    typeof item === "string" ? { value: item, label: item } : item
  );

  const [inner, setInner] = useState(defaultValue ?? list[0]?.value);
  const current = value !== undefined ? value : inner;
  const currentIndex = Math.max(
    0,
    list.findIndex((item) => item.value === current)
  );

  const reduce = useReducedMotion();
  const preset = SIZES[size] || SIZES.md;

  const commit = (nextValue, index) => {
    if (disabled || nextValue === current) return;
    if (value === undefined) setInner(nextValue);
    onChange?.(nextValue, index);
  };

  const handleKeyDown = (e, i) => {
    if (disabled) return;
    let nextIndex = null;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") {
      nextIndex = (i + 1) % list.length;
    } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
      nextIndex = (i - 1 + list.length) % list.length;
    } else if (e.key === "Home") {
      nextIndex = 0;
    } else if (e.key === "End") {
      nextIndex = list.length - 1;
    }

    if (nextIndex !== null) {
      e.preventDefault();
      commit(list[nextIndex].value, nextIndex);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn(
        "relative inline-grid grid-flow-col auto-cols-[minmax(0,1fr)] items-center rounded-xl border border-border/70 bg-muted/75 p-1 text-center align-middle select-none dark:border-white/10 dark:bg-muted/60",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      {list.map((item, i) => {
        const isActive = i === currentIndex;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            tabIndex={isActive ? 0 : -1}
            disabled={disabled}
            onClick={() => commit(item.value, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            className={cn(
              "relative z-10 inline-flex items-center justify-center gap-1.5 rounded-[9px] border-0 bg-transparent font-medium whitespace-nowrap transition-colors duration-150 outline-none select-none cursor-pointer",
              preset.height,
              preset.font,
              preset.pad,
              isActive
                ? "font-semibold text-foreground"
                : "text-muted-foreground hover:text-foreground/90",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-muted"
            )}
          >
            {isActive && (
              <motion.div
                layoutId={`segment-pill-${controlId}`}
                transition={
                  reduce
                    ? { duration: 0 }
                    : {
                        type: "spring",
                        bounce: 0,
                        duration: 0.35,
                      }
                }
                className="absolute inset-0 rounded-[9px] border border-black/5 bg-card shadow-[0_1px_3px_rgba(0,0,0,0.12),0_1px_2px_rgba(0,0,0,0.06)] dark:border-white/20 dark:bg-card dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                style={{ zIndex: -1 }}
              />
            )}
            {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
            <span className="truncate">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
