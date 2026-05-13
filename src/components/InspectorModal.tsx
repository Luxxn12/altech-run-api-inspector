import React, { useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ApiLog, StatusFilter } from "../types/apiLog";
import { getStatusGroup } from "../utils/getStatusColor";
import { ApiLogDetail } from "./ApiLogDetail";
import { ApiLogItem } from "./ApiLogItem";
import { SearchFilterBar } from "./SearchFilterBar";

type InspectorModalProps = {
  visible: boolean;
  logs: ApiLog[];
  allowCopy: boolean;
  allowOpenInBrowser: boolean;
  onClose: () => void;
  onClearLogs: () => void;
};

export function InspectorModal({
  visible,
  logs,
  allowCopy,
  allowOpenInBrowser,
  onClose,
  onClearLogs,
}: InspectorModalProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [selectedLog, setSelectedLog] = useState<ApiLog | null>(null);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const urlMatch = log.url.toLowerCase().includes(search.trim().toLowerCase());
      if (!urlMatch) {
        return false;
      }

      if (filter === "ALL") {
        return true;
      }

      const group = getStatusGroup(log.status, Boolean(log.error));
      return group === filter;
    });
  }, [logs, search, filter]);

  const onClearAll = () => {
    onClearLogs();
    setSelectedLog(null);
  };

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.sheet}>
          {selectedLog ? (
            <ApiLogDetail
              log={selectedLog}
              allowCopy={allowCopy}
              allowOpenInBrowser={allowOpenInBrowser}
              onBack={() => setSelectedLog(null)}
              onClear={onClearAll}
            />
          ) : (
            <View style={styles.container}>
              <View style={styles.header}>
                <View>
                  <Text style={styles.title}>API Inspector</Text>
                  <Text style={styles.subtitle}>{logs.length} request captured</Text>
                </View>
                <View style={styles.headerActions}>
                  <Pressable style={styles.clearBtn} onPress={onClearAll}>
                    <Text style={styles.clearText}>Clear Logs</Text>
                  </Pressable>
                  <Pressable style={styles.closeBtn} onPress={onClose}>
                    <Text style={styles.closeText}>Close</Text>
                  </Pressable>
                </View>
              </View>

              <SearchFilterBar
                search={search}
                onChangeSearch={setSearch}
                filter={filter}
                onChangeFilter={setFilter}
              />

              <FlatList
                data={filteredLogs}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({ item }) => <ApiLogItem log={item} onPress={setSelectedLog} />}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={<Text style={styles.emptyText}>No request logs found.</Text>}
              />
            </View>
          )}
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: "#F3F4F6",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden",
  },
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14,
  },
  header: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    marginTop: 2,
    color: "#6B7280",
    fontSize: 12,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: "#DC2626",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },
  clearText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "600",
  },
  closeBtn: {
    borderWidth: 1,
    borderColor: "#9CA3AF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },
  closeText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600",
  },
  listContainer: {
    paddingBottom: 16,
  },
  emptyText: {
    marginTop: 28,
    textAlign: "center",
    color: "#6B7280",
  },
});
