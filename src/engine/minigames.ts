import { foodCategories, traditionalCombinations } from "@/data/foods";
import { answer, wordById } from "@/data/sentences";
import { prayers } from "@/data/prayers";
import type { BreakfastResult } from "@/types/movie";

export function taste(food: (string | null)[]): BreakfastResult | null {
  if (food.length !== foodCategories.length || !foodCategories.every(({ foods }, i) => foods.some(({ id }) => id === food[i]))) return null;
  return traditionalCombinations.some((combo) => combo.every((id, i) => food[i] === id)) ? "traditional" : "alternative";
}

export function revealPrayer(category: number | null, previous: number | null) {
  return previous === null && category !== null && Number.isInteger(category) && prayers[category] ? category : null;
}

export function checkSentence(slots: (string | null)[]) {
  if (slots.length !== answer.length || !slots.every((id) => id && Object.hasOwn(wordById, id)) || new Set(slots).size !== answer.length) return null;
  const kept = slots.map((id, index) => id === answer[index] ? id : null);
  return { slots: kept, correct: kept.every(Boolean) };
}

export function placeWord(slots: (string | null)[], word: string, target?: number) {
  if (!Object.hasOwn(wordById, word)) return slots;
  const source = slots.indexOf(word);
  const index = target ?? slots.indexOf(null);
  if (!Number.isInteger(index) || index < 0 || index >= slots.length || index === source || (target === undefined && source >= 0)) return slots;
  const next = [...slots];
  if (source >= 0) next[source] = next[index];
  next[index] = word;
  return next;
}
