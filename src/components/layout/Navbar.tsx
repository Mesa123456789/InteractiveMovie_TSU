"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Aperture } from "lucide-react";
import { useEffect } from "react";
import { useMovieStore } from "@/stores/useMovieStore";

export function Navbar() {
  const path = usePathname();
  useEffect(() => {
    if (useMovieStore.getState().replay) useMovieStore.getState().clearReplay();
  }, []);
  const items = [{ href: "/", text: "หน้าหลัก" }, { href: "/journey", text: "การเดินทาง" }];
  return (
    <header className="site-header">
      <Link href="/" className="brand" aria-label="ร่วมค้นพบไปกับหมวย หน้าหลัก">
        <span className="brand-seal"><Aperture size={21} strokeWidth={1.4} /></span>
        <span>ร่วมค้นพบ<span className="brand-accent">ไปกับหมวย</span></span>
      </Link>
      <nav aria-label="เมนูหลัก" className="main-nav">
        {items.map(({ href, text }) => (
          <Link key={href} href={href} aria-current={href === path ? "page" : undefined}>
            {text}{href === path && <motion.span className="nav-line" layoutId="nav-line" />}
          </Link>
        ))}
      </nav>
    </header>
  );
}
