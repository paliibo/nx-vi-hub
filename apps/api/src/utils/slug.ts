export const slugify = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);

/**
 * Appends -2, -3, … until the slug is free. `taken` is the set of slugs already
 * sharing the base, which the caller fetches in one query rather than probing
 * the database once per attempt.
 */
export const uniqueSlug = (value: string, taken: string[] = []): string => {
  const base = slugify(value) || "video";
  if (!taken.includes(base)) return base;

  let suffix = 2;
  while (taken.includes(`${base}-${suffix}`)) suffix += 1;
  return `${base}-${suffix}`;
};
