import type { Metadata } from "next";

import { redirectIfSignedIn } from "../../../lib/session";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  // Next 15 hands request data in as a promise so the page can start rendering
  // before the query string is parsed.
  searchParams: Promise<{ next?: string }>;
}) {
  await redirectIfSignedIn();

  const { next } = await searchParams;

  return <SignInForm returnTo={next} />;
}
