export type PlayerStatus = "waiting" | "racing" | "eliminated" | "finished";

export interface Player {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  mistakes: number;
  typedLength: number;
  correctLength: number;
  progress: number;
  status: PlayerStatus;
  finishTime: number | null;
  combo: number;
}

export interface Thresholds {
  minWpm: number;
  minAccuracy: number;
  maxMistakes: number;
}

export interface Quote {
  text: string;
  author: string;
}

export type RoomStatus = "waiting" | "countdown" | "active" | "finished";

export interface RoomUpdatePayload {
  code: string;
  hostId: string | null;
  status: RoomStatus;
  tier: string;
  players: Player[];
}

export interface MatchStartedPayload {
  quote: Quote;
  startTime: number;
  thresholds: Thresholds;
  timeoutMs: number;
}

export interface EliminationPayload {
  id: string;
  name: string;
  wpm: number;
  accuracy: number;
  reason: string;
}

export interface MatchEndedPayload {
  reason: "finished" | "timeout" | "all_eliminated";
  winner: Player | null;
  results: Player[];
}
