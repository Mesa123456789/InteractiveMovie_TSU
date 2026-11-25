import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { z } from "zod";
import { checkpoints, checkpointIds } from "@/data/checkpoints";
import { episodes } from "@/data/episodes";
import { foodById, foodCategories } from "@/data/foods";
import { wordById } from "@/data/sentences";
import { nodes } from "@/data/scenes";
import { checkSentence, placeWord, revealPrayer, taste } from "@/engine/minigames";
import { advance, enter, freshProgress, type StoryEvent } from "@/engine/narrative-engine";
import { lastShot } from "@/engine/scene-resolver";
import type { CheckpointId, EpisodeId, MainProgress, NodeId, SequenceId, Subtitle } from "@/types/movie";

type Replay = { key: string; progress: MainProgress; until: readonly NodeId[]; returnTo: "/" | "/journey"; complete: boolean };
type Settings = { muted: boolean; volume: number; subtitles: Subtitle };
type WatchState = {
  hydrated: boolean;
  main: MainProgress;
  replay: Replay | null;
  unlocked: Partial<Record<CheckpointId, MainProgress["from"]>>;
  settings: Settings;
  start: (reset?: boolean) => void;
  replayAt: (id: CheckpointId) => void;
  playEpisode: (id: EpisodeId) => void;
  clearReplay: () => void;
  event: (event: StoryEvent, expected: NodeId) => boolean;
  tick: (node: NodeId, shotId: string, time: number) => void;
  selectFood: (category: number, id: string) => void;
  reviewBreakfast: (open: boolean) => void;
  selectPrayer: (category: number) => void;
  wish: () => boolean;
  put: (id: string, target?: number) => void;
  remove: (slot: number) => void;
  clearWords: () => void;
  check: () => void;
  setSettings: (settings: Partial<Settings>) => void;
  debugJump: (node: NodeId, card?: boolean) => void;
  unlockAll: () => void;
  reset: () => void;
};

const settingsSchema = z.object({
  muted: z.boolean(), volume: z.number().min(0).max(1), subtitles: z.enum(["th", "en", "off"]),
});
const nodeSchema = z.custom<NodeId>((id) => typeof id === "string" && Object.hasOwn(nodes, id));
const sequenceSchema = z.custom<SequenceId>((id) => nodeSchema.safeParse(id).success && nodes[id as NodeId].type === "sequence");
const episodeSchema = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)]);
const prayerIndex = z.number().int().min(0).max(8).nullable();
const selection = z.union([z.literal(0), z.literal(1)]).optional();
const progressSchema = z.object({
  started: z.boolean(), node: nodeSchema, episode: episodeSchema, scene: sequenceSchema, from: sequenceSchema,
  shotId: z.string(), time: z.number().min(0), done: z.boolean(),
  choices: z.object({ c1: selection, c2: selection, c3: selection }),
  food: z.array(z.string().refine((id) => Object.hasOwn(foodById, id)).nullable()).length(3),
  breakfast: z.enum(["traditional", "alternative"]).nullable(),
  breakfastReview: z.boolean().default(false),
  prayer: prayerIndex, blessing: prayerIndex,
  words: z.array(z.string().refine((id) => Object.hasOwn(wordById, id)).nullable()).length(4),
  attempts: z.number().int().min(0), solved: z.boolean(),
  completed: z.array(episodeSchema), unlocked: z.array(episodeSchema),
});
const baseSettings: Settings = { muted: false, volume: 0.85, subtitles: "off" };
const keepCheckpointsOnRestart = true;
const active = (state: WatchState) => state.replay?.progress ?? state.main;

function updateActive(state: WatchState, progress: MainProgress): Partial<WatchState> {
  if (state.replay) {
    return { replay: { ...state.replay, progress, complete: state.replay.until.includes(progress.node) } };
  }
  const node = nodes[progress.node];
  const unlocked = node.type === "choice" || node.type === "minigame"
    ? { ...state.unlocked, [node.id]: progress.from } : state.unlocked;
  return { main: progress, unlocked };
}

function resumed(saved: unknown, current: WatchState): WatchState {
  if (!saved || typeof saved !== "object") return current;
  const data = saved as Partial<WatchState>;
  const main = progressSchema.safeParse(data.main);
  const settings = settingsSchema.safeParse(data.settings);
  const unlocked = Object.fromEntries(checkpointIds.flatMap((id) => {
    const source = data.unlocked?.[id];
    return source && Object.hasOwn(nodes, source) && nodes[source].type === "sequence" && nodes[source].nextNodeId === id
      ? [[id, source]] : [];
  }));
  return { ...current, main: main.success ? main.data : current.main, unlocked,
    settings: settings.success ? settings.data : current.settings };
}

