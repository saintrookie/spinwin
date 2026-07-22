"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";
import { ROLL_POOL_SIZE } from "@/lib/constants";
import { selectCurrentPrize } from "@/lib/select-current-prize";
import type {
  DrawSettings,
  DrawStats,
  Prize,
  RollCandidate,
  SpinResult,
  Winner,
} from "@/types/domain";

export type DrawStatus = "idle" | "rolling" | "revealing" | "celebrating";

type DrawState = {
  status: DrawStatus;
  isStopping: boolean;
  prizes: Prize[];
  stats: DrawStats | null;
  settings: DrawSettings | null;
  history: Winner[];
  rollPool: RollCandidate[];
  lastWinner: SpinResult | null;
  lastWinnerPrizeName: string | null;
  loading: boolean;
};

type Action =
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_STATUS"; status: DrawStatus }
  | { type: "SET_STOPPING"; isStopping: boolean }
  | { type: "SET_PRIZES"; prizes: Prize[] }
  | { type: "SET_STATS"; stats: DrawStats }
  | { type: "SET_SETTINGS"; settings: DrawSettings }
  | { type: "SET_HISTORY"; history: Winner[] }
  | { type: "SET_ROLL_POOL"; rollPool: RollCandidate[] }
  | { type: "SET_WINNER"; winner: SpinResult | null; prizeName?: string | null };

const initialState: DrawState = {
  status: "idle",
  isStopping: false,
  prizes: [],
  stats: null,
  settings: null,
  history: [],
  rollPool: [],
  lastWinner: null,
  lastWinnerPrizeName: null,
  loading: true,
};

function reducer(state: DrawState, action: Action): DrawState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.loading };
    case "SET_STATUS":
      return { ...state, status: action.status };
    case "SET_STOPPING":
      return { ...state, isStopping: action.isStopping };
    case "SET_PRIZES":
      return { ...state, prizes: action.prizes };
    case "SET_STATS":
      return { ...state, stats: action.stats };
    case "SET_SETTINGS":
      return { ...state, settings: action.settings };
    case "SET_HISTORY":
      return { ...state, history: action.history };
    case "SET_ROLL_POOL":
      return { ...state, rollPool: action.rollPool };
    case "SET_WINNER":
      return {
        ...state,
        lastWinner: action.winner,
        lastWinnerPrizeName: action.winner ? action.prizeName ?? null : null,
      };
    default:
      return state;
  }
}

type DrawContextValue = {
  state: DrawState;
  currentPrize: Prize | null;
  startDraw: () => void;
  stopDraw: () => Promise<void>;
  resetDraw: () => Promise<void>;
  refreshAll: () => Promise<void>;
  updateSettings: (patch: Partial<DrawSettings>) => Promise<void>;
  returnToIdle: () => void;
};

const DrawContext = createContext<DrawContextValue | null>(null);

export function DrawProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const currentPrize = useMemo(() => selectCurrentPrize(state.prizes), [state.prizes]);

  const refreshStats = useCallback(async () => {
    const stats = await api.getStats();
    dispatch({ type: "SET_STATS", stats });
  }, []);

  const refreshHistory = useCallback(async () => {
    const history = await api.getHistory();
    dispatch({ type: "SET_HISTORY", history });
  }, []);

  const refreshRollPool = useCallback(async () => {
    try {
      const rollPool = await api.getRollPool(ROLL_POOL_SIZE);
      dispatch({ type: "SET_ROLL_POOL", rollPool });
    } catch {
      // roll pool is cosmetic only; a transient failure shouldn't block the UI
    }
  }, []);

  const refreshPrizes = useCallback(async () => {
    const prizes = await api.listPrizes();
    dispatch({ type: "SET_PRIZES", prizes });
  }, []);

  const refreshAll = useCallback(async () => {
    const [prizes, stats, settings, history] = await Promise.all([
      api.listPrizes(),
      api.getStats(),
      api.getSettings(),
      api.getHistory(),
    ]);
    dispatch({ type: "SET_PRIZES", prizes });
    dispatch({ type: "SET_STATS", stats });
    dispatch({ type: "SET_SETTINGS", settings });
    dispatch({ type: "SET_HISTORY", history });
    await refreshRollPool();
  }, [refreshRollPool]);

  useEffect(() => {
    dispatch({ type: "SET_LOADING", loading: true });
    refreshAll()
      .catch((err) => {
        toast.error(err instanceof Error ? err.message : "Failed to load draw data");
      })
      .finally(() => dispatch({ type: "SET_LOADING", loading: false }));
  }, [refreshAll]);

  const startDraw = useCallback(() => {
    if (!currentPrize) {
      toast.error("No prize available to draw");
      return;
    }
    if (state.stats && state.stats.remaining <= 0) {
      toast.error("No eligible participants remain");
      return;
    }
    dispatch({ type: "SET_WINNER", winner: null });
    dispatch({ type: "SET_STOPPING", isStopping: false });
    dispatch({ type: "SET_STATUS", status: "rolling" });
  }, [currentPrize, state.stats]);

  const stopDraw = useCallback(async () => {
    if (state.status !== "rolling" || state.isStopping || !currentPrize) return;
    dispatch({ type: "SET_STOPPING", isStopping: true });
    const rollDurationMs = state.settings?.rollDurationMs ?? 4000;
    const wonPrizeName = currentPrize.name;
    try {
      const [results] = await Promise.all([
        api.spin(currentPrize.id, 1),
        new Promise((resolve) => setTimeout(resolve, rollDurationMs)),
      ]);
      if (results.length === 0) {
        toast.error("No eligible participants remain for this prize");
        dispatch({ type: "SET_STATUS", status: "idle" });
        dispatch({ type: "SET_STOPPING", isStopping: false });
        return;
      }
      dispatch({ type: "SET_WINNER", winner: results[0], prizeName: wonPrizeName });
      dispatch({ type: "SET_STATUS", status: "revealing" });
      await Promise.all([refreshStats(), refreshHistory(), refreshRollPool(), refreshPrizes()]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Draw failed");
      dispatch({ type: "SET_STATUS", status: "idle" });
    } finally {
      dispatch({ type: "SET_STOPPING", isStopping: false });
    }
  }, [state.status, state.isStopping, state.settings, currentPrize, refreshStats, refreshHistory, refreshRollPool, refreshPrizes]);

  const returnToIdle = useCallback(() => {
    dispatch({ type: "SET_STATUS", status: "idle" });
  }, []);

  const resetDraw = useCallback(async () => {
    try {
      await api.resetDraw();
      dispatch({ type: "SET_STATUS", status: "idle" });
      dispatch({ type: "SET_WINNER", winner: null });
      await refreshAll();
      toast.success("Draw has been reset");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Reset failed");
    }
  }, [refreshAll]);

  const updateSettings = useCallback(async (patch: Partial<DrawSettings>) => {
    try {
      const settings = await api.updateSettings(patch);
      dispatch({ type: "SET_SETTINGS", settings });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not update settings");
    }
  }, []);

  return (
    <DrawContext.Provider
      value={{ state, currentPrize, startDraw, stopDraw, resetDraw, refreshAll, updateSettings, returnToIdle }}
    >
      {children}
    </DrawContext.Provider>
  );
}

export function useDraw() {
  const ctx = useContext(DrawContext);
  if (!ctx) throw new Error("useDraw must be used within a DrawProvider");
  return ctx;
}
