export type AssetKind = "image" | "video" | "audio" | "subtitle";
export type Asset = { id: string; src: string; kind: AssetKind; bytes: number };
export type Subtitle = "th" | "en" | "off";
export type SequenceId = "s1" | "s1b" | "s2" | "s3a" | "s3b" | "temple" | "s4" | "s5a" | "s5b" | "s6a" | "s6b" | "shared" | "s7";
export type ChoiceId = "c1" | "c2" | "c3";
export type GameId = "g1" | "g2" | "g3";
export type CheckpointId = ChoiceId | GameId;
export type NodeId = SequenceId | CheckpointId | "ending";
export type EpisodeId = 1 | 2 | 3 | 4 | 5 | 6;
export type BreakfastResult = "traditional" | "alternative";

export type Shot = {
  id: string;
  webSceneId: SequenceId;
  screenplayScene: string;
  cut: string;
  description: string;
  assetId: string | null;
  fallbackId: string;
  mediaType: "image" | "video";
  durationMs: number;
  /** Seconds measured from the actual edited video. */
  startTime?: number;
  interactionTime?: number;
  audioAssetId?: string;
  freezeAssetId?: string;
  subtitles?: Partial<Record<"th" | "en" | "zh", string>>;
  subtitleTracks?: Partial<Record<"th" | "en" | "zh", string>>;
  cameraMotion: "static" | "zoom-in" | "zoom-out" | "pan-left" | "pan-right";
  transition: "cut" | "fade" | "dissolve";
};

export type NarrativeNode =
  | { type: "sequence"; id: SequenceId; title: string; episodeId: EpisodeId; shots: readonly Shot[]; nextNodeId: NodeId }
  | { type: "choice"; id: ChoiceId; episodeId: EpisodeId }
  | { type: "minigame"; id: GameId; episodeId: EpisodeId }
  | { type: "ending"; id: "ending"; episodeId: 6 };

export type MainProgress = {
  started: boolean;
  node: NodeId;
  episode: EpisodeId;
  scene: SequenceId;
  shotId: string;
  time: number;
  from: SequenceId;
  choices: Partial<Record<ChoiceId, 0 | 1>>;
  food: (string | null)[];
  breakfast: BreakfastResult | null;
  breakfastReview: boolean;
  prayer: number | null;
  blessing: number | null;
  words: (string | null)[];
  attempts: number;
  solved: boolean;
  completed: EpisodeId[];
  unlocked: EpisodeId[];
  done: boolean;
};
