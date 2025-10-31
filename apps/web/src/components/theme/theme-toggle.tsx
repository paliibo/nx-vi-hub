"use client";

import { tw } from "@/tailwind";
import { DesktopIcon, MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const OPTIONS = [
  { icon: SunIcon, label: "Light", value: "light" },
  { icon: MoonIcon, label: "Dark", value: "dark" },
  { icon: DesktopIcon, label: "System", value: "system" },
] as const;

export const ThemeToggle = () => {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // The server cannot know the stored preference, so rendering the active state
  // before mount would mark the wrong option and then correct itself.
  useEffect(() => setMounted(true), []);

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
