"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Scroll-triggered entrance using Apple-calibrated critically damped spring:
 * Damping ratio 1.0 (bounce 0), Response 0.4s (WWDC 2018 Fluid Interfaces).
 * Smooth, natural arrival with zero oscillation.
 */
export function Reveal({
  children,
  delay = 0,
  distance = 18,
  className = "",
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: distance }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.08 }}
      transition={{
        type: "spring",
        bounce: 0,
        duration: 0.4,
        delay,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
