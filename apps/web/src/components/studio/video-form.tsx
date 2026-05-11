"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { CategorySchema } from "@/shared/types";
import type { CreateVideoBodySchema, CreateVideoInputSchema } from "@/shared/validation";

import { Button } from "@/shared-ui/components/button";
import { useForm, zodResolver } from "@/shared-ui/components/form";
import { FormInput } from "@/shared-ui/components/input";
import { createVideoBodySchema } from "@/shared/validation";

import { api } from "../../lib/api-client";

type VideoFormProps = {
  categories: CategorySchema[];
  /** Present when editing; absent when publishing something new. */
  initial?: Partial<CreateVideoInputSchema> & { slug: string };
};

export const VideoForm = ({ categories, initial }: VideoFormProps) => {
  const router = useRouter();
  const [error, setError] = useState<null | string>(null);

  // <fields, context, parsed> — the fields are the pre-default shape, the
  // submit handler receives the parsed one.
  const { control, formState, handleSubmit, register, watch } = useForm<
    CreateVideoInputSchema,
    unknown,
    CreateVideoBodySchema
  >({
    defaultValues: {
      categorySlug: initial?.categorySlug ?? categories[0]?.slug,
      description: initial?.description ?? "",
      durationSeconds: initial?.durationSeconds ?? 0,
      sourceUrl: initial?.sourceUrl ?? null,
      tags: initial?.tags ?? [],
      thumbnailUrl: initial?.thumbnailUrl ?? null,
      title: initial?.title ?? "",
      visibility: initial?.visibility ?? "PUBLIC",
    },
    resolver: zodResolver(createVideoBodySchema),
  });

  const onSubmit = handleSubmit(async values => {
    setError(null);

    const payload = {
      ...values,
      // Empty URL fields mean "no URL", not an empty string, which would fail
      // the .url() check on the way in.
      sourceUrl: values.sourceUrl || null,
      thumbnailUrl: values.thumbnailUrl || null,
    };

    const result = initial
      ? await api.videos.update({ body: payload, params: { slug: initial.slug } })
      : await api.videos.create({ body: payload });

    if (result.status === 200 || result.status === 201) {
      router.refresh();
      router.push(`/watch/${result.body.slug}`);
      return;
    }

    const body = result.body as null | { message?: string };
    setError(body?.message ?? "Could not save the video.");
  });

  return (
    <form className="flex max-w-2xl flex-col gap-4" noValidate onSubmit={onSubmit}>
      <FormInput
        className="h-10"
        control={control}
        label="Title"
        name="title"
        placeholder="What is this video called?"
      />

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Description</span>
        <textarea
          className="focus-ring min-h-28 w-full resize-y rounded-lg border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground"
          placeholder="What is it about?"
          {...register("description")}
        />
      </label>

      <FormInput
        className="h-10"
        control={control}
        label="Video URL"
        name="sourceUrl"
        placeholder="https://example.com/video.mp4"
      />

      <FormInput
        className="h-10"
        control={control}
        label="Thumbnail URL (optional)"
        name="thumbnailUrl"
        placeholder="Leave empty to use generated artwork"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormInput
          className="h-10"
          control={control}
          label="Duration (seconds)"
          name="durationSeconds"
          type="number"
        />

        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium">Category</span>
          <select
            className="focus-ring h-10 rounded-lg border border-border bg-transparent px-3 text-sm"
            {...register("categorySlug")}
          >
            {categories.map(category => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Visibility</span>
        <select
          className="focus-ring h-10 rounded-lg border border-border bg-transparent px-3 text-sm"
          {...register("visibility")}
        >
          <option value="PUBLIC">Public — listed everywhere</option>
          <option value="UNLISTED">Unlisted — anyone with the link</option>
          <option value="PRIVATE">Private — only you</option>
        </select>
      </label>

      {error && (
        <p
          className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger"
          role="alert"
        >
          {error}
        </p>
      )}

      <div className="flex items-center gap-2">
        <Button disabled={formState.isSubmitting} type="submit">
          {formState.isSubmitting ? "Saving…" : initial ? "Save changes" : "Publish"}
        </Button>
        <Button onClick={() => router.back()} type="button" variant="ghost">
          Cancel
        </Button>
      </div>

      <p className="text-muted-foreground text-body-s">
        Preview: {watch("title") || "Untitled"} · {watch("visibility")}
      </p>
    </form>
  );
};
