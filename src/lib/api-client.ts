import type {
  DrawSettings,
  DrawStats,
  Prize,
  RollCandidate,
  SpinResult,
  Winner,
} from "@/types/domain";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(body?.error ?? `Request to ${url} failed (${res.status})`);
  }
  return body as T;
}

export const api = {
  getStats: () => request<DrawStats>("/api/stats"),
  getSettings: () => request<DrawSettings>("/api/settings"),
  updateSettings: (patch: Partial<DrawSettings>) =>
    request<DrawSettings>("/api/settings", { method: "PATCH", body: JSON.stringify(patch) }),
  listPrizes: () => request<Prize[]>("/api/prizes"),
  createPrize: (input: {
    name: string;
    description?: string;
    quantity: number;
    displayOrder: number;
  }) => request<Prize>("/api/prizes", { method: "POST", body: JSON.stringify(input) }),
  updatePrize: (id: string, patch: Partial<Prize>) =>
    request<Prize>(`/api/prizes/${id}`, { method: "PATCH", body: JSON.stringify(patch) }),
  deletePrize: (id: string) => request<{ ok: true }>(`/api/prizes/${id}`, { method: "DELETE" }),
  getRollPool: (size = 300) => request<RollCandidate[]>(`/api/participants/roll-pool?size=${size}`),
  wipeParticipants: () => request<{ ok: true }>("/api/participants", { method: "DELETE" }),
  importChunk: (rows: unknown[], batchId: string) =>
    request<{ inserted: number }>("/api/participants/import", {
      method: "POST",
      body: JSON.stringify({ rows, batchId }),
    }),
  spin: (prizeId: string, count = 1) =>
    request<SpinResult[]>("/api/draw/spin", {
      method: "POST",
      body: JSON.stringify({ prizeId, count }),
    }),
  resetDraw: () => request<{ ok: true }>("/api/draw/reset", { method: "POST" }),
  getHistory: (limit = 20) => request<Winner[]>(`/api/draw/history?limit=${limit}`),
};
