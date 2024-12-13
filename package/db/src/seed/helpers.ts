/**
 * Deterministic helpers for the seed. Everything derived from content uses a
 * fixed hash rather than Math.random, so two developers running `nx run db:seed`
 * end up with byte-identical catalogs and screenshots stay reproducible.
 */

export const slugify = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

/** FNV-1a. Small, dependency-free, and stable across Node versions. */
export const hashString = (value: string): number => {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

/** A stable integer in [min, max] derived from a seed string. */
export const pick = (seed: string, min: number, max: number): number =>
  min + (hashString(seed) % (max - min + 1));

export const pickFrom = <T>(seed: string, items: readonly T[]): T =>
  items[hashString(seed) % items.length];

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Spreads publication dates backwards from a fixed reference point. Passing the
 * reference in keeps the seed pure — the same input always produces the same
 * catalog, which a `new Date()` inside here would not.
 */
export const daysBefore = (reference: Date, days: number): Date =>
  new Date(reference.getTime() - days * DAY_MS);
