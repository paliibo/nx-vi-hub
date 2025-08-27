/**
 * Semantic colour tokens.
 *
 * Components reference the role a colour plays — `bg-surface`, `text-muted` —
 * never a palette step. Every token resolves to a CSS custom property defined
 * in global.css, so light and dark are one variable swap rather than a `dark:`
 * variant on every element.
 */
export const ThemeColors = {
  ACCENT: "accent",
  ACCENT_FOREGROUND: "accent-foreground",
  BACKGROUND: "background",
  BORDER: "border",
  BORDER_STRONG: "border-strong",
  DANGER: "danger",
  DANGER_FOREGROUND: "danger-foreground",
  FOREGROUND: "foreground",
  INPUT: "input",
  MUTED: "muted",
  MUTED_FOREGROUND: "muted-foreground",
  OVERLAY: "overlay",
  PRIMARY: "primary",
  PRIMARY_FOREGROUND: "primary-foreground",
  RING: "ring",
  SUBTLE: "subtle",
  SUCCESS: "success",
  SURFACE: "surface",
  SURFACE_FOREGROUND: "surface-foreground",
  SURFACE_RAISED: "surface-raised",
} as const;

export type ThemeColor = (typeof ThemeColors)[keyof typeof ThemeColors];

/**
 * Named type ramp. Declaring these as utilities keeps headings consistent
 * without every page re-picking a size, weight and leading combination.
 */
export const FontSizes = {
  BODY_S: ".text-body-s",
  DISPLAY: ".text-display",
  HEADLINE_L: ".text-headline-l",
  HEADLINE_M: ".text-headline-m",
  HEADLINE_S: ".text-headline-s",
  LABEL: ".text-label",
} as const;

export type FontSize = (typeof FontSizes)[keyof typeof FontSizes];
