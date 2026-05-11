import type { Express } from "express";

import { prisma } from "@nx-vi-hub/db/server";
import request from "supertest";

import { createApp } from "./app";

/**
 * End-to-end tests against a real Postgres database.
 *
 * They exercise the whole stack — routing, contract validation, services and
 * Prisma — because that is where the interesting failures live. Everything is
 * namespaced with a per-run suffix and removed afterwards, so the tests can run
 * against a seeded development database without disturbing it.
 */
const RUN_ID = Math.random().toString(36).slice(2, 10);

const account = {
  email: `test-${RUN_ID}@vihub.test`,
  password: "integration-test-password",
  username: `test${RUN_ID}`,
};

let app: Express;
let agent: ReturnType<typeof request.agent>;

/** Pulls a cookie value out of a Set-Cookie header list. */
const cookieValue = (headers: string[] | undefined, name: string): string | undefined =>
  headers
    ?.find(header => header.startsWith(`${name}=`))
    ?.split(";")[0]
    ?.split("=")[1];

beforeAll(() => {
  app = createApp();
  // supertest's agent keeps cookies between requests, which is what makes the
  // session flow testable without handling tokens by hand.
  agent = request.agent(app);
});

afterAll(async () => {
  // Deleting the user cascades to their channel, videos, comments and tokens.
  await prisma.user.deleteMany({ where: { email: account.email } });
  await prisma.$disconnect();
});

