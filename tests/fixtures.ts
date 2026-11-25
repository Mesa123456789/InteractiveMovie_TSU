import { expect, type Page } from "@playwright/test";
import { enter, freshProgress } from "@/engine/narrative-engine";
import type { MainProgress, NodeId } from "@/types/movie";

const key = "muay-film-v2";

export async function seed(page: Page, node: NodeId, extra: Partial<MainProgress> = {}, unlocked = {}) {
  await page.addInitScript(({ key, main, unlocked }) => {
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({ version: 2, state: { main, unlocked } }));
  }, { key, main: { ...enter(freshProgress(), node), ...extra }, unlocked });
}

export function snapshot(page: Page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "{}").state, key);
}

export async function finishSequence(page: Page) {
  await expect(page.locator(".loading-overlay")).toHaveCount(0);
  const slider = page.getByRole("slider", { name: "ตำแหน่งรับชม" });
  await page.mouse.move(112, 110);
  await expect(slider).toBeVisible();
  await slider.fill(await slider.getAttribute("max") ?? "4");
}

export async function cdptouchSwipe(page: Page, x: number, y: number, dx: number, dy = 0) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let step = 1; step <= 10; step++) {
    await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x + dx * step / 10, y: y + dy * step / 10 }] });
  }
  await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await cdp.detach();
}
