import type { CheckpointId, EpisodeId, NodeId, SequenceId } from "@/types/movie";

type Checkpoint = {
  title: string; episode: EpisodeId; type: "choice" | "game";
  from: SequenceId; replayUntil: readonly NodeId[];
};

export const checkpoints: Record<CheckpointId, Checkpoint> = {
  c1: { title: "หน้าร้านเกี๊ยว", episode: 1, type: "choice", from: "s1", replayUntil: ["g1"] },
  g1: { title: "จับคู่มื้อเช้า", episode: 2, type: "game", from: "s2", replayUntil: ["temple"] },
  g2: { title: "ขอพรที่วัด", episode: 3, type: "game", from: "temple", replayUntil: ["c2"] },
  c2: { title: "ออกจากวัดลามะ", episode: 4, type: "choice", from: "s4", replayUntil: ["c3"] },
  c3: { title: "เส้นทางเที่ยวปักกิ่ง", episode: 5, type: "choice", from: "s5a", replayUntil: ["shared"] },
  g3: { title: "เรียงประโยคภาษาจีน", episode: 6, type: "game", from: "shared", replayUntil: ["ending"] },
};

export const checkpointIds = Object.keys(checkpoints) as CheckpointId[];
