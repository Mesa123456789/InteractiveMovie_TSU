"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { DndContext, DragOverlay, PointerSensor, rectIntersection, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { motion } from "motion/react";
import { ArrowRight, Check, RotateCcw, Volume2 } from "lucide-react";
import { Action } from "@/components/ui/Action";
import { InteractionTitle } from "@/components/interaction/Interaction";
import { answer, hints, sentence, wordById, words } from "@/data/sentences";
import { artwork, asset } from "@/data/asset-mapping";
import { selectProgress, useMovieStore } from "@/stores/useMovieStore";
import { rise, stagger, timing } from "@/lib/motion";

type Word = (typeof words)[number];

function WordLabel({ word }: { word: Word }) {
  return <><strong className="chinese" lang="zh-Hans">{word.zh}</strong><small>{word.pin}</small></>;
}

type TileKeyboard = (event: KeyboardEvent<HTMLButtonElement>, word: Word) => void;

function Tile({ word, tap, keyboard }: { word: Word; tap: () => void; keyboard: TileKeyboard }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: word.id });
  return <motion.button className="word-tile" data-word={word.id} data-dragging={isDragging} ref={setNodeRef} type="button" aria-label={word.zh + " " + word.pin}
    onClick={tap} {...attributes} {...listeners} onKeyDown={(event) => keyboard(event, word)}
    whileHover={{ y: -2 }} whileTap={{ scale: 0.96 }}><WordLabel word={word}/></motion.button>;
}
function Slot({ index, word, wrong, correct, remove, keyboard, highlighted }: {
  index: number; word: Word | undefined; wrong: Word | undefined; correct: boolean;
  remove: () => void; keyboard: TileKeyboard; highlighted: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: "slot-" + index });
  return <motion.div className="sentence-slot" ref={setNodeRef} aria-label={"ช่อง " + (index + 1)}
    data-over={isOver || highlighted} data-wrong={!!wrong} data-correct={correct}
    animate={{ x: wrong ? [0, -5, 5, -4, 0] : 0 }} transition={{ duration: timing.ui }}>
    {word ? <Tile word={word} tap={remove} keyboard={keyboard}/> : wrong ? <WordLabel word={wrong}/> : null}
  </motion.div>;
}

