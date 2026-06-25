import { Prisma, PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import { config } from "dotenv";
import { existsSync } from "fs";
import { dirname, join } from "path";

import { CATEGORIES, CHANNELS, COMMENT_BODIES, REPLY_BODIES, SAMPLE_SOURCES, VIDEOS } from "./data";
import { daysBefore, pick, pickFrom, slugify } from "./helpers";

/**
 * Walks up from this file looking for the workspace .env.
 *
 * A fixed relative path breaks the moment the seed runs from somewhere other
 * than its source tree — which is exactly what happens in the Docker image,
 * where it is compiled to dist/seed and sits at a different depth.
 */
const findEnvFile = (from: string): string | undefined => {
  let directory = from;
  for (let depth = 0; depth < 8; depth += 1) {
    const candidate = join(directory, ".env");
    if (existsSync(candidate)) return candidate;
    const parent = dirname(directory);
    if (parent === directory) break;
    directory = parent;
  }
  return undefined;
};

// In a container the values come from the environment and there is no file,
// which is fine: dotenv never overwrites what is already set.
config({ path: findEnvFile(__dirname), quiet: true });

const prisma = new PrismaClient();

/** Fixed reference point so re-running the seed does not reshuffle the catalog. */
const REFERENCE_DATE = new Date("2026-08-01T12:00:00.000Z");

const DEMO_USER = {
  displayName: "Demo Viewer",
  email: "demo@vihub.dev",
  password: "demo1234",
  username: "demo",
};

const SEED_PASSWORD = "vihub1234";

const CURATED_PLAYLIST = {
  description: "Talks worth the full runtime.",
  title: "Worth the hour",
};

async function main() {
  console.log("Seeding Vi Hub…");

  const passwordHash = await argon2.hash(SEED_PASSWORD);
  const demoPasswordHash = await argon2.hash(DEMO_USER.password);

  const categories = await seedCategories();
  console.log(`  categories  ${categories.length}`);

  const channels = await seedChannels(passwordHash);
  console.log(`  channels    ${channels.length}`);

  const videos = await seedVideos(channels, categories);
  console.log(`  videos      ${videos.length}`);

  const demoUser = await prisma.user.upsert({
    create: {
      bio: "Signed in so you can try the library, playlists and comments.",
      displayName: DEMO_USER.displayName,
      email: DEMO_USER.email,
      passwordHash: demoPasswordHash,
      username: DEMO_USER.username,
    },
    update: { displayName: DEMO_USER.displayName, passwordHash: demoPasswordHash },
    where: { email: DEMO_USER.email },
  });

  const users = await prisma.user.findMany({ select: { id: true, username: true } });

  await seedEngagement(videos, users);
  const commentCount = await prisma.comment.count();
  console.log(`  comments    ${commentCount}`);

  await seedDemoLibrary(demoUser.id, channels, videos);
  console.log(`  demo login  ${DEMO_USER.email} / ${DEMO_USER.password}`);

  console.log("Done.");
}

async function seedCategories() {
  for (const [index, category] of CATEGORIES.entries()) {
    await prisma.category.upsert({
      create: { ...category, position: index },
      update: { ...category, position: index },
      where: { slug: category.slug },
    });
  }
  return prisma.category.findMany();
}

async function seedChannels(passwordHash: string) {
  for (const channel of CHANNELS) {
    const user = await prisma.user.upsert({
      create: {
        bio: channel.bio,
        displayName: channel.displayName,
        email: channel.email,
        passwordHash,
        username: channel.username,
      },
      update: { bio: channel.bio, displayName: channel.displayName },
      where: { email: channel.email },
    });

    await prisma.channel.upsert({
      create: {
        accentColor: channel.accentColor,
        description: channel.description,
        handle: channel.handle,
        name: channel.name,
        ownerId: user.id,
      },
      update: {
        accentColor: channel.accentColor,
        description: channel.description,
        name: channel.name,
      },
      where: { handle: channel.handle },
    });
  }
  return prisma.channel.findMany();
}

async function seedDemoLibrary(
  demoUserId: string,
  channels: { id: string }[],
  videos: { durationSeconds: number; id: string; slug: string }[],
) {
  // Subscribe the demo account to most channels so the sidebar is not empty.
  for (const channel of channels.slice(0, 5)) {
    await prisma.subscription.upsert({
      create: { channelId: channel.id, userId: demoUserId },
      update: {},
      where: { userId_channelId: { channelId: channel.id, userId: demoUserId } },
    });
  }

  // Half-watched videos, so "Continue watching" has something to show.
  for (const video of videos.slice(0, 6)) {
    const ratio = pick(`${video.slug}:progress`, 15, 80) / 100;
    await prisma.watchHistory.upsert({
      create: {
        positionSeconds: Math.round(video.durationSeconds * ratio),
        userId: demoUserId,
        videoId: video.id,
        watchedAt: daysBefore(REFERENCE_DATE, pick(`${video.slug}:watched`, 0, 20)),
      },
      update: {},
      where: { userId_videoId: { userId: demoUserId, videoId: video.id } },
    });
  }

  // A normal user-created playlist. The two built-in playlists (Watch later,
  // Liked videos) are not seeded — the API creates them on first access, so
  // accounts made before this feature existed get them too.
  const existing = await prisma.playlist.findFirst({
    where: { ownerId: demoUserId, title: CURATED_PLAYLIST.title },
  });

  const curated =
    existing ??
    (await prisma.playlist.create({
      data: {
        description: CURATED_PLAYLIST.description,
        ownerId: demoUserId,
        title: CURATED_PLAYLIST.title,
        visibility: "PUBLIC",
      },
    }));

  for (const [position, video] of videos.slice(2, 9).entries()) {
    await prisma.playlistItem.upsert({
      create: { playlistId: curated.id, position, videoId: video.id },
      update: { position },
      where: { playlistId_videoId: { playlistId: curated.id, videoId: video.id } },
    });
  }
}

async function seedEngagement(
  videos: { durationSeconds: number; id: string; slug: string }[],
  users: { id: string; username: string }[],
) {
  for (const video of videos) {
    // A deterministic slice of the user list reacts to and comments on each video.
    const commenterCount = pick(`${video.slug}:comments`, 1, 4);

    for (let index = 0; index < commenterCount; index += 1) {
      const author = users[pick(`${video.slug}:author:${index}`, 0, users.length - 1)];
      const body = pickFrom(`${video.slug}:body:${index}`, COMMENT_BODIES);

      const existing = await prisma.comment.findFirst({
        where: { authorId: author.id, body, parentId: null, videoId: video.id },
      });
      if (existing) continue;

      const comment = await prisma.comment.create({
        data: { authorId: author.id, body, videoId: video.id },
      });

      if (pick(`${video.slug}:reply:${index}`, 0, 2) === 0) {
        const replier = users[pick(`${video.slug}:replier:${index}`, 0, users.length - 1)];
        await prisma.comment.create({
          data: {
            authorId: replier.id,
            body: pickFrom(`${video.slug}:replybody:${index}`, REPLY_BODIES),
            parentId: comment.id,
            videoId: video.id,
          },
        });
      }
    }

    for (const user of users) {
      const roll = pick(`${video.slug}:${user.username}:reaction`, 0, 9);
      if (roll > 5) continue;
      await prisma.reaction.upsert({
        create: {
          type: roll === 5 ? "DISLIKE" : "LIKE",
          userId: user.id,
          videoId: video.id,
        },
        update: {},
        where: { userId_videoId: { userId: user.id, videoId: video.id } },
      });
    }
  }
}

async function seedVideos(
  channels: { handle: string; id: string }[],
  categories: { id: string; slug: string }[],
) {
  const channelByHandle = new Map(channels.map(channel => [channel.handle, channel.id]));
  const categoryBySlug = new Map(categories.map(category => [category.slug, category.id]));

  for (const [index, video] of VIDEOS.entries()) {
    const slug = slugify(video.title);
    const channelId = channelByHandle.get(video.channelHandle);
    if (!channelId) continue;

    // Derived from the slug so the same title always yields the same numbers.
    const durationSeconds = pick(`${slug}:duration`, 4 * 60, 47 * 60);
    const views = pick(`${slug}:views`, 900, 480_000);
    const publishedAt = daysBefore(REFERENCE_DATE, pick(`${slug}:age`, 1, 420));

    const record = await prisma.video.upsert({
      create: {
        categoryId: categoryBySlug.get(video.categorySlug) ?? null,
        channelId,
        description: video.description,
        durationSeconds,
        publishedAt,
        slug,
        sourceUrl: SAMPLE_SOURCES[index % SAMPLE_SOURCES.length],
        title: video.title,
        views,
      },
      update: {
        categoryId: categoryBySlug.get(video.categorySlug) ?? null,
        description: video.description,
        durationSeconds,
        publishedAt,
        sourceUrl: SAMPLE_SOURCES[index % SAMPLE_SOURCES.length],
        title: video.title,
        views,
      },
      where: { slug },
    });

    for (const tagName of video.tags) {
      const tagSlug = slugify(tagName);
      const tag = await prisma.tag.upsert({
        create: { name: tagName, slug: tagSlug },
        update: {},
        where: { slug: tagSlug },
      });
      await prisma.videoTag.upsert({
        create: { tagId: tag.id, videoId: record.id },
        update: {},
        where: { videoId_tagId: { tagId: tag.id, videoId: record.id } },
      });
    }
  }

  return prisma.video.findMany({ orderBy: { publishedAt: "desc" } });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async error => {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error(`Prisma error ${error.code}: ${error.message}`);
    } else {
      console.error(error);
    }
    await prisma.$disconnect();
    process.exit(1);
  });
