"use client";

/**
 * Catches failures in the root layout itself. It replaces the whole document,
 * so it has to render <html> and <body> — and because the root layout never
 * ran, none of the app's providers or CSS variables are available here. The
 * styles are inline for exactly that reason.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          alignItems: "center",
          background: "#0f0f11",
          color: "#fafaf9",
          display: "flex",
          flexDirection: "column",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
          gap: "1rem",
          justifyContent: "center",
          margin: 0,
          minHeight: "100vh",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", margin: 0 }}>Vi Hub could not start</h1>
        <p style={{ color: "#a1a1aa", margin: 0, maxWidth: "32rem" }}>
          Something failed before the page could render. Check that the API is running.
        </p>
        {error.digest && (
          <code style={{ color: "#71717a", fontSize: "0.8125rem" }}>{error.digest}</code>
        )}
        <button
          onClick={reset}
          style={{
            background: "#a3e635",
            border: 0,
            borderRadius: "0.5rem",
            color: "#0f0f11",
            cursor: "pointer",
            fontWeight: 600,
            padding: "0.625rem 1.25rem",
          }}
          type="button"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
