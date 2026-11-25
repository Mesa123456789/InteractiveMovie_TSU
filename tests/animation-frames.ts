import type { Page } from "@playwright/test";

export async function captureAnimation(page: Page, trigger: string, targets: string[], duration: number) {
  const result = await page.evaluate(({ trigger, targets, duration }) => {
    const button = document.querySelector<HTMLElement>(trigger)!;
    const original = new Map<string, Element>();

    function readTargets() {
      return Object.fromEntries(targets.map((selector) => {
        const element = document.querySelector(selector);
        if (!element) return [selector, null];
        if (!original.has(selector)) original.set(selector, element);
        const { transform, transitionDuration, opacity, filter } = getComputedStyle(element);
        const matrix = transform === "none" ? new DOMMatrixReadOnly() : new DOMMatrixReadOnly(transform);
        const { left, top, width, height } = element.getBoundingClientRect();
        return [selector, { x: matrix.m41, y: matrix.m42, scale: matrix.a, opacity: Number(opacity),
          left, top, width, height, transform, transitionDuration, filter, same: original.get(selector) === element && element.isConnected }] as const;
      }));
    }

    const before = readTargets();
    const frames: { ms: number; nodes: ReturnType<typeof readTargets> }[] = [];
    const start = performance.now();
    button.click();
    return new Promise<{ before: typeof before; frames: typeof frames }>((resolve) => {
      function measure(now: number) {
        const ms = now - start;
        frames.push({ ms, nodes: readTargets() });
        if (ms < duration) requestAnimationFrame(measure);
        else resolve({ before, frames });
      }
      requestAnimationFrame(measure);
    });
  }, { trigger, targets, duration });

  return {
    ...result,
    series(selector: string) {
      return result.frames.flatMap(({ nodes }) => nodes[selector] ? [nodes[selector]] : []);
    },
  };
}
