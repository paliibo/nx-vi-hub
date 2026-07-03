"use client";

import Link from "next/link";
import { useState } from "react";

import type { SignInBodySchema } from "@/shared/validation";

import { Button } from "@/shared-ui/components/button";
import { useForm, zodResolver } from "@/shared-ui/components/form";
import { FormInput } from "@/shared-ui/components/input";
import { signInBodySchema } from "@/shared/validation";

import { Logo } from "../../../components/brand";
import { api } from "../../../lib/api-client";

const DEMO = { email: "demo@vihub.dev", password: "demo1234" };

export const SignInForm = ({ returnTo }: { returnTo?: string }) => {
  const [error, setError] = useState<null | string>(null);

  const { control, formState, handleSubmit, setValue } = useForm<SignInBodySchema>({
    defaultValues: { email: "", password: "" },
    resolver: zodResolver(signInBodySchema),
  });

  const onSubmit = handleSubmit(async values => {
    setError(null);

    // Posted from the browser, not from a server action, so the Set-Cookie the
    // API returns is stored by the browser itself. Going through the server
    // would mean copying cookies back out of the response by hand.
    const result = await api.auth.signIn({ body: values });

    if (result.status === 200) {
      // A full document navigation rather than router.push().
      //
      // The session is read by the root layout, so signing in changes every
      // server component on the page. router.refresh() followed by a push races
      // — the push cancels the in-flight refresh and the shell renders signed
      // out until the next reload. Reloading is unambiguous, and an auth
      // transition is exactly the moment where paying for one is fine.
      //
      // Only same-origin paths are accepted, so a crafted ?next= cannot bounce
      // the user off the site.
      const target = returnTo?.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/";
      window.location.assign(target);
      return;
    }

    const body = result.body as null | { message?: string };
    setError(body?.message ?? "Could not sign you in. Please try again.");
  });

  const fillDemo = () => {
    setValue("email", DEMO.email, { shouldValidate: true });
    setValue("password", DEMO.password, { shouldValidate: true });
  };

  return (
    <form
      className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-8"
      noValidate
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-2">
        <Logo />
        <h1 className="mt-2 text-headline-l">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to keep your history, playlists and subscriptions.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <FormInput
          autoComplete="email"
          className="h-10"
          control={control}
          label="Email"
          name="email"
          placeholder="you@example.com"
          type="email"
        />
        <FormInput
          autoComplete="current-password"
          className="h-10"
          control={control}
          label="Password"
          name="password"
          placeholder="••••••••"
          type="password"
        />
      </div>

      {error && (
        <p
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      <Button disabled={formState.isSubmitting} type="submit">
        {formState.isSubmitting ? "Signing in…" : "Sign in"}
      </Button>

      <button
        className="focus-ring rounded-lg border border-dashed border-border px-3 py-2 text-muted-foreground transition-colors text-body-s hover:border-border-strong hover:text-foreground"
        onClick={fillDemo}
        type="button"
      >
        Use the demo account — {DEMO.email} / {DEMO.password}
      </button>

      <p className="text-center text-sm text-muted-foreground">
        No account yet?{" "}
        <Link
          className="focus-ring rounded font-medium text-primary hover:underline"
          href="/sign-up"
        >
          Create one
        </Link>
      </p>
    </form>
  );
};
