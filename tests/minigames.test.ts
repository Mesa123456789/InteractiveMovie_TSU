import { expect, it } from "vitest";
import { checkSentence, placeWord, revealPrayer, taste } from "@/engine/minigames";
import { prayers } from "@/data/prayers";
import { advance, enter, freshProgress } from "@/engine/narrative-engine";

it("requires one valid breakfast item from every category", () => {
  expect(taste(["youtiao", null, "jianbing"])).toBeNull();
  expect(taste(["youtiao", "jiaoquan", "jianbing"])).toBeNull();
  expect(taste(["youtiao", "tofu", "jianbing"])).toBe("traditional");
  expect(taste(["cucumber", "tofu", "luzhu"])).toBe("alternative");
});

it("resolves exactly one deterministic prayer result and rejects repeated requests", () => {
  expect(revealPrayer(null, null)).toBeNull();
  expect(revealPrayer(9, null)).toBeNull();
  expect(revealPrayer(0, null)).toBe(0);
  expect(revealPrayer(1, 0)).toBeNull();
  expect(prayers[0].text).toBe("学业有成");
  const game = enter(freshProgress(), "g2");
  expect(advance(game, { type: "accept-prayer" })).toBe(game);
  expect(advance({ ...game, blessing: 0 }, { type: "accept-prayer" }).node).toBe("s4");
});

it("requires four distinct words, preserves correct positions, and supports swapping", () => {
  expect(checkSentence(["i", null, "portion", "noodles"])).toBeNull();
  expect(checkSentence(["i", "i", "portion", "dumplings"])).toBeNull();
  expect(checkSentence(["i", "no", "portion", "noodles"])).toEqual({ slots: ["i", null, "portion", null], correct: false });
  expect(placeWord(["want", "i", null, null], "want", 1)).toEqual(["i", "want", null, null]);
  expect(checkSentence(["i", "want", "portion", "dumplings"])?.correct).toBe(true);
});
