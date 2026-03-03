/**
 * Keyboard map for the player, kept next to the component that binds it so the
 * help dialog and the handler can never disagree about what a key does.
 */
export const PLAYER_SHORTCUTS: { action: string; keys: string[] }[] = [
  { action: "Play or pause", keys: ["Space", "K"] },
  { action: "Back 5 seconds", keys: ["←"] },
  { action: "Forward 5 seconds", keys: ["→"] },
  { action: "Back 10 seconds", keys: ["J"] },
  { action: "Forward 10 seconds", keys: ["L"] },
  { action: "Mute", keys: ["M"] },
  { action: "Fullscreen", keys: ["F"] },
  { action: "Theatre mode", keys: ["T"] },
  { action: "Jump to 0–90%", keys: ["0", "…", "9"] },
  { action: "Volume", keys: ["↑", "↓"] },
];
