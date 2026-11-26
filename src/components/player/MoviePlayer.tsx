"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Aperture, RotateCw, Smartphone } from "lucide-react";
import { nodes } from "@/data/scenes";
import { asset, shotAsset } from "@/data/asset-mapping";
import { ChoiceOverlay, Interaction } from "@/components/interaction/Interaction";
import { DebugPanel } from "@/components/layout/DebugPanel";
import { Action } from "@/components/ui/Action";
import { BreakfastGame } from "@/features/breakfast-game/BreakfastGame";
import { PrayerGame } from "@/features/prayer-game/PrayerGame";
import { SentenceGame } from "@/features/sentence-game/SentenceGame";
import { selectProgress, useMovieStore } from "@/stores/useMovieStore";
import { useOrientation } from "@/hooks/useOrientation";
import { usePlayerFullscreen } from "@/hooks/usePlayerFullscreen";
import { lastShot } from "@/engine/scene-resolver";
import { usePreloadAssets } from "@/hooks/usePreloadAssets";
import { SequencePlayback } from "./SequencePlayback";
import { FrameError, FreezeFrame } from "./MediaStage";
import { CloseWatch, FullscreenButton } from "./PlayerControls";
import type { CheckpointId, MainProgress } from "@/types/movie";
import type { StoryEvent } from "@/engine/narrative-engine";

function WatchInteraction({ id, progress, close, advance, portrait, replay, fullscreen, toggleFullscreen }: {
  id: CheckpointId; progress: MainProgress; close: () => void; advance: (event: StoryEvent) => void; portrait: boolean; replay: boolean;
  fullscreen: boolean; toggleFullscreen: () => void;
}) {
  const [retry, setRetry] = useState(0);
  const [failed, setFailed] = useState(false);
  const shot = lastShot(progress.from);
  const source = shotAsset(shot);
  const freeze = asset(shot.freezeAssetId, "image");
  usePreloadAssets(undefined, id);
  const error = failed || (!source && !freeze);
  return <>
    <FreezeFrame key={retry} shot={shot} source={source} override={freeze} retry={retry} onError={() => setFailed(true)}/>
    {error ? <FrameError retry={() => { setFailed(false); setRetry((n) => n + 1); }}/> :
      <div className="interaction-host" inert={portrait} aria-hidden={portrait}>
        <Interaction>
          {(id === "c1" || id === "c2" || id === "c3") && <ChoiceOverlay id={id} choose={(option) => advance({ type: "choose", id, option })}/>}
          {id === "g1" && <BreakfastGame confirm={() => advance({ type: "taste" })}/>}
          {id === "g2" && <PrayerGame confirm={() => advance({ type: "accept-prayer" })}/>}
          {id === "g3" && <SentenceGame confirm={() => advance({ type: "order" })}/>}
        </Interaction>
      </div>}
    {!shot.assetId && !error && <div className="frozen-note">ภาพประกอบชั่วคราว</div>}
    {replay && <div className="replay-note">เล่นย้อนหลัง</div>}
    <div className="watch-corner">
      <FullscreenButton active={fullscreen} toggle={toggleFullscreen}/>
      <CloseWatch close={close}/>
    </div>
  </>;
}

export function MoviePlayer() {
  const router = useRouter();
  const progress = useMovieStore(selectProgress);
  const hydrated = useMovieStore((state) => state.hydrated);
  const replay = useMovieStore((state) => state.replay);
  const chapter = nodes[progress.node];
  const isPortrait = useOrientation();
  const [allowPortrait, setAllowPortrait] = useState(false);
  const portrait = isPortrait && !allowPortrait;
  const stage = useRef<HTMLElement>(null);
  const {mode, toggle: toggleFullscreen} = usePlayerFullscreen(stage);
  const fullscreen = mode !== null;
  const [ending, setEnding] = useState(false);
  const close = useCallback(() => {
    const path = useMovieStore.getState().replay?.returnTo ?? "/";
    router.push(path);
  }, [router]);

  useEffect(() => {
    if (!hydrated) return;
    if (replay?.complete) {
      router.replace(replay.returnTo);
    } else if (!progress.started) router.replace("/");
    else if (progress.done && !replay) {
      const timer = window.setTimeout(() => router.replace("/"), 640);
      return () => window.clearTimeout(timer);
    }
  }, [hydrated, progress.started, progress.done, replay, router]);

  const advance = useCallback((event: StoryEvent) => {
    if (chapter.id === "s7" && event.type === "finish") setEnding(true);
    useMovieStore.getState().event(event, chapter.id);
  }, [chapter.id]);
  const finish = useCallback(() => advance({ type: "finish" }), [advance]);

  if (!hydrated || !progress.started || replay?.complete) return <main className="page-loading"><Aperture className="loading-aperture" aria-label="กำลังโหลด"/></main>;
  return <main className="watch-page" ref={stage} data-fullscreen={mode ?? "off"}>
    <div className="watch-stage" inert={portrait} aria-hidden={portrait}>
      {chapter.type === "sequence" && <SequencePlayback key={(replay?.key ?? "main") + chapter.id} node={chapter} initial={progress}
        portrait={portrait} close={close} finish={finish} fullscreen={fullscreen} toggleFullscreen={toggleFullscreen}/>}
      {(chapter.type === "choice" || chapter.type === "minigame") && <WatchInteraction key={(replay?.key ?? "main") + chapter.id}
        id={chapter.id} progress={progress} close={close} advance={advance} portrait={portrait} replay={!!replay}
        fullscreen={fullscreen} toggleFullscreen={toggleFullscreen}/>}
      {chapter.type === "ending" && <FreezeFrame shot={lastShot("s7")} source={shotAsset(lastShot("s7"))}
        override={asset(lastShot("s7").freezeAssetId, "image")} retry={0} onError={() => {}}/>}
      <AnimatePresence>{(ending || chapter.type === "ending") && <motion.div className="ending-fade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.62 }}/>}</AnimatePresence>
    </div>
    {portrait && <div className="orientation-prompt" role="dialog" aria-modal="true" aria-labelledby="orientation-title">
      <div className="rotation-orbit"><Smartphone size={62} strokeWidth={1.1}/><RotateCw className="rotate-arrow" size={22}/></div>
      <h1 id="orientation-title">หมุนจอเป็นแนวนอน<br/>เพื่อเริ่มรับชมภาพยนตร์</h1>
      <div className="orientation-actions">
        <Action variant="primary" onClick={() => setAllowPortrait(true)}>ดูในแนวตั้ง</Action>
        <Action variant="secondary" onClick={close}>{replay ? "กลับไปการเดินทาง" : "กลับหน้าหลัก"}</Action>
      </div>
    </div>}
    {process.env.NODE_ENV === "development" && <DebugPanel />}
  </main>;
}
