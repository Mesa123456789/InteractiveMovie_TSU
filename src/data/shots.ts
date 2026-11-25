import { shotMedia, stills, type Still } from "./asset-mapping";
import type { SequenceId, Shot } from "@/types/movie";

type Group = { scene: string; cuts: string[]; still: Still; description: string };
const range = (start: number, end: number, suffix = "A") =>
  Array.from({ length: end - start + 1 }, (_, index) => (start + index) + suffix);
const group = (scene: string, cuts: string[], still: Still, description: string): Group => ({ scene, cuts, still, description });

const edit: Record<SequenceId, Group[]> = {
  s1: [
    group("SC01", range(1, 9), stills.cafeteria, "หมวยกำคูปองอาหารหน้าโรงอาหารชิงหัว"),
    group("SC01", range(1, 6, "B"), stills.home, "หมวยนึกถึงวันที่ทะเลาะกับพ่อ ก่อนเห็นเพื่อนส่งรูปเที่ยวยุโรป"),
    group("SC01", range(1, 3, "C"), stills.dorm, "หมวยกลับห้องพัก"),
    group("SC01", range(4, 6, "C"), stills.sink, "บะหมี่ต้มยำหกลงซิงค์"),
    group("SC02", range(1, 3), stills.street, "หมวยออกเดินบนถนนปักกิ่ง"),
    group("SC02", ["4A"], stills.hero, "หมวยหยุดหน้าร้านเกี๊ยว"),
  ],
  s1b: [
    group("SC02.2", ["1"], stills.street, "หมวยเดินผ่านร้าน"),
    group("SC02.2", ["2", "3"], stills.dorm, "หมวยกินบะหมี่คนเดียว ก่อนตัดสินใจออกอีกครั้ง"),
  ],
  s2: [
    group("SC02", range(5, 6), stills.dumplings, "เจ้าของร้านห่อเกี๊ยวสด"),
    group("SC02", range(1, 2, "C"), stills.home, "หมวยนึกถึงตอนช่วยแม่จีบขนมจีบ"),
    group("SC02", ["3C"], stills.order, "เกี๊ยวคำแรกทำให้หมวยนึกถึงบ้าน"),
    group("SC03", range(1, 2), stills.street, "เช้าวันถัดมาที่ปักกิ่ง"),
    group("SC03", range(3, 6), stills.breakfast, "หมวยดูเมนูอาหารเช้า"),
  ],
  s3a: [group("SC03", range(6, 7), stills.breakfastReaction, "หมวยลองกินตามคนท้องถิ่นและยกนิ้วโป้ง")],
  s3b: [group("SC03.2", range(1, 3), stills.breakfastReaction, "หมวยหัวเราะกับรสชาติที่ไม่คุ้น")],
  temple: [
    group("SC04", range(1, 4), stills.temple, "หมวยมาถึงวัดลามะ มองผู้คนไหว้ธูป"),
    group("SC04", ["5A"], stills.prayerWheel, "มือหมวยแตะกงล้อมนต์"),
  ],
  s4: [
    group("SC04", ["6A"], stills.temple, "หมวยหลับตาขอพรและถ่ายรูปวัด"),
    group("SC04", ["7A"], stills.templeExit, "หมวยเดินออกจากวัด"),
  ],
  s5a: [group("SC04", range(1, 3, "B"), stills.wangfujing, "หมวยเดินชิมอาหารที่หวังฝูจิ่ง")],
  s5b: [group("SC04", range(4, 5, "B"), stills.palace, "หมวยชมวิวทะเลสาบที่ Summer Palace")],
  s6a: [group("SC04", range(6, 7, "B"), stills.hutong, "หมวยสำรวจตรอกเก่า ลองอาหารและถ่ายภาพ")],
  s6b: [group("SC04", [...range(1, 3, "C"), ...range(1, 3, "D")], stills.tsinghua, "หมวยเล่นหิมะกับเพื่อนที่มหาวิทยาลัยชิงหัว")],
  shared: [
    group("SC05", range(1, 6), stills.shichahai, "แม่โทรหาหมวยระหว่างเดินริมสือช่าไห่"),
    group("SC06", ["1A"], stills.hero, "หมวยกลับมาที่ร้านเกี๊ยวเดิม"),
    group("SC06", ["2A", "3A"], stills.order, "หมวยเงยหน้าขึ้นมองคนขายเพื่อสั่งอาหาร"),
  ],
  s7: [
    group("SC06", ["4A"], stills.order, "หมวยสั่งเกี๊ยวเป็นภาษาจีน"),
    group("SC06", ["5A"], stills.dumplings, "หมวยกินเกี๊ยวและคุยกับแม่"),
    group("SC06", ["6A"], stills.ending, "หมวยโบกมือลาและเดินออกจากร้าน"),
  ],
};

export const sequenceMedia: Partial<Record<SequenceId, readonly Shot[]>> = {};

export function shotsFor(id: SequenceId): readonly Shot[] {
  return sequenceMedia[id] ?? edit[id].flatMap(({ scene, cuts, still, description }, index) =>
    cuts.map((cut, cutIndex): Shot => {
      const key = scene + "/" + cut;
      const shotId = id + "/" + key;
      return {
        id: shotId, webSceneId: id, screenplayScene: scene, cut, description,
        assetId: null, fallbackId: still, mediaType: "image", durationMs: 4000,
        cameraMotion: cutIndex === 0 && (id === "s5b" || id === "temple") ? "pan-right" :
          cutIndex === 0 && (id === "shared" || id === "s7") ? "zoom-in" : "static",
        transition: cutIndex ? "cut" : index % 2 ? "fade" : "dissolve",
        ...shotMedia[shotId] ?? shotMedia[key],
      };
    }));
}
