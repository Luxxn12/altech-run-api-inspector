import { create } from "zustand";
import type { ApiLog } from "../types/apiLog";

type ApiLogsState = {
  logs: ApiLog[];
  maxLogs: number;
  addLog: (log: ApiLog) => void;
  clearLogs: () => void;
  setMaxLogs: (maxLogs: number) => void;
  updateLog: (id: string, patch: Partial<ApiLog>) => void;
};

const DEFAULT_MAX_LOGS = 100;

export const useApiLogsStore = create<ApiLogsState>((set) => ({
  logs: [],
  maxLogs: DEFAULT_MAX_LOGS,
  addLog: (log) =>
    set((state) => {
      const next = [log, ...state.logs];
      if (next.length <= state.maxLogs) {
        return { logs: next };
      }
      return { logs: next.slice(0, state.maxLogs) };
    }),
  clearLogs: () => set({ logs: [] }),
  setMaxLogs: (maxLogs) =>
    set((state) => {
      const safeMaxLogs = Math.max(1, Math.floor(maxLogs));
      return {
        maxLogs: safeMaxLogs,
        logs: state.logs.slice(0, safeMaxLogs),
      };
    }),
  updateLog: (id, patch) =>
    set((state) => ({
      logs: state.logs.map((log) => (log.id === id ? { ...log, ...patch } : log)),
    })),
}));
