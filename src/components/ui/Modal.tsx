"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { X } from "lucide-react";
import { ease, timing } from "@/lib/motion";

export function Modal({ label, close, children, className = "" }: { label: string; close: () => void; children: ReactNode; className?: string }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const element = dialog.current;
    element?.showModal();
    return () => element?.close();
  }, []);
  return <dialog ref={dialog} aria-label={label} className={"modal " + className} onCancel={(event) => { event.preventDefault(); close(); }}
    onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
    <motion.div className="modal-inner" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: timing.panel, ease }}>
      {children}
      <button type="button" className="icon-button modal-close" aria-label="ปิดหน้าต่าง" onClick={close}><X /></button>
    </motion.div>
  </dialog>;
}
