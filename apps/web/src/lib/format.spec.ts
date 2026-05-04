import {
  formatCompact,
  formatDate,
  formatDuration,
  formatRelativeTime,
  formatTimestampParam,
  formatViews,
  parseTimestampParam,
} from "./format";

describe("formatDuration", () => {
  it("omits the hour component below an hour", () => {
    expect(formatDuration(90)).toBe("1:30");
    expect(formatDuration(59)).toBe("0:59");
  });

  it("pads minutes and seconds once hours are shown", () => {
    expect(formatDuration(3725)).toBe("1:02:05");
  });

  it("clamps negatives rather than rendering '-1:-30'", () => {
    expect(formatDuration(-42)).toBe("0:00");
  });
});

describe("formatCompact", () => {
  it("keeps one decimal below 100 and drops it above", () => {
    expect(formatCompact(1500)).toBe("1.5K");
    expect(formatCompact(76_669)).toBe("76.7K");
    expect(formatCompact(241_300)).toBe("241K");
  });

  it("drops a trailing .0 so 9000 is 9K, not 9.0K", () => {
    expect(formatCompact(9000)).toBe("9K");
  });

  it("leaves values under a thousand alone", () => {
    expect(formatCompact(999)).toBe("999");
    expect(formatCompact(0)).toBe("0");
  });

  it("scales past a million", () => {
    expect(formatCompact(2_400_000)).toBe("2.4M");
    expect(formatCompact(3_000_000_000)).toBe("3B");
  });
});

describe("formatViews", () => {
  it("singularises exactly one view", () => {
    expect(formatViews(1)).toBe("1 view");
    expect(formatViews(2)).toBe("2 views");
    expect(formatViews(0)).toBe("0 views");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-08-29T12:00:00.000Z");

  it("reports anything under a minute as just now", () => {
    expect(formatRelativeTime(new Date("2026-08-29T11:59:30.000Z"), now)).toBe("just now");
  });

  it("picks the largest unit that fits", () => {
    expect(formatRelativeTime(new Date("2026-08-29T09:00:00.000Z"), now)).toBe("3 hours ago");
    expect(formatRelativeTime(new Date("2026-08-26T12:00:00.000Z"), now)).toBe("3 days ago");
    expect(formatRelativeTime(new Date("2025-08-29T12:00:00.000Z"), now)).toBe("1 year ago");
  });

  it("singularises a count of one", () => {
    expect(formatRelativeTime(new Date("2026-08-28T12:00:00.000Z"), now)).toBe("1 day ago");
  });

  it("accepts an ISO string, which is how dates arrive over the wire", () => {
    expect(formatRelativeTime("2026-08-28T12:00:00.000Z", now)).toBe("1 day ago");
  });
});

describe("formatDate", () => {
  it("renders a stable date regardless of the host locale", () => {
    expect(formatDate("2026-08-29T12:00:00.000Z")).toBe("August 29, 2026");
  });

  it("returns an empty string for an unparseable value", () => {
    expect(formatDate("not a date")).toBe("");
  });
});

describe("timestamp parameters", () => {
  it("round-trips through the share-link format", () => {
    for (const seconds of [0, 9, 60, 95, 3600, 3725]) {
      expect(parseTimestampParam(formatTimestampParam(seconds))).toBe(seconds);
    }
  });

  it("accepts a bare number of seconds", () => {
    expect(parseTimestampParam("95")).toBe(95);
  });

  it("treats missing or malformed input as the start", () => {
    expect(parseTimestampParam(null)).toBe(0);
    expect(parseTimestampParam(undefined)).toBe(0);
    expect(parseTimestampParam("")).toBe(0);
    expect(parseTimestampParam("banana")).toBe(0);
  });
});
