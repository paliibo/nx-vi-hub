"use client";

import {
  EnterFullScreenIcon,
  PauseIcon,
  PlayIcon,
  SpeakerLoudIcon,
  SpeakerOffIcon,
} from "@radix-ui/react-icons";
import { useCallback, useEffect, useRef, useState } from "react";

import { tw } from "@/tailwind";

import { useInterval } from "../../hooks/use-interval";
import { api } from "../../lib/api-client";
import { formatDuration } from "../../lib/format";
import { VideoPoster } from "../video/video-poster";

type VideoPlayerProps = {
  accentColor: string;
  durationSeconds: number;
  onTheatreToggle?: () => void;
  /** Seconds to start from: the viewer's saved position, or ?t= from a share link. */
  resumeAtSeconds: number;
  /** Progress is only persisted for signed-in viewers. */
  signedIn: boolean;
  slug: string;
  sourceUrl: null | string;
  thumbnailUrl: null | string;
  title: string;
};

/** How often the resume point is written back while playing. */
const PROGRESS_INTERVAL_MS = 10_000;

/** Watch time before a view is counted, so a stray click is not a view. */
const VIEW_THRESHOLD_SECONDS = 5;

export const VideoPlayer = ({
  accentColor,
  durationSeconds,
  onTheatreToggle,
  resumeAtSeconds,
  signedIn,
  slug,
  sourceUrl,
  thumbnailUrl,
  title,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewCountedRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(resumeAtSeconds);
  const [duration, setDuration] = useState(durationSeconds);
  const [started, setStarted] = useState(false);

  const seekTo = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(seconds, video.duration || seconds));
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play().catch(() => undefined);
    } else {
      video.pause();
    }
  }, []);

  const persistProgress = useCallback(() => {
    const video = videoRef.current;
    if (!video || !signedIn || !video.currentTime) return;

    void api.videos
      .recordProgress({
        body: { positionSeconds: Math.floor(video.currentTime) },
        params: { slug },
      })
      .catch(() => undefined);
  }, [signedIn, slug]);

  // Periodic save while playing. Paused playback writes nothing, so a video
  // left open overnight does not send 8,640 identical requests.
  useInterval(persistProgress, playing ? PROGRESS_INTERVAL_MS : null);

  // And once more on the way out, so closing the tab keeps the last position.
  useEffect(() => () => persistProgress(), [persistProgress]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      // Never steal a key from someone typing a comment.
      if (target?.closest("input, textarea, [contenteditable='true']")) return;

      const video = videoRef.current;
      if (!video) return;

      switch (event.key) {
        case " ":
        case "k":
          event.preventDefault();
          togglePlay();
          break;
        case "ArrowDown":
          event.preventDefault();
          video.volume = Math.max(0, video.volume - 0.1);
          break;
        case "ArrowLeft":
          event.preventDefault();
          seekTo(video.currentTime - 5);
          break;
        case "ArrowRight":
          event.preventDefault();
          seekTo(video.currentTime + 5);
          break;
        case "ArrowUp":
          event.preventDefault();
          video.volume = Math.min(1, video.volume + 0.1);
          break;
        case "f":
          void containerRef.current?.requestFullscreen().catch(() => undefined);
          break;
        case "j":
          seekTo(video.currentTime - 10);
          break;
        case "l":
          seekTo(video.currentTime + 10);
          break;
        case "m":
          video.muted = !video.muted;
          setMuted(video.muted);
          break;
        case "t":
          onTheatreToggle?.();
          break;
        default:
          if (/^[0-9]$/.test(event.key) && video.duration) {
            seekTo((Number(event.key) / 10) * video.duration);
          }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onTheatreToggle, seekTo, togglePlay]);

  const onTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    setCurrentTime(video.currentTime);

    if (!viewCountedRef.current && video.currentTime >= VIEW_THRESHOLD_SECONDS) {
      viewCountedRef.current = true;
      void api.videos.registerView({ body: {}, params: { slug } }).catch(() => undefined);
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!sourceUrl) {
    return (
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl bg-muted">
        <VideoPoster
          accentColor={accentColor}
          seed={slug}
          thumbnailUrl={thumbnailUrl}
          title={title}
        />
        <p className="absolute rounded-lg bg-overlay/70 px-4 py-2 text-sm text-white">
          This video has no media attached yet.
        </p>
      </div>
    );
  }

  return (
    <div
      className="group relative aspect-video w-full overflow-hidden rounded-2xl bg-black"
      ref={containerRef}
    >
      <video
        className="h-full w-full"
        onClick={togglePlay}
        onLoadedMetadata={event => {
          const video = event.currentTarget;
          setDuration(video.duration || durationSeconds);
          // Resuming here rather than on mount: currentTime cannot be set
          // before the browser knows how long the video is.
          if (resumeAtSeconds > 0) video.currentTime = resumeAtSeconds;
        }}
        onPause={() => {
          setPlaying(false);
          persistProgress();
        }}
        onPlay={() => {
          setPlaying(true);
          setStarted(true);
        }}
        onTimeUpdate={onTimeUpdate}
        playsInline
        poster={thumbnailUrl ?? undefined}
        preload="metadata"
        ref={videoRef}
        src={sourceUrl}
        title={title}
      />

      {!started && (
        <button
          aria-label={`Play ${title}`}
          className="absolute inset-0 flex items-center justify-center bg-overlay/30 transition-colors hover:bg-overlay/20"
          onClick={togglePlay}
          type="button"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xl">
            <PlayIcon className="ml-1 h-7 w-7" />
          </span>
        </button>
      )}

      <div
        className={tw(
          "absolute inset-x-0 bottom-0 flex flex-col gap-1 bg-gradient-to-t from-black/85 to-transparent p-3 transition-opacity",
          // Controls fade out during playback but stay up whenever the pointer
          // or keyboard focus is inside the player.
          playing ? "opacity-0 group-focus-within:opacity-100 group-hover:opacity-100" : "opacity-100",
        )}
      >
        <input
          aria-label="Seek"
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-primary"
          max={Math.max(1, Math.floor(duration))}
          min={0}
          onChange={event => seekTo(Number(event.target.value))}
          step={1}
          style={{
            background: `linear-gradient(to right, ${accentColor} ${progress}%, rgb(255 255 255 / 0.25) ${progress}%)`,
          }}
          type="range"
          value={Math.floor(currentTime)}
        />

        <div className="flex items-center gap-3 text-white">
          <button
            aria-label={playing ? "Pause" : "Play"}
            className="focus-ring rounded p-1"
            onClick={togglePlay}
            type="button"
          >
            {playing ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
          </button>

          <button
            aria-label={muted ? "Unmute" : "Mute"}
            className="focus-ring rounded p-1"
            onClick={() => {
              const video = videoRef.current;
              if (!video) return;
              video.muted = !video.muted;
              setMuted(video.muted);
            }}
            type="button"
          >
            {muted ? <SpeakerOffIcon className="h-5 w-5" /> : <SpeakerLoudIcon className="h-5 w-5" />}
          </button>

          <span className="text-body-s tabular-nums">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>

          <button
            aria-label="Fullscreen"
            className="focus-ring ml-auto rounded p-1"
            onClick={() => void containerRef.current?.requestFullscreen().catch(() => undefined)}
            type="button"
          >
            <EnterFullScreenIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
