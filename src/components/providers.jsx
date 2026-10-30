"use client";

import { ThemeProvider } from "next-themes";
import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

export const DECIMAL_OPTIONS = [2, 3, 4, 5, 6];
const DEFAULT_DECIMALS = 4;
const STORAGE_KEY = "advstat:decimals";

const SettingsContext = createContext({
  decimals: DEFAULT_DECIMALS,
  setDecimals: (/** @type {number} */ _value) => {},
});

/** @type {Set<() => void>} */
const listeners = new Set();

function readDecimals() {
  const stored = Number(window.localStorage.getItem(STORAGE_KEY));
  return DECIMAL_OPTIONS.includes(stored) ? stored : DEFAULT_DECIMALS;
}

/** @param {() => void} listener */
function subscribe(listener) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function SettingsProvider({ children }) {
  const decimals = useSyncExternalStore(subscribe, readDecimals, () => DEFAULT_DECIMALS);
  const setDecimals = useCallback((/** @type {number} */ value) => {
    window.localStorage.setItem(STORAGE_KEY, String(value));
    listeners.forEach((listener) => listener());
  }, []);
  const value = useMemo(() => ({ decimals, setDecimals }), [decimals, setDecimals]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/** Number of decimal places used to display results (2–6). */
export function useSettings() {
  return useContext(SettingsContext);
}

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <SettingsProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster position="bottom-right" richColors closeButton />
        </TooltipProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}
