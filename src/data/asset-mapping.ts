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
type ShotMedia = Pick<Shot, "assetId"> & Partial<Pick<Shot, "mediaType" | "durationMs" | "startTime" | "interactionTime" | "freezeAssetId" | "audioAssetId" | "subtitles" | "subtitleCues" | "subtitleTracks">>;
export const figmaStill = (name: string) => `figma/${name}.webp`;

// Original fills from the UX Handoff, matched to the Prototype shot order.
export const shotMedia: Partial<Record<string, ShotMedia>> = {
  "s1/SC02/3A": { assetId: figmaStill("enter-dumpling-shop") },
  "s1/SC02/4A": { assetId: figmaStill("shop") },
  "s1b/SC02.2/1": { assetId: figmaStill("pass-dumpling-shop") },
  "s2/SC02/5A": { assetId: figmaStill("enter-dumpling-shop") },
  "s2/SC02/6A": { assetId: figmaStill("enter-dumpling-shop") },
  "s2/SC03/5A": { assetId: figmaStill("breakfast") },
  "s2/SC03/6A": { assetId: figmaStill("breakfast") },
  "s3a/SC03/6A": { assetId: figmaStill("breakfast-traditional") },
  "s3a/SC03/7A": { assetId: figmaStill("breakfast-traditional") },
  "s3b/SC03.2/1A": { assetId: figmaStill("breakfast-alternative") },
  "s3b/SC03.2/2A": { assetId: figmaStill("breakfast-alternative") },
  "s3b/SC03.2/3A": { assetId: figmaStill("breakfast-alternative") },
  "temple/SC04/5A": { assetId: figmaStill("prayer-wheel") },
  "s4/SC04/6A": { assetId: figmaStill("temple-blessing") },
  "s4/SC04/7A": { assetId: figmaStill("temple-exit") },
  "s5a/SC04/1B": { assetId: figmaStill("wangfujing-arrival") },
  "s5a/SC04/2B": { assetId: figmaStill("wangfujing-arrival") },
  "s5a/SC04/3B": { assetId: figmaStill("wangfujing") },
  "s5b/SC04/4B": { assetId: figmaStill("summer-palace-arrival") },
  "s5b/SC04/5B": { assetId: figmaStill("summer-palace") },
  "s6a/SC04/6B": { assetId: figmaStill("hutong-arrival") },
  "s6a/SC04/7B": { assetId: figmaStill("hutong-tasting") },
  "s6b/SC04/1C": { assetId: figmaStill("tsinghua-arrival") },
  "s6b/SC04/2C": { assetId: figmaStill("tsinghua-snowball") },
  "s6b/SC04/3C": { assetId: figmaStill("tsinghua-snowball") },
  "s6b/SC04/1D": { assetId: figmaStill("tsinghua-friends") },
  "s6b/SC04/2D": { assetId: figmaStill("tsinghua-friends") },
  "s6b/SC04/3D": { assetId: figmaStill("tsinghua-friends") },
  "shared/SC05/1A": { assetId: figmaStill("shichahai-bridge") },
  "shared/SC05/2A": { assetId: figmaStill("shichahai-bridge") },
  "shared/SC05/3A": { assetId: figmaStill("shichahai-call") },
  "shared/SC05/4A": { assetId: figmaStill("shichahai-call") },
  "shared/SC05/5A": { assetId: figmaStill("shichahai-call") },
  "shared/SC05/6A": { assetId: figmaStill("shichahai-call") },
  "shared/SC06/1A": { assetId: figmaStill("shop") },
  "shared/SC06/2A": { assetId: figmaStill("order") },
  "shared/SC06/3A": { assetId: figmaStill("order") },
  "s7/SC06/4A": { assetId: figmaStill("dumpling-order") },
  "s7/SC06/6A": { assetId: figmaStill("leave-dumpling-shop") },
};
export const artwork = {
  hero: { assetId: "artwork/lantern-lit-winter-market.png", fallbackId: stills.hero },
  mandarinAudio: null as string | null,
};
export const episodeArtwork: Partial<Record<number, string>> = {
  1: figmaStill("shop"),
  2: figmaStill("order"),
  3: figmaStill("breakfast"),
  4: figmaStill("temple-exit"),
  5: figmaStill("summer-palace"),
  6: figmaStill("order"),
};
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
