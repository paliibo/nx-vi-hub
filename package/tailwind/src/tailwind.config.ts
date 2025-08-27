import type { Config as TailwindConfig } from "tailwindcss";

import plugin from "tailwindcss/plugin";

import { FontSizes, ThemeColor, ThemeColors } from "./theme";

/**
 * Every semantic token is stored as bare HSL channels ("240 6% 8%") rather than
 * a finished colour, so Tailwind can inject the alpha channel and `bg-surface/60`
 * works exactly like `bg-zinc-900/60` would.
 */
const withAlpha = (token: ThemeColor) => `hsl(var(--${token}) / <alpha-value>)`;

const semanticColors = Object.fromEntries(
  Object.values(ThemeColors).map(token => [token, withAlpha(token)]),
) as Record<ThemeColor, string>;

export const defaultConfig = {
  darkMode: ["class", '[data-theme="dark"]'],
  plugins: [
    require("tailwindcss-animate"),
    plugin(({ matchUtilities, theme }) => {
      matchUtilities(
        { "animation-delay": value => ({ "animation-delay": value }) },
        { values: theme("transitionDelay") },
      );
    }),
    plugin(({ addUtilities }) => {
      addUtilities({
        [FontSizes.BODY_S]: { fontSize: "0.8125rem", fontWeight: "400", lineHeight: "1.25rem" },
        [FontSizes.DISPLAY]: {
          fontSize: "clamp(2rem, 1.2rem + 3.2vw, 3.5rem)",
          fontWeight: "700",
          letterSpacing: "-0.03em",
          lineHeight: "1.05",
        },
        [FontSizes.HEADLINE_L]: {
          fontSize: "1.75rem",
          fontWeight: "650",
          letterSpacing: "-0.02em",
          lineHeight: "2.125rem",
        },
        [FontSizes.HEADLINE_M]: {
          fontSize: "1.25rem",
          fontWeight: "600",
          letterSpacing: "-0.015em",
          lineHeight: "1.75rem",
        },
        [FontSizes.HEADLINE_S]: {
          fontSize: "1rem",
          fontWeight: "600",
          letterSpacing: "-0.01em",
          lineHeight: "1.5rem",
        },
        [FontSizes.LABEL]: {
          fontSize: "0.6875rem",
          fontWeight: "600",
          letterSpacing: "0.08em",
          lineHeight: "1rem",
          textTransform: "uppercase",
        },
      });
    }),
  ],
  theme: {
    extend: {
      animation: {
        "fade-in": "fade-in 240ms cubic-bezier(0.16, 1, 0.3, 1)",
        "rise-in": "rise-in 320ms cubic-bezier(0.16, 1, 0.3, 1) both",
        shimmer: "shimmer 1.6s ease-in-out infinite",
        "smooth-pulse": "smooth-pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "calc(var(--radius) + 4px)",
      },
      colors: {
        ...semanticColors,
        current: "currentColor",
        transparent: "transparent",
      },
      fontFamily: {
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "rise-in": {
          from: { opacity: "0", transform: "translateY(0.75rem)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "smooth-pulse": { "0%, 100%": { opacity: "1" }, "50%": { opacity: ".65" } },
      },
      screens: {
        desktop: { min: "769px" },
        mobile: { max: "768px" },
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
} satisfies Omit<TailwindConfig, "content">;
