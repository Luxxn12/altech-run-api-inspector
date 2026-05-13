// src/AltechApiInspector.tsx
import { useEffect, useState as useState3 } from "react";

// src/components/FloatingButton.tsx
import { Pressable, StyleSheet, Text, View } from "react-native";
import { jsx, jsxs } from "react/jsx-runtime";
function getPositionStyle(position) {
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
function FloatingButton({ count, position, onPress }) {
  return /* @__PURE__ */ jsx(View, { pointerEvents: "box-none", style: [styles.container, getPositionStyle(position)], children: /* @__PURE__ */ jsxs(Pressable, { onPress, style: styles.button, children: [
    /* @__PURE__ */ jsx(Text, { style: styles.buttonText, children: "API" }),
    count > 0 ? /* @__PURE__ */ jsx(View, { style: styles.badge, children: /* @__PURE__ */ jsx(Text, { style: styles.badgeText, children: count > 99 ? "99+" : count }) }) : null
  ] }) });
}
var styles = StyleSheet.create({
  container: {
    position: "absolute",
    zIndex: 9999
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
    elevation: 6
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 13
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
    borderColor: "#FFFFFF"
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700"
  }
});

// src/components/InspectorModal.tsx
import { useMemo as useMemo2, useState as useState2 } from "react";
import {
  FlatList,
  Modal,
  Pressable as Pressable5,
  SafeAreaView,
  StyleSheet as StyleSheet6,
  Text as Text6,
  View as View6
} from "react-native";

// src/utils/getStatusColor.ts
var COLORS = {
  ALL: { background: "#E5E7EB", text: "#111827" },
  "2xx": { background: "#DCFCE7", text: "#166534" },
  "3xx": { background: "#DBEAFE", text: "#1D4ED8" },
  "4xx": { background: "#FFEDD5", text: "#C2410C" },
  "5xx": { background: "#FEE2E2", text: "#B91C1C" },
  ERROR: { background: "#FEE2E2", text: "#991B1B" }
};
function getStatusGroup(status, hasError) {
  if (hasError) {
    return "ERROR";
  }
  if (!status) {
    return "ALL";
  }
  if (status >= 200 && status < 300) {
    return "2xx";
  }
  if (status >= 300 && status < 400) {
    return "3xx";
  }
  if (status >= 400 && status < 500) {
    return "4xx";
  }
  if (status >= 500) {
    return "5xx";
  }
  return "ALL";
}
function getStatusColor(status, hasError) {
  return COLORS[getStatusGroup(status, hasError)];
}

// src/components/ApiLogDetail.tsx
import { useMemo, useState } from "react";
import {
  Alert,
  Pressable as Pressable2,
  ScrollView,
  StyleSheet as StyleSheet3,
  Text as Text3,
  View as View3
} from "react-native";

// src/utils/copyToClipboard.ts
import Clipboard from "@react-native-clipboard/clipboard";
function copyToClipboard(value) {
  Clipboard.setString(value);
}

// src/utils/formatJson.ts
function formatJson(value) {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
    }
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

// src/utils/openInBrowser.ts
import { Linking } from "react-native";
function isAbsoluteUrl(url) {
  return /^https?:\/\//i.test(url);
}
async function openInBrowser(url) {
  if (!isAbsoluteUrl(url)) {
    return {
      opened: false,
      reason: "Hanya absolute URL (http/https) yang bisa dibuka di browser."
    };
  }
  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
    return { opened: true };
  }
  return {
    opened: false,
    reason: "URL tidak bisa dibuka di perangkat ini."
  };
}

// src/components/StatusBadge.tsx
import { StyleSheet as StyleSheet2, Text as Text2, View as View2 } from "react-native";
import { jsx as jsx2 } from "react/jsx-runtime";
function StatusBadge({ status, error }) {
  const { background, text } = getStatusColor(status, Boolean(error));
  const label = error ? "ERR" : status ? String(status) : "N/A";
  return /* @__PURE__ */ jsx2(View2, { style: [styles2.badge, { backgroundColor: background }], children: /* @__PURE__ */ jsx2(Text2, { style: [styles2.text, { color: text }], children: label }) });
}
var styles2 = StyleSheet2.create({
  badge: {
    minWidth: 48,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    fontSize: 12,
    fontWeight: "700"
  }
});

