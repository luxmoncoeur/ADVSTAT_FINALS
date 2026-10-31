"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

/** True after hydration; use to render theme-dependent visuals only on the client. */
export function useMounted() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}
