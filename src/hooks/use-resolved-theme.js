"use client";

import { useTheme } from "next-themes";
import { useMounted } from "./use-mounted";

/** 'light' | 'dark', stable across hydration (light until mounted). */
export function useResolvedTheme() {
  const { resolvedTheme } = useTheme();
  const mounted = useMounted();
  return mounted && resolvedTheme === "dark" ? "dark" : "light";
}
