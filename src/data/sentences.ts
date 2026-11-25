export const words = [
  { id: "dumplings", zh: "饺子", pin: "jiǎozi" },
  { id: "i", zh: "我", pin: "wǒ" },
  { id: "portion", zh: "一份", pin: "yí fèn" },
  { id: "want", zh: "想要", pin: "xiǎng yào" },
  { id: "noodles", zh: "面条", pin: "miàntiáo" },
  { id: "no", zh: "不", pin: "bù" },
] as const;

export const wordById = Object.fromEntries(words.map((word) => [word.id, word]));
export const answer = ["i", "want", "portion", "dumplings"] as const;
export const sentence = {
  zh: "我想要一份饺子。",
  pinyin: "Wǒ xiǎng yào yí fèn jiǎozi.",
  th: "ฉันอยากได้เกี๊ยวหนึ่งที่",
};
export const hints = [
  "ลองเริ่มจากคำที่หมายถึง «ฉัน»",
  "วางคำ «อยากได้» หลังประธาน แล้วตามด้วยจำนวน",
  "เรียงตามความหมาย ฉัน → อยากได้ → หนึ่งที่ → เกี๊ยว",
];
