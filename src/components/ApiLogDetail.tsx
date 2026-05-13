import React, { useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import type { ApiLog } from "../types/apiLog";
import { copyToClipboard } from "../utils/copyToClipboard";
import { formatJson } from "../utils/formatJson";
import { openInBrowser } from "../utils/openInBrowser";
import { StatusBadge } from "./StatusBadge";

type DetailTab = "Overview" | "Request" | "Response" | "Headers";

type ApiLogDetailProps = {
  log: ApiLog;
  allowCopy: boolean;
  allowOpenInBrowser: boolean;
  onBack: () => void;
  onClear: () => void;
};

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || "-"}</Text>
    </View>
  );
}

function Section({ title, value }: { title: string; value: unknown }) {
  return (
    <View style={styles.sectionBlock}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <ScrollView horizontal>
        <Text style={styles.jsonText}>{formatJson(value)}</Text>
      </ScrollView>
    </View>
  );
}

export function ApiLogDetail({
  log,
  allowCopy,
  allowOpenInBrowser,
  onBack,
  onClear,
}: ApiLogDetailProps) {
  const [activeTab, setActiveTab] = useState<DetailTab>("Overview");
  const [warning, setWarning] = useState<string | null>(null);

  const tabs: DetailTab[] = ["Overview", "Request", "Response", "Headers"];

  const overviewBody = useMemo(
    () => (
      <View style={styles.stackGap}>
        <View style={styles.statusRow}>
          <StatusBadge status={log.status} error={log.error} />
          <Text style={styles.statusText}>{log.statusText || (log.error ? "Request Failed" : "Unknown")}</Text>
        </View>
        <InfoRow label="Method" value={log.method} />
        <InfoRow label="URL" value={log.url} />
        <InfoRow label="Duration" value={`${log.duration} ms`} />
        <InfoRow label="Error" value={log.error} />
      </View>
    ),
    [log],
  );

  const requestBody = (
    <View style={styles.stackGap}>
      <Section title="Request Body" value={log.requestBody ?? null} />
    </View>
  );

  const responseBody = (
    <View style={styles.stackGap}>
      <Section title="Response Body" value={log.responseBody ?? null} />
    </View>
  );

  const headersBody = (
    <View style={styles.stackGap}>
      <Section title="Request Headers" value={log.requestHeaders ?? {}} />
      <Section title="Response Headers" value={log.responseHeaders ?? {}} />
    </View>
  );

  const onCopy = (value: unknown, label: string) => {
    if (!allowCopy) {
      return;
    }
    copyToClipboard(formatJson(value));
    Alert.alert("Copied", `${label} copied to clipboard`);
  };

  const onOpenBrowser = async () => {
    if (!allowOpenInBrowser) {
      return;
    }

    try {
      const result = await openInBrowser(log.url);
      if (!result.opened) {
        setWarning(result.reason ?? "URL tidak bisa dibuka.");
      } else {
        setWarning(null);
      }
    } catch (error) {
      setWarning(error instanceof Error ? error.message : "Gagal membuka browser.");
    }
  };

  const onRetry = async () => {
    if (!log.retry) {
      setWarning("Retry request tidak tersedia untuk log ini.");
      return;
    }

    setWarning(null);
    try {
      await log.retry();
    } catch (error) {
      setWarning(error instanceof Error ? error.message : "Retry request gagal.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
        <Text numberOfLines={1} style={styles.title}>
          API Detail
        </Text>
      </View>

      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const active = tab === activeTab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, active && styles.tabButtonActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        {activeTab === "Overview" && overviewBody}
        {activeTab === "Request" && requestBody}
        {activeTab === "Response" && responseBody}
        {activeTab === "Headers" && headersBody}
      </ScrollView>

      {warning ? <Text style={styles.warningText}>{warning}</Text> : null}

      <View style={styles.actionRow}>
        <Pressable style={styles.actionButton} onPress={() => onCopy(log.url, "URL")}>
          <Text style={styles.actionText}>Copy URL</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={() => onCopy(log.responseBody, "Response")}> 
          <Text style={styles.actionText}>Copy Response</Text>
        </Pressable>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.actionButton} onPress={onOpenBrowser}>
          <Text style={styles.actionText}>Open in Browser</Text>
        </Pressable>
        <Pressable style={styles.actionButton} onPress={onRetry}>
          <Text style={styles.actionText}>Retry</Text>
        </Pressable>
        <Pressable style={[styles.actionButton, styles.clearButton]} onPress={onClear}>
          <Text style={[styles.actionText, styles.clearButtonText]}>Clear</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  backButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  backText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 12,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    marginBottom: 10,
    flexWrap: "wrap",
  },
  tabButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF",
  },
  tabButtonActive: {
    borderColor: "#111827",
    backgroundColor: "#111827",
  },
  tabText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  body: {
    paddingBottom: 10,
  },
  stackGap: {
    gap: 10,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusText: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "600",
  },
  infoRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
  },
  infoLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 13,
    color: "#111827",
  },
  sectionBlock: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  jsonText: {
    fontSize: 12,
    color: "#1F2937",
    fontFamily: "Courier",
  },
  warningText: {
    marginTop: 8,
    marginBottom: 4,
    color: "#B45309",
    fontSize: 12,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap",
  },
  actionButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937",
  },
  clearButton: {
    borderColor: "#DC2626",
  },
  clearButtonText: {
    color: "#B91C1C",
  },
});