describe("health and documentation", () => {
  it("reports healthy", async () => {
    const response = await request(app).get("/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("serves an OpenAPI document generated from the contract", async () => {
    const response = await request(app).get("/openapi.json");
    expect(response.status).toBe(200);
    // Pinning the patch version would fail on a ts-rest upgrade that changes
    // nothing we depend on; the major version is what governs the shape.
    expect(response.body.openapi).toMatch(/^3\./);
    expect(Object.keys(response.body.paths).length).toBeGreaterThan(20);
  });
});

describe("public catalog", () => {
  it("lists videos with pagination metadata", async () => {
    const response = await request(app).get("/api/web/videos?limit=2");
    expect(response.status).toBe(200);
    expect(response.body.items.length).toBeLessThanOrEqual(2);
    expect(response.body.pagination).toMatchObject({ limit: 2, page: 1 });
  });

  it("rejects a limit above the cap instead of reading the whole catalog", async () => {
    const response = await request(app).get("/api/web/videos?limit=100000");
    expect(response.status).toBe(400);
  });

  it("answers 404 for a slug that does not exist", async () => {
    const response = await request(app).get("/api/web/videos/no-such-video-anywhere");
    expect(response.status).toBe(404);
    expect(response.body.name).toBe("NotFoundError");
  });

  it("returns every home page shelf in one request", async () => {
    const response = await request(app).get("/api/web/catalog/discover");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("trending");
    expect(response.body).toHaveProperty("fresh");
    expect(response.body).toHaveProperty("continueWatching");
  });
});

describe("authentication", () => {
  it("refuses a protected route without a session", async () => {
    const response = await request(app).get("/api/web/auth/me");
    expect(response.status).toBe(401);
  });

  it("creates an account and sets both auth cookies", async () => {
    const response = await agent.post("/api/web/auth/sign-up").send(account);

    expect(response.status).toBe(201);
    expect(response.body.user.username).toBe(account.username);
    // The password must never come back, hashed or otherwise.
    expect(JSON.stringify(response.body)).not.toContain(account.password);

    const cookies = response.headers["set-cookie"] as unknown as string[];
    expect(cookieValue(cookies, "vihub_access")).toBeTruthy();
    expect(cookieValue(cookies, "vihub_refresh")).toBeTruthy();
  });

  it("refuses a second account on the same email", async () => {
    const response = await request(app)
      .post("/api/web/auth/sign-up")
      .send({ ...account, username: `other${RUN_ID}` });

    expect(response.status).toBe(409);
  });

  it("identifies the signed-in user", async () => {
    const response = await agent.get("/api/web/auth/me");
    expect(response.status).toBe(200);
    expect(response.body.email).toBe(account.email);
    expect(response.body).not.toHaveProperty("passwordHash");
  });

  it("rejects a wrong password", async () => {
    const response = await request(app)
      .post("/api/web/auth/sign-in")
      .send({ email: account.email, password: "definitely-wrong" });

    expect(response.status).toBe(401);
  });

  it("rotates the refresh token and refuses to reuse the spent one", async () => {
    const session = request.agent(app);
    const signIn = await session
      .post("/api/web/auth/sign-in")
      .send({ email: account.email, password: account.password });

    const original = cookieValue(
      signIn.headers["set-cookie"] as unknown as string[],
      "vihub_refresh",
    );
    expect(original).toBeTruthy();

    const refreshed = await session.post("/api/web/auth/refresh");
    expect(refreshed.status).toBe(200);

    const rotated = cookieValue(
      refreshed.headers["set-cookie"] as unknown as string[],
      "vihub_refresh",
    );
    expect(rotated).toBeTruthy();
    expect(rotated).not.toBe(original);

    // Replaying the spent token must fail, which is the point of rotating.
    const replay = await request(app)
      .post("/api/web/auth/refresh")
      .set("Cookie", `vihub_refresh=${original}`);
    expect(replay.status).toBe(401);
  });
});

describe("publishing and engagement", () => {
  const handle = `ch${RUN_ID}`;
  let slug: string;

  it("requires a channel before publishing", async () => {
    const response = await agent
      .post("/api/web/videos")
      .send({ durationSeconds: 10, title: "Should not be published" });

    expect(response.status).toBe(403);
  });

  it("creates a channel", async () => {
    const response = await agent
      .post("/api/web/channels")
      .send({ handle, name: `Test Channel ${RUN_ID}` });

    expect(response.status).toBe(201);
    expect(response.body.handle).toBe(handle);
    expect(response.body.subscriberCount).toBe(0);
  });

  it("refuses a handle that is already taken", async () => {
    const other = request.agent(app);
    await other.post("/api/web/auth/sign-up").send({
      email: `second-${RUN_ID}@vihub.test`,
      password: account.password,
      username: `second${RUN_ID}`,
    });

    const response = await other
      .post("/api/web/channels")
      .send({ handle, name: "Colliding channel" });

    expect(response.status).toBe(409);
    await prisma.user.deleteMany({ where: { email: `second-${RUN_ID}@vihub.test` } });
  });

  it("publishes a video", async () => {
    const response = await agent.post("/api/web/videos").send({
      description: "Created by the integration suite.",
      durationSeconds: 120,
      tags: ["testing"],
      title: `Integration test video ${RUN_ID}`,
    });

    expect(response.status).toBe(201);
    slug = response.body.slug;
    expect(slug).toContain("integration-test-video");
  });

  it("counts a view", async () => {
    const before = await request(app).get(`/api/web/videos/${slug}`);
    await request(app).post(`/api/web/videos/${slug}/views`);
    const after = await request(app).get(`/api/web/videos/${slug}`);

    expect(after.body.views).toBe(before.body.views + 1);
  });

  it("toggles a like off when applied twice", async () => {
    const liked = await agent.put(`/api/web/videos/${slug}/reaction`).send({ type: "LIKE" });
    expect(liked.status).toBe(200);
    expect(liked.body).toMatchObject({ likeCount: 1, viewerReaction: "LIKE" });

    const cleared = await agent.put(`/api/web/videos/${slug}/reaction`).send({ type: null });
    expect(cleared.body).toMatchObject({ likeCount: 0, viewerReaction: null });
  });

  it("clamps a resume position to the video's duration", async () => {
    const response = await agent
      .put(`/api/web/videos/${slug}/progress`)
      .send({ positionSeconds: 999_999 });

    expect(response.status).toBe(200);
    expect(response.body.positionSeconds).toBe(120);
    expect(response.body.completed).toBe(true);
  });

  it("posts a comment and one level of reply, but refuses to nest further", async () => {
    const comment = await agent
      .post(`/api/web/videos/${slug}/comments`)
      .send({ body: "A comment from the integration suite." });
    expect(comment.status).toBe(201);

    const reply = await agent
      .post(`/api/web/videos/${slug}/comments`)
      .send({ body: "A reply.", parentId: comment.body.id });
    expect(reply.status).toBe(201);

    const nested = await agent
      .post(`/api/web/videos/${slug}/comments`)
      .send({ body: "Too deep.", parentId: reply.body.id });
    expect(nested.status).toBe(400);
  });

  it("rejects an empty comment", async () => {
    const response = await agent.post(`/api/web/videos/${slug}/comments`).send({ body: "   " });
    expect(response.status).toBe(400);
  });

  it("refuses to subscribe to your own channel", async () => {
    const response = await agent.post(`/api/web/channels/${handle}/subscribe`);
    expect(response.status).toBe(403);
  });

  it("hides a private video from everyone but its owner", async () => {
    await agent.patch(`/api/web/videos/${slug}`).send({ visibility: "PRIVATE" });

    const anonymous = await request(app).get(`/api/web/videos/${slug}`);
    expect(anonymous.status).toBe(404);

    const owner = await agent.get(`/api/web/videos/${slug}`);
    expect(owner.status).toBe(200);

    await agent.patch(`/api/web/videos/${slug}`).send({ visibility: "PUBLIC" });
  });

  it("refuses to edit someone else's video", async () => {
    const stranger = request.agent(app);
    await stranger.post("/api/web/auth/sign-up").send({
      email: `stranger-${RUN_ID}@vihub.test`,
      password: account.password,
      username: `stranger${RUN_ID}`,
    });

    const response = await stranger.patch(`/api/web/videos/${slug}`).send({ title: "Hijacked" });
    expect(response.status).toBe(403);

    await prisma.user.deleteMany({ where: { email: `stranger-${RUN_ID}@vihub.test` } });
  });
});

describe("library", () => {
  it("creates the two built-in playlists on first read", async () => {
    const response = await agent.get("/api/web/library/playlists");
    expect(response.status).toBe(200);

    const systems = response.body.items.map(
      (playlist: { system: null | string }) => playlist.system,
    );
    expect(systems).toContain("watch-later");
    expect(systems).toContain("liked");
  });

  it("refuses to delete a built-in playlist", async () => {
    const playlists = await agent.get("/api/web/library/playlists");
    const watchLater = playlists.body.items.find(
      (playlist: { system: null | string }) => playlist.system === "watch-later",
    );

    const response = await agent.delete(`/api/web/library/playlists/${watchLater.id}`);
    expect(response.status).toBe(400);
  });

  it("adds a video to a playlist and treats a repeat add as a no-op", async () => {
    const created = await agent
      .post("/api/web/library/playlists")
      .send({ title: `Suite playlist ${RUN_ID}` });
    expect(created.status).toBe(201);

    const video = await request(app).get("/api/web/videos?limit=1");
    const videoId = video.body.items[0].id;

    const first = await agent
      .post(`/api/web/library/playlists/${created.body.id}/items`)
      .send({ videoId });
    expect(first.status).toBe(201);
    expect(first.body.items).toHaveLength(1);

    const second = await agent
      .post(`/api/web/library/playlists/${created.body.id}/items`)
      .send({ videoId });
    expect(second.status).toBe(201);
    expect(second.body.items).toHaveLength(1);
  });

  it("rejects a reorder that does not list every item", async () => {
    const playlists = await agent.get("/api/web/library/playlists");
    const custom = playlists.body.items.find(
      (playlist: { system: null | string }) => playlist.system === null,
    );

    const response = await agent
      .put(`/api/web/library/playlists/${custom.id}/order`)
      .send({ itemIds: ["00000000-0000-4000-8000-000000000000"] });

    expect(response.status).toBe(400);
  });

  it("records and then clears watch history", async () => {
    const history = await agent.get("/api/web/library/history");
    expect(history.status).toBe(200);
    expect(history.body.pagination.count).toBeGreaterThan(0);

    await agent.delete("/api/web/library/history");

    const cleared = await agent.get("/api/web/library/history");
    expect(cleared.body.pagination.count).toBe(0);
  });
});

describe("sign out", () => {
  it("clears the session", async () => {
    const response = await agent.post("/api/web/auth/logout");
    expect(response.status).toBe(200);

    const me = await agent.get("/api/web/auth/me");
    expect(me.status).toBe(401);
  });
});
