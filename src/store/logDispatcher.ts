import type { ApiLog } from "../types/apiLog";
import type { ConsoleLoggerOptions, InspectorMode } from "../types/inspector";
import { logApiToConsole } from "../utils/logToConsole";
import { useApiLogsStore } from "./apiLogsStore";

type DispatchApiLogOptions = {
  mode: InspectorMode;
  console: ConsoleLoggerOptions;
};

export function dispatchApiLog(log: ApiLog, options: DispatchApiLogOptions): void {
  if (options.mode === "ui" || options.mode === "both") {
    useApiLogsStore.getState().addLog(log);
  }

  if (options.mode === "console" || options.mode === "both") {
    logApiToConsole(log, options.console);
  }

  if (options.console.onLog) {
    Promise.resolve(options.console.onLog(log)).catch(() => undefined);
  }
}
