import React, { useEffect, useState } from "react";
import { FloatingButton } from "./components/FloatingButton";
import { InspectorModal } from "./components/InspectorModal";
import { attachFetchInspector, restoreFetchInspector } from "./interceptors/fetchInterceptor";
import { useApiLogsStore } from "./store/apiLogsStore";
import type { ConsoleLoggerOptions, InspectorMode } from "./types/inspector";

export type AltechApiInspectorProps = {
  enabled?: boolean;
  maxLogs?: number;
  position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
  defaultOpen?: boolean;
  allowOpenInBrowser?: boolean;
  allowCopy?: boolean;
  mode?: InspectorMode;
  showFloatingButton?: boolean;
  console?: ConsoleLoggerOptions;
};

export function AltechApiInspector({
  enabled = __DEV__,
  maxLogs = 100,
  position = "bottom-right",
  defaultOpen = false,
  allowOpenInBrowser = true,
  allowCopy = true,
  mode = "ui",
  showFloatingButton = true,
  console,
}: AltechApiInspectorProps) {
  const logs = useApiLogsStore((state) => state.logs);
  const clearLogs = useApiLogsStore((state) => state.clearLogs);
  const setMaxLogs = useApiLogsStore((state) => state.setMaxLogs);
  const [visible, setVisible] = useState(defaultOpen);

  useEffect(() => {
    if (!enabled || !__DEV__) {
      return;
    }

    setMaxLogs(maxLogs);
    attachFetchInspector({ enabled, mode, console });

    return () => {
      restoreFetchInspector();
    };
  }, [console, enabled, maxLogs, mode, setMaxLogs]);

  if (!enabled || !__DEV__) {
    return null;
  }

  const shouldRenderUi = mode === "ui" || mode === "both";
  if (!shouldRenderUi) {
    return null;
  }

  return (
    <>
      {showFloatingButton ? (
        <FloatingButton count={logs.length} position={position} onPress={() => setVisible(true)} />
      ) : null}
      <InspectorModal
        visible={visible}
        logs={logs}
        allowCopy={allowCopy}
        allowOpenInBrowser={allowOpenInBrowser}
        onClose={() => setVisible(false)}
        onClearLogs={clearLogs}
      />
    </>
  );
}
