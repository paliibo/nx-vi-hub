"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import { type ReactNode } from "react";

/**
 * `attribute="data-theme"` matches the selector the Tailwind config and the CSS
 * token block are keyed on. The class strategy would work too, but a data
 * attribute keeps the class list free of a value that is not a style.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <NextThemeProvider
    attribute="data-theme"
    defaultTheme="dark"
    disableTransitionOnChange
    enableSystem
  >
    {children}
  </NextThemeProvider>
);
