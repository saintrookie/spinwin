"use client";

import { useEffect } from "react";

type ShortcutMap = Record<string, (event: KeyboardEvent) => void>;

const EDITABLE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"]);

/**
 * Global keydown shortcuts, ignored while focus is in an editable field or a
 * dialog is capturing text input (so typing a prize name doesn't trigger "n").
 */
export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    function handler(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target && (EDITABLE_TAGS.has(target.tagName) || target.isContentEditable)) return;

      const key = event.code === "Space" ? "space" : event.key.toLowerCase();
      const fn = shortcuts[key];
      if (fn) {
        event.preventDefault();
        fn(event);
      }
    }

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [shortcuts, enabled]);
}
