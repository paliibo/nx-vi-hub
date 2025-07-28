import { authRouter } from "./auth.router";
import { catalogRouter } from "./catalog.router";
import { channelsRouter } from "./channels.router";
import { commentsRouter } from "./comments.router";
import { libraryRouter } from "./library.router";
import { videosRouter } from "./videos.router";

export const appRouter = {
  auth: authRouter,
  catalog: catalogRouter,
  channels: channelsRouter,
  comments: commentsRouter,
  library: libraryRouter,
  videos: videosRouter,
};
