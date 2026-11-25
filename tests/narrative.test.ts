import { describe, expect, it } from "vitest";
import { advance, enter, freshProgress, type StoryEvent } from "@/engine/narrative-engine";
import { checkpointFrame, lastShot } from "@/engine/scene-resolver";
import { clampSeek, createTimeline, position } from "@/engine/playback-controller";
import { nodes } from "@/data/scenes";
import { shotAsset } from "@/data/asset-mapping";
import type { NodeId } from "@/types/movie";

const options = [0, 1] as const;
const combinations = options.flatMap((c1) =>
  [false, true].flatMap((traditional) =>
    options.flatMap((c2) => options.map((c3) => ({ c1, traditional, c2, c3 })))),
);

describe("narrative", () => {
  it.each(combinations)("reaches the ending with $c1 / $traditional / $c2 / $c3", ({ c1, traditional, c2, c3 }) => {
    let state = enter(freshProgress(), "s1");
    const apply = (event: StoryEvent, expected: NodeId) => {
      state = advance(state, event);
      expect(state.node).toBe(expected);
    };
    const finish = (expected: NodeId) => apply({ type: "finish" }, expected);
    finish("c1");
    apply({ type: "choose", id: "c1", option: c1 }, c1 === 0 ? "s2" : "s1b");
    if (c1 === 1) finish("s2");
    finish("g1");
    const food = [traditional ? "youtiao" : "jiaoquan", "tofu", "jianbing"];
    state = { ...state, food };
    apply({ type: "taste" }, traditional ? "s3a" : "s3b");
    finish("temple");
    finish("g2");
    state = { ...state, prayer: 2, blessing: 2 };
    apply({ type: "accept-prayer" }, "s4");
    finish("c2");
    apply({ type: "choose", id: "c2", option: c2 }, c2 === 0 ? "s5a" : "s5b");
    finish("c3");
    expect(state.from).toBe(c2 === 0 ? "s5a" : "s5b");
    expect(lastShot(state.from).cut).toBe(c2 === 0 ? "3B" : "5B");
    apply({ type: "choose", id: "c3", option: c3 }, c3 === 0 ? "s6a" : "s6b");
    finish("shared");
    finish("g3");
    state = { ...state, words: ["i", "want", "portion", "dumplings"], solved: true };
    apply({ type: "order" }, "s7");
    finish("ending");
    expect(state).toMatchObject({ done: true, completed: [1, 2, 3, 4, 5, 6], choices: { c1, c2, c3 }, food, blessing: 2, solved: true });
  });

  it("retains distinct final frames for the two location branches", () => {
    expect(checkpointFrame("c3", "s5a")?.id).toBeDefined();
    expect(checkpointFrame("c3", "s5a")?.id).not.toBe(checkpointFrame("c3", "s5b")?.id);
  });

  it("maps every configured shot and stops unresolved interaction boundaries", () => {
    for (const node of Object.values(nodes)) {
      if (node.type === "sequence") expect(node.shots.every((shot) => !!shotAsset(shot))).toBe(true);
    }
    for (const id of ["c1", "c2", "c3", "g1", "g2", "g3"] as const) {
      const state = enter(freshProgress(), id);
      expect(advance(state, { type: "finish" })).toBe(state);
    }
  });

  it("uses video duration and timecodes and clamps seeks before the interaction", () => {
    const last = lastShot("s1");
    const clip = { ...last, id: "clip", mediaType: "video" as const, startTime: 2, interactionTime: 21 };
    const timeline = createTimeline([last, clip], { clip: 31 });
    expect(timeline.total).toBe(23);
    expect(position(timeline.entries, 5)?.shot.id).toBe("clip");
    expect(clampSeek(999, timeline.total)).toBeCloseTo(22.99);
    expect(clampSeek(-10, timeline.total)).toBe(0);
    expect(createTimeline([{ ...clip, interactionTime: undefined }], { clip: 14 }).total).toBe(12);
  });
});
