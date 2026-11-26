import { figmaStill, stills } from "./asset-mapping";
import type { ChoiceId, SequenceId } from "@/types/movie";

type Option = { title: string; detail?: string; image: string; next: SequenceId };
export const choices: Record<ChoiceId, { title: string; options: readonly [Option, Option] }> = {
  c1: { title: "หมวยจะทำยังไงดี?", options: [
    { title: "เข้าร้านเกี๊ยว", image: figmaStill("enter-dumpling-shop"), next: "s2" },
    { title: "กลับหอ", image: stills.dorm, next: "s1b" },
  ] },
  c2: { title: "หลังออกจากวัดลามะ หมวยจะไปไหนต่อ?", options: [
    { title: "หวังฝูจิ่ง", image: figmaStill("wangfujing"), next: "s5a" },
    { title: "Summer Palace", image: figmaStill("summer-palace"), next: "s5b" },
  ] },
  c3: { title: "หมวยจะไปสัมผัสจีนในมุมไหนต่อ?", options: [
    { title: "หนานหลัวกู่เซี่ยง", detail: "ชมสถาปัตยกรรมและลองอาหาร", image: figmaStill("hutong-arrival"), next: "s6a" },
    { title: "มหาวิทยาลัยชิงหัว", detail: "พบเพื่อนนักศึกษาและเล่นปาหิมะ", image: figmaStill("tsinghua-arrival"), next: "s6b" },
  ] },
};
