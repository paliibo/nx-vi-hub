"use client";

import type { CreateChannelBodySchema } from "@/shared/validation";

import { createChannelBodySchema } from "@/shared/validation";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/shared-ui/components/button";
import { useForm, zodResolver } from "@/shared-ui/components/form";
import { FormInput } from "@/shared-ui/components/input";

import { api } from "../../lib/api-client";

export const CreateChannelForm = ({ suggestedHandle }: { suggestedHandle: string }) => {
  const router = useRouter();
  const [error, setError] = useState<null | string>(null);

  const { control, formState, handleSubmit } = useForm<CreateChannelBodySchema>({
    defaultValues: {
      accentColor: "#a3e635",
      description: "",
      handle: suggestedHandle,
      name: "",
    },
    resolver: zodResolver(createChannelBodySchema),
  });

  const onSubmit = handleSubmit(async values => {
    setError(null);

    const result = await api.channels.create({
      body: { ...values, description: values.description || null },
    });

    if (result.status === 201) {
      router.refresh();
      router.push(`/channel/${result.body.handle}`);
      return;
    }

    const body = result.body as { message?: string } | null;
    setError(body?.message ?? "Could not create the channel.");
  });

  return (
    <form className="flex max-w-lg flex-col gap-4" noValidate onSubmit={onSubmit}>
      <FormInput
        className="h-10"
        control={control}
        label="Channel name"
        name="name"
        placeholder="What is your channel called?"
      />

      <FormInput
        className="h-10"
        control={control}
        label="Handle"
        name="handle"
        placeholder="lowercase_letters"
      />

      <FormInput
        className="h-10"
        control={control}
        label="Description (optional)"
        name="description"
        placeholder="What do you publish?"
      />

      <FormInput
        className="h-10 max-w-40"
        control={control}
        label="Accent colour"
        name="accentColor"
        type="color"
      />

      {error && (
        <p
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      <Button className="w-fit" disabled={formState.isSubmitting} type="submit">
        {formState.isSubmitting ? "Creating…" : "Create channel"}
      </Button>
    </form>
  );
};
