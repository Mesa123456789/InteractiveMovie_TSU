import type { Metadata, Viewport } from "next";
import "@fontsource-variable/noto-sans-thai";
import "@fontsource/noto-sans-sc/400.css";
import "@fontsource/noto-sans-sc/500.css";
import "@fontsource/noto-sans-sc/600.css";
import "@fontsource/noto-sans-sc/700.css";
import { Providers } from "@/components/layout/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "ร่วมค้นพบไปกับหมวย",
  description: "จากรสชาติที่คิดถึงบ้าน สู่การเปิดใจให้โลกใหม่",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#080B0A" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th" data-scroll-behavior="smooth"><body><Providers>{children}</Providers></body></html>;
}
