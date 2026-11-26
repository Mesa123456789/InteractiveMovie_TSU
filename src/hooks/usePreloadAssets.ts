"use client";

import { useEffect } from "react";
import { asset, shotAsset } from "@/data/asset-mapping";
import { choices } from "@/data/choices";
import { nodes } from "@/data/scenes";
import type { NodeId, Shot } from "@/types/movie";

export function usePreloadAssets(nextShot: Shot | undefined, nextNode: NodeId | undefined) {
  const nextImage = nextShot && shotAsset(nextShot)?.kind === "image" ? shotAsset(nextShot)?.src : undefined;
  useEffect(() => {
    const candidates = nextImage ? [nextImage] : [];
    const node = nextNode && nodes[nextNode];
    if (node?.type === "choice") {
      for (const option of choices[node.id].options) {
        const optionImage = asset(option.image, "image");
        if (optionImage) candidates.push(optionImage.src);
      }
    }
    const possible = node && (node.type === "choice" ? choices[node.id].options.map(({ next }) => next) :
      node.type === "sequence" ? [node.id] : node.id === "g1" ? ["s3a", "s3b"] as const : node.id === "g2" ? ["s4"] as const : node.id === "g3" ? ["s7"] as const : []);
    if (possible) for (const id of possible) {
      const target = nodes[id];
      const source = target.type === "sequence" && target.shots[0] && shotAsset(target.shots[0]);
      if (source && source.kind === "image") candidates.push(source.src);
    }
    for (const src of new Set(candidates)) {
      const preview = new Image();
      preview.src = src;
    }
  }, [nextImage, nextNode]);
}
