import { dispatchApiLog } from "../store/logDispatcher";
import type { ApiLog } from "../types/apiLog";
import type { ConsoleLoggerOptions, InspectorMode } from "../types/inspector";

export type AttachFetchInspectorOptions = {
  enabled?: boolean;
  mode?: InspectorMode;
  console?: ConsoleLoggerOptions;
};

type FetchFn = typeof fetch;

type FetchInput = Parameters<FetchFn>[0];
type FetchInit = Parameters<FetchFn>[1];

let originalFetch: FetchFn | null = null;
let isAttached = false;

function createId(): string {
  return `fetch_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function headersToObject(headers?: HeadersInit): Record<string, any> | undefined {
  if (!headers) {
    return undefined;
  }

  if (Array.isArray(headers)) {
    return headers.reduce<Record<string, any>>((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  }

  if (typeof Headers !== "undefined" && headers instanceof Headers) {
    const result: Record<string, any> = {};
    headers.forEach((value, key) => {
      result[key] = value;
    });
    return result;
  }

  return { ...(headers as Record<string, any>) };
}

function parseStringToJsonMaybe(value: string): any {
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

function parseInitBody(body: unknown): any {
  if (body == null) {
    return undefined;
  }

  if (typeof body === "string") {
    return parseStringToJsonMaybe(body);
  }

  return body;
}

async function parseRequestBody(input: FetchInput, init?: FetchInit): Promise<any> {
  if (init?.body !== undefined) {
    return parseInitBody(init.body);
  }

  if (typeof Request !== "undefined" && input instanceof Request) {
    try {
      const cloned = input.clone();
      const text = await cloned.text();
      return parseStringToJsonMaybe(text);
    } catch {
      return undefined;
    }
  }

  return undefined;
}

async function parseResponseBody(response: Response): Promise<any> {
  try {
    const text = await response.text();
    return parseStringToJsonMaybe(text);
  } catch {
    return undefined;
  }
}

function normalizeRequest(input: FetchInput, init?: FetchInit) {
  let method = "GET";
  let url = "";
  let headers: Record<string, any> | undefined;

  if (typeof input === "string") {
    url = input;
    method = (init?.method ?? "GET").toUpperCase();
    headers = headersToObject(init?.headers);
    return { method, url, headers };
  }

  if (input instanceof URL) {
    url = input.toString();
    method = (init?.method ?? "GET").toUpperCase();
    headers = headersToObject(init?.headers);
    return { method, url, headers };
  }

  if (typeof Request !== "undefined" && input instanceof Request) {
    url = input.url;
    method = (init?.method ?? input.method ?? "GET").toUpperCase();
    headers = {
      ...(headersToObject(input.headers) ?? {}),
      ...(headersToObject(init?.headers) ?? {}),
    };
    return { method, url, headers };
  }

  url = String(input);
  method = (init?.method ?? "GET").toUpperCase();
  headers = headersToObject(init?.headers);
  return { method, url, headers };
}

function createRetry(input: FetchInput, init?: FetchInit) {
  return async () => {
    const currentFetch = originalFetch ?? globalThis.fetch;
    await currentFetch(input as any, init as any);
  };
}

export function attachFetchInspector(options: AttachFetchInspectorOptions = {}): void {
  const enabled = options.enabled ?? __DEV__;
  const mode = options.mode ?? "both";
  const consoleOptions = options.console ?? {};

  if (!enabled || !__DEV__ || isAttached) {
    return;
  }

  if (typeof globalThis.fetch !== "function") {
    return;
  }

  originalFetch = globalThis.fetch.bind(globalThis);

  globalThis.fetch = (async (input: FetchInput, init?: FetchInit) => {
    const { method, url, headers } = normalizeRequest(input, init);
    const startedAt = Date.now();
    const requestBodyPromise = parseRequestBody(input, init);

    try {
      const response = await (originalFetch as FetchFn)(input as any, init as any);
      const duration = Date.now() - startedAt;
      const clonedResponse = response.clone();
      const responseBody = await parseResponseBody(clonedResponse);
      const requestBody = await requestBodyPromise;

      const responseHeaders: Record<string, any> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const log: ApiLog = {
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
        retry: createRetry(input, init),
      };

      dispatchApiLog(log, { mode, console: consoleOptions });
      return response;
    } catch (error) {
      const duration = Date.now() - startedAt;
      const requestBody = await requestBodyPromise;

      const log: ApiLog = {
        id: createId(),
        method,
        url,
        duration,
        requestHeaders: headers,
        requestBody,
        error: error instanceof Error ? error.message : String(error),
        timestamp: startedAt,
        retry: createRetry(input, init),
      };

      dispatchApiLog(log, { mode, console: consoleOptions });
      throw error;
    }
  }) as FetchFn;

  isAttached = true;
}

export function restoreFetchInspector(): void {
  if (!isAttached || !originalFetch) {
    return;
  }

  globalThis.fetch = originalFetch;
  isAttached = false;
}

export function isFetchInspectorAttached(): boolean {
  return isAttached;
}
