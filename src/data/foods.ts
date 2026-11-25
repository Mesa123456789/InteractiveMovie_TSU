export const foodCategories = [
  { title: "เครื่องเคียง", foods: [
    { id: "youtiao", th: "โหยวเถียว", zh: "油条", pin: "yóutiáo" },
    { id: "jiaoquan", th: "เจียวเฉวียน", zh: "焦圈", pin: "jiāoquān" },
    { id: "cucumber", th: "ไผหวงกวา", zh: "拍黄瓜", pin: "pāi huángguā" },
  ] },
  { title: "ซุป / เครื่องดื่ม", foods: [
    { id: "tofu", th: "เต้าหู้เค็ม", zh: "咸豆腐脑", pin: "xián dòufunǎo" },
    { id: "soy", th: "โต้วเจียง", zh: "豆浆", pin: "dòujiāng" },
    { id: "chaogan", th: "เฉากาน", zh: "炒肝", pin: "chǎogān" },
  ] },
  { title: "อาหารหลัก", foods: [
    { id: "jianbing", th: "เจียนปิ่งกั่วจื่อ", zh: "煎饼果子", pin: "jiānbing guǒzi" },
    { id: "noodles", th: "จาเจี้ยงเมี่ยน", zh: "炸酱面", pin: "zhájiàngmiàn" },
    { id: "luzhu", th: "หลูจู่หั่วเซา", zh: "卤煮火烧", pin: "lǔzhǔ huǒshāo" },
  ] },
] as const;

export const traditionalCombinations: readonly (readonly string[])[] = [["youtiao", "tofu", "jianbing"]];
export const foodById = Object.fromEntries(foodCategories.flatMap(({ foods }) => [...foods]).map((food) => [food.id, food]));
