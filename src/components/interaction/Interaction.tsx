"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { Action } from "@/components/ui/Action";
import { asset } from "@/data/asset-mapping";
import { choices } from "@/data/choices";
import { timing } from "@/lib/motion";
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

export function InteractionTitle({ kind, title, description }: { kind?: string; title: string; description?: string }) {
  return <header className="interaction-title">
    {kind && <p className="eyebrow"><span className="eyebrow-rule"/>{kind}</p>}
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
    const track = root.querySelector<HTMLElement>(".choice-track");
    const cloud = root.querySelector<HTMLElement>(".choice-cloud");
    const flow = index === 0 ? -1 : 1;
    const timeline = gsap.timeline({
      defaults: { ease: "power2.out", overwrite: "auto" },
      onComplete: () => choose(index),
    });

    timeline
      .to(buttons[index], { backgroundColor: "#38674b", borderColor: "#f1d28a", boxShadow: "0 5px 32px #d3ad4270",
        duration: 0.12 }, 0)
      .to(buttons[1 - index], { opacity: 0.35, duration: 0.5 }, 0.1);
    if (track && cloud) {
      const distance = Math.max(0, (track.clientWidth - cloud.offsetWidth) / 2);
      timeline.to(cloud, { x: flow * distance, duration: 0.5, ease: "power3.out" }, 0.1);
    }
    timeline.to(root, { autoAlpha: 0, duration: 0.35, ease: "sine.inOut" }, 0.85);
  }

  return <div className="choice-panel" ref={panel} aria-busy={selected !== null}>
    <div className="choice-entrance">
      <InteractionTitle kind={"ทางเลือก " + id.slice(1)} title={choice.title}/>
    </div>
    <div className="choice-grid">
      {choice.options.map((option, i) => {
        const picture = asset(option.image, "image");
        return <div className="choice-entrance" key={option.title}>
          <Action variant="choice" className="choice-card" disabled={selected !== null}
            data-selected={selected === i} onClick={() => contextSafe(select)(i as 0 | 1)}>
            <span className="choice-media" aria-hidden="true">
              {picture && <span className="choice-photo static-image" style={{ backgroundImage: "url(" + picture.src + ")" }}/>}
              <span className="choice-media-shade"/>
            </span>
            <span className="choice-copy">
              <strong>{option.title}</strong>
              {option.detail && <small>{option.detail}</small>}
            </span>
          </Action>
        </div>;
      })}
    </div>
    <div className="choice-divider" aria-hidden="true">
        <span className="choice-track"><span className="choice-fill"/></span>
        <span className="choice-cloud"><svg viewBox="0 0 56 29" fill="none">
          <path d="M4 18c0-4 3-7 7-7 1-5 4-8 9-8 4 0 7 2 8 6 3-2 7-2 10 1 3 3 6 4 12 4-4 3-9 4-15 3-3 6-8 8-14 6-3 3-9 3-13 0-3-2-4-3-4-5Z" fill="currentColor" stroke="#b09858" strokeWidth="1.6"/>
          <path d="M11 12c4-1 7 2 5 5m12-8c-3 0-5 3-4 5s4 2 6 1m-9 8c1-2 0-4-1-5" stroke="#927943" strokeWidth="1.35" strokeLinecap="round"/>
        </svg></span>
    </div>
  </div>;
}
