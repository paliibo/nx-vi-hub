import type { Metadata } from "next";

import { redirectIfSignedIn } from "../../../lib/session";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function SignInPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  await redirectIfSignedIn();

  return <SignInForm returnTo={searchParams.next} />;
}
