import { expect, test } from "@playwright/test";
import { cdptouchSwipe, seed, snapshot } from "./fixtures";

test("portrait homepage and coverflow support touch swipes without overflow", async ({ page }, info) => {
  await page.goto("/");
  await expect(page.getByRole("button", { name: "เริ่มการเดินทาง" })).toBeEnabled();
  await expect(page.locator(".nav-location")).toBeHidden();
  const cardsOnHome = page.locator(".episode-card");
  const reveal = page.locator(".episode-reveal-toggle");
  await expect(reveal).toHaveAttribute("aria-expanded", "false");
  await expect(cardsOnHome.first()).not.toBeInViewport();
  expect(await page.evaluate(() => document.documentElement.scrollHeight === window.innerHeight)).toBe(true);
  await page.screenshot({ path: info.outputPath("home-mobile.png"), animations: "disabled", scale: "css" });
  await cdptouchSwipe(page, 240, 680, 0, -135);
  await expect(reveal).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("#episodes")).not.toHaveAttribute("inert", "");
  const tops = await cardsOnHome.evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().top));
  expect(new Set(tops).size).toBe(1);
  await cdptouchSwipe(page, 240, 420, 0, 115);
  await expect(reveal).toHaveAttribute("aria-expanded", "false");
  await expect(page.locator(".episode-gradient")).toHaveCSS("opacity", "0");
  await reveal.tap();
  await expect(page.locator("#episodes")).not.toHaveAttribute("inert", "");
  await cardsOnHome.last().scrollIntoViewIfNeeded();
  await expect(cardsOnHome.last()).toBeInViewport({ ratio: 1 });
  await cardsOnHome.last().tap();
  const detail = page.getByRole("dialog");
  await expect(detail).toHaveAccessibleName("ร้านเดิม ความรู้สึกใหม่");
  await detail.getByRole("button", { name: "ปิดรายละเอียด" }).tap();
  await expect(detail).toHaveCount(0);
  await page.getByRole("link", { name: "การเดินทาง", exact: true }).click();
  await expect(page.getByRole("heading", { name: "หน้าร้านเกี๊ยว" })).toBeVisible();
  const active = (await page.getByTestId("coverflow").locator('.cover-card[data-center="true"]').boundingBox())!;
  await cdptouchSwipe(page, active.x + active.width / 2, active.y + active.height / 2, -110);
  await expect(page.getByRole("heading", { name: "ออกจากวัดลามะ" })).toBeVisible();
  await page.getByRole("tab", { name: "มินิเกม" }).tap();
  await expect(page.getByRole("heading", { name: "จับคู่มื้อเช้า" })).toBeVisible();
  const cards = page.locator('.coverflow[data-tab="game"]');
  await expect(cards).toHaveCSS("opacity", "1");
  await expect(cards.locator('.cover-card[data-offset="1"]')).toHaveCSS("opacity", "0.7");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: info.outputPath("journey-mobile.png"), animations: "disabled", scale: "css" });
});

test("rotation preserves choices, sentence tiles and landscape fit", async ({ page }, info) => {
  await seed(page, "g3");
  await page.goto("/watch");
  await expect(page.getByRole("heading", { name: /หมุนจอเป็นแนวนอน/ })).toBeVisible();
  await page.screenshot({ path: info.outputPath("orientation.png"), animations: "disabled", scale: "css" });
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByRole("heading", { name: "ช่วยหมวยสั่งเกี๊ยว" })).toBeVisible();
  await page.locator(".word-bank").getByRole("button", { name: /我/ }).tap();
  const progress = (await snapshot(page)).main;
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("heading", { name: /หมุนจอเป็นแนวนอน/ })).toBeVisible();
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator(".sentence-slot").first()).toContainText("我");
  expect((await snapshot(page)).main).toEqual(progress);
  expect(await page.locator(".interaction-scroll").evaluate((el) => el.scrollHeight <= el.clientHeight)).toBe(true);
  await page.screenshot({ path: info.outputPath("sentence-mobile-landscape.png"), animations: "disabled", scale: "css" });
});

test("breakfast and the full prayer reveal fit the landscape screen", async ({ page }, info) => {
  const hydrationErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && /hydrat/i.test(message.text())) hydrationErrors.push(message.text());
  });
  await page.setViewportSize({ width: 844, height: 390 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seed(page, "g2");
  await page.goto("/watch");
  await expect(page.getByRole("heading", { name: "ขอพรที่วัด" })).toBeVisible();
  const interaction = page.locator(".interaction-scroll");
  expect(await interaction.evaluate((el) => el.scrollHeight <= el.clientHeight)).toBe(true);
  await page.screenshot({ path: info.outputPath("prayer-landscape.png"), animations: "disabled", scale: "css" });
  await page.getByRole("button", { name: "การเรียน", exact: true }).tap();
  await page.getByRole("button", { name: "ขอพร", exact: true }).tap();
  await expect(page.locator(".prayer-flash")).toHaveAttribute("data-active", "true");
  await expect(page.locator(".prayer-flash")).toHaveAttribute("data-active", "false");
  await expect(page.getByRole("heading", { name: "学业有成" })).toBeVisible();
  expect(await interaction.evaluate((el) => el.scrollHeight <= el.clientHeight)).toBe(true);
  await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("muay-film-v2")!);
    saved.state.main.node = "g1";
    saved.state.main.from = "s2";
    localStorage.setItem("muay-film-v2", JSON.stringify(saved));
  });
  await page.reload();
  await expect(page.getByRole("heading", { name: "จับคู่อาหารมื้อนี้ให้หมวย" })).toBeVisible();
  for (const name of ["โหยวเถียว", "เต้าหู้เค็ม", "เจียนปิ่งกั่วจื่อ"]) {
    await page.getByRole("button", { name: new RegExp(name) }).tap();
  }
  expect(await interaction.evaluate((el) => el.scrollHeight <= el.clientHeight)).toBe(true);
  await page.screenshot({ path: info.outputPath("breakfast-landscape.png"), animations: "disabled", scale: "css" });
  await page.getByRole("button", { name: "ลองชิมเลย!" }).tap();
  await expect(page.locator(".dish-result")).toHaveCount(3);
  await expect.poll(() => interaction.evaluate((el) => el.scrollHeight <= el.clientHeight)).toBe(true);
  await page.screenshot({ path: info.outputPath("breakfast-result-landscape.png"), animations: "disabled", scale: "css" });
  expect(hydrationErrors).toEqual([]);
});
