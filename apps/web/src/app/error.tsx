"use client";

import { useEffect } from "react";

import { Button } from "@/shared-ui/components/button";

/**
 * Route-level error boundary. `reset` re-renders the segment, which is enough
 * to recover from a failed fetch without a full page load.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-danger text-label">Something went wrong</p>
      <h1 className="text-headline-l">This page did not load</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The API may be unreachable. Check that it is running, then try again.
      </p>
      {error.digest && (
        <code className="rounded bg-muted px-2 py-1 font-mono text-muted-foreground text-body-s">
          {error.digest}
        </code>
      )}
      <Button className="mt-2" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
