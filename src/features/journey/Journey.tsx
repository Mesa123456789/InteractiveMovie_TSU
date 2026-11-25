"use client";

import { useEffectEvent, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import gsap from "gsap";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Keyboard, Navigation, Pagination } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import "swiper/css";
import "swiper/css/effect-coverflow";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { ArrowLeft, ArrowRight, LockKeyhole, Play } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Action } from "@/components/ui/Action";
import { checkpoints } from "@/data/checkpoints";
import { episodes } from "@/data/episodes";
import { checkpointFrame } from "@/engine/scene-resolver";
import { useMovieStore } from "@/stores/useMovieStore";
import { ease, spring, travelSeconds } from "@/lib/motion";
import { DebugPanel } from "@/components/layout/DebugPanel";
import type { CheckpointId } from "@/types/movie";

const tabs = { choice: ["c1", "c2", "c3"], game: ["g1", "g2", "g3"] } as const;
const tabIds = ["choice", "game"] as const;
const tabLabels = { choice: "ทางเลือก", game: "มินิเกม" };
const modules = [EffectCoverflow, Navigation, Pagination, Keyboard];
type Tab = keyof typeof tabs;
type Unlocks = ReturnType<typeof useMovieStore.getState>["unlocked"];

export function Journey() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("choice");
  const [indices, setIndices] = useState({ choice: 0, game: 0 });
  const leavingTab = useRef<Tab | null>(null);
  const requestedTab = useRef<Tab>("choice");
  const unlocked = useMovieStore((s) => s.unlocked);
  const replayAt = useMovieStore((s) => s.replayAt);
  const items = tabs[tab];
  const id = items[indices[tab]];
  const checkpoint = checkpoints[id];
  const image = checkpointFrame(id, unlocked[id]);

  function switchTab(next: Tab) {
    requestedTab.current = next;
    if (leavingTab.current || next === tab) return;
    leavingTab.current = tab;
    setTab(next);
  }

  function finishTabExit(deck: Tab) {
    if (leavingTab.current !== deck) return;
    leavingTab.current = null;
    switchTab(requestedTab.current);
  }

  function updateIndex(deck: Tab, index: number) {
    setIndices((current) => current[deck] === index ? current : { ...current, [deck]: index });
  }

  function replay(item: CheckpointId) {
    if (!unlocked[item]) return;
    replayAt(item);
    router.push("/watch");
  }

  return <main className="journey-page">
    <AnimatePresence initial={false}>
      <motion.div className="journey-atmosphere" key={image?.id ?? id}
        initial={{ opacity: 0, scale: 1.045 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.82, ease }}>
        <div className="journey-back static-image" style={{ backgroundImage: image ? "url(" + image.src + ")" : undefined }}/>
      </motion.div>
    </AnimatePresence>
    <div className="journey-shade" /><div className="grain" aria-hidden="true"/>
    <Navbar />
    <section className="journey-content" aria-label="การเดินทาง">
      <div className="journey-heading">
        <div className="journey-tabs" role="tablist" aria-label="ประเภทจุดเล่นซ้ำ">
          {tabIds.map((key) => <button id={"journey-" + key} key={key} role="tab" aria-selected={tab === key}
            aria-controls="journey-cards" tabIndex={tab === key ? 0 : -1} onClick={() => switchTab(key)}
            onKeyDown={(event) => {
              if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
              event.preventDefault();
              event.stopPropagation();
              const next = event.key === "Home" ? "choice" : event.key === "End" ? "game" : key === "choice" ? "game" : "choice";
              switchTab(next);
              document.getElementById("journey-" + next)?.focus();
            }}>{tabLabels[key]}{tab === key && <motion.span layoutId="journey-tab" className="tab-line" transition={spring}/>}</button>)}
        </div>
      </div>
      <div className="carousel-area" id="journey-cards" role="tabpanel" aria-labelledby={"journey-" + tab}>
        {tabIds.map((deck) => <CheckpointCarousel key={deck} tab={deck} active={deck === tab}
          unlocked={unlocked} onIndexChange={updateIndex} onExitComplete={finishTabExit} replay={replay}/>)}
      </div>
      <div className="journey-bottom">
        <AnimatePresence mode="wait" initial={false}><motion.div key={id} className="selected-journey" aria-live="polite"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -7 }} transition={{ duration: 0.19, ease }}>
          <p>EP {String(checkpoint.episode).padStart(2, "0")} <span>·</span> {episodes[checkpoint.episode - 1].title}</p>
          <h1>{checkpoint.title}</h1>
          <Action className={unlocked[id] ? "primary" : "secondary"} disabled={!unlocked[id]} onClick={() => replay(id)}>
            {unlocked[id] ? <><Play size={16} fill="currentColor"/>เล่นอีกครั้ง</> : <><LockKeyhole size={16}/>ยังไม่ปลดล็อก</>}
          </Action>
        </motion.div></AnimatePresence>
      </div>
    </section>
    {process.env.NODE_ENV === "development" && <DebugPanel />}
  </main>;
}

