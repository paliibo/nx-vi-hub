"use client";

import type { CommentThreadSchema, SessionUserSchema } from "@/shared/types";

import { ChatBubbleIcon, TrashIcon } from "@radix-ui/react-icons";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/shared-ui/components/button";

import { api } from "../../lib/api-client";
import { formatRelativeTime } from "../../lib/format";

type CommentListProps = {
  initialThreads: CommentThreadSchema[];
  session: null | SessionUserSchema;
  slug: string;
  total: number;
};

const Avatar = ({ name }: { name: string }) => (
  <span
    aria-hidden="true"
    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-muted-foreground"
  >
    {name.slice(0, 2)}
  </span>
);

export const CommentList = ({ initialThreads, session, slug, total }: CommentListProps) => {
  const [threads, setThreads] = useState(initialThreads);
  const [draft, setDraft] = useState("");
  const [replyTo, setReplyTo] = useState<null | string>(null);
  const [replyDraft, setReplyDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const post = async (body: string, parentId?: string) => {
    if (!body.trim() || !session) return;
    setBusy(true);

    const result = await api.comments.create({
      body: { body: body.trim(), parentId: parentId ?? null },
      params: { slug },
    });

    if (result.status === 201) {
      const created = result.body;

      setThreads(current =>
        parentId
          ? current.map(thread =>
              thread.id === parentId
                ? {
                    ...thread,
                    replies: [...thread.replies, created],
                    replyCount: thread.replyCount + 1,
                  }
                : thread,
            )
          : [{ ...created, replies: [] }, ...current],
      );

      if (parentId) {
        setReplyDraft("");
        setReplyTo(null);
      } else {
        setDraft("");
      }
    }

    setBusy(false);
  };

  const remove = async (commentId: string, parentId?: string) => {
    const result = await api.comments.remove({ params: { commentId } });
    if (result.status !== 200) return;

    setThreads(current =>
      parentId
        ? current.map(thread =>
            thread.id === parentId
              ? {
                  ...thread,
                  replies: thread.replies.filter(reply => reply.id !== commentId),
                  replyCount: Math.max(0, thread.replyCount - 1),
                }
              : thread,
          )
        : current.filter(thread => thread.id !== commentId),
    );
  };

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-headline-m flex items-center gap-2">
        <ChatBubbleIcon className="h-5 w-5 text-muted-foreground" />
        {total} {total === 1 ? "comment" : "comments"}
      </h2>

      {session ? (
        <form
          className="flex gap-3"
          onSubmit={event => {
            event.preventDefault();
            void post(draft);
          }}
        >
          <Avatar name={session.displayName} />
          <div className="flex flex-1 flex-col gap-2">
            <textarea
              className="focus-ring min-h-[2.5rem] w-full resize-y rounded-lg border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground"
              onChange={event => setDraft(event.target.value)}
              placeholder="Add a comment…"
              rows={2}
              value={draft}
            />
            {draft.trim() && (
              <div className="flex justify-end gap-2">
                <Button onClick={() => setDraft("")} size="sm" type="button" variant="ghost">
                  Cancel
                </Button>
                <Button disabled={busy} size="sm" type="submit">
                  {busy ? "Posting…" : "Comment"}
                </Button>
              </div>
            )}
          </div>
        </form>
      ) : (
        <p className="rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
          <Link className="font-medium text-primary hover:underline" href={`/sign-in?next=/watch/${slug}`}>
            Sign in
          </Link>{" "}
          to join the conversation.
        </p>
      )}

      <ul className="flex flex-col gap-6">
        {threads.map(thread => (
          <li className="flex gap-3" key={thread.id}>
            <Avatar name={thread.author.displayName} />

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <p className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-medium">{thread.author.displayName}</span>
                <span className="text-body-s text-muted-foreground">
                  {formatRelativeTime(thread.createdAt)}
                  {thread.edited && " · edited"}
                </span>
              </p>

              <p className="whitespace-pre-wrap text-sm">{thread.body}</p>

              <div className="flex items-center gap-1">
                {session && (
                  <button
                    className="focus-ring rounded px-2 py-1 text-body-s text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => setReplyTo(replyTo === thread.id ? null : thread.id)}
                    type="button"
                  >
                    Reply
                  </button>
                )}
                {session?.id === thread.author.id && (
                  <button
                    className="focus-ring flex items-center gap-1 rounded px-2 py-1 text-body-s text-muted-foreground transition-colors hover:text-danger"
                    onClick={() => void remove(thread.id)}
                    type="button"
                  >
                    <TrashIcon className="h-3.5 w-3.5" />
                    Delete
                  </button>
                )}
              </div>

              {replyTo === thread.id && (
                <form
                  className="mt-1 flex flex-col gap-2"
                  onSubmit={event => {
                    event.preventDefault();
                    void post(replyDraft, thread.id);
                  }}
                >
                  <textarea
                    autoFocus
                    className="focus-ring w-full resize-y rounded-lg border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground"
                    onChange={event => setReplyDraft(event.target.value)}
                    placeholder={`Replying to ${thread.author.displayName}…`}
                    rows={2}
                    value={replyDraft}
                  />
                  <div className="flex justify-end gap-2">
                    <Button onClick={() => setReplyTo(null)} size="sm" type="button" variant="ghost">
                      Cancel
                    </Button>
                    <Button disabled={busy} size="sm" type="submit">
                      Reply
                    </Button>
                  </div>
                </form>
              )}

              {thread.replies.length > 0 && (
                <ul className="mt-2 flex flex-col gap-4 border-l border-border pl-4">
                  {thread.replies.map(reply => (
                    <li className="flex gap-3" key={reply.id}>
                      <Avatar name={reply.author.displayName} />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="flex flex-wrap items-baseline gap-2">
                          <span className="text-sm font-medium">{reply.author.displayName}</span>
                          <span className="text-body-s text-muted-foreground">
                            {formatRelativeTime(reply.createdAt)}
                          </span>
                        </p>
                        <p className="whitespace-pre-wrap text-sm">{reply.body}</p>
                        {session?.id === reply.author.id && (
                          <button
                            className="focus-ring flex w-fit items-center gap-1 rounded py-0.5 text-body-s text-muted-foreground transition-colors hover:text-danger"
                            onClick={() => void remove(reply.id, thread.id)}
                            type="button"
                          >
                            <TrashIcon className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {thread.replyCount > thread.replies.length && (
                <p className="text-body-s text-muted-foreground">
                  {thread.replyCount - thread.replies.length} more{" "}
                  {thread.replyCount - thread.replies.length === 1 ? "reply" : "replies"}
                </p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
