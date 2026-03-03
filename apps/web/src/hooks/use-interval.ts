"use client";

import { useEffect, useRef } from "react";

/**
 * setInterval that always calls the latest callback without restarting the
 * timer when that callback changes. Storing it in a ref is what stops a new
 * closure on every render from clearing and re-creating the interval.
 */
export const useInterval = (callback: () => void, delayMs: null | number) => {
  const saved = useRef(callback);

  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delayMs === null) return;
    const id = setInterval(() => saved.current(), delayMs);
    return () => clearInterval(id);
  }, [delayMs]);
};
