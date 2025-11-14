import type { Metadata } from "next";

import { redirectIfSignedIn } from "../../../lib/session";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = { title: "Create an account" };

export default async function SignUpPage() {
  await redirectIfSignedIn();
  return <SignUpForm />;
}
