"use client";

import { useEffect, useState } from "react";

/**
 * Trails `value` by `delay` milliseconds. Used to keep the command palette from
 * issuing a request per keystroke — typing "engineering" would otherwise fire
 * eleven searches to display the result of the last one.
 */
export const useDebouncedValue = <T>(value: T, delay = 200): T => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [delay, value]);

  return debounced;
};
