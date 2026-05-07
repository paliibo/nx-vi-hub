import { slugify, uniqueSlug } from "./slug";

describe("slugify", () => {
  it("lowercases and joins words with single hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
    expect(slugify("  spaced   out  ")).toBe("spaced-out");
  });

  it("strips punctuation rather than encoding it", () => {
    expect(slugify("A monorepo is a build graph — wearing a trench coat!")).toBe(
      "a-monorepo-is-a-build-graph-wearing-a-trench-coat",
    );
  });

  it("folds accents to their base letters", () => {
    expect(slugify("Crème brûlée")).toBe("creme-brulee");
  });

  it("never leaves a leading or trailing hyphen", () => {
    expect(slugify("!!! shouting !!!")).toBe("shouting");
  });

  it("produces an empty string when nothing survives", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("uniqueSlug", () => {
  it("returns the plain slug when it is free", () => {
    expect(uniqueSlug("My Video", [])).toBe("my-video");
  });

  it("suffixes from 2 upwards, skipping taken numbers", () => {
    expect(uniqueSlug("My Video", ["my-video"])).toBe("my-video-2");
    expect(uniqueSlug("My Video", ["my-video", "my-video-2"])).toBe("my-video-3");
    expect(uniqueSlug("My Video", ["my-video", "my-video-2", "my-video-3"])).toBe("my-video-4");
  });

  it("falls back to a usable slug when the title has no usable characters", () => {
    expect(uniqueSlug("!!!", [])).toBe("video");
  });
});