// src/components/ApiLogDetail.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
function InfoRow({ label, value }) {
  return /* @__PURE__ */ jsxs2(View3, { style: styles3.infoRow, children: [
    /* @__PURE__ */ jsx3(Text3, { style: styles3.infoLabel, children: label }),
    /* @__PURE__ */ jsx3(Text3, { style: styles3.infoValue, children: value || "-" })
  ] });
}
function Section({ title, value }) {
  return /* @__PURE__ */ jsxs2(View3, { style: styles3.sectionBlock, children: [
    /* @__PURE__ */ jsx3(Text3, { style: styles3.sectionTitle, children: title }),
    /* @__PURE__ */ jsx3(ScrollView, { horizontal: true, children: /* @__PURE__ */ jsx3(Text3, { style: styles3.jsonText, children: formatJson(value) }) })
  ] });
}
function ApiLogDetail({
  log,
  allowCopy,
  allowOpenInBrowser,
  onBack,
  onClear
}) {
  var _a, _b, _c, _d;
  const [activeTab, setActiveTab] = useState("Overview");
  const [warning, setWarning] = useState(null);
  const tabs = ["Overview", "Request", "Response", "Headers"];
  const overviewBody = useMemo(
    () => /* @__PURE__ */ jsxs2(View3, { style: styles3.stackGap, children: [
      /* @__PURE__ */ jsxs2(View3, { style: styles3.statusRow, children: [
        /* @__PURE__ */ jsx3(StatusBadge, { status: log.status, error: log.error }),
        /* @__PURE__ */ jsx3(Text3, { style: styles3.statusText, children: log.statusText || (log.error ? "Request Failed" : "Unknown") })
      ] }),
      /* @__PURE__ */ jsx3(InfoRow, { label: "Method", value: log.method }),
      /* @__PURE__ */ jsx3(InfoRow, { label: "URL", value: log.url }),
      /* @__PURE__ */ jsx3(InfoRow, { label: "Duration", value: `${log.duration} ms` }),
      /* @__PURE__ */ jsx3(InfoRow, { label: "Error", value: log.error })
    ] }),
    [log]
  );
  const requestBody = /* @__PURE__ */ jsx3(View3, { style: styles3.stackGap, children: /* @__PURE__ */ jsx3(Section, { title: "Request Body", value: (_a = log.requestBody) != null ? _a : null }) });
  const responseBody = /* @__PURE__ */ jsx3(View3, { style: styles3.stackGap, children: /* @__PURE__ */ jsx3(Section, { title: "Response Body", value: (_b = log.responseBody) != null ? _b : null }) });
  const headersBody = /* @__PURE__ */ jsxs2(View3, { style: styles3.stackGap, children: [
    /* @__PURE__ */ jsx3(Section, { title: "Request Headers", value: (_c = log.requestHeaders) != null ? _c : {} }),
    /* @__PURE__ */ jsx3(Section, { title: "Response Headers", value: (_d = log.responseHeaders) != null ? _d : {} })
  ] });
  const onCopy = (value, label) => {
    if (!allowCopy) {
      return;
    }
    copyToClipboard(formatJson(value));
    Alert.alert("Copied", `${label} copied to clipboard`);
  };
  const onOpenBrowser = async () => {
    var _a2;
    if (!allowOpenInBrowser) {
      return;
    }
    try {
      const result = await openInBrowser(log.url);
      if (!result.opened) {
        setWarning((_a2 = result.reason) != null ? _a2 : "URL tidak bisa dibuka.");
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
  return /* @__PURE__ */ jsxs2(View3, { style: styles3.container, children: [
    /* @__PURE__ */ jsxs2(View3, { style: styles3.headerRow, children: [
      /* @__PURE__ */ jsx3(Pressable2, { onPress: onBack, style: styles3.backButton, children: /* @__PURE__ */ jsx3(Text3, { style: styles3.backText, children: "Back" }) }),
      /* @__PURE__ */ jsx3(Text3, { numberOfLines: 1, style: styles3.title, children: "API Detail" })
    ] }),
    /* @__PURE__ */ jsx3(View3, { style: styles3.tabRow, children: tabs.map((tab) => {
      const active = tab === activeTab;
      return /* @__PURE__ */ jsx3(
        Pressable2,
        {
          onPress: () => setActiveTab(tab),
          style: [styles3.tabButton, active && styles3.tabButtonActive],
          children: /* @__PURE__ */ jsx3(Text3, { style: [styles3.tabText, active && styles3.tabTextActive], children: tab })
        },
        tab
      );
    }) }),
    /* @__PURE__ */ jsxs2(ScrollView, { contentContainerStyle: styles3.body, children: [
      activeTab === "Overview" && overviewBody,
      activeTab === "Request" && requestBody,
      activeTab === "Response" && responseBody,
      activeTab === "Headers" && headersBody
    ] }),
    warning ? /* @__PURE__ */ jsx3(Text3, { style: styles3.warningText, children: warning }) : null,
    /* @__PURE__ */ jsxs2(View3, { style: styles3.actionRow, children: [
      /* @__PURE__ */ jsx3(Pressable2, { style: styles3.actionButton, onPress: () => onCopy(log.url, "URL"), children: /* @__PURE__ */ jsx3(Text3, { style: styles3.actionText, children: "Copy URL" }) }),
      /* @__PURE__ */ jsx3(Pressable2, { style: styles3.actionButton, onPress: () => onCopy(log.responseBody, "Response"), children: /* @__PURE__ */ jsx3(Text3, { style: styles3.actionText, children: "Copy Response" }) })
    ] }),
    /* @__PURE__ */ jsxs2(View3, { style: styles3.actionRow, children: [
      /* @__PURE__ */ jsx3(Pressable2, { style: styles3.actionButton, onPress: onOpenBrowser, children: /* @__PURE__ */ jsx3(Text3, { style: styles3.actionText, children: "Open in Browser" }) }),
      /* @__PURE__ */ jsx3(Pressable2, { style: styles3.actionButton, onPress: onRetry, children: /* @__PURE__ */ jsx3(Text3, { style: styles3.actionText, children: "Retry" }) }),
      /* @__PURE__ */ jsx3(Pressable2, { style: [styles3.actionButton, styles3.clearButton], onPress: onClear, children: /* @__PURE__ */ jsx3(Text3, { style: [styles3.actionText, styles3.clearButtonText], children: "Clear" }) })
    ] })
  ] });
}
var styles3 = StyleSheet3.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 20
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  backButton: {
    backgroundColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  backText: {
    color: "#111827",
    fontWeight: "600",
    fontSize: 12
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#111827"
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    marginBottom: 10,
    flexWrap: "wrap"
  },
  tabButton: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF"
  },
  tabButtonActive: {
    borderColor: "#111827",
    backgroundColor: "#111827"
  },
  tabText: {
    fontSize: 12,
    color: "#374151",
    fontWeight: "600"
  },
  tabTextActive: {
    color: "#FFFFFF"
  },
  body: {
    paddingBottom: 10
  },
  stackGap: {
    gap: 10
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  statusText: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "600"
  },
  infoRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10
  },
  infoLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 3
  },
  infoValue: {
    fontSize: 13,
    color: "#111827"
  },
  sectionBlock: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 10,
    gap: 8
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827"
  },
  jsonText: {
    fontSize: 12,
    color: "#1F2937",
    fontFamily: "Courier"
  },
  warningText: {
    marginTop: 8,
    marginBottom: 4,
    color: "#B45309",
    fontSize: 12
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
    flexWrap: "wrap"
  },
  actionButton: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  actionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1F2937"
  },
  clearButton: {
    borderColor: "#DC2626"
  },
  clearButtonText: {
    color: "#B91C1C"
  }
});

