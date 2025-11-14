import type { ListCategoriesResponseSchema } from "@/shared/validation";
import type { Metadata, Viewport } from "next";

import { AppShell } from "../components/layout";
import { ThemeProvider } from "../components/theme";
import { okOrNull, serverApi } from "../lib/api-server";
import { APP_NAME, APP_TAGLINE } from "../lib/config";
import { getSession } from "../lib/session";
import "./global.css";

export const metadata: Metadata = {
  description:
    "Browse, watch and curate a self-hosted video library. Built with Nx, Next.js, Express, Prisma and a shared ts-rest contract.",
  title: { default: `${APP_NAME} — ${APP_TAGLINE}`, template: `%s · ${APP_NAME}` },
};

/**
 * Every route reads the session cookie through the shell, so nothing here can
 * be prerendered at build time. Saying so explicitly stops Next from attempting
 * static generation and falling back to the pages-router error component when
 * cookies() bails out mid-render.
 */
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  themeColor: [
    { color: "#faf9f7", media: "(prefers-color-scheme: light)" },
    { color: "#0f0f11", media: "(prefers-color-scheme: dark)" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Both are needed by the shell on every route, and both are cheap; fetching
  // them together avoids a waterfall between the layout and the first page.
  const [session, categories] = await Promise.all([
    getSession(),
    serverApi.catalog.categories().then(okOrNull<ListCategoriesResponseSchema>),
  ]);

  return (
    // suppressHydrationWarning is required by next-themes: it writes the theme
    // attribute before React hydrates, which React would otherwise flag as a
    // server/client mismatch on <html>.
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <a
            className="focus-ring sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2"
            href="#main"
          >
            Skip to content
          </a>

          <AppShell categories={categories?.items ?? []} session={session}>
            {children}
          </AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
