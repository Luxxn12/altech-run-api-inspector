import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { getStatusColor } from "../utils/getStatusColor";

type StatusBadgeProps = {
  status?: number;
  error?: string;
};

export function StatusBadge({ status, error }: StatusBadgeProps) {
  const { background, text } = getStatusColor(status, Boolean(error));
  const label = error ? "ERR" : status ? String(status) : "N/A";

  return (
    <View style={[styles.badge, { backgroundColor: background }]}> 
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minWidth: 48,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
