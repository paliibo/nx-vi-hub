"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { SignUpFormSchema } from "@/shared/validation";

import { Button } from "@/shared-ui/components/button";
import { FormCheckbox } from "@/shared-ui/components/checkbox";
import { useForm, zodResolver } from "@/shared-ui/components/form";
import { FormInput } from "@/shared-ui/components/input";
import { signUpFormSchema } from "@/shared/validation";

import { Logo } from "../../../components/brand";
import { api } from "../../../lib/api-client";

export const SignUpForm = () => {
  const router = useRouter();
  const [error, setError] = useState<null | string>(null);

  const { control, formState, handleSubmit } = useForm<SignUpFormSchema>({
    defaultValues: {
      agree: false as never,
      confirmPassword: "",
      displayName: "",
      email: "",
      password: "",
      username: "",
    },
    resolver: zodResolver(signUpFormSchema),
  });

  const onSubmit = handleSubmit(async values => {
    setError(null);

    // confirmPassword and agree are checked here and deliberately not sent —
    // the API has no use for either.
    const result = await api.auth.signUp({
      body: {
        displayName: values.displayName || undefined,
        email: values.email,
        password: values.password,
        username: values.username,
      },
    });

    if (result.status === 201) {
      router.refresh();
      router.push("/");
      return;
    }

    const body = result.body as null | { message?: string };
    setError(body?.message ?? "Could not create your account. Please try again.");
  });

  return (
    <form
      className="flex flex-col gap-5 rounded-2xl border border-border bg-surface p-6 shadow-lg sm:p-8"
      noValidate
      onSubmit={onSubmit}
    >
      <div className="flex flex-col gap-2">
        <Logo />
        <h1 className="mt-2 text-headline-l">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Free, and everything stays on your own instance.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <FormInput
          autoComplete="username"
          className="h-10"
          control={control}
          label="Username"
          name="username"
          placeholder="lowercase_letters"
        />
        <FormInput
          autoComplete="nickname"
          className="h-10"
          control={control}
          label="Display name (optional)"
          name="displayName"
          placeholder="How you want to be shown"
        />
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
          autoComplete="new-password"
          className="h-10"
          control={control}
          label="Password"
          name="password"
          placeholder="At least 8 characters"
          type="password"
        />
        <FormInput
          autoComplete="new-password"
          className="h-10"
          control={control}
          label="Confirm password"
          name="confirmPassword"
          placeholder="Repeat your password"
          type="password"
        />
      </div>

      <FormCheckbox
        control={control}
        label="I agree to the terms of this demo instance"
        name="agree"
      />

      {error && (
        <p
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      <Button disabled={formState.isSubmitting} type="submit">
        {formState.isSubmitting ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          className="focus-ring rounded font-medium text-primary hover:underline"
          href="/sign-in"
        >
          Sign in
        </Link>
      </p>
    </form>
  );
};