function CheckpointCarousel({ tab, active, unlocked, onIndexChange, onExitComplete, replay }: {
  tab: Tab; active: boolean; unlocked: Unlocks;
  onIndexChange: (tab: Tab, index: number) => void; onExitComplete: (tab: Tab) => void;
  replay: (item: CheckpointId) => void;
}) {
  const carousel = useRef<SwiperInstance | null>(null);
  const deck = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  const items = tabs[tab];

  useLayoutEffect(() => {
    const swiper = carousel.current;
    if (!swiper || swiper.destroyed) return;
    if (active) swiper.keyboard.enable();
    else swiper.keyboard.disable();
  }, [active]);

  const finishExit = useEffectEvent(() => {
    const swiper = carousel.current;
    if (swiper && !swiper.destroyed) {
      // Reset only after the deck has fully slid out.
      const index = swiper.realIndex % items.length;
      if (index === 1) swiper.slidePrev(0, false);
      else if (index === 2) swiper.slideNext(0, false);
    }
    onExitComplete(tab);
  });

  useLayoutEffect(() => {
    const position = { x: active ? 0 : tab === "choice" ? -48 : 48, opacity: active ? 1 : 0 };
    if (!initialized.current) {
      gsap.set(deck.current, position);
      initialized.current = true;
      return;
    }
    const tween = gsap.to(deck.current, { ...position, duration: travelSeconds, ease: "power2.inOut",
      onComplete: () => { if (!active) finishExit(); } });
    return () => { tween.kill(); };
  }, [active, tab]);

  function selectDot(index: number) {
    const swiper = carousel.current;
    if (!swiper || swiper.destroyed) return;
    const current = swiper.realIndex % items.length;
    const forward = (index - current + items.length) % items.length;
    if (forward === 1) swiper.slideNext();
    else if (forward === 2) swiper.slidePrev();
  }

  return (
    <div className="coverflow-gesture" ref={deck} data-active={active} aria-hidden={!active} inert={!active}>
      <Swiper className="coverflow" data-tab={tab} data-testid={active ? "coverflow" : undefined} modules={modules}
        effect="coverflow" centeredSlides slidesPerView="auto" initialSlide={3} loop loopAddBlankSlides={false} loopPreventsSliding={false}
        speed={travelSeconds * 1000} grabCursor threshold={6} longSwipesRatio={0.26}
        coverflowEffect={{ rotate: 11, stretch: "35%", depth: 45, scale: 0.86, slideShadows: false }}
        onSetTransition={(swiper, duration) => swiper.el.style.setProperty("--cover-transition", duration + "ms")}
        navigation={{ prevEl: "#" + tab + "-prev", nextEl: "#" + tab + "-next", addIcons: false }}
        keyboard={{ enabled: active, onlyInViewport: true, pageUpDown: false }}
        pagination={{
          el: "#" + tab + "-dots",
          type: "custom",
          renderCustom: (swiper) => items.map((item, i) =>
            '<button type="button" data-slide="' + i + '" aria-label="' + checkpoints[item].title +
            '" aria-current="' + String(swiper.realIndex % items.length === i) + '"><span></span></button>').join(""),
        }}
        onSwiper={(instance) => { carousel.current = instance; }}
        onRealIndexChange={(instance) => onIndexChange(tab, instance.realIndex % items.length)}>
        {[...items, ...items].map((item, i) => {
          const target = checkpoints[item];
          const picture = checkpointFrame(item, unlocked[item]);
          return <SwiperSlide key={item + "-" + i}>
            {({ isActive, isPrev, isNext }) => {
              const offset = isPrev ? -1 : isNext ? 1 : 0;
              const visible = isActive || isPrev || isNext;
              return <button type="button" className="cover-card swiper-slide-transform" data-checkpoint-id={item}
                data-center={isActive} data-offset={offset}
                aria-hidden={!visible} tabIndex={visible ? 0 : -1}
                aria-label={target.title + (unlocked[item] ? " เล่นอีกครั้ง" : " ยังล็อกอยู่")} aria-pressed={isActive}
                onClick={() => {
                  const swiper = carousel.current;
                  if (!swiper?.allowClick) return;
                  if (isPrev) swiper.slidePrev();
                  else if (isNext) swiper.slideNext();
                  else if (isActive) replay(item);
                }}>
                {picture && <span className="static-image" style={{ backgroundImage: "url(" + picture.src + ")" }} />}
                <span className="cover-shade"/>
                <span className="cover-top"><span className="episode-code">EP {String(target.episode).padStart(2, "0")}</span>
                  <span className="cover-lock">{unlocked[item] ? <Play size={15} fill="currentColor"/> : <LockKeyhole size={16}/>}</span></span>
                <span className="cover-title">{target.title}</span>
              </button>;
            }}
          </SwiperSlide>;
        })}
        <button slot="container-end" id={tab + "-prev"} className="icon-button carousel-arrow previous journey-prev" aria-label="การ์ดก่อนหน้า"><ArrowLeft size={21}/></button>
        <button slot="container-end" id={tab + "-next"} className="icon-button carousel-arrow next journey-next" aria-label="การ์ดถัดไป"><ArrowRight size={21}/></button>
        <div slot="container-end" id={tab + "-dots"} className="carousel-dots" aria-label="เลือกการ์ด" onClick={(event) => {
          const button = (event.target as HTMLElement).closest<HTMLButtonElement>("[data-slide]");
          if (button) selectDot(Number(button.dataset.slide));
        }}/>
      </Swiper>
    </div>
  );
}