// src/components/ApiLogItem.tsx
import { Pressable as Pressable3, StyleSheet as StyleSheet4, Text as Text4, View as View4 } from "react-native";
import { jsx as jsx4, jsxs as jsxs3 } from "react/jsx-runtime";
function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString();
}
function ApiLogItem({ log, onPress }) {
  return /* @__PURE__ */ jsxs3(Pressable3, { style: styles4.container, onPress: () => onPress(log), children: [
    /* @__PURE__ */ jsxs3(View4, { style: styles4.leftBlock, children: [
      /* @__PURE__ */ jsx4(Text4, { style: styles4.method, children: log.method }),
      /* @__PURE__ */ jsx4(Text4, { numberOfLines: 1, style: styles4.url, children: log.url }),
      /* @__PURE__ */ jsxs3(Text4, { style: styles4.meta, children: [
        log.duration,
        " ms \u2022 ",
        formatTime(log.timestamp)
      ] })
    ] }),
    /* @__PURE__ */ jsx4(StatusBadge, { status: log.status, error: log.error })
  ] });
}
var styles4 = StyleSheet4.create({
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  leftBlock: {
    flex: 1
  },
  method: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4
  },
  url: {
    fontSize: 13,
    color: "#1F2937",
    marginBottom: 4
  },
  meta: {
    fontSize: 11,
    color: "#6B7280"
  }
});

