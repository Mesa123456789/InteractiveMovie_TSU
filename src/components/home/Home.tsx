"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { artwork, asset, episodeArtwork } from "@/data/asset-mapping";
import { episodes } from "@/data/episodes";
import { Navbar } from "@/components/layout/Navbar";
import { Action } from "@/components/ui/Action";
import { useMovieStore } from "@/stores/useMovieStore";
import { nodes } from "@/data/scenes";
import { createTimeline } from "@/engine/playback-controller";
import { EpisodeDetail } from "./EpisodeDetail";
import { useEpisodeReveal } from "./useEpisodeReveal";
import { DebugPanel } from "@/components/layout/DebugPanel";
import type { EpisodeId } from "@/types/movie";

const summaries = {
  1: "คืนแรกที่ปักกิ่ง หมวยคิดถึงบ้านจนได้กลิ่นเกี๊ยวจากร้านริมทาง",
  2: "เกี๊ยวคำแรกพาหมวยกลับไปนึกถึงครัวของแม่ ก่อนพบรสชาติใหม่ในเช้าวันถัดมา",
  3: "หมวยลองมื้อเช้าแบบปักกิ่ง แล้วแวะวัดลามะเพื่อขอพร",
  4: "เมื่อออกจากวัดลามะ หมวยต้องเลือกจุดหมายถัดไปในปักกิ่ง",
  5: "ผ่านถนนการค้าหรือพระราชวังฤดูร้อน แล้วเลือกอีกมุมของเมืองที่หมวยอยากรู้จัก",
  6: "สายจากแม่พาหมวยกลับมาที่ร้านเกี๊ยวเดิม คราวนี้เธอจะลองสั่งด้วยตัวเอง",
};

export function Home() {
  const router = useRouter();
  const main = useMovieStore((s) => s.main);
  const hydrated = useMovieStore((s) => s.hydrated);
  const start = useMovieStore((s) => s.start);
  const playEpisode = useMovieStore((s) => s.playEpisode);
  const [selected, setSelected] = useState<{ id: EpisodeId; origin: HTMLButtonElement } | null>(null);
  const viewport = useRef<HTMLElement>(null);
  const { expanded, interactive, reveal } = useEpisodeReveal(viewport);
  const image = asset(artwork.hero.assetId, "image") ?? asset(artwork.hero.fallbackId, "image");

  const activeNode = nodes[main.node];
  const duration = activeNode.type === "sequence" ? createTimeline(activeNode.shots).total : 0;
  const roll = main.done ? "เริ่มใหม่" : main.started ? "ดูต่อ" : "เริ่มการเดินทาง";
  const detail = selected ? episodes[selected.id - 1] : null;
  const detailLabel = detail && main.completed.includes(detail.id) ? "เล่นอีกครั้ง"
    : detail && main.started && !main.done && main.episode === detail.id ? "ดูต่อ" : "เริ่มรับชม";

  return (
    <main className="home-page" ref={viewport}>
      <div className="hero-visual" aria-hidden="true">
        {image && <Image src={image.src} alt="" fill fetchPriority="high" loading="eager" sizes="100vw" />}
      </div>
      <div className="hero-shade" aria-hidden="true" />
      <div className="episode-gradient" aria-hidden="true" />
      <Navbar />
      <section className="hero" aria-labelledby="film-title">
        <div className="hero-content page-gutter">
          <h1 id="film-title">ร่วมค้นพบ<span>ไปกับหมวย</span></h1>
          <p className="hero-tag">จากรสชาติที่คิดถึงบ้าน<br className="mobile-br"/> สู่การเปิดใจให้โลกใหม่</p>
          <p className="hero-note"><MapPin size={13} /> ปักกิ่ง ประเทศจีน</p>
          <div className="hero-actions">
            <Action variant="primary" disabled={!hydrated} onClick={() => { start(main.done); router.push("/watch"); }}>
              {roll}
            </Action>
          </div>
        </div>
      </section>
      <section className="episode-section" id="episodes" inert={!interactive} aria-labelledby="episodes-title">
        <div className="section-heading">
          <h2 id="episodes-title">ตอนทั้งหมด</h2>
        </div>
        <div className="episode-rail">
          {episodes.map((episode) => {
            const unlocked = main.unlocked.includes(episode.id);
            const complete = main.completed.includes(episode.id);
            const active = main.started && !main.done && main.episode === episode.id;
            const picture = asset(episodeArtwork[episode.id], "image") ?? asset(episode.image, "image");
            return <div className="episode-card-reveal" key={episode.id}>
              <motion.button whileHover={{ y: -4 }} className="episode-card" data-locked={!unlocked} aria-haspopup="dialog"
                onClick={(event) => setSelected({ id: episode.id, origin: event.currentTarget })}>
                <span className="episode-image">
                  {picture && <Image src={picture.src} alt="" fill sizes="(max-width: 630px) 155px, 17vw" />}
                  <span className="episode-shade" />
                  <span className="episode-code">EP {String(episode.id).padStart(2, "0")}</span>
                  {(active || complete) && <span className="episode-track"><motion.span className="episode-meter" initial={{ scaleX: 0 }}
                    animate={{ scaleX: complete ? 1 : duration ? main.time / duration : 0.98 }}/></span>}
                </span>
                <span className="episode-caption"><strong>{episode.title}</strong><small>{complete ? "ดูแล้ว" : active ? "ดูต่อ" : unlocked ? "พร้อมรับชม" : "ยังไม่ปลดล็อก"}</small></span>
              </motion.button>
            </div>;
          })}
        </div>
      </section>
      <Action variant="text" className="episode-reveal-toggle"
        aria-expanded={expanded} aria-controls="episodes" onClick={() => reveal(!expanded)}>
        {expanded ? "ซ่อนตอนทั้งหมด" : "ตอนทั้งหมด"}
      </Action>
      {detail && selected && <EpisodeDetail title={detail.title} number={detail.id} summary={summaries[detail.id]}
        picture={asset(episodeArtwork[detail.id], "image") ?? asset(detail.image, "image")} origin={selected.origin}
        playable={hydrated && main.unlocked.includes(detail.id)} label={detailLabel} close={() => setSelected(null)}
        play={() => { playEpisode(detail.id); router.push("/watch"); }} />}
      {process.env.NODE_ENV === "development" && <DebugPanel />}
    </main>
  );
}
