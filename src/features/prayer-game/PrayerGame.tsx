"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowRight, Check, Sparkles } from "lucide-react";
import { prayers } from "@/data/prayers";
import { Action } from "@/components/ui/Action";
import { InteractionTitle } from "@/components/interaction/Interaction";
import { selectProgress, useMovieStore } from "@/stores/useMovieStore";
import { spring } from "@/lib/motion";
import { BlessingParticles, type ParticlePlayback } from "./BlessingParticles";

gsap.registerPlugin(useGSAP);

const descriptions = [
  "การสอบและการเรียนรู้", "งานราบรื่นและโอกาสใหม่", "ความมั่นคงและการออม",
  "ความสัมพันธ์ที่ดี", "ความสุขของคนที่บ้าน", "ร่างกายแข็งแรง",
  "เดินทางโดยสวัสดิภาพ", "ความมั่นใจและการพัฒนา", "พักใจและคลายกังวล",
];

export function PrayerGame({ confirm }: { confirm: () => void }) {
  const { prayer, blessing } = useMovieStore(selectProgress);
  const select = useMovieStore((state) => state.selectPrayer);
  const wish = useMovieStore((state) => state.wish);
  const [flashing, setFlashing] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const particles = useRef<ParticlePlayback>(null);
  const card = blessing === null ? null : prayers[blessing];
  const settled = !!card && !flashing;

  useGSAP(() => {
    if (!flashing || !card || !stage.current) return;
    const field = particles.current;
    const timeline = gsap.timeline({ onComplete: () => setFlashing(false) });
    timeline
      .from(".prayer-darken", { opacity: 0, duration: 0.5, ease: "sine.inOut" }, 0)
      .to(".prayer-panel", { opacity: 0, duration: 0.23, ease: "sine.inOut" }, 0)
      .fromTo(".prayer-flash", { scale: 0.05, opacity: 0 },
        { scale: 0.85, opacity: 0.68, duration: 0.2, ease: "sine.inOut" }, 0.06)
      .to(".prayer-flash", { scale: 1.38, opacity: 0.78, duration: 0.12, ease: "sine.out" }, 0.26)
      .to(".prayer-flash", { scale: 1.69, opacity: 0, duration: 0.42, ease: "sine.out" }, 0.38)
      .fromTo(".blessing-card", { scale: 0.2, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.55, ease: "power2.out" }, 0.2)
      .fromTo(".blessing-halo", { opacity: 0 },
        { opacity: 0.72, duration: 0.39, ease: "sine.out" }, 0.36)
      .from(".blessing-copy > *", { opacity: 0, y: 5, duration: 0.22, stagger: 0.035, ease: "power2.out" }, 0.35)
      .from(".blessing-action", { opacity: 0, y: 12, duration: 0.2, ease: "power2.out" }, 0.58)
      .call(() => field?.play(), [], 0.09)
      .to(".prayer-particles", { opacity: 0.85, duration: 0.22, ease: "sine.out" }, 0.13)
      .to(".prayer-particles", { opacity: 0, duration: 0.39, ease: "sine.inOut" }, 0.41)
      .call(() => field?.pause(), [], 0.8);
    return () => field?.pause();
  }, { scope: stage, dependencies: [card, flashing], revertOnUpdate: true });

  useGSAP(() => {
    if (!settled) return;
    gsap.timeline({ repeat: -1, yoyo: true })
      .fromTo(".blessing-halo", { opacity: 0.72, scale: 1 },
        { opacity: 0.47, scale: 1.05, duration: 2.3, ease: "sine.inOut" });
  }, { scope: stage, dependencies: [settled], revertOnUpdate: true });

  useLayoutEffect(() => {
    if (settled) title.current?.focus({ preventScroll: true });
  }, [settled]);

  return <div className="prayer-stage" ref={stage} data-revealed={!!card} data-settled={settled}>
    {(!card || flashing) && <BlessingParticles ref={particles}/>}
    {card && <div className="prayer-darken" aria-hidden="true"/>}
    {(!card || flashing) && <section className="game-panel prayer-panel" inert={flashing}>
      <InteractionTitle kind="มินิเกม 2" title="ขอพรที่วัด" description="เลือกเรื่องที่อยากขอพรได้ 1 เรื่อง"/>
      <div className="prayer-grid">
        {prayers.map(({ category, Icon }, index) => <motion.button key={category} className="prayer-option"
          aria-label={category} aria-pressed={prayer === index} onClick={() => select(index)}
          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={spring}>
          <Icon size={22} strokeWidth={1.55} aria-hidden="true"/>
          <span>{category}</span><small>{descriptions[index]}</small>
          {prayer === index && <Check className="prayer-tick" size={15} aria-hidden="true"/>}
        </motion.button>)}
      </div>
      <div className="game-footer prayer-footer"><Action className="primary" disabled={prayer === null || flashing}
        onClick={() => { if (wish()) setFlashing(true); }}><Sparkles size={17}/>ขอพร</Action></div>
    </section>}
    {card && <div className="blessing-wrap" inert={flashing} aria-hidden={flashing} role="status">
      <div className="blessing-shell">
        <div className="prayer-flash-position" aria-hidden="true">
          <div className="prayer-flash" data-active={flashing}/>
        </div>
        <div className="blessing-halo" aria-hidden="true"/>
        <div className="blessing-card">
          <div className="blessing-copy">
            <Sparkles className="wish-emblem" size={26} strokeWidth={1.25}/>
            <p className="eyebrow">คำอวยพร · {card.category}</p>
            <h2 className="chinese" ref={title} tabIndex={-1} lang="zh-Hans">{card.text}</h2>
            <p className="blessing-pinyin">{card.pinyin}</p>
            <span className="wish-divider"/>
            <p>{card.translation}</p>
          </div>
        </div>
      </div>
      <div className="blessing-action"><Action className="primary" disabled={flashing}
        onClick={confirm}>รับพรและชมต่อ<ArrowRight size={17}/></Action></div>
    </div>}
  </div>;
}