export function SentenceGame({ confirm }: { confirm: () => void }) {
  const { words: slots, attempts, solved } = useMovieStore(selectProgress);
  const { put, remove, clearWords, check } = useMovieStore.getState();
  const [dragging, setDragging] = useState<string | null>(null);
  const [errors, setErrors] = useState<(string | null)[]>([]);
  const [checked, setChecked] = useState<(string | null)[]>([]);
  const [reviewedAttempt, setReviewedAttempt] = useState(0);
  const [audioMessage, setAudioMessage] = useState("");
  const [pickup, setPickup] = useState<{ word: string; index: number } | null>(null);
  const errorTimer = useRef<number>(undefined);
  const audio = useRef<HTMLAudioElement | null>(null);
  const speech = useRef<SpeechSynthesisUtterance | null>(null);
  const success = useRef<HTMLHeadingElement>(null);
  const board = useRef<HTMLDivElement>(null);
  const id = useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const ready = slots.every(Boolean);
  const retry = !ready && attempts > reviewedAttempt;

  useEffect(() => () => {
    window.clearTimeout(errorTimer.current);
    audio.current?.pause();
    if (speech.current) window.speechSynthesis?.cancel();
  }, []);

  useEffect(() => { if (solved) success.current?.focus({ preventScroll: true }); }, [solved]);

  function verify() {
    setErrors(slots.map((word, index) => word && word !== answer[index] ? word : null));
    setChecked(slots.map((word, index) => word === answer[index] ? word : null));
    window.clearTimeout(errorTimer.current);
    errorTimer.current = window.setTimeout(() => setErrors([]), 360);
    check();
  }

  function drop({ active, over }: DragEndEvent) {
    setDragging(null);
    const target = String(over?.id ?? "");
    if (target.startsWith("slot-")) place(String(active.id), Number(target.slice(5)));
  }

  function place(word: string, target?: number) {
    setReviewedAttempt(attempts);
    put(word, target);
  }

  function keyboard(event: KeyboardEvent<HTMLButtonElement>, word: Word) {
    const key = event.key;
    if (key === " " || (key === "Enter" && pickup?.word === word.id)) {
      event.preventDefault();
      if (event.repeat) return;
      if (pickup?.word !== word.id) {
        setPickup({ word: word.id, index: slots.indexOf(word.id) });
      } else {
        if (pickup.index >= 0) {
          place(word.id, pickup.index);
          requestAnimationFrame(() => board.current?.querySelector<HTMLButtonElement>('[data-word="' + word.id + '"]')?.focus());
        }
        setPickup(null);
      }
      return;
    }
    if (pickup?.word !== word.id) return;
    if (key === "Escape" || key === "Tab") { setPickup(null); return; }
    const step = key === "ArrowRight" || key === "ArrowDown" ? 1 : key === "ArrowLeft" || key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    setPickup((current) => current && ({ ...current, index: current.index < 0 ? step > 0 ? 0 : 3 : Math.max(0, Math.min(3, current.index + step)) }));
  }

  function speak() {
    setAudioMessage("");
    const clip = asset(artwork.mandarinAudio, "audio");
    if (clip) {
      audio.current?.pause();
      const next = new Audio(clip.src);
      audio.current = next;
      void next.play().catch(() => setAudioMessage("ไม่สามารถเล่นเสียงได้"));
      return;
    }
    const engine = window.speechSynthesis;
    const voice = engine?.getVoices().find((item) => /^zh[-_](CN|Hans|SG)/i.test(item.lang));
    if (!voice) { setAudioMessage("อุปกรณ์นี้ไม่มีเสียงอ่านภาษาจีนกลาง"); return; }
    engine.cancel();
    const utterance = new SpeechSynthesisUtterance(sentence.zh);
    speech.current = utterance;
    utterance.lang = "zh-CN";
    utterance.voice = voice;
    utterance.rate = 0.82;
    utterance.onerror = () => setAudioMessage("ไม่สามารถเล่นเสียงได้");
    engine.speak(utterance);
  }

  if (solved) return <motion.div className="game-panel sentence-success" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
    <motion.span className="success-emblem" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}><Check size={35}/></motion.span>
    <p className="eyebrow">เรียงประโยคถูกต้อง</p>
    <h2 className="chinese" lang="zh-Hans" ref={success} tabIndex={-1}>{sentence.zh}</h2>
    <p className="sentence-pinyin">{sentence.pinyin}</p><p>{sentence.th}</p>
    <div className="sentence-actions"><Action className="secondary" onClick={speak}><Volume2 size={17}/>ฟังเสียง</Action>
      <Action className="primary" onClick={confirm}>ให้หมวยสั่งเลย<ArrowRight size={17}/></Action></div>
    <p className="audio-message" role="status">{audioMessage}</p>
  </motion.div>;

  return <motion.div className="game-panel sentence-panel" ref={board} variants={stagger} initial="hidden" animate="visible">
    <motion.div variants={rise}><InteractionTitle kind="มินิเกม 3" title="ช่วยหมวยสั่งเกี๊ยว" description={"“" + sentence.th + "”"}/></motion.div>
    <DndContext id={id} sensors={sensors} collisionDetection={rectIntersection} onDragStart={({ active }) => { setPickup(null); setDragging(String(active.id)); }}
      onDragCancel={() => setDragging(null)} onDragEnd={drop} accessibility={{ screenReaderInstructions: {
        draggable: "กด Space เพื่อหยิบคำ ใช้ปุ่มลูกศรเลือกช่อง แล้วกด Space เพื่อวาง หรือกด Enter เพื่อแตะเลือกคำ",
      } }}>
      <motion.div className="sentence-slots" variants={rise}>{slots.map((word, index) => <Slot key={index} index={index}
        word={word ? wordById[word] : undefined} wrong={errors[index] ? wordById[errors[index]] : undefined}
        correct={!!word && checked[index] === word}
        remove={() => { setReviewedAttempt(attempts); setChecked((last) => last.map((item, i) => i === index ? null : item)); remove(index); }}
        keyboard={keyboard} highlighted={pickup?.index === index}/>)}</motion.div>
      <motion.div className="word-bank" variants={rise}>{words.filter((word) => !slots.includes(word.id))
        .map((word) => <Tile key={word.id} word={word} tap={() => { setPickup(null); place(word.id); }} keyboard={keyboard}/>)}</motion.div>
      <DragOverlay>{dragging && wordById[dragging] ? <span className="word-tile dragging"><WordLabel word={wordById[dragging]}/></span> : null}</DragOverlay>
    </DndContext>
    <motion.div className="game-footer sentence-footer" variants={rise}>
      <p className="sentence-hint" role="status">{pickup ? pickup.index < 0 ? "ใช้ปุ่มลูกศรเพื่อเลือกช่อง" : "ช่อง " + (pickup.index + 1) + " · กด Space เพื่อวางคำ"
        : attempts ? hints[Math.min(attempts - 1, hints.length - 1)] : "ลากหรือแตะคำเพื่อเรียงประโยค"}</p>
      <div className="sentence-actions"><Action className="secondary sentence-clear" onClick={() => {
        setReviewedAttempt(attempts); setChecked([]); setErrors([]); clearWords();
      }}><RotateCcw size={15}/>ล้างคำ</Action>
        {retry ? <Action className="sentence-retry" onClick={() => {
          setReviewedAttempt(attempts);
          setErrors([]);
          requestAnimationFrame(() => board.current?.querySelector<HTMLButtonElement>(".word-bank button")?.focus());
        }}>ลองใหม่อีกครั้ง</Action> : <Action className="primary" disabled={!ready} onClick={verify}>ตรวจคำตอบ</Action>}</div>
    </motion.div>
  </motion.div>;
}
