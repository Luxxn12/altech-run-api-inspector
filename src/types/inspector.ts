import type { ApiLog } from "./apiLog";

export type InspectorMode = "ui" | "console" | "both";
export type ConsoleVerbosity = "compact" | "detailed";

export type ConsoleLoggerOptions = {
  maxBodyLength?: number;
  verbosity?: ConsoleVerbosity;
  showHeaders?: boolean;
  showTimestamp?: boolean;
  onLog?: (log: ApiLog) => void | Promise<void>;
};
