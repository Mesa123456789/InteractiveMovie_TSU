"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Check } from "lucide-react";
import { choices } from "@/data/choices";
import { timing, travelSeconds } from "@/lib/motion";
import type { ChoiceId } from "@/types/movie";

gsap.registerPlugin(useGSAP);

export function Interaction({ children }: { children: ReactNode }) {
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    panel.current?.querySelector<HTMLElement>("h2")?.focus({ preventScroll: true });
  }, []);
  return <motion.section className="interaction-layer" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    transition={{ duration: timing.panel }} ref={panel} aria-label="จุดโต้ตอบของภาพยนตร์">
    <div className="interaction-scroll">{children}</div>
  </motion.section>;
}

export function InteractionTitle({ kind, title, description }: { kind: string; title: string; description?: string }) {
  return <header className="interaction-title">
    <p className="eyebrow"><span className="eyebrow-rule"/>{kind}</p>
    <h2 tabIndex={-1}>{title}</h2>
    {description && <p>{description}</p>}
  </header>;
}

export function ChoiceOverlay({ id, choose }: { id: ChoiceId; choose: (option: 0 | 1) => void }) {
  const choice = choices[id];
  const [selected, setSelected] = useState<number | null>(null);
  const panel = useRef<HTMLDivElement>(null);
  const lock = useRef(false);
  const { contextSafe } = useGSAP(() => {
    gsap.from(".choice-entrance", { opacity: 0, y: 12, stagger: 0.055,
      duration: 0.48, ease: "power2.out" });
  }, { scope: panel });

  function select(index: 0 | 1) {
    if (lock.current || !panel.current) return;
    lock.current = true;
    setSelected(index);
    const root = panel.current;
    const buttons = root.querySelectorAll(".choice-card");
    const bar = root.querySelector<HTMLElement>(".choice-divider");
    const cloud = root.querySelector<HTMLElement>(".choice-cloud");
    const cloudIcon = cloud?.querySelector("svg");
    const fill = root.querySelector<HTMLElement>(".choice-fill");
    const flow = index === 0 ? -1 : 1;
    const travel = Math.max(0, ((bar?.clientWidth ?? 0) - (cloud?.clientWidth ?? 0)) / 2 - 7);
    const timeline = gsap.timeline({
      defaults: { ease: "power2.out", overwrite: "auto" },
      onComplete: () => choose(index),
    });

    timeline
      .to(buttons[index], { backgroundColor: "#38674b", borderColor: "#f1d28a", boxShadow: "0 5px 32px #d3ad4270",
        scale: 1.035, duration: 0.24 }, 0)
      .to(buttons[1 - index], { opacity: 0.27, duration: 0.23 }, 0);
    if (fill && cloud && cloudIcon) {
      timeline
        .set(fill, { transformOrigin: index === 0 ? "right center" : "left center" }, 0)
        .to(fill, { x: flow * (bar?.clientWidth ?? 0) * 0.15, scaleX: 1.45, backgroundColor: "#6aba8d",
          ease: "sine.inOut", duration: 0.55 }, 0)
        .to(cloud, { x: travel * flow, ease: "sine.inOut", duration: 0.55 }, 0)
        .to(cloudIcon, { rotation: flow * 6, scale: 1.12, ease: "sine.inOut", duration: 0.55 }, 0);
    }
    timeline.to(root, { autoAlpha: 0, duration: 0.2, ease: "sine.inOut" }, travelSeconds - 0.2);
  }

  return <div className="choice-panel" ref={panel} aria-busy={selected !== null}>
    <div className="choice-entrance">
      <InteractionTitle kind={"ทางเลือก " + id.slice(1)} title={choice.title}/>
    </div>
    <div className="choice-grid">
      {choice.options.map((option, i) => (
        <div className="choice-entrance" key={option.title}>
          <button type="button" className="choice-card" disabled={selected !== null}
            data-selected={selected === i} onClick={() => contextSafe(select)(i as 0 | 1)}>
            <strong>{option.title}</strong>{option.detail && <small>{option.detail}</small>}
            {selected === i && <Check className="choice-check" size={18} aria-hidden="true"/>}
          </button>
        </div>
      ))}
    </div>
    <div className="choice-divider choice-entrance" aria-hidden="true">
        <span className="choice-track"><span className="choice-fill"/></span>
        <span className="choice-cloud"><svg viewBox="0 0 56 29" fill="none">
          <path d="M4 18c0-4 3-7 7-7 1-5 4-8 9-8 4 0 7 2 8 6 3-2 7-2 10 1 3 3 6 4 12 4-4 3-9 4-15 3-3 6-8 8-14 6-3 3-9 3-13 0-3-2-4-3-4-5Z" fill="currentColor" stroke="#b09858" strokeWidth="1.6"/>
          <path d="M11 12c4-1 7 2 5 5m12-8c-3 0-5 3-4 5s4 2 6 1m-9 8c1-2 0-4-1-5" stroke="#927943" strokeWidth="1.35" strokeLinecap="round"/>
        </svg></span>
    </div>
  </div>;
}
