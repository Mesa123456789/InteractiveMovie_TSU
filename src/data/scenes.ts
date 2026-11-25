import type { EpisodeId, NarrativeNode, NodeId, SequenceId } from "@/types/movie";
import { shotsFor } from "./shots";

const sequence = (id: SequenceId, title: string, episodeId: EpisodeId, nextNodeId: NodeId): NarrativeNode =>
  ({ type: "sequence", id, title, episodeId, nextNodeId, shots: shotsFor(id) });

export const nodes: Record<NodeId, NarrativeNode> = {
  s1: sequence("s1", "คิดถึงบ้าน", 1, "c1"),
  c1: { type: "choice", id: "c1", episodeId: 1 },
  s1b: sequence("s1b", "คืนแรกที่หอพัก", 2, "s2"),
  s2: sequence("s2", "คำแรกที่เปิดใจ", 2, "g1"),
  g1: { type: "minigame", id: "g1", episodeId: 2 },
  s3a: sequence("s3a", "มื้อเช้าแบบท้องถิ่น", 3, "temple"),
  s3b: sequence("s3b", "รสชาติที่ไม่คุ้น", 3, "temple"),
  temple: sequence("temple", "วัดลามะ", 3, "g2"),
  g2: { type: "minigame", id: "g2", episodeId: 3 },
  s4: sequence("s4", "เปิดรับสิ่งใหม่", 4, "c2"),
  c2: { type: "choice", id: "c2", episodeId: 4 },
  s5a: sequence("s5a", "หวังฝูจิ่ง", 5, "c3"),
  s5b: sequence("s5b", "Summer Palace", 5, "c3"),
  c3: { type: "choice", id: "c3", episodeId: 5 },
  s6a: sequence("s6a", "หนานหลัวกู่เซี่ยง", 6, "shared"),
  s6b: sequence("s6b", "มหาวิทยาลัยชิงหัว", 6, "shared"),
  shared: sequence("shared", "สายจากแม่", 6, "g3"),
  g3: { type: "minigame", id: "g3", episodeId: 6 },
  s7: sequence("s7", "ร้านเดิม ความรู้สึกใหม่", 6, "ending"),
  ending: { type: "ending", id: "ending", episodeId: 6 },
};
