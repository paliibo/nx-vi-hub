/**
 * Deterministic poster art.
 *
 * Seeded videos carry no thumbnail file, and rendering a grey rectangle for
 * every one of them looks like a bug. Instead each video gets a gradient
 * derived from its own slug: stable across renders and across machines, unique
 * per video, and free of any network request.
 */

/** FNV-1a — the same hash the database seed uses, so art and data agree. */
const hashString = (value: string): number => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

export type PosterArt = {
  angle: number;
  blobs: { cx: number; cy: number; opacity: number; r: number }[];
  from: string;
  to: string;
};

/**
 * `accent` is the channel's brand colour. Anchoring one stop of the gradient
 * near it means every video from a channel reads as a family without any two
 * being identical.
 */
export const posterArt = (seed: string, accent?: null | string): PosterArt => {
  const hash = hashString(seed);

  const accentHue = accent ? hexToHue(accent) : null;
  const baseHue = accentHue ?? hash % 360;

  // Second stop sits 40–100 degrees away: far enough to read as a gradient,
  // close enough to avoid a muddy complementary blend.
  const spread = 40 + ((hash >>> 8) % 60);

  return {
    angle: 100 + ((hash >>> 20) % 80),
    blobs: [
      {
        cx: 20 + ((hash >>> 3) % 30),
        cy: 25 + ((hash >>> 5) % 30),
        opacity: 0.28,
        r: 30 + ((hash >>> 7) % 18),
      },
      {
        cx: 60 + ((hash >>> 11) % 30),
        cy: 45 + ((hash >>> 13) % 35),
        opacity: 0.2,
        r: 24 + ((hash >>> 17) % 20),
      },
    ],
    from: `hsl(${baseHue} 62% 26%)`,
    to: `hsl(${(baseHue + spread) % 360} 55% 12%)`,
  };
};

const hexToHue = (hex: string): null | number => {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return null;

  const int = parseInt(match[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  if (delta === 0) return 0;

  let hue: number;
  if (max === r) hue = ((g - b) / delta) % 6;
  else if (max === g) hue = (b - r) / delta + 2;
  else hue = (r - g) / delta + 4;

  return Math.round((hue * 60 + 360) % 360);
};

/** Up to two initials for the poster's centre mark. */
export const posterInitials = (title: string): string =>
  title
    .split(/\s+/)
    .filter(word => /[a-z0-9]/i.test(word))
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() ?? "")
    .join("");