// src/components/SearchFilterBar.tsx
import { Pressable as Pressable4, ScrollView as ScrollView2, StyleSheet as StyleSheet5, Text as Text5, TextInput, View as View5 } from "react-native";
import { jsx as jsx5, jsxs as jsxs4 } from "react/jsx-runtime";
var FILTERS = ["ALL", "2xx", "3xx", "4xx", "5xx", "ERROR"];
function SearchFilterBar({
  search,
  onChangeSearch,
  filter,
  onChangeFilter
}) {
  return /* @__PURE__ */ jsxs4(View5, { style: styles5.container, children: [
    /* @__PURE__ */ jsx5(
      TextInput,
      {
        value: search,
        onChangeText: onChangeSearch,
        placeholder: "Search URL...",
        placeholderTextColor: "#9CA3AF",
        style: styles5.input
      }
    ),
    /* @__PURE__ */ jsx5(ScrollView2, { horizontal: true, showsHorizontalScrollIndicator: false, contentContainerStyle: styles5.filterRow, children: FILTERS.map((item) => {
      const isActive = item === filter;
      const color = getStatusColor(item === "ALL" ? void 0 : Number(item[0]) * 100, item === "ERROR");
      return /* @__PURE__ */ jsx5(
        Pressable4,
        {
          style: [
            styles5.filterButton,
            isActive && { backgroundColor: color.background, borderColor: color.text }
          ],
          onPress: () => onChangeFilter(item),
          children: /* @__PURE__ */ jsx5(Text5, { style: [styles5.filterText, isActive && { color: color.text }], children: item })
        },
        item
      );
    }) })
  ] });
}
var styles5 = StyleSheet5.create({
  container: {
    gap: 10,
    marginBottom: 12
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#111827",
    backgroundColor: "#FFFFFF"
  },
  filterRow: {
    gap: 8
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 999,
    backgroundColor: "#FFFFFF"
  },
  filterText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600"
  }
});

