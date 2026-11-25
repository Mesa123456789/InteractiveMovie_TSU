import { assets } from "./assets.generated";
import type { Asset, AssetKind, Shot } from "@/types/movie";

const catalog = new Map<string, Asset>((assets as readonly Asset[]).map((asset) => [asset.id, asset]));

export const stills = {
  hero: "preview/lantern-alley.webp",
  cafeteria: "preview/cafeteria.webp",
  dorm: "preview/dorm.webp",
  dumplings: "preview/dumplings.webp",
  breakfast: "preview/breakfast.webp",
  temple: "preview/temple.webp",
  wangfujing: "preview/wangfujing.webp",
  palace: "preview/palace.webp",
  tsinghua: "preview/tsinghua.webp",
  shichahai: "preview/shichahai.webp",
  home: "preview/thai-kitchen.webp",
  sink: "preview/sink.webp",
  street: "preview/winter-street.webp",
  breakfastReaction: "preview/breakfast-reaction.webp",
  prayerWheel: "preview/prayer-wheel.webp",
  templeExit: "preview/temple-exit.webp",
  hutong: "preview/hutong.webp",
  order: "preview/ordering.webp",
  ending: "preview/ending.webp",
} as const;
export type Still = (typeof stills)[keyof typeof stills];

// Exact ID first, then screenplay cut key such as "SC02/4A".
type ShotMedia = Pick<Shot, "assetId"> & Partial<Pick<Shot, "mediaType" | "durationMs" | "startTime" | "interactionTime" | "freezeAssetId" | "audioAssetId" | "subtitles" | "subtitleTracks">>;
export const shotMedia: Partial<Record<string, ShotMedia>> = {};
export const artwork = {
  hero: { assetId: null, fallbackId: stills.hero },
  mandarinAudio: null as string | null,
};
export const episodeArtwork: Partial<Record<number, string>> = {};
export const checkpointArtwork: Partial<Record<string, string>> = {};
export const foodArtwork: Partial<Record<string, string>> = {
  youtiao: "preview/food/youtiao.webp",
  jiaoquan: "preview/food/jiaoquan.webp",
  cucumber: "preview/food/cucumber.webp",
  tofu: "preview/food/tofu.webp",
  soy: "preview/food/soy.webp",
  chaogan: "preview/food/chaogan.webp",
  jianbing: "preview/food/jianbing.webp",
  noodles: "preview/food/noodles.webp",
  luzhu: "preview/food/luzhu.webp",
};

export function asset(id?: string | null, kind?: AssetKind): Asset | undefined {
  const found = id ? catalog.get(id) : undefined;
  return found && (!kind || found.kind === kind) ? found : undefined;
}

export function shotAsset(shot: Shot) {
  return shot.assetId ? asset(shot.assetId, shot.mediaType) : asset(shot.fallbackId, "image");
}
