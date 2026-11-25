"use client";

import { AnimatePresence, motion } from "motion/react";
import { AudioLines, Maximize, Minimize, Pause, Play, X } from "lucide-react";
import { clock } from "@/engine/playback-controller";
import { useMovieStore } from "@/stores/useMovieStore";
import { Modal } from "@/components/ui/Modal";
import { Action } from "@/components/ui/Action";
import type { Subtitle } from "@/types/movie";

export function CloseWatch({ close }: { close: () => void }) {
  return <button className="icon-button watch-close" onClick={close} aria-label="ปิดตัวเล่น"><X size={25} strokeWidth={1.7}/></button>;
}

export function PlayerControls({ visible, playing, time, total, episode, title, close, toggle, seek, skip, audio, fullscreen, isFullscreen, feedback }: {
  visible: boolean; playing: boolean; time: number; total: number; episode: number; title: string;
  close: () => void; toggle: () => void; seek: (time: number) => void; skip: (seconds: number) => void; audio: () => void;
  fullscreen: () => void; isFullscreen: boolean; feedback: { direction: number; id: number } | null;
}) {
  return <>
    <motion.div className="player-controls" data-visible={visible} aria-hidden={!visible} inert={!visible}
      initial={false} animate={{ opacity: visible ? 1 : 0 }} transition={{ duration: 0.26 }}>
      <div className="player-vignette"/>
      <header className="player-top"><div><small>EP {String(episode).padStart(2, "0")}</small><strong>{title}</strong></div><CloseWatch close={close}/></header>
      <div className="playback-center">
        {[-10, 0, 10].map((seconds) => <motion.button key={seconds} className={"icon-button " + (seconds === 0 ? "main-play" : "skip-play")}
          type="button" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
          aria-label={seconds < 0 ? "ย้อนกลับ 10 วินาที" : seconds > 0 ? "ไปข้างหน้า 10 วินาที" : playing ? "หยุดชั่วคราว" : "เล่น"}
          onClick={() => seconds ? skip(seconds) : toggle()}>
          {seconds ? <span className="skip-symbol" data-direction={seconds}><span>10</span></span>
            : <AnimatePresence mode="wait" initial={false}><motion.span key={String(playing)}
              initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.12 }}>
              {playing ? <Pause size={41} fill="currentColor" strokeWidth={0}/> : <Play size={41} fill="currentColor" strokeWidth={0}/>}
            </motion.span></AnimatePresence>}
        </motion.button>)}
      </div>
      <div className="player-bottom">
        <div className="progress-row">
          <input type="range" min={0} max={total || 0.01} step={0.01} value={Math.min(time, total)} onChange={(event) => seek(event.currentTarget.valueAsNumber)}
            aria-label="ตำแหน่งรับชม" aria-valuetext={clock(time) + " จาก " + clock(total)}
            style={{ "--played": (total ? time / total * 100 : 0) + "%" } as React.CSSProperties}/>
          <span>{clock(time)} <i>/</i> {clock(total)}</span>
        </div>
        <div className="player-tools">
          <button className="icon-button audio-button" onClick={audio}><AudioLines size={17}/>เสียงและคำบรรยาย</button>
          <button className="icon-button fullscreen-button" onClick={fullscreen} aria-label={isFullscreen ? "ออกจากเต็มจอ" : "เต็มจอ"}>
            {isFullscreen ? <Minimize size={20}/> : <Maximize size={20}/>}</button>
        </div>
      </div>
    </motion.div>
    <AnimatePresence>{feedback && <motion.div key={feedback.id} className="seek-feedback" data-direction={feedback.direction}
      initial={{ opacity: 0, scale: 0.78 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} aria-hidden="true">
      {feedback.direction > 0 ? "+10" : "−10"}
    </motion.div>}</AnimatePresence>
  </>;
}

export function AudioSubtitleModal({ close, languages, hasAudio }: { close: () => void; languages: readonly Subtitle[]; hasAudio: boolean }) {
  const settings = useMovieStore((state) => state.settings);
  const set = useMovieStore((state) => state.setSettings);
  return <Modal label="เสียงและคำบรรยาย" close={close} className="audio-modal">
    <h2>เสียงและคำบรรยาย</h2>
    <div className="audio-grid">
      <fieldset><legend>เสียง</legend>
        {hasAudio ? <>
          <label className="audio-line"><input type="checkbox" checked={!settings.muted} onChange={(e) => set({ muted: !e.target.checked })}/>เปิดเสียง</label>
          <label className="audio-line volume-line">ระดับเสียง <input type="range" min="0" max="1" step="0.05" value={settings.volume} onChange={(e) => set({ volume: e.target.valueAsNumber })}/></label>
        </> : <p>ฉากนี้ยังไม่มีแทร็กเสียง</p>}
      </fieldset>
      <fieldset><legend>คำบรรยาย</legend>
        {([{ id: "off", label: "ปิด" }, { id: "th", label: "ไทย" }, { id: "en", label: "English" }] as const).map(({ id, label }) => <label key={id} className="audio-line">
          <input type="radio" name="subtitle" disabled={id !== "off" && !languages.includes(id)} checked={settings.subtitles === id}
            onChange={() => set({ subtitles: id })}/>{label}{id !== "off" && !languages.includes(id) && <small>ยังไม่พร้อมใช้งาน</small>}</label>)}
      </fieldset>
    </div>
    <Action className="primary" onClick={close}>เสร็จ</Action>
  </Modal>;
}
