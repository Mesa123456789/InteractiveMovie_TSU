"use client";

import { useEffectEvent, useLayoutEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";

export function useEpisodeReveal(viewport: RefObject<HTMLElement | null>) {
  const timeline = useRef<gsap.core.Timeline | null>(null);
  const opening = useRef(false);
  const [expanded, setExpanded] = useState(false);
  const [interactive, setInteractive] = useState(false);

  function reveal(next: boolean) {
    const animation = timeline.current;
    const frame = viewport.current;
    if (!animation || !frame || opening.current === next || frame.querySelector("dialog[open]")) return;
    opening.current = next;
    setExpanded(next);
    if (next) {
      animation.play();
      return;
    }
    if (frame.querySelector(".episode-section")?.contains(document.activeElement)) {
      frame.querySelector<HTMLButtonElement>(".episode-reveal-toggle")?.focus({ preventScroll: true });
    }
    setInteractive(false);
    animation.reverse();
  }

  const revealFromInput = useEffectEvent(reveal);

  useLayoutEffect(() => {
    const frame = viewport.current;
    const copy = frame?.querySelector(".hero-content");
    const shade = frame?.querySelector(".episode-gradient");
    const rail = frame?.querySelector(".episode-section");
    if (!frame || !copy || !shade || !rail) return;
    const cards = rail.querySelectorAll(".episode-card-reveal");
    const readShift = () => Number.parseFloat(getComputedStyle(frame).getPropertyValue("--hero-reveal-shift"));
    let shift = readShift();
    const context = gsap.context(() => {
      gsap.set(rail, { yPercent: 110, opacity: 0 });
      gsap.set(cards, { y: 16, opacity: 0 });
      timeline.current = gsap.timeline({
        paused: true,
        defaults: { ease: "power3.inOut" },
        onComplete: () => setInteractive(true),
      })
        .fromTo(shade, { opacity: 0 }, { opacity: 1, duration: 0.82 }, 0)
        .fromTo(copy, { y: 0 }, { y: () => shift, duration: 0.82 }, 0)
        .fromTo(rail, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8 }, 0.1)
        .fromTo(cards, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.3, stagger: 0.06, ease: "power3.out" }, 0.3);
    }, frame);

    function resize() {
      const next = readShift();
      const animation = timeline.current;
      if (next === shift || !animation) return;
      shift = next;
      const progress = animation.progress();
      animation.invalidate().progress(progress, true);
    }

    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaY) <= Math.max(2, Math.abs(event.deltaX))) return;
      if (frame.querySelector("dialog[open]")) return;
      event.preventDefault();
      revealFromInput(event.deltaY > 0);
    };

    let touch: { x: number; y: number } | null = null;
    function touchStart(event: TouchEvent) {
      const point = event.touches[0];
      touch = event.touches.length === 1 && point ? { x: point.clientX, y: point.clientY } : null;
    }
    function touchEnd(event: TouchEvent) {
      const start = touch;
      touch = null;
      const point = event.changedTouches[0];
      if (!start || !point) return;
      const x = point.clientX - start.x;
      const y = point.clientY - start.y;
      if (Math.hypot(x, y) < 10 && event.target instanceof Element && event.target.closest(".episode-reveal-toggle")) {
        event.preventDefault();
        revealFromInput(!opening.current);
        return;
      }
      if (Math.abs(y) >= 40 && Math.abs(y) > Math.abs(x) * 1.25) revealFromInput(y < 0);
    }
    function touchCancel() {
      touch = null;
    }

    function keydown(event: KeyboardEvent) {
      if (event.key === "Escape" && !event.defaultPrevented) revealFromInput(false);
    }

    frame.addEventListener("wheel", wheel, { passive: false });
    frame.addEventListener("touchstart", touchStart, { passive: true });
    frame.addEventListener("touchend", touchEnd, { passive: false });
    frame.addEventListener("touchcancel", touchCancel);
    window.addEventListener("keydown", keydown);
    window.addEventListener("resize", resize);
    return () => {
      frame.removeEventListener("wheel", wheel);
      frame.removeEventListener("touchstart", touchStart);
      frame.removeEventListener("touchend", touchEnd);
      frame.removeEventListener("touchcancel", touchCancel);
      window.removeEventListener("keydown", keydown);
      window.removeEventListener("resize", resize);
      context.revert();
      timeline.current = null;
    };
  }, [viewport]);

  return { expanded, interactive, reveal };
}
