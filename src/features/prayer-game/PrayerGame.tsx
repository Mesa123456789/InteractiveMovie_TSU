"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
      .from(".prayer-darken", { opacity: 0, duration: 0.25, ease: "sine.inOut" }, 0)
      .to(".prayer-panel", { opacity: 0, duration: 0.25, ease: "sine.inOut" }, 0)
      .fromTo(".prayer-flash", { scale: 0.08, opacity: 0 },
        { scale: 0.63, opacity: 0.68, duration: 0.35, ease: "sine.inOut" }, 0.15)
      .to(".prayer-flash", { scale: 1.38, opacity: 0.93, duration: 0.3, ease: "power3.out" }, 0.5)
      .to(".prayer-flash", { scale: 1.55, opacity: 0, duration: 0.65, ease: "sine.out" }, 0.8)
      .fromTo(".blessing-card", { scale: 0.55, opacity: 0 },
        { scale: 1.03, opacity: 1, duration: 0.37, ease: "power3.out" }, 0.7)
      .to(".blessing-card", { scale: 1, duration: 0.13, ease: "power3.out" }, 1.07)
      .from(".blessing-halo", { opacity: 0, duration: 0.45, ease: "sine.out" }, 1)
      .from(".blessing-copy", { opacity: 0, duration: 0.26, ease: "sine.out" }, 0.91)
      .from(".blessing-heading", { opacity: 0, y: 8, duration: 0.27, ease: "power3.out" }, 1)
      .from(".blessing-action", { opacity: 0, y: 12, duration: 0.28, ease: "power3.out" }, 1.17)
      .call(() => field?.play(), [], 0.48)
      .to(".prayer-particles", { opacity: 0.36, duration: 0.27, ease: "sine.out" }, 0.5)
      .to(".prayer-particles", { opacity: 0, duration: 0.58, ease: "sine.inOut" }, 0.77)
      .call(() => field?.pause(), [], 1.35);
    return () => field?.pause();
  }, { scope: stage, dependencies: [card, flashing], revertOnUpdate: true });

  useGSAP(() => {
    if (!settled) return;
    gsap.timeline({ repeat: -1, yoyo: true })
      .fromTo(".blessing-halo", { opacity: 0.64 },
        { opacity: 0.46, duration: 2.3, ease: "sine.inOut" });
  }, { scope: stage, dependencies: [settled], revertOnUpdate: true });

  useLayoutEffect(() => {
    if (settled) title.current?.focus({ preventScroll: true });
  }, [settled]);

  return <div className="prayer-stage" ref={stage} data-revealed={!!card} data-settled={settled}>
    {(!card || flashing) && <BlessingParticles ref={particles}/>}
    <div className="prayer-darken" data-revealed={!!card} aria-hidden="true"/>
    <div className="prayer-flash-position" aria-hidden="true">
      <div className="prayer-flash" data-active={flashing}/>
    </div>
    {(!card || flashing) && <section className="game-panel prayer-panel" inert={flashing}>
      <InteractionTitle title="ขอพรที่วัด" description="เลือกเรื่องที่อยากขอพรได้ 1 เรื่อง"/>
      <div className="prayer-grid">
        {prayers.map(({ category, Icon }, index) => <motion.button key={category} className="prayer-option"
          aria-label={category} aria-pressed={prayer === index} onClick={() => select(index)}
          whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }} transition={spring}>
          <Icon className="prayer-icon" strokeWidth={1.65} aria-hidden="true"/>
          <span>{category}</span><small>{descriptions[index]}</small>
        </motion.button>)}
      </div>
      <div className="game-footer prayer-footer"><Action variant="primary" disabled={prayer === null || flashing}
        onClick={() => { if (wish()) setFlashing(true); }}>ขอพร</Action></div>
    </section>}
    <div className="blessing-wrap" hidden={!card} inert={!settled} aria-hidden={!settled} role="status">
      <div className="blessing-shell">
        <p className="blessing-heading">พรนี้เป็นของคุณ</p>
        <div className="blessing-halo" aria-hidden="true"/>
        <div className="blessing-card">
          {card && blessing !== null && <div className="blessing-copy">
            <div className="blessing-header">
              <card.Icon className="blessing-emblem" strokeWidth={1.55} aria-hidden="true"/>
              <p className="blessing-label">การ์ดพร</p>
              <p className="blessing-category">{card.category}</p>
            </div>
            <span className="wish-divider" />
            <div className="blessing-main">
              <h2 className="chinese" ref={title} tabIndex={-1} lang="zh-Hans">{card.text}</h2>
              <p className="blessing-pinyin">{card.pinyin}</p>
              <p className="blessing-translation">{card.translation}</p>
            </div>
            <span className="wish-divider" />
            <div className="blessing-meta">
              <p className="blessing-description">{descriptions[blessing]}</p>
              <p className="blessing-location">วัดลามะ · ปักกิ่ง</p>
            </div>
          </div>}
        </div>
        <div className="blessing-action"><Action variant="primary" disabled={!settled}
          onClick={confirm}>รับพรและชมต่อ</Action></div>
      </div>
    </div>
  </div>;
}
