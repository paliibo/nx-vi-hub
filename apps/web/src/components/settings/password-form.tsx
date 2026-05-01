"use client";

import { useState } from "react";

import type { ChangePasswordBodySchema } from "@/shared/validation";

import { Button } from "@/shared-ui/components/button";
import { useForm, zodResolver } from "@/shared-ui/components/form";
import { FormInput } from "@/shared-ui/components/input";
import { changePasswordBodySchema } from "@/shared/validation";

import { api } from "../../lib/api-client";

export const PasswordForm = () => {
  const [status, setStatus] = useState<null | { message: string; ok: boolean }>(null);

  const { control, formState, handleSubmit, reset } = useForm<ChangePasswordBodySchema>({
    defaultValues: { currentPassword: "", newPassword: "" },
    resolver: zodResolver(changePasswordBodySchema),
  });

  const onSubmit = handleSubmit(async values => {
    const result = await api.auth.changePassword({ body: values });

    if (result.status === 200) {
      reset();
      setStatus({
        message: "Password changed. Any other devices you were signed in on have been signed out.",
        ok: true,
      });
      return;
    }

    const body = result.body as null | { message?: string };
    setStatus({ message: body?.message ?? "Could not change your password.", ok: false });
  });

  return (
    <form className="flex max-w-lg flex-col gap-4" noValidate onSubmit={onSubmit}>
      <FormInput
        autoComplete="current-password"
        className="h-10"
        control={control}
        label="Current password"
        name="currentPassword"
        type="password"
      />

      <FormInput
        autoComplete="new-password"
        className="h-10"
        control={control}
        label="New password"
        name="newPassword"
        type="password"
      />

      {status && (
        <p
          className={
            status.ok
              ? "rounded-lg border border-success/40 bg-success/10 px-3 py-2 text-sm text-success"
              : "rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          }
          role="status"
        >
          {status.message}
        </p>
      )}

      <Button className="w-fit" disabled={formState.isSubmitting} type="submit">
        {formState.isSubmitting ? "Changing…" : "Change password"}
      </Button>
    </form>
  );
};
