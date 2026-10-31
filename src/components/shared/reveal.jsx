"use client";

import AnimatedContent from "@/components/reactbits/AnimatedContent";

/** Scroll-triggered entrance (React Bits AnimatedContent). Skipped under reduced motion. */
export function Reveal({
  children,
  delay = 0,
  distance = 28,
  className = "",
  blur = 6,
  stagger = 0,
}) {
  return (
    <AnimatedContent
      distance={distance}
      duration={0.7}
      ease="power3.out"
      blur={blur}
      delay={delay}
      stagger={stagger}
      threshold={0.08}
      className={className}
    >
      {children}
    </AnimatedContent>
  );
}
