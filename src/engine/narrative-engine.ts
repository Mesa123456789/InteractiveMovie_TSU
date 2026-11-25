import { choices } from "@/data/choices";
import { checkpoints } from "@/data/checkpoints";
import { episodes } from "@/data/episodes";
import { nodes } from "@/data/scenes";
import type { ChoiceId, EpisodeId, MainProgress, NodeId } from "@/types/movie";
import { taste } from "./minigames";
import { lastShot } from "./scene-resolver";

export function freshProgress(): MainProgress {
  return {
    started: false, node: "s1", episode: 1, scene: "s1", shotId: "s1/SC01/1A", time: 0, from: "s1",
    choices: {}, food: [null, null, null], breakfast: null, breakfastReview: false, prayer: null, blessing: null,
    words: [null, null, null, null], attempts: 0, solved: false, completed: [], unlocked: [1], done: false,
  };
}

export function enter(progress: MainProgress, nodeId: NodeId): MainProgress {
  const node = nodes[nodeId];
  const previous = nodes[progress.node];
  const sequence = node.type === "sequence" ? node : null;
  const isCheckpoint = node.type === "choice" || node.type === "minigame";
  const from = isCheckpoint ? previous.type === "sequence" && previous.nextNodeId === node.id ? previous.id : checkpoints[node.id].from : progress.from;
  const done = node.type === "ending";
  const completed = done ? episodes.map(({ id }) => id) : previous.type === "choice" || previous.type === "minigame"
    ? episodes.some(({ boundary }) => boundary === previous.id)
      ? [...new Set([...progress.completed, previous.episodeId])].sort()
      : progress.completed
    : progress.completed;
  const unlocked: EpisodeId[] = [...new Set([...progress.unlocked, ...completed, node.episodeId])].sort();
  return {
    ...progress, started: true, node: nodeId, episode: node.episodeId,
    scene: sequence?.id ?? (isCheckpoint ? from : progress.scene), from, time: 0,
    shotId: sequence?.shots[0]?.id ?? (isCheckpoint ? lastShot(from).id : progress.shotId),
    completed, unlocked, done,
  };
}

export type StoryEvent =
  | { type: "finish" }
  | { type: "choose"; id: ChoiceId; option: 0 | 1 }
  | { type: "taste" }
  | { type: "accept-prayer" }
  | { type: "order" };

export function advance(progress: MainProgress, event: StoryEvent): MainProgress {
  const current = nodes[progress.node];
  switch (event.type) {
    case "finish":
      return current.type === "sequence" ? enter(progress, current.nextNodeId) : progress;
    case "choose":
      return current.id === event.id && current.type === "choice"
        ? enter({ ...progress, choices: { ...progress.choices, [event.id]: event.option } }, choices[event.id].options[event.option].next)
        : progress;
    case "taste": {
      const breakfast = current.id === "g1" ? taste(progress.food) : null;
      return breakfast ? enter({ ...progress, breakfast, breakfastReview: false }, breakfast === "traditional" ? "s3a" : "s3b") : progress;
    }
    case "accept-prayer":
      return current.id === "g2" && progress.blessing !== null ? enter(progress, "s4") : progress;
    case "order":
      return current.id === "g3" && progress.solved ? enter(progress, "s7") : progress;
  }
}
