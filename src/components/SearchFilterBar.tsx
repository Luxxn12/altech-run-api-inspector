import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { StatusFilter } from "../types/apiLog";
import { getStatusColor } from "../utils/getStatusColor";

type SearchFilterBarProps = {
  search: string;
  onChangeSearch: (value: string) => void;
  filter: StatusFilter;
  onChangeFilter: (value: StatusFilter) => void;
};

const FILTERS: StatusFilter[] = ["ALL", "2xx", "3xx", "4xx", "5xx", "ERROR"];

export function SearchFilterBar({
  search,
  onChangeSearch,
  filter,
  onChangeFilter,
}: SearchFilterBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        value={search}
        onChangeText={onChangeSearch}
        placeholder="Search URL..."
        placeholderTextColor="#9CA3AF"
        style={styles.input}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((item) => {
          const isActive = item === filter;
          const color = getStatusColor(item === "ALL" ? undefined : Number(item[0]) * 100, item === "ERROR");

          return (
            <Pressable
              key={item}
              style={[
                styles.filterButton,
                isActive && { backgroundColor: color.background, borderColor: color.text },
              ]}
              onPress={() => onChangeFilter(item)}
            >
              <Text style={[styles.filterText, isActive && { color: color.text }]}>{item}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
    backgroundColor: "#FFFFFF",
  },
  filterRow: {
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
  },
  filterText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },
});
