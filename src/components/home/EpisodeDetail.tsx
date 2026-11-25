"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { LockKeyhole, Play, X } from "lucide-react";
import { Action } from "@/components/ui/Action";
import { ease, travelEase, travelSeconds } from "@/lib/motion";
import type { Asset } from "@/types/movie";

export function EpisodeDetail({ title, number, summary, picture, playable, label, origin, close, play }: {
  title: string; number: number; summary: string; picture?: Asset; playable: boolean; label: string;
  origin: HTMLElement; close: () => void; play: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const dismissButton = useRef<HTMLButtonElement>(null);
  const pending = useRef<"close" | "play" | null>(null);
  const [open, setOpen] = useState(true);
  const hidden = { y: 100, opacity: 0 };

  useLayoutEffect(() => {
    const element = dialog.current;
    element?.showModal();
    dismissButton.current?.focus({ preventScroll: true });
    return () => element?.close();
  }, []);

  function dismiss(action: "close" | "play") {
    if (pending.current) return;
    pending.current = action;
    setOpen(false);
  }

  function afterExit() {
    dialog.current?.close();
    close();
    if (pending.current === "play") play();
    else origin.focus({ preventScroll: true });
  }

  return <dialog ref={dialog} className="episode-dialog" aria-labelledby="detail-title" aria-describedby="detail-summary"
    onClick={(event) => { if (event.target === event.currentTarget) dismiss("close"); }}
    onCancel={(event) => { event.preventDefault(); dismiss("close"); }}>
    <div className="episode-detail-position">
      <AnimatePresence onExitComplete={afterExit}>
        {open && <motion.div key="scrim" className="episode-dialog-shade" aria-hidden="true"
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }} animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }} transition={{ duration: travelSeconds, ease }}/>}
        {open && <motion.div key="detail" className="episode-detail"
          initial={hidden} animate={{ y: 0, opacity: 1 }} exit={hidden}
          transition={{ duration: travelSeconds, ease: travelEase }}>
          {picture && <Image src={picture.src} fill alt="" sizes="(max-width: 680px) 94vw, 680px" fetchPriority="high" />}
          <div className="episode-detail-shade"/>
          <motion.div className="episode-detail-copy" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }} transition={{ delay: 0.2, duration: 0.23, ease }}>
            <p className="eyebrow">EP {String(number).padStart(2, "0")}</p>
            <h2 id="detail-title">{title}</h2>
            <p id="detail-summary">{summary}</p>
            <Action className="primary" disabled={!playable} onClick={() => dismiss("play")}>
              {playable ? <Play size={17} fill="currentColor"/> : <LockKeyhole size={16}/>}
              {playable ? label : "ยังไม่ปลดล็อก"}
            </Action>
          </motion.div>
          <button ref={dismissButton} type="button" className="icon-button episode-detail-close" aria-label="ปิดรายละเอียด"
            onClick={() => dismiss("close")}><X size={22}/></button>
        </motion.div>}
      </AnimatePresence>
    </div>
  </dialog>;
}
