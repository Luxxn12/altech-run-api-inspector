import type { StatusFilter } from "../types/apiLog";

type StatusColor = {
  background: string;
  text: string;
};

const COLORS: Record<StatusFilter, StatusColor> = {
  ALL: { background: "#E5E7EB", text: "#111827" },
  "2xx": { background: "#DCFCE7", text: "#166534" },
  "3xx": { background: "#DBEAFE", text: "#1D4ED8" },
  "4xx": { background: "#FFEDD5", text: "#C2410C" },
  "5xx": { background: "#FEE2E2", text: "#B91C1C" },
  ERROR: { background: "#FEE2E2", text: "#991B1B" },
};

export function getStatusGroup(status?: number, hasError?: boolean): StatusFilter {
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

export function getStatusColor(status?: number, hasError?: boolean): StatusColor {
  return COLORS[getStatusGroup(status, hasError)];
}
