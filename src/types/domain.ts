export type Participant = {
  id: string;
  participantNo: string;
  fullName: string;
  plateNumber: string | null;
  hasWon: boolean;
  importBatchId: string | null;
  importedAt: string;
  createdAt: string;
};

export type Prize = {
  id: string;
  name: string;
  description: string | null;
  quantity: number;
  awardedCount: number;
  displayOrder: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
};

export type Winner = {
  id: string;
  participantId: string;
  prizeId: string;
  wonAt: string;
  participant: Pick<Participant, "participantNo" | "fullName" | "plateNumber">;
  prize: Pick<Prize, "name">;
};

export type DrawSettings = {
  currentPrizeId: string | null;
  rollDurationMs: number;
  rollSpeedMs: number;
  soundEnabled: boolean;
  confettiEnabled: boolean;
  theme: "light" | "dark";
};

export type DrawStats = {
  total: number;
  remaining: number;
  winners: number;
  currentPrize: Prize | null;
};

export type RollCandidate = Pick<Participant, "id" | "fullName" | "plateNumber">;

export type SpinResult = {
  winnerId: string;
  participantId: string;
  participantNo: string;
  fullName: string;
  plateNumber: string | null;
  prizeId: string;
  wonAt: string;
};

export type ImportRowError = {
  row: number;
  field?: string;
  message: string;
};

export type ImportSummary = {
  inserted: number;
  updated: number;
  failedChunks: number;
};
