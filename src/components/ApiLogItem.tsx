import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ApiLog } from "../types/apiLog";
import { StatusBadge } from "./StatusBadge";

type ApiLogItemProps = {
  log: ApiLog;
  onPress: (log: ApiLog) => void;
};

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString();
}

export function ApiLogItem({ log, onPress }: ApiLogItemProps) {
  return (
    <Pressable style={styles.container} onPress={() => onPress(log)}>
      <View style={styles.leftBlock}>
        <Text style={styles.method}>{log.method}</Text>
        <Text numberOfLines={1} style={styles.url}>
          {log.url}
        </Text>
        <Text style={styles.meta}>
          {log.duration} ms • {formatTime(log.timestamp)}
        </Text>
      </View>
      <StatusBadge status={log.status} error={log.error} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  leftBlock: {
    flex: 1,
  },
  method: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  url: {
    fontSize: 13,
    color: "#1F2937",
    marginBottom: 4,
  },
  meta: {
    fontSize: 11,
    color: "#6B7280",
  },
});
