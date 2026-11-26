"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

type FullscreenMode = "native" | "viewport" | null;

export function usePlayerFullscreen(stage: RefObject<HTMLElement | null>) {
  const [mode, setMode] = useState<FullscreenMode>(null);
  const pending = useRef(false);

  useEffect(() => {
    const sync = () => setMode((previous) => {
      if (stage.current && document.fullscreenElement === stage.current) return "native";
      return previous === "native" ? null : previous;
    });
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, [stage]);

  useEffect(() => {
    if (mode !== "viewport") return;
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented && !stage.current?.querySelector("dialog[open]")) setMode(null);
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [mode, stage]);

  const toggle = useCallback(async () => {
    const root = stage.current;
    if (!root || pending.current) return;
    if (mode === "viewport") {
      setMode(null);
      return;
    }
    if (document.fullscreenElement === root) {
      await document.exitFullscreen().catch(() => {});
      return;
    }
    pending.current = true;
    try {
      if (document.fullscreenEnabled && root.requestFullscreen) {
        await root.requestFullscreen({ navigationUI: "hide" });
        if (document.fullscreenElement === root) {
          setMode("native");
          return;
        }
      }
    } catch {
      // Some browsers and embedded contexts reject fullscreen for non-video elements.
    } finally {
      pending.current = false;
    }
    if (stage.current === root) setMode("viewport");
  }, [mode, stage]);

  return { mode, toggle };
}
