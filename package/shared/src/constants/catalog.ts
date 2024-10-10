/**
 * Ordering options offered by the catalog endpoints. Kept here rather than in
 * the API so the sort dropdown in the web app and the Prisma `orderBy` clause
 * can never drift apart.
 */
export const VIDEO_SORT = {
  MOST_VIEWED: "most-viewed",
  NEWEST: "newest",
  OLDEST: "oldest",
  TOP_RATED: "top-rated",
} as const;

export type VideoSort = (typeof VIDEO_SORT)[keyof typeof VIDEO_SORT];

export const VIDEO_SORT_LABELS: Record<VideoSort, string> = {
  [VIDEO_SORT.MOST_VIEWED]: "Most viewed",
  [VIDEO_SORT.NEWEST]: "Newest first",
  [VIDEO_SORT.OLDEST]: "Oldest first",
  [VIDEO_SORT.TOP_RATED]: "Top rated",
};

export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 48;

/** A video counts as watched once the viewer passes this share of its runtime. */
export const COMPLETION_THRESHOLD = 0.95;

/** Below this, "Continue watching" treats the video as not really started. */
export const RESUME_MIN_SECONDS = 10;

export const SYSTEM_PLAYLIST = {
  LIKED: "liked",
  WATCH_LATER: "watch-later",
} as const;

export type SystemPlaylist = (typeof SYSTEM_PLAYLIST)[keyof typeof SYSTEM_PLAYLIST];

export const SYSTEM_PLAYLIST_TITLES: Record<SystemPlaylist, string> = {
  [SYSTEM_PLAYLIST.LIKED]: "Liked videos",
  [SYSTEM_PLAYLIST.WATCH_LATER]: "Watch later",
};
