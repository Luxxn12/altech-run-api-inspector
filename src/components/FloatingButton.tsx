import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Position = "bottom-right" | "bottom-left" | "top-right" | "top-left";

type FloatingButtonProps = {
  count: number;
  position: Position;
  onPress: () => void;
};

function getPositionStyle(position: Position) {
  switch (position) {
    case "bottom-left":
      return { bottom: 20, left: 16 };
    case "top-right":
      return { top: 60, right: 16 };
    case "top-left":
      return { top: 60, left: 16 };
    case "bottom-right":
    default:
      return { bottom: 20, right: 16 };
  }
}

export function FloatingButton({ count, position, onPress }: FloatingButtonProps) {
  return (
    <View pointerEvents="box-none" style={[styles.container, getPositionStyle(position)]}>
      <Pressable onPress={onPress} style={styles.button}>
        <Text style={styles.buttonText}>API</Text>
        {count > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{count > 99 ? "99+" : count}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 9999,
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#111827",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
});
