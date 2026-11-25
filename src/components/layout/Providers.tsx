"use client";

import { MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { useMovieStore } from "@/stores/useMovieStore";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    void Promise.resolve(useMovieStore.persist.rehydrate()).finally(() => useMovieStore.setState({ hydrated: true }));
  }, []);
  return <MotionConfig reducedMotion="never">{children}</MotionConfig>;
}
