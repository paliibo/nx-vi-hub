import Link from "next/link";

import { Button } from "@/shared-ui/components/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-label text-primary">404</p>
      <h1 className="text-headline-l">We could not find that page</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        The video may have been removed, or the link may have a typo in it.
      </p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/search">Browse everything</Link>
        </Button>
      </div>
    </div>
  );
}
