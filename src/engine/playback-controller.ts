import type { Shot } from "@/types/movie";

export type TimedShot = { shot: Shot; start: number; duration: number };

export function createTimeline(shots: readonly Shot[], durations: Readonly<Record<string, number>> = {}) {
  let total = 0;
  const entries: TimedShot[] = shots.map((shot) => {
    const start = total;
    const clipStart = shot.startTime ?? 0;
    const fileEnd = durations[shot.id];
    const end = shot.interactionTime === undefined ? fileEnd : Math.min(shot.interactionTime, fileEnd ?? Infinity);
    const duration = shot.mediaType === "video" && end !== undefined
      ? Math.max(0.01, end - clipStart)
      : shot.durationMs / 1000;
    total += duration;
    return { shot, start, duration };
  });
  return { entries, total };
}

export function position(entries: readonly TimedShot[], time: number) {
  return entries.find((entry) => time < entry.start + entry.duration) ?? entries.at(-1);
}

export function clampSeek(time: number, total: number) {
  return Math.max(0, Math.min(time, Math.max(0, total - 0.01)));
}

export function clock(seconds: number) {
  const full = Math.max(0, Math.floor(seconds));
  return Math.floor(full / 60) + ":" + String(full % 60).padStart(2, "0");
}
