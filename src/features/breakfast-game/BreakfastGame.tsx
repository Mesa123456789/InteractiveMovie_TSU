"use client";

import { useLayoutEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Utensils } from "lucide-react";
import { foodById, foodCategories } from "@/data/foods";
import { asset, foodArtwork } from "@/data/asset-mapping";
import { taste } from "@/engine/minigames";
import { InteractionTitle } from "@/components/interaction/Interaction";
import { Action } from "@/components/ui/Action";
import { selectProgress, useMovieStore } from "@/stores/useMovieStore";
import { spring } from "@/lib/motion";

type Dish = (typeof foodById)[string];
const menu = [2, 0, 1].map((index) => ({ ...foodCategories[index], index }));

function DishPhoto({ dish }: { dish: Dish }) {
  const image = asset(foodArtwork[dish.id], "image");
  return image ? <span className="dish-photo" aria-hidden="true" style={{ backgroundImage: "url(" + image.src + ")" }}/>
    : <span className="dish-photo dish-photo-empty" aria-hidden="true"><Utensils size={19}/></span>;
}

function DishLabel({ dish, expanded = false }: { dish: Dish; expanded?: boolean }) {
  return <span className="dish-label">
    <strong className="chinese" lang="zh-Hans">{dish.zh}</strong>
    <span className="dish-pinyin">{dish.pin}</span>
    {expanded && <span className="dish-thai">{dish.th}</span>}
  </span>;
}

export function BreakfastGame({ confirm }: { confirm: () => void }) {
  const { food, breakfastReview } = useMovieStore(selectProgress);
  const selectFood = useMovieStore((state) => state.selectFood);
  const review = useMovieStore((state) => state.reviewBreakfast);
  const stage = useRef<HTMLDivElement>(null);
  const count = food.filter(Boolean).length;
  const valid = !!taste(food);
  const reviewing = breakfastReview && valid;

  useLayoutEffect(() => {
    stage.current?.querySelector<HTMLElement>(reviewing ? ".breakfast-result h2" : ".breakfast-select h2")?.focus({ preventScroll: true });
  }, [reviewing]);

  return <div className="game-panel breakfast-panel" ref={stage}>
    <AnimatePresence initial={false} onExitComplete={() => {
      stage.current?.querySelector<HTMLElement>(reviewing ? ".breakfast-result h2" : ".breakfast-select h2")?.focus({ preventScroll: true });
    }}>
      {reviewing ? <motion.section key="result" className="breakfast-view breakfast-result"
        initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }} transition={{ duration: 0.24 }}>
        <InteractionTitle kind="มินิเกม 1" title="ผลลัพธ์การจับคู่"/>
        <div className="food-grid">
          {menu.map(({ index, title }) => {
            const choice = food[index];
            const dish = choice ? foodById[choice] : undefined;
            if (!dish) return null;
            return <div key={title} className="food-result-group">
              <h3>{title}</h3>
              <article className="dish-result"><DishPhoto dish={dish}/><DishLabel dish={dish} expanded/></article>
            </div>;
          })}
        </div>
        <div className="game-footer breakfast-footer">
          <Action className="secondary" onClick={() => review(false)}>ลองจับคู่เมนูอื่นๆ</Action>
          <Action className="primary" onClick={() => {
            if (selectProgress(useMovieStore.getState()).breakfastReview) confirm();
          }}>บันทึกเมนูและเดินทางต่อ<ArrowRight size={16}/></Action>
        </div>
      </motion.section> : <motion.section key="selection" className="breakfast-view breakfast-select"
        initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }} transition={{ duration: 0.24 }}>
        <InteractionTitle kind="มินิเกม 1" title="จับคู่อาหารมื้อนี้ให้หมวย" description="ช่วยตัดสินใจเลือกเมนูอย่างละหนึ่งจากทั้ง 3 หมวด"/>
        <div className="food-grid">
          {menu.map(({ title, foods, index }) => <fieldset key={title}>
            <legend>{title}</legend>
            <div className="food-options">
              {foods.map((dish) => {
                const selected = dish.id === food[index];
                return <motion.button key={dish.id} className="food-option" type="button"
                  aria-label={dish.th + " " + dish.zh} aria-pressed={selected} onClick={() => selectFood(index, dish.id)}
                  whileTap={{ scale: 0.98 }} transition={spring}>
                  <DishPhoto dish={dish}/><DishLabel dish={dish}/>
                  {selected && <span className="selection-check" aria-hidden="true"><Check size={13}/></span>}
                </motion.button>;
              })}
            </div>
          </fieldset>)}
        </div>
        <div className="game-footer breakfast-footer">
          <span className="food-count" role="status">เมนูในถาด {count}/3</span>
          <Action className="primary" disabled={!valid} onClick={() => review(true)}>ลองชิมเลย!</Action>
        </div>
      </motion.section>}
    </AnimatePresence>
  </div>;
}
