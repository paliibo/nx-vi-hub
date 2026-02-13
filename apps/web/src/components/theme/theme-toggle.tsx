"use client";

import { DesktopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { tw } from "@/tailwind";

const OPTIONS = [
  { icon: SunIcon, label: "Light", value: "light" },
  { icon: MoonIcon, label: "Dark", value: "dark" },
  { icon: DesktopIcon, label: "System", value: "system" },
] as const;

/**
 * True once hydrated, false during server rendering.
 *
 * The server cannot know the stored preference, so marking an option active
 * before hydration highlights the wrong one and then visibly corrects itself.
 * useSyncExternalStore expresses this in one render — a useState + useEffect
 * pair would set state during an effect, which costs an extra render pass.
 */
const subscribe = () => () => undefined;
const useIsHydrated = () =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

export const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();
  const mounted = useIsHydrated();

  return (
    <div
      aria-label="Colour theme"
      className="inline-flex items-center gap-0.5 rounded-full border border-border bg-surface p-0.5"
      role="radiogroup"
    >
      {OPTIONS.map(option => {
        const Icon = option.icon;
        const active = mounted && theme === option.value;

        return (
          <button
            aria-checked={active}
            aria-label={option.label}
            className={tw(
              "focus-ring rounded-full p-1.5 text-muted-foreground transition-colors",
              "hover:text-foreground",
              active && "bg-muted text-foreground",
            )}
            key={option.value}
            onClick={() => setTheme(option.value)}
            role="radio"
            type="button"
          >
            <Icon className="h-4 w-4" />
          </button>
        );
      })}
    </div>
  );
};
