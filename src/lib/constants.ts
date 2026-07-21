export const IMPORT_CHUNK_SIZE = 750;
export const IMPORT_MAX_CONCURRENCY = 3;

export const ROLL_POOL_SIZE = 300;

export const DEFAULT_ROLL_DURATION_MS = 4000;
export const DEFAULT_ROLL_SPEED_MS = 60;

export const WINNER_HISTORY_LIMIT = 20;

export const PARTICIPANT_TEMPLATE_HEADERS = [
  "Participant No",
  "Full Name",
  "Plate Number",
] as const;

export const KEYBOARD_SHORTCUTS = {
  startStop: "Space",
  fullscreen: "f",
  upload: "u",
  toggleTheme: "d",
  reset: "r",
} as const;
