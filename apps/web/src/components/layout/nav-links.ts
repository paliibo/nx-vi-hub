import {
  ArchiveIcon,
  BookmarkIcon,
  CounterClockwiseClockIcon,
  HeartIcon,
  HomeIcon,
  LayersIcon,
  MagnifyingGlassIcon,
  PersonIcon,
  VideoIcon,
} from "@radix-ui/react-icons";

export type NavLink = {
  href: string;
  icon: typeof HomeIcon;
  label: string;
  /** Only rendered for a signed-in visitor. */
  requiresAuth?: boolean;
};

export const PRIMARY_LINKS: NavLink[] = [
  { href: "/", icon: HomeIcon, label: "Home" },
  { href: "/search", icon: MagnifyingGlassIcon, label: "Explore" },
  { href: "/subscriptions", icon: LayersIcon, label: "Subscriptions", requiresAuth: true },
];

export const LIBRARY_LINKS: NavLink[] = [
  { href: "/library", icon: ArchiveIcon, label: "Library", requiresAuth: true },
  {
    href: "/library/history",
    icon: CounterClockwiseClockIcon,
    label: "History",
    requiresAuth: true,
  },
  { href: "/library/liked", icon: HeartIcon, label: "Liked", requiresAuth: true },
  { href: "/library/playlists", icon: BookmarkIcon, label: "Playlists", requiresAuth: true },
];

export const STUDIO_LINKS: NavLink[] = [
  { href: "/studio", icon: VideoIcon, label: "Studio", requiresAuth: true },
  { href: "/settings", icon: PersonIcon, label: "Settings", requiresAuth: true },
];
