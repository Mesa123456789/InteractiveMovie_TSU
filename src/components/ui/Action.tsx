"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { timing } from "@/lib/motion";

export function Action({ className = "", ...props }: HTMLMotionProps<"button">) {
  return <motion.button type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
    transition={{ duration: timing.feedback }} className={"action " + className} {...props} />;
}
