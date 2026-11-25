"use client";

import { useEffect, useId, useImperativeHandle, useRef, type Ref } from "react";
import type { Container, ISourceOptions } from "@tsparticles/engine";

export type ParticlePlayback = { play: () => void; pause: () => void };

const options: ISourceOptions = {
  autoPlay: false,
  fullScreen: { enable: false },
  fpsLimit: 45,
  detectRetina: true,
  particles: {
    number: { value: 38 },
    color: { value: ["#dfab5d", "#f8d98b", "#fff0b8"] },
    shape: { type: "circle" },
    size: { value: { min: 0.8, max: 2.5 } },
    opacity: { value: { min: 0.18, max: 0.86 } },
    move: { enable: true, direction: "top", speed: { min: 0.7, max: 2.8 }, outModes: { default: "out" } },
  },
};

let loaded: Promise<typeof import("@tsparticles/engine").tsParticles> | undefined;

function particleEngine() {
  loaded ??= Promise.all([import("@tsparticles/engine"), import("@tsparticles/basic")])
    .then(async ([{ tsParticles }, { loadBasic }]) => {
      await loadBasic(tsParticles);
      return tsParticles;
    })
    .catch((error: unknown) => { loaded = undefined; throw error; });
  return loaded;
}

export function BlessingParticles({ ref }: { ref: Ref<ParticlePlayback> }) {
  const host = useRef<HTMLDivElement>(null);
  const container = useRef<Container>(null);
  const playing = useRef(false);
  const id = "blessing-" + useId();

  useImperativeHandle(ref, () => ({
    play() { playing.current = true; container.current?.play(); },
    pause() { playing.current = false; container.current?.pause(); },
  }), []);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    void particleEngine().then(async (engine) => {
      if (disposed) return;
      const effect = await engine.load({ id, element, options });
      if (disposed) { effect?.destroy(); return; }
      if (!effect) return;
      container.current = effect;
      element.dataset.particlesReady = "true";
      element.dataset.particleCount = String(effect.particles.count);
      if (playing.current) effect.play();
      else effect.pause();
    }).catch((error: unknown) => {
      if (!disposed) console.error("Unable to initialize blessing particles", error);
    });
    return () => { disposed = true; container.current?.destroy(); container.current = null; };
  }, [id]);

  return <div ref={host} className="prayer-particles" aria-hidden="true"/>;
}
