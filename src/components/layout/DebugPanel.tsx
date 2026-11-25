"use client";

import { useRouter } from "next/navigation";
import { Bug } from "lucide-react";
import { nodes } from "@/data/scenes";
import { shotAsset } from "@/data/asset-mapping";
import { currentFrame, selectProgress, useMovieStore } from "@/stores/useMovieStore";
import type { NodeId } from "@/types/movie";

export function DebugPanel() {
  const router = useRouter();
  const progress = useMovieStore(selectProgress);
  return <details className="debug-panel">
    <summary title="Development controls" aria-label="Development controls"><Bug size={17}/></summary>
    <div>
      <label>Jump to <select value="" onChange={(event) => {
        const key = event.target.value;
        if (!key) return;
        if (key === "home" || key === "journey") { router.push(key === "home" ? "/" : "/journey"); return; }
        useMovieStore.getState().debugJump(key === "card" ? "g2" : key as NodeId, key === "card");
        router.push(key === "ending" ? "/" : "/watch");
      }}><option value="">Choose node</option><option value="home">Home</option><option value="journey">Journey</option>
        {Object.values(nodes).map((n) => <option key={n.id} value={n.id}>{n.id}{n.type === "sequence" ? " · " + n.title : ""}</option>)}
        <option value="card">Prayer card reveal</option>
      </select></label>
      <button onClick={() => useMovieStore.getState().unlockAll()}>Unlock all checkpoints</button>
      <button onClick={() => { useMovieStore.getState().reset(); router.push("/"); }}>Reset progress</button>
      <pre>{JSON.stringify({ progress, asset: shotAsset(currentFrame(progress))?.id ?? null }, null, 2)}</pre>
    </div>
  </details>;
}
