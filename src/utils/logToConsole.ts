import type { ApiLog } from "../types/apiLog";
import type { ConsoleLoggerOptions } from "../types/inspector";

const ANSI = {
  reset: "\u001b[0m",
  bold: "\u001b[1m",
  dim: "\u001b[2m",
  green: "\u001b[32m",
  blue: "\u001b[34m",
  yellow: "\u001b[33m",
  red: "\u001b[31m",
  cyan: "\u001b[36m",
};

function getStatusColor(status?: number, hasError?: boolean): string {
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

function pretty(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function oneLinePreview(value: unknown, maxLength: number): string {
  const text = pretty(value).replace(/\s+/g, " ").trim();
  if (!text) {
    return "-";
  }

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}...`;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength)}\n... <truncated ${text.length - maxLength} chars>`;
}

function section(title: string, value: unknown, maxBodyLength: number): string {
  if (value === undefined) {
    return "";
  }

  return [
    `${ANSI.cyan}${title}${ANSI.reset}`,
    truncate(pretty(value), maxBodyLength),
    "",
  ].join("\n");
}

export function logApiToConsole(log: ApiLog, options: ConsoleLoggerOptions = {}): void {
  if (!__DEV__) {
    return;
  }

  const maxBodyLength = options.maxBodyLength ?? 1600;
  const verbosity = options.verbosity ?? "compact";
  const showTimestamp = options.showTimestamp ?? true;
  const shouldShowHeaders = options.showHeaders ?? verbosity === "detailed";
  const statusLabel = log.error ? "ERR" : String(log.status ?? "N/A");
  const statusColor = getStatusColor(log.status, Boolean(log.error));
  const headline = [
    `${ANSI.bold}[ALTECH API]${ANSI.reset}`,
    `${ANSI.cyan}${log.method}${ANSI.reset}`,
    `${statusColor}${statusLabel}${ANSI.reset}`,
    `${ANSI.dim}${log.duration}ms${ANSI.reset}`,
    log.url,
  ].join(" ");

  if (verbosity === "compact") {
    const compactLines = [
      "",
      headline,
      showTimestamp ? `${ANSI.dim}${new Date(log.timestamp).toISOString()}${ANSI.reset}` : "",
      log.error ? `${ANSI.red}Error:${ANSI.reset} ${log.error}` : "",
      log.requestBody !== undefined
        ? `${ANSI.cyan}REQ${ANSI.reset} ${oneLinePreview(log.requestBody, 240)}`
        : "",
      log.responseBody !== undefined
        ? `${ANSI.cyan}RES${ANSI.reset} ${oneLinePreview(log.responseBody, 240)}`
        : "",
    ]
      .filter(Boolean)
      .join("\n");

    // eslint-disable-next-line no-console
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
    "============================================================",
  ]
    .filter(Boolean)
    .join("\n");

  // eslint-disable-next-line no-console
  console.log(output);
}
