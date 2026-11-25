import { stills } from "./asset-mapping";
import type { EpisodeId, NodeId, SequenceId } from "@/types/movie";

export const episodes = [
  { id: 1, title: "คิดถึงบ้าน", start: "s1", boundary: "c1", image: stills.cafeteria },
  { id: 2, title: "คำแรกที่เปิดใจ", start: "s2", boundary: "g1", image: stills.dumplings },
  { id: 3, title: "ลองแบบที่นี่", start: "s3a", boundary: "g2", image: stills.breakfast },
  { id: 4, title: "เปิดรับสิ่งใหม่", start: "s4", boundary: "c2", image: stills.temple },
  { id: 5, title: "เริ่มอยากอยู่ต่อ", start: "s5a", boundary: "c3", image: stills.palace },
  { id: 6, title: "ร้านเดิม ความรู้สึกใหม่", start: "shared", boundary: "ending", image: stills.shichahai },
] as const satisfies readonly { id: EpisodeId; title: string; start: SequenceId; boundary: NodeId; image: string }[];
