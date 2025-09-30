/**
 * Formatting helpers shared by every surface that shows a video.
 *
 * Deliberately dependency-free and deterministic: these run during server
 * rendering as well as in the browser, and a locale-sensitive library would
 * produce different markup in each, which React reports as a hydration error.
 */

/** 90 -> "1:30", 3725 -> "1:02:05". */
export const formatDuration = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;

  const pad = (value: number) => value.toString().padStart(2, "0");

  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
};

/** Spoken form for screen readers, where "1:02:05" is read as a time of day. */
export const describeDuration = (totalSeconds: number): string => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);

  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"} ${minutes} minutes`;
  if (minutes > 0) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  return `${safe} seconds`;
};

const COMPACT_STEPS = [
  { suffix: "B", value: 1_000_000_000 },
  { suffix: "M", value: 1_000_000 },
  { suffix: "K", value: 1_000 },
] as const;

/** 1500 -> "1.5K", 76669 -> "76.6K", 2_400_000 -> "2.4M". */
export const formatCompact = (value: number): string => {
  const safe = Math.max(0, Math.floor(value));

  for (const step of COMPACT_STEPS) {
    if (safe >= step.value) {
      const scaled = safe / step.value;
      // One decimal below 100, none above — "9.4K" reads better than "9K",
      // "241K" reads better than "241.3K".
      const text = scaled >= 100 ? Math.floor(scaled).toString() : scaled.toFixed(1);
      return `${text.replace(/\.0$/, "")}${step.suffix}`;
    }
  }

  return safe.toString();
};

export const formatViews = (views: number): string =>
  `${formatCompact(views)} view${views === 1 ? "" : "s"}`;

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const UNITS: [number, string][] = [
  [YEAR, "year"],
  [MONTH, "month"],
  [WEEK, "week"],
  [DAY, "day"],
  [HOUR, "hour"],
  [MINUTE, "minute"],
];

/**
 * "3 days ago". Takes an explicit `now` so callers rendering on the server can
 * pass the same instant used elsewhere in the tree, and so it is testable.
 */
export const formatRelativeTime = (date: Date | string, now: Date = new Date()): string => {
  const value = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((now.getTime() - value.getTime()) / 1000);

  if (!Number.isFinite(seconds)) return "";
  if (seconds < MINUTE) return "just now";

  for (const [size, name] of UNITS) {
    if (seconds >= size) {
      const count = Math.floor(seconds / size);
      return `${count} ${name}${count === 1 ? "" : "s"} ago`;
    }
  }

  return "just now";
};

/** Stable across server and browser — toLocaleDateString is not. */
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const formatDate = (date: Date | string): string => {
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return "";
  return `${MONTH_NAMES[value.getUTCMonth()]} ${value.getUTCDate()}, ${value.getUTCFullYear()}`;
};

/** Seconds -> the `t=` value used in share links, e.g. 95 -> "1m35s". */
export const formatTimestampParam = (seconds: number): string => {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60);
  const remainder = safe % 60;
  return minutes > 0 ? `${minutes}m${remainder}s` : `${remainder}s`;
};

/** Parses "1m35s", "95s" or a bare "95" back into seconds. */
export const parseTimestampParam = (value: null | string | undefined): number => {
  if (!value) return 0;
  const match = /^(?:(\d+)m)?(?:(\d+)s?)?$/.exec(value.trim());
  if (!match || (!match[1] && !match[2])) return 0;
  return Number(match[1] ?? 0) * 60 + Number(match[2] ?? 0);
};
