import { stills } from "./asset-mapping";
import type { ChoiceId, SequenceId } from "@/types/movie";

type Option = { title: string; detail?: string; image: string; next: SequenceId };
export const choices: Record<ChoiceId, { title: string; options: readonly [Option, Option] }> = {
  c1: { title: "หมวยจะทำยังไงดี?", options: [
    { title: "เข้าร้านเกี๊ยว", image: stills.dumplings, next: "s2" },
    { title: "กลับหอ", image: stills.dorm, next: "s1b" },
  ] },
  c2: { title: "หลังออกจากวัดลามะ หมวยจะไปไหนต่อ?", options: [
    { title: "หวังฝูจิ่ง", image: stills.wangfujing, next: "s5a" },
    { title: "Summer Palace", image: stills.palace, next: "s5b" },
  ] },
  c3: { title: "หมวยจะไปสัมผัสจีนในมุมไหนต่อ?", options: [
    { title: "หนานหลัวกู่เซี่ยง", detail: "ชมสถาปัตยกรรมและลองอาหาร", image: stills.hutong, next: "s6a" },
    { title: "มหาวิทยาลัยชิงหัว", detail: "พบเพื่อนนักศึกษาและเล่นปาหิมะ", image: stills.tsinghua, next: "s6b" },
  ] },
};
