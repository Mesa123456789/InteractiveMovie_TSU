"use client";

import { useSyncExternalStore } from "react";

const query = "(orientation: portrait) and (max-width: 700px)";
function subscribe(callback: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
export function useOrientation() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false);
}
