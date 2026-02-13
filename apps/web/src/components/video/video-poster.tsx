import { tw } from "@/tailwind";

import { posterArt, posterInitials } from "../../lib/poster";

type VideoPosterProps = {
  accentColor?: null | string;
  className?: string;
  /** Stable input for the generated art — the video slug. */
  seed: string;
  /** Real thumbnail, when the video has one. Falls back to generated art. */
  thumbnailUrl?: null | string;
  title: string;
};

/**
 * Renders the video's thumbnail, or generated gradient art when there is none.
 *
 * The art is inline SVG rather than an <img>: it costs no request, it scales
 * without artefacts, and its colours come from the same tokens as the rest of
 * the page so it never looks pasted in.
 */
export const VideoPoster = ({
  accentColor,
  className,
  seed,
  thumbnailUrl,
  title,
}: VideoPosterProps) => {
  if (thumbnailUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        alt=""
        className={tw("h-full w-full object-cover", className)}
        loading="lazy"
        src={thumbnailUrl}
      />
    );
  }

  const art = posterArt(seed, accentColor);
  const gradientId = `poster-${seed}`;

  return (
    <svg
      aria-hidden="true"
      className={tw("h-full w-full", className)}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 160 90"
    >
      <defs>
        <linearGradient gradientTransform={`rotate(${art.angle} 0.5 0.5)`} id={gradientId}>
          <stop offset="0%" stopColor={art.from} />
          <stop offset="100%" stopColor={art.to} />
        </linearGradient>
      </defs>

      <rect fill={`url(#${gradientId})`} height="90" width="160" />

      {art.blobs.map((blob, index) => (
        <circle
          cx={blob.cx}
          cy={blob.cy}
          fill="white"
          fillOpacity={blob.opacity}
          key={index}
          r={blob.r}
        />
      ))}

      <text
        fill="white"
        fillOpacity="0.82"
        fontSize="18"
        fontWeight="700"
        letterSpacing="0.5"
        textAnchor="middle"
        x="80"
        y="52"
      >
        {posterInitials(title)}
      </text>
    </svg>
  );
};
