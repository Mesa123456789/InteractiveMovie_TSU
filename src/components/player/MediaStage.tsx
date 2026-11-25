"use client";

import { AnimatePresence, motion } from "motion/react";
import { Aperture, RotateCcw } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Asset, Shot } from "@/types/movie";
import { asset } from "@/data/asset-mapping";
import { Action } from "@/components/ui/Action";

export function FrameError({ retry }: { retry: () => void }) {
  return <div className="frame-error" role="alert"><Aperture size={27}/><h2>โหลดภาพยนตร์ไม่ได้</h2>
    <p>ตำแหน่งรับชมของคุณยังอยู่ที่เดิม</p><Action className="primary" onClick={retry}><RotateCcw size={16}/>ลองอีกครั้ง</Action></div>;
}

export function ImageFrame({ shot, source, retry, ready, playing, onLoad, onError }: {
  shot: Shot; source: Asset; retry: number; ready: boolean; playing: boolean; onLoad: () => void; onError: () => void;
}) {
  const duration = shot.transition === "cut" ? 0 : shot.transition === "fade" ? 0.6 : 0.34;
  return <motion.div className="movie-still" initial={{ opacity: duration ? 0 : 1 }}
    animate={{ opacity: ready ? 1 : 0 }} exit={{ opacity: 0 }} transition={{ duration }}>
    {/* Preserve the original frame and avoid a second image optimization pass. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={source.src + (retry ? "?retry=" + retry : "")} alt="" data-camera={shot.cameraMotion}
      style={{ animationPlayState: playing ? "running" : "paused", animationDuration: Math.max(4, shot.durationMs / 1000) + "s" }}
      onLoad={onLoad} onError={onError}/>
  </motion.div>;
}

export function FreezeFrame({ shot, source, override, retry, onError }: { shot: Shot; source: Asset | undefined; override?: Asset; retry: number; onError: () => void }) {
  const image = override ?? (source?.kind === "image" ? source : undefined);
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const element = video.current;
    if (!element) return;
    function freeze() {
      if (!element) return;
      element.currentTime = Math.max(shot.startTime ?? 0, Math.min(shot.interactionTime ?? element.duration, element.duration) - 0.025);
      element.pause();
    }
    element.addEventListener("loadedmetadata", freeze);
    if (element.readyState >= 1) freeze();
    return () => element.removeEventListener("loadedmetadata", freeze);
  }, [shot, source, retry]);
  if (image) return <div className="frozen-frame" data-frame={shot.id} data-source={image.id}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={image.src + (retry ? "?retry=" + retry : "")} alt="" onError={onError}/>
  </div>;
  return <div className="frozen-frame" data-frame={shot.id} data-source={source?.id}>
    {source?.kind === "video" && <video ref={video} src={source.src + (retry ? "?retry=" + retry : "")} muted playsInline preload="auto" onError={onError}/>}
  </div>;
}

export function SubtitleLayer({ text }: { text?: string }) {
  return <AnimatePresence initial={false}><motion.div key={text ?? "none"} className="subtitle-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    {text && <span>{text}</span>}
  </motion.div></AnimatePresence>;
}

export function subtitleAvailability(shots: readonly Shot[]) {
  return (["th", "en"] as const).filter((language) => shots.some((shot) => shot.subtitles?.[language] ||
    (shot.mediaType === "video" && asset(shot.subtitleTracks?.[language], "subtitle"))));
}
