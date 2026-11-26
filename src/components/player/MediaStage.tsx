"use client";

import { AnimatePresence, motion } from "motion/react";
import { Aperture } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Asset, Shot } from "@/types/movie";
import { asset } from "@/data/asset-mapping";
import { Action } from "@/components/ui/Action";

export function FrameError({ retry }: { retry: () => void }) {
  return <div className="frame-error" role="alert"><Aperture size={27}/><h2>โหลดภาพยนตร์ไม่ได้</h2>
    <p>ตำแหน่งรับชมของคุณยังอยู่ที่เดิม</p><Action variant="primary" onClick={retry}>ลองอีกครั้ง</Action></div>;
}

export function ImageFrame({ shot, source, retry, ready, onLoad, onError }: {
  shot: Shot; source: Asset; retry: number; ready: boolean; onLoad: () => void; onError: () => void;
}) {
  const image = useRef<HTMLImageElement>(null);
  const duration = shot.transition === "cut" ? 0 : shot.transition === "fade" ? 0.6 : 0.34;
  useEffect(() => {
    if (image.current?.complete && image.current.naturalWidth > 0) onLoad();
  }, [onLoad, source.src, retry]);
  return <motion.div className="movie-still" initial={{ opacity: duration ? 0 : 1 }}
    animate={{ opacity: ready ? 1 : 0 }} exit={{ opacity: 0 }} transition={{ duration }}>
    {/* Preserve the original frame and avoid a second image optimization pass. */}
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img ref={image} src={source.src + (retry ? "?retry=" + retry : "")} alt="" onLoad={onLoad} onError={onError}/>
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
  return <AnimatePresence initial={false} mode="wait">{text && <motion.div key={text} className="subtitle-layer"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
    <span>{text}</span>
  </motion.div>}</AnimatePresence>;
}

export function subtitleAvailability(shots: readonly Shot[]) {
  return (["th", "en"] as const).filter((language) => shots.some((shot) => shot.subtitles?.[language] || shot.subtitleCues?.[language]?.length ||
    (shot.mediaType === "video" && asset(shot.subtitleTracks?.[language], "subtitle"))));
}
