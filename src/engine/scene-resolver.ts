import { asset, checkpointArtwork, shotAsset } from "@/data/asset-mapping";
import { checkpoints } from "@/data/checkpoints";
import { nodes } from "@/data/scenes";
import type { CheckpointId, SequenceId, Shot } from "@/types/movie";

export function lastShot(id: SequenceId): Shot {
  const node = nodes[id];
  if (node.type !== "sequence" || !node.shots.length) throw new Error("Invalid sequence " + id);
  return node.shots[node.shots.length - 1];
}

export function checkpointFrame(id: CheckpointId, from = checkpoints[id].from) {
  const shot = lastShot(from);
  const override = checkpointArtwork[id];
  const frozen = shotAsset(shot);
  return asset(shot.freezeAssetId, "image") ??
    (frozen?.kind === "image" && shot.assetId ? frozen : undefined) ??
    asset(override, "image") ?? (frozen?.kind === "image" ? frozen : asset(shot.fallbackId, "image"));
}