export const useMovieStore = create<WatchState>()(persist((set, get) => {
  const edit = (node: NodeId, change: (progress: MainProgress) => MainProgress) => {
    set((state) => {
      const progress = active(state);
      if (progress.node !== node || state.replay?.complete) return state;
      const next = change(progress);
      return next === progress ? state : updateActive(state, next);
    });
  };
  return {
    hydrated: false, main: freshProgress(), replay: null, unlocked: {}, settings: baseSettings,
    start: (reset) => set((state) => ({
      replay: null, main: reset || !state.main.started ? enter(freshProgress(), "s1") : state.main,
      unlocked: reset && !keepCheckpointsOnRestart ? {} : state.unlocked,
    })),
    replayAt: (id) => set((state) => {
      const from = state.unlocked[id];
      if (!from) return state;
      const config = checkpoints[id];
      return { replay: { key: id, progress: enter(enter(freshProgress(), from), id), until: config.replayUntil, returnTo: "/journey", complete: false } };
    }),
    playEpisode: (id) => set((state) => {
      const episode = episodes.find((entry) => entry.id === id);
      if (!episode || !state.main.unlocked.includes(id)) return state;
      if (!state.main.started) return { main: enter(freshProgress(), episode.start), replay: null };
      if (state.main.episode === id && !state.main.done) return { replay: null };
      const routeStart: NodeId = id === 2 && state.main.choices.c1 === 1 ? "s1b"
        : id === 3 && state.main.breakfast === "alternative" ? "s3b"
        : id === 5 && state.main.choices.c2 === 1 ? "s5b"
        : id === 6 && state.main.choices.c3 !== undefined ? state.main.choices.c3 === 0 ? "s6a" : "s6b"
        : episode.start;
      return { replay: { key: "ep-" + id, progress: enter(freshProgress(), routeStart), until: [episode.boundary], returnTo: "/", complete: false } };
    }),
    clearReplay: () => set({ replay: null }),
    event: (event, expected) => {
      let changed = false;
      edit(expected, (progress) => {
        const next = advance(progress, event);
        changed = next !== progress;
        return next;
      });
      return changed;
    },
    tick: (node, shotId, time) => edit(node, (progress) => progress.time === time && progress.shotId === shotId ? progress : { ...progress, shotId, time }),
    selectFood: (category, id) => edit("g1", (progress) =>
      !progress.breakfastReview && foodCategories[category]?.foods.some((food) => food.id === id)
        ? { ...progress, food: progress.food.map((value, i) => i === category ? id : value) } : progress),
    reviewBreakfast: (open) => edit("g1", (progress) =>
      progress.breakfastReview === open || (open && !taste(progress.food)) ? progress : { ...progress, breakfastReview: open }),
    selectPrayer: (category) => edit("g2", (progress) =>
      revealPrayer(category, progress.blessing) === null ? progress : { ...progress, prayer: category }),
    wish: () => {
      let changed = false;
      edit("g2", (progress) => {
        const blessing = revealPrayer(progress.prayer, progress.blessing);
        changed = blessing !== null;
        return changed ? { ...progress, blessing } : progress;
      });
      return changed;
    },
    put: (word, target) => edit("g3", (progress) => progress.solved ? progress : { ...progress, words: placeWord(progress.words, word, target) }),
    remove: (slot) => edit("g3", (progress) => progress.solved ? progress : { ...progress, words: progress.words.map((word, i) => i === slot ? null : word) }),
    clearWords: () => edit("g3", (progress) => progress.solved ? progress : { ...progress, words: freshProgress().words }),
    check: () => edit("g3", (progress) => {
      const result = progress.solved ? null : checkSentence(progress.words);
      return result ? { ...progress, words: result.slots, solved: result.correct, attempts: progress.attempts + Number(!result.correct) } : progress;
    }),
    setSettings: (settings) => set({ settings: { ...get().settings, ...settings } }),
    debugJump: (node, card) => {
      if (process.env.NODE_ENV !== "development") return;
      set((state) => {
        let main = enter(state.main, node);
        if (node === "g2") main = { ...main, prayer: card ? 0 : null, blessing: card ? 0 : null };
        if (node === "g3") main = { ...main, words: freshProgress().words, attempts: 0, solved: false };
        return { ...updateActive({ ...state, replay: null }, main), replay: null };
      });
    },
    unlockAll: () => {
      if (process.env.NODE_ENV !== "development") return;
      set((state) => ({
        unlocked: Object.fromEntries(checkpointIds.map((id) => [id, checkpoints[id].from])),
        main: { ...state.main, unlocked: episodes.map(({ id }) => id) },
      }));
    },
    reset: () => set({ main: freshProgress(), replay: null, unlocked: {} }),
  };
}, {
  name: "muay-film-v2", version: 2, storage: createJSONStorage(() => localStorage),
  partialize: ({ main, unlocked, settings }) => ({ main, unlocked, settings }),
  merge: resumed,
  skipHydration: true,
}));

export function currentFrame(progress: MainProgress) {
  const item = nodes[progress.node];
  if (item.type === "sequence") return item.shots.find((shot) => shot.id === progress.shotId) ?? item.shots[0];
  return lastShot(item.type === "ending" ? "s7" : progress.from);
}

export const selectProgress = (state: WatchState) => active(state);