// src/components/InspectorModal.tsx
import { jsx as jsx6, jsxs as jsxs5 } from "react/jsx-runtime";
function InspectorModal({
  visible,
  logs,
  allowCopy,
  allowOpenInBrowser,
  onClose,
  onClearLogs
}) {
  const [search, setSearch] = useState2("");
  const [filter, setFilter] = useState2("ALL");
  const [selectedLog, setSelectedLog] = useState2(null);
  const filteredLogs = useMemo2(() => {
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
  return /* @__PURE__ */ jsx6(Modal, { animationType: "slide", transparent: true, visible, onRequestClose: onClose, children: /* @__PURE__ */ jsx6(View6, { style: styles6.overlay, children: /* @__PURE__ */ jsx6(SafeAreaView, { style: styles6.sheet, children: selectedLog ? /* @__PURE__ */ jsx6(
    ApiLogDetail,
    {
      log: selectedLog,
      allowCopy,
      allowOpenInBrowser,
      onBack: () => setSelectedLog(null),
      onClear: onClearAll
    }
  ) : /* @__PURE__ */ jsxs5(View6, { style: styles6.container, children: [
    /* @__PURE__ */ jsxs5(View6, { style: styles6.header, children: [
      /* @__PURE__ */ jsxs5(View6, { children: [
        /* @__PURE__ */ jsx6(Text6, { style: styles6.title, children: "API Inspector" }),
        /* @__PURE__ */ jsxs5(Text6, { style: styles6.subtitle, children: [
          logs.length,
          " request captured"
        ] })
      ] }),
      /* @__PURE__ */ jsxs5(View6, { style: styles6.headerActions, children: [
        /* @__PURE__ */ jsx6(Pressable5, { style: styles6.clearBtn, onPress: onClearAll, children: /* @__PURE__ */ jsx6(Text6, { style: styles6.clearText, children: "Clear Logs" }) }),
        /* @__PURE__ */ jsx6(Pressable5, { style: styles6.closeBtn, onPress: onClose, children: /* @__PURE__ */ jsx6(Text6, { style: styles6.closeText, children: "Close" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsx6(
      SearchFilterBar,
      {
        search,
        onChangeSearch: setSearch,
        filter,
        onChangeFilter: setFilter
      }
    ),
    /* @__PURE__ */ jsx6(
      FlatList,
      {
        data: filteredLogs,
        keyExtractor: (item) => item.id,
        ItemSeparatorComponent: () => /* @__PURE__ */ jsx6(View6, { style: { height: 8 } }),
        renderItem: ({ item }) => /* @__PURE__ */ jsx6(ApiLogItem, { log: item, onPress: setSelectedLog }),
        contentContainerStyle: styles6.listContainer,
        ListEmptyComponent: /* @__PURE__ */ jsx6(Text6, { style: styles6.emptyText, children: "No request logs found." })
      }
    )
  ] }) }) }) });
}
var styles6 = StyleSheet6.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end"
  },
  sheet: {
    maxHeight: "88%",
    backgroundColor: "#F3F4F6",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: "hidden"
  },
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 14
  },
  header: {
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827"
  },
  subtitle: {
    marginTop: 2,
    color: "#6B7280",
    fontSize: 12
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center"
  },
  clearBtn: {
    borderWidth: 1,
    borderColor: "#DC2626",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF"
  },
  clearText: {
    color: "#B91C1C",
    fontSize: 12,
    fontWeight: "600"
  },
  closeBtn: {
    borderWidth: 1,
    borderColor: "#9CA3AF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#FFFFFF"
  },
  closeText: {
    color: "#374151",
    fontSize: 12,
    fontWeight: "600"
  },
  listContainer: {
    paddingBottom: 16
  },
  emptyText: {
    marginTop: 28,
    textAlign: "center",
    color: "#6B7280"
  }
});

// src/utils/logToConsole.ts
var ANSI = {
  reset: "\x1B[0m",
  bold: "\x1B[1m",
  dim: "\x1B[2m",
  green: "\x1B[32m",
  blue: "\x1B[34m",
  yellow: "\x1B[33m",
  red: "\x1B[31m",
  cyan: "\x1B[36m"
};
function getStatusColor2(status, hasError) {
  if (hasError) {
    return ANSI.red;
  }
  if (!status) {
    return ANSI.dim;
  }
  if (status >= 200 && status < 300) {
    return ANSI.green;
  }
  if (status >= 300 && status < 400) {
    return ANSI.blue;
  }
  if (status >= 400 && status < 500) {
    return ANSI.yellow;
  }
  if (status >= 500) {
    return ANSI.red;
  }
  return ANSI.dim;
}
function pretty(value) {
  if (typeof value === "string") {
    return value;
  }
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}
function oneLinePreview(value, maxLength) {
  const text = pretty(value).replace(/\s+/g, " ").trim();
  if (!text) {
    return "-";
  }
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
}
function truncate(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}
... <truncated ${text.length - maxLength} chars>`;
}
function section(title, value, maxBodyLength) {
  if (value === void 0) {
    return "";
  }
  return [
    `${ANSI.cyan}${title}${ANSI.reset}`,
    truncate(pretty(value), maxBodyLength),
    ""
  ].join("\n");
}
function logApiToConsole(log, options = {}) {
  var _a, _b, _c, _d, _e;
  if (!__DEV__) {
    return;
  }
  const maxBodyLength = (_a = options.maxBodyLength) != null ? _a : 1600;
  const verbosity = (_b = options.verbosity) != null ? _b : "compact";
  const showTimestamp = (_c = options.showTimestamp) != null ? _c : true;
  const shouldShowHeaders = (_d = options.showHeaders) != null ? _d : verbosity === "detailed";
  const statusLabel = log.error ? "ERR" : String((_e = log.status) != null ? _e : "N/A");
  const statusColor = getStatusColor2(log.status, Boolean(log.error));
  const headline = [
    `${ANSI.bold}[ALTECH API]${ANSI.reset}`,
    `${ANSI.cyan}${log.method}${ANSI.reset}`,
    `${statusColor}${statusLabel}${ANSI.reset}`,
    `${ANSI.dim}${log.duration}ms${ANSI.reset}`,
    log.url
  ].join(" ");
  if (verbosity === "compact") {
    const compactLines = [
      "",
      headline,
      showTimestamp ? `${ANSI.dim}${new Date(log.timestamp).toISOString()}${ANSI.reset}` : "",
      log.error ? `${ANSI.red}Error:${ANSI.reset} ${log.error}` : "",
      log.requestBody !== void 0 ? `${ANSI.cyan}REQ${ANSI.reset} ${oneLinePreview(log.requestBody, 240)}` : "",
      log.responseBody !== void 0 ? `${ANSI.cyan}RES${ANSI.reset} ${oneLinePreview(log.responseBody, 240)}` : ""
    ].filter(Boolean).join("\n");
    console.log(compactLines);
    return;
  }
  const output = [
    "\n============================================================",
    headline,
    showTimestamp ? `${ANSI.dim}${new Date(log.timestamp).toISOString()}${ANSI.reset}` : "",
    log.error ? `${ANSI.red}Error:${ANSI.reset} ${log.error}` : "",
    shouldShowHeaders ? section("Request Headers", log.requestHeaders, maxBodyLength) : "",
    section("Request Body", log.requestBody, maxBodyLength),
    shouldShowHeaders ? section("Response Headers", log.responseHeaders, maxBodyLength) : "",
    section("Response Body", log.responseBody, maxBodyLength),
    "============================================================"
  ].filter(Boolean).join("\n");
  console.log(output);
}

// src/store/apiLogsStore.ts
import { create } from "zustand";
var DEFAULT_MAX_LOGS = 100;
var useApiLogsStore = create((set) => ({
  logs: [],
  maxLogs: DEFAULT_MAX_LOGS,
  addLog: (log) => set((state) => {
    const next = [log, ...state.logs];
    if (next.length <= state.maxLogs) {
      return { logs: next };
    }
    return { logs: next.slice(0, state.maxLogs) };
  }),
  clearLogs: () => set({ logs: [] }),
  setMaxLogs: (maxLogs) => set((state) => {
    const safeMaxLogs = Math.max(1, Math.floor(maxLogs));
    return {
      maxLogs: safeMaxLogs,
      logs: state.logs.slice(0, safeMaxLogs)
    };
  }),
  updateLog: (id, patch) => set((state) => ({
    logs: state.logs.map((log) => log.id === id ? { ...log, ...patch } : log)
  }))
}));

// src/store/logDispatcher.ts
function dispatchApiLog(log, options) {
  if (options.mode === "ui" || options.mode === "both") {
    useApiLogsStore.getState().addLog(log);
  }
  if (options.mode === "console" || options.mode === "both") {
    logApiToConsole(log, options.console);
  }
  if (options.console.onLog) {
    Promise.resolve(options.console.onLog(log)).catch(() => void 0);
  }
}

// src/interceptors/fetchInterceptor.ts
var originalFetch = null;
var isAttached = false;
function createId() {
  return `fetch_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function headersToObject(headers) {
  if (!headers) {
    return void 0;
  }
  if (Array.isArray(headers)) {
    return headers.reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }
  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    const result = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }
  return { ...headers };
}
function parseStringToJsonMaybe(value) {
  const trimmed = value.trim();
  if (!trimmed) {
    return value;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return value;
  }
}
function parseInitBody(body) {
  if (body == null) {
    return void 0;
  }
  if (typeof body === "string") {
    return parseStringToJsonMaybe(body);
  }
  return body;
}
async function parseRequestBody(input, init) {
  if ((init == null ? void 0 : init.body) !== void 0) {
    return parseInitBody(init.body);
  }
  if (typeof Request !== "undefined" && input instanceof Request) {
    try {
      const cloned = input.clone();
      const text = await cloned.text();
      return parseStringToJsonMaybe(text);
    } catch {
      return void 0;
    }
  }
  return void 0;
}
async function parseResponseBody(response) {
  try {
    const text = await response.text();
    return parseStringToJsonMaybe(text);
  } catch {
    return void 0;
  }
}
function normalizeRequest(input, init) {
  var _a, _b, _c, _d, _e, _f, _g;
  let method = "GET";
  let url = "";
  let headers;
  if (typeof input === "string") {
    url = input;
    method = ((_a = init == null ? void 0 : init.method) != null ? _a : "GET").toUpperCase();
    headers = headersToObject(init == null ? void 0 : init.headers);
    return { method, url, headers };
  }
  if (input instanceof URL) {
    url = input.toString();
    method = ((_b = init == null ? void 0 : init.method) != null ? _b : "GET").toUpperCase();
    headers = headersToObject(init == null ? void 0 : init.headers);
    return { method, url, headers };
  }
  if (typeof Request !== "undefined" && input instanceof Request) {
    url = input.url;
    method = ((_d = (_c = init == null ? void 0 : init.method) != null ? _c : input.method) != null ? _d : "GET").toUpperCase();
    headers = {
      ...(_e = headersToObject(input.headers)) != null ? _e : {},
      ...(_f = headersToObject(init == null ? void 0 : init.headers)) != null ? _f : {}
    };
    return { method, url, headers };
  }
  url = String(input);
  method = ((_g = init == null ? void 0 : init.method) != null ? _g : "GET").toUpperCase();
  headers = headersToObject(init == null ? void 0 : init.headers);
  return { method, url, headers };
}
function createRetry(input, init) {
  return async () => {
    const currentFetch = originalFetch != null ? originalFetch : globalThis.fetch;
    await currentFetch(input, init);
  };
}
function attachFetchInspector(options = {}) {
  var _a, _b, _c;
  const enabled = (_a = options.enabled) != null ? _a : __DEV__;
  const mode = (_b = options.mode) != null ? _b : "both";
  const consoleOptions = (_c = options.console) != null ? _c : {};
  if (!enabled || !__DEV__ || isAttached) {
    return;
  }
  if (typeof globalThis.fetch !== "function") {
    return;
  }
  originalFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = (async (input, init) => {
    const { method, url, headers } = normalizeRequest(input, init);
    const startedAt = Date.now();
    const requestBodyPromise = parseRequestBody(input, init);
    try {
      const response = await originalFetch(input, init);
      const duration = Date.now() - startedAt;
      const clonedResponse = response.clone();
      const responseBody = await parseResponseBody(clonedResponse);
      const requestBody = await requestBodyPromise;
      const responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      const log = {
        id: createId(),
        method,
        url,
        status: response.status,
        statusText: response.statusText,
        duration,
        requestHeaders: headers,
        requestBody,
        responseHeaders,
        responseBody,
        timestamp: startedAt,
        retry: createRetry(input, init)
      };
      dispatchApiLog(log, { mode, console: consoleOptions });
      return response;
    } catch (error) {
      const duration = Date.now() - startedAt;
      const requestBody = await requestBodyPromise;
      const log = {
        id: createId(),
        method,
        url,
        duration,
        requestHeaders: headers,
        requestBody,
        error: error instanceof Error ? error.message : String(error),
        timestamp: startedAt,
        retry: createRetry(input, init)
      };
      dispatchApiLog(log, { mode, console: consoleOptions });
      throw error;
    }
  });
  isAttached = true;
}
function restoreFetchInspector() {
  if (!isAttached || !originalFetch) {
    return;
  }
  globalThis.fetch = originalFetch;
  isAttached = false;
}
function isFetchInspectorAttached() {
  return isAttached;
}

// src/AltechApiInspector.tsx
import { Fragment, jsx as jsx7, jsxs as jsxs6 } from "react/jsx-runtime";
function AltechApiInspector({
  enabled = __DEV__,
  maxLogs = 100,
  position = "bottom-right",
  defaultOpen = false,
  allowOpenInBrowser = true,
  allowCopy = true,
  mode = "ui",
  showFloatingButton = true,
  console: console2
}) {
  const logs = useApiLogsStore((state) => state.logs);
  const clearLogs = useApiLogsStore((state) => state.clearLogs);
  const setMaxLogs = useApiLogsStore((state) => state.setMaxLogs);
  const [visible, setVisible] = useState3(defaultOpen);
  useEffect(() => {
    if (!enabled || !__DEV__) {
      return;
    }
    setMaxLogs(maxLogs);
    attachFetchInspector({ enabled, mode, console: console2 });
    return () => {
      restoreFetchInspector();
    };
  }, [console2, enabled, maxLogs, mode, setMaxLogs]);
  if (!enabled || !__DEV__) {
    return null;
  }
  const shouldRenderUi = mode === "ui" || mode === "both";
  if (!shouldRenderUi) {
    return null;
  }
  return /* @__PURE__ */ jsxs6(Fragment, { children: [
    showFloatingButton ? /* @__PURE__ */ jsx7(FloatingButton, { count: logs.length, position, onPress: () => setVisible(true) }) : null,
    /* @__PURE__ */ jsx7(
      InspectorModal,
      {
        visible,
        logs,
        allowCopy,
        allowOpenInBrowser,
        onClose: () => setVisible(false),
        onClearLogs: clearLogs
      }
    )
  ] });
}

// src/initApiInspector.ts
function initApiInspector(options = {}) {
  var _a, _b, _c;
  const enabled = (_a = options.enabled) != null ? _a : __DEV__;
  if (!enabled || !__DEV__) {
    return () => void 0;
  }
  if (typeof options.maxLogs === "number") {
    useApiLogsStore.getState().setMaxLogs(options.maxLogs);
  }
  const mode = (_b = options.mode) != null ? _b : "console";
  const interceptFetch = (_c = options.interceptFetch) != null ? _c : true;
  if (interceptFetch) {
    attachFetchInspector({ enabled, mode, console: options.console });
    return () => {
      restoreFetchInspector();
    };
  }
  return () => void 0;
}

// src/interceptors/axiosInterceptor.ts
function createId2() {
  return `axios_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
function headersToObject2(headers) {
  if (!headers) {
    return void 0;
  }
  if (typeof headers.toJSON === "function") {
    return headers.toJSON();
  }
  return { ...headers };
}
function parseData(data) {
  if (typeof data !== "string") {
    return data;
  }
  const trimmed = data.trim();
  if (!trimmed) {
    return data;
  }
  try {
    return JSON.parse(trimmed);
  } catch {
    return data;
  }
}
function resolveUrl(config) {
  var _a, _b;
  const baseURL = (_a = config.baseURL) != null ? _a : "";
  const url = (_b = config.url) != null ? _b : "";
  if (!baseURL) {
    return url;
  }
  if (/^https?:\/\//i.test(url)) {
    return url;
  }
  const left = baseURL.endsWith("/") ? baseURL.slice(0, -1) : baseURL;
  const right = url.startsWith("/") ? url.slice(1) : url;
  return `${left}/${right}`;
}
function buildRetry(instance, config) {
  if (!config) {
    return void 0;
  }
  return async () => {
    await instance.request(config);
  };
}
function addSuccessLog(instance, response, mode, consoleOptions) {
  var _a, _b;
  const config = response.config;
  const startedAt = (_a = config.__altechStartedAt) != null ? _a : Date.now();
  const duration = Date.now() - startedAt;
  const log = {
    id: createId2(),
    method: ((_b = config.method) != null ? _b : "GET").toUpperCase(),
    url: resolveUrl(config),
    status: response.status,
    statusText: response.statusText,
    duration,
    requestHeaders: headersToObject2(config.headers),
    requestBody: parseData(config.data),
    responseHeaders: headersToObject2(response.headers),
    responseBody: parseData(response.data),
    timestamp: startedAt,
    retry: buildRetry(instance, config)
  };
  dispatchApiLog(log, { mode, console: consoleOptions });
}
function addErrorLog(instance, error, mode, consoleOptions) {
  var _a, _b, _c, _d, _e, _f, _g;
  const config = (_a = error.config) != null ? _a : {};
  const startedAt = (_b = config.__altechStartedAt) != null ? _b : Date.now();
  const duration = Date.now() - startedAt;
  const log = {
    id: createId2(),
    method: ((_c = config.method) != null ? _c : "GET").toUpperCase(),
    url: resolveUrl(config),
    status: (_d = error.response) == null ? void 0 : _d.status,
    statusText: (_e = error.response) == null ? void 0 : _e.statusText,
    duration,
    requestHeaders: headersToObject2(config.headers),
    requestBody: parseData(config.data),
    responseHeaders: headersToObject2((_f = error.response) == null ? void 0 : _f.headers),
    responseBody: parseData((_g = error.response) == null ? void 0 : _g.data),
    error: error.message,
    timestamp: startedAt,
    retry: buildRetry(instance, config)
  };
  dispatchApiLog(log, { mode, console: consoleOptions });
}
function attachAxiosInspector(axiosInstance, options = {}) {
  var _a, _b, _c;
  const enabled = (_a = options.enabled) != null ? _a : __DEV__;
  const mode = (_b = options.mode) != null ? _b : "both";
  const consoleOptions = (_c = options.console) != null ? _c : {};
  if (!enabled || !__DEV__) {
    return () => void 0;
  }
  const requestInterceptorId = axiosInstance.interceptors.request.use((config) => {
    config.__altechStartedAt = Date.now();
    return config;
  });
  const responseInterceptorId = axiosInstance.interceptors.response.use(
    (response) => {
      addSuccessLog(axiosInstance, response, mode, consoleOptions);
      return response;
    },
    (error) => {
      addErrorLog(axiosInstance, error, mode, consoleOptions);
      return Promise.reject(error);
    }
  );
  return () => {
    axiosInstance.interceptors.request.eject(requestInterceptorId);
    axiosInstance.interceptors.response.eject(responseInterceptorId);
  };
}
export {
  AltechApiInspector,
  attachAxiosInspector,
  attachFetchInspector,
  initApiInspector,
  isFetchInspectorAttached,
  restoreFetchInspector
};
//# sourceMappingURL=index.mjs.map