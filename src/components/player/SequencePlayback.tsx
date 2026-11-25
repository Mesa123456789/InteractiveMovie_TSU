"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Aperture } from "lucide-react";
import { asset, shotAsset } from "@/data/asset-mapping";
import { createTimeline, clampSeek, position } from "@/engine/playback-controller";
import { usePreloadAssets } from "@/hooks/usePreloadAssets";
import { useMovieStore } from "@/stores/useMovieStore";
import type { MainProgress, NarrativeNode } from "@/types/movie";
import { AudioSubtitleModal, CloseWatch, PlayerControls } from "./PlayerControls";
import { FrameError, ImageFrame, SubtitleLayer, subtitleAvailability } from "./MediaStage";

type Sequence = Extract<NarrativeNode, { type: "sequence" }>;

export function SequencePlayback({ node, initial, portrait, close, finish, toggleFullscreen, fullscreen }: {
  node: Sequence; initial: MainProgress; portrait: boolean; close: () => void; finish: () => void;
  toggleFullscreen: () => void; fullscreen: boolean;
}) {
  const [time, setTime] = useState(initial.time);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(true);
  const [menu, setMenu] = useState(false);
  const [retry, setRetry] = useState(0);
  const [ready, setReady] = useState<Record<string, true>>({});
  const [failed, setFailed] = useState("");
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<{ direction: number; id: number } | null>(null);
  const [focused, setFocused] = useState(false);
  const settings = useMovieStore((s) => s.settings);
  const video = useRef<HTMLVideoElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const timeRef = useRef(time);
  const finishRef = useRef(false);
  const seekFlash = useRef<number>(undefined);
  const hide = useRef<number>(undefined);
  const writeAt = useRef(0);
  const stage = useRef<HTMLDivElement>(null);
  const timeline = useMemo(() => createTimeline(node.shots, durations), [node.shots, durations]);
  const entry = position(timeline.entries, time);
  const shot = entry?.shot;
  const source = shot && shotAsset(shot);
  const audioSource = asset(shot?.audioAssetId, "audio");
  const mediaKey = [source?.id, shot?.mediaType === "video" || shot?.cameraMotion !== "static" ? shot?.id : "", retry].join("|");
  const missing = !source || failed === mediaKey;
  const readyNow = !!ready[mediaKey];
  const blocked = portrait || menu || missing || !readyNow;
  const running = playing && !blocked;
  const nextShot = entry && timeline.entries[timeline.entries.indexOf(entry) + 1]?.shot;
  usePreloadAssets(nextShot, node.nextNodeId);

  const persist = useCallback((value: number) => {
    const current = position(timeline.entries, value)?.shot;
    if (current) useMovieStore.getState().tick(node.id, current.id, value);
  }, [node.id, timeline.entries]);

  const update = useCallback((value: number, force = false) => {
    const safe = Math.min(timeline.total, Math.max(0, value));
    timeRef.current = safe;
    setTime(safe);
    if (force || performance.now() - writeAt.current > 330) {
      writeAt.current = performance.now();
      persist(safe);
    }
  }, [persist, timeline.total]);

  const next = useCallback((value: number) => {
    if (finishRef.current) return;
    if (value >= timeline.total - 0.001) {
      finishRef.current = true;
      update(timeline.total, true);
      finish();
    } else update(value);
  }, [finish, update, timeline.total]);

  useEffect(() => {
    if (!running || source?.kind !== "image") return;
    let previous = performance.now();
    const timer = window.setInterval(() => {
      const current = performance.now();
      const elapsed = (current - previous) / 1000;
      previous = current;
      if (document.visibilityState === "visible") next(timeRef.current + Math.min(elapsed, 0.15));
    }, 45);
    return () => window.clearInterval(timer);
  }, [running, source?.kind, next]);

  const reveal = useCallback(() => {
    setVisible(true);
    window.clearTimeout(hide.current);
    if (playing && !portrait && !menu && !missing && !focused) hide.current = window.setTimeout(() => setVisible(false), 2900);
  }, [playing, portrait, menu, missing, focused]);

  useEffect(() => {
    const timer = window.setTimeout(reveal, 0);
    return () => { window.clearTimeout(timer); window.clearTimeout(hide.current); };
  }, [reveal]);

  useEffect(() => () => window.clearTimeout(seekFlash.current), []);
  useEffect(() => {
    const handle = () => persist(timeRef.current);
    window.addEventListener("pagehide", handle);
    return () => window.removeEventListener("pagehide", handle);
  }, [persist]);

  useEffect(() => {
    const element = video.current;
    if (!element) return;
    element.volume = settings.volume;
    for (const track of Array.from(element.textTracks)) track.mode = track.language === settings.subtitles ? "showing" : "disabled";
    if (running) void element.play().catch((error: DOMException) => { if (error.name !== "AbortError") setPlaying(false); });
    else element.pause();
  }, [running, settings, mediaKey]);

  useEffect(() => {
    const element = audio.current;
    if (!element) return;
    element.volume = settings.volume;
    if (running && !settings.muted) void element.play().catch(() => {});
    else element.pause();
  }, [running, settings, shot?.id]);

  function seek(value: number) {
    if (missing || !entry) return;
    const target = clampSeek(value, timeline.total);
    update(target, true);
    const targetEntry = position(timeline.entries, target);
    if (targetEntry?.shot.id === entry.shot.id) {
      if (video.current?.readyState) video.current.currentTime = target - entry.start + (shot?.startTime ?? 0);
      if (audio.current?.readyState) audio.current.currentTime = target - entry.start;
    }
    reveal();
  }

  function skip(seconds: number) {
    seek(timeRef.current + seconds);
    setFeedback({ direction: seconds, id: Date.now() });
    window.clearTimeout(seekFlash.current);
    seekFlash.current = window.setTimeout(() => setFeedback(null), 430);
  }

  function toggle() {
    if (missing) return;
    if (playing) persist(timeRef.current);
    const element = video.current;
    if (!playing && readyNow && !portrait && !menu && element) {
      void element.play().catch(() => setPlaying(false));
    }
    setPlaying(!playing);
    reveal();
  }

  useEffect(() => {
    function keys(event: KeyboardEvent) {
      if (event.key === "Tab" && !menu && !portrait && !visible) {
        reveal();
        stage.current?.focus({ preventScroll: true });
      }
      if (event.defaultPrevented || menu || portrait || (event.target instanceof HTMLElement && event.target.closest("input,select,button,a,summary"))) return;
      const actions: Record<string, () => void> = {
        " ": toggle, ArrowLeft: () => skip(-10), ArrowRight: () => skip(10),
        f: toggleFullscreen, m: () => useMovieStore.getState().setSettings({ muted: !useMovieStore.getState().settings.muted }),
        Escape: () => { persist(timeRef.current); close(); },
      };
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (actions[key]) { event.preventDefault(); actions[key](); }
    }
    window.addEventListener("keydown", keys);
    return () => window.removeEventListener("keydown", keys);
  });

  if (!shot || !entry) return <><FrameError retry={() => setRetry(retry + 1)}/><CloseWatch close={close}/></>;
  const text = settings.subtitles === "off" || (source?.kind === "video" && asset(shot.subtitleTracks?.[settings.subtitles], "subtitle"))
    ? undefined : shot.subtitles?.[settings.subtitles];
  const fallback = !shot.assetId;
  return <div className="sequence-stage" ref={stage} tabIndex={-1} onPointerMove={reveal} onPointerDown={reveal}
    onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
    onFocus={(event) => { if (event.target.matches(":focus-visible")) setFocused(true); }}>
    <div className="media-surface" onClick={reveal} data-shot={shot.id}>
      <AnimatePresence initial={false}>
        {source?.kind === "image" && <ImageFrame key={mediaKey} shot={shot} source={source} retry={retry} ready={readyNow} playing={running}
          onLoad={() => setReady((old) => old[mediaKey] ? old : { ...old, [mediaKey]: true })} onError={() => setFailed(mediaKey)}/>}
      </AnimatePresence>
      {source?.kind === "video" && <video key={mediaKey} ref={video} className="movie-video" muted={settings.muted} playsInline preload="auto"
        src={source.src + (retry ? "?retry=" + retry : "")}
        onLoadedMetadata={(event) => {
          const element = event.currentTarget;
          if (Number.isFinite(element.duration)) setDurations((old) => old[shot.id] === element.duration ? old : { ...old, [shot.id]: element.duration });
          const target = Math.max(0, timeRef.current - entry.start) + (shot.startTime ?? 0);
          if (target > 0) element.currentTime = Math.min(target, Math.max(0, Math.min(shot.interactionTime ?? element.duration, element.duration) - 0.03));
        }}
        onLoadedData={() => setReady((old) => old[mediaKey] ? old : { ...old, [mediaKey]: true })} onError={() => setFailed(mediaKey)}
        onTimeUpdate={(event) => {
          if (running) {
            const relative = event.currentTarget.currentTime - (shot.startTime ?? 0);
            if (relative >= entry.duration) {
              event.currentTarget.pause();
              next(entry.start + entry.duration);
            } else update(entry.start + relative);
          }
        }} onEnded={() => { if (running) next(entry.start + entry.duration); }}>
        {(["th", "en", "zh"] as const).map((lang) => {
          const track = asset(shot.subtitleTracks?.[lang], "subtitle");
          return track ? <track key={lang} kind="subtitles" srcLang={lang} src={track.src} label={lang} default={settings.subtitles === lang}/> : null;
        })}
      </video>}
      {audioSource && <audio key={shot.id} ref={audio} src={audioSource.src} preload="auto" onLoadedMetadata={(event) => {
        event.currentTarget.currentTime = Math.max(0, timeRef.current - entry.start);
      }}/>}
    </div>
    {fallback && !missing && <div className="preview-caption" title={shot.screenplayScene + " / " + shot.cut}><span>ภาพประกอบชั่วคราว</span><p>{shot.description}</p></div>}
    {!readyNow && !missing && <div className="loading-overlay" role="status" aria-label="กำลังโหลด"><Aperture size={24}/></div>}
    {missing ? <><FrameError retry={() => setRetry((value) => value + 1)}/><CloseWatch close={() => { persist(timeRef.current); close(); }}/></> :
      <PlayerControls visible={visible || !playing || menu || focused} playing={playing} time={time} total={timeline.total}
        episode={node.episodeId} title={node.title} close={() => { persist(timeRef.current); close(); }} toggle={toggle} seek={seek} skip={skip}
        audio={() => setMenu(true)} fullscreen={toggleFullscreen} isFullscreen={fullscreen} feedback={feedback}/>}
    <SubtitleLayer text={text}/>
    {menu && <AudioSubtitleModal close={() => setMenu(false)} languages={subtitleAvailability(node.shots)}
      hasAudio={node.shots.some((item) => item.mediaType === "video" && !!shotAsset(item) || !!asset(item.audioAssetId, "audio"))}/>}
  </div>;
}
