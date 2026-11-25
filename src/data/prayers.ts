import { BookOpen, BriefcaseBusiness, Coins, Heart, House, HeartPulse, Compass, Sprout, Moon } from "lucide-react";

export const prayers = [
  { category: "การเรียน", text: "学业有成", pinyin: "Xué yè yǒu chéng", translation: "ขอให้การเรียนประสบความสำเร็จ", Icon: BookOpen },
  { category: "การงาน", text: "事业顺利", pinyin: "Shì yè shùn lì", translation: "ขอให้การงานราบรื่น", Icon: BriefcaseBusiness },
  { category: "การเงิน", text: "财源广进", pinyin: "Cái yuán guǎng jìn", translation: "ขอให้การเงินรุ่งเรือง", Icon: Coins },
  { category: "ความรัก", text: "幸福美满", pinyin: "Xìng fú měi mǎn", translation: "ขอให้ความรักมีความสุข", Icon: Heart },
  { category: "ครอบครัว", text: "阖家幸福", pinyin: "Hé jiā xìng fú", translation: "ขอให้ครอบครัวมีความสุข", Icon: House },
  { category: "สุขภาพ", text: "身体健康", pinyin: "Shēn tǐ jiàn kāng", translation: "ขอให้สุขภาพแข็งแรง", Icon: HeartPulse },
  { category: "การเดินทาง", text: "一路平安", pinyin: "Yí lù píng ān", translation: "ขอให้เดินทางปลอดภัย", Icon: Compass },
  { category: "การเติบโตของตัวเอง", text: "心想事成", pinyin: "Xīn xiǎng shì chéng", translation: "ขอให้สมหวัง", Icon: Sprout },
  { category: "ความสงบใจ", text: "平安喜乐", pinyin: "Píng ān xǐ lè", translation: "ขอให้ใจสงบและมีความสุข", Icon: Moon },
] as const;
