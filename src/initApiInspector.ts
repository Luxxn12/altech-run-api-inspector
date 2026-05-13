import { attachFetchInspector, restoreFetchInspector } from "./interceptors/fetchInterceptor";
import { useApiLogsStore } from "./store/apiLogsStore";
import type { ConsoleLoggerOptions, InspectorMode } from "./types/inspector";

export type InitApiInspectorOptions = {
  enabled?: boolean;
  maxLogs?: number;
  mode?: InspectorMode;
  interceptFetch?: boolean;
  console?: ConsoleLoggerOptions;
};

export function initApiInspector(options: InitApiInspectorOptions = {}): () => void {
  const enabled = options.enabled ?? __DEV__;
  if (!enabled || !__DEV__) {
    return () => undefined;
  }

  if (typeof options.maxLogs === "number") {
    useApiLogsStore.getState().setMaxLogs(options.maxLogs);
  }

  const mode = options.mode ?? "console";
  const interceptFetch = options.interceptFetch ?? true;

  if (interceptFetch) {
    attachFetchInspector({ enabled, mode, console: options.console });
    return () => {
      restoreFetchInspector();
    };
  }

  return () => undefined;
}
