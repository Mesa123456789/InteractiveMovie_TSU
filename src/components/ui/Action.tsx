"use client";

import { motion, type HTMLMotionProps } from "motion/react";
import { timing } from "@/lib/motion";

type ActionProps = HTMLMotionProps<"button"> & {
  variant: "primary" | "secondary" | "choice" | "text";
};

export function Action({ variant, className = "", ...props }: ActionProps) {
  return <motion.button type="button" whileHover={variant === "choice" ? undefined : { y: -2 }}
    whileTap={variant === "choice" ? undefined : { scale: 0.97 }}
    transition={{ duration: timing.feedback }} className={`action ${variant} ${className}`.trim()} {...props} />;
}
