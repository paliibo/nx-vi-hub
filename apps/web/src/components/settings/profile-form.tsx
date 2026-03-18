"use client";

import type { SessionUserSchema } from "@/shared/types";
import type { UpdateProfileBodySchema } from "@/shared/validation";

import { updateProfileBodySchema } from "@/shared/validation";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared-ui/components/button";
import { useForm, zodResolver } from "@/shared-ui/components/form";
import { FormInput } from "@/shared-ui/components/input";

import { api } from "../../lib/api-client";

export const ProfileForm = ({ session }: { session: SessionUserSchema }) => {
  const router = useRouter();
  const [status, setStatus] = useState<null | { message: string; ok: boolean }>(null);

  const { control, formState, handleSubmit, register } = useForm<UpdateProfileBodySchema>({
    defaultValues: {
      avatarUrl: session.avatarUrl,
      bio: session.bio ?? "",
      displayName: session.displayName,
    },
    resolver: zodResolver(updateProfileBodySchema),
  });

  const onSubmit = handleSubmit(async values => {
    const result = await api.auth.updateProfile({
      body: {
        avatarUrl: values.avatarUrl || null,
        bio: values.bio || null,
        displayName: values.displayName,
      },
    });

    if (result.status === 200) {
      setStatus({ message: "Profile saved.", ok: true });
      router.refresh();
      return;
    }

    const body = result.body as { message?: string } | null;
    setStatus({ message: body?.message ?? "Could not save your profile.", ok: false });
  });

  return (
    <form className="flex max-w-lg flex-col gap-4" noValidate onSubmit={onSubmit}>
      <FormInput className="h-10" control={control} label="Display name" name="displayName" />

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Bio</span>
        <textarea
          className="focus-ring min-h-24 w-full resize-y rounded-lg border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground"
          maxLength={400}
          placeholder="A sentence or two about you"
          {...register("bio")}
        />
      </label>

      <FormInput
        className="h-10"
        control={control}
        label="Avatar URL (optional)"
        name="avatarUrl"
        placeholder="https://example.com/you.jpg"
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
        {formState.isSubmitting ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
};
