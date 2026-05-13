import type {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { dispatchApiLog } from "../store/logDispatcher";
import type { ApiLog } from "../types/apiLog";
import type { ConsoleLoggerOptions, InspectorMode } from "../types/inspector";

type AttachAxiosInspectorOptions = {
  enabled?: boolean;
  mode?: InspectorMode;
  console?: ConsoleLoggerOptions;
};

type AxiosLike = AxiosInstance;
type AxiosConfigWithStart = AxiosRequestConfig & { __altechStartedAt?: number };

function createId(): string {
  return `axios_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function headersToObject(headers: AxiosRequestConfig["headers"] | AxiosResponse["headers"]) {
  if (!headers) {
    return undefined;
  }

  if (typeof (headers as AxiosHeaders).toJSON === "function") {
    return (headers as AxiosHeaders).toJSON();
  }

  return { ...(headers as Record<string, any>) };
}

function parseData(data: any) {
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

function resolveUrl(config: AxiosRequestConfig): string {
  const baseURL = config.baseURL ?? "";
  const url = config.url ?? "";

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

function buildRetry(instance: AxiosLike, config: AxiosRequestConfig | undefined) {
  if (!config) {
    return undefined;
  }

  return async () => {
    await instance.request(config);
  };
}

function addSuccessLog(
  instance: AxiosLike,
  response: AxiosResponse,
  mode: InspectorMode,
  consoleOptions: ConsoleLoggerOptions,
): void {
  const config = response.config as AxiosConfigWithStart;
  const startedAt = config.__altechStartedAt ?? Date.now();
  const duration = Date.now() - startedAt;

  const log: ApiLog = {
    id: createId(),
    method: (config.method ?? "GET").toUpperCase(),
    url: resolveUrl(config),
    status: response.status,
    statusText: response.statusText,
    duration,
    requestHeaders: headersToObject(config.headers),
    requestBody: parseData(config.data),
    responseHeaders: headersToObject(response.headers),
    responseBody: parseData(response.data),
    timestamp: startedAt,
    retry: buildRetry(instance, config),
  };

  dispatchApiLog(log, { mode, console: consoleOptions });
}

function addErrorLog(
  instance: AxiosLike,
  error: AxiosError,
  mode: InspectorMode,
  consoleOptions: ConsoleLoggerOptions,
): void {
  const config = (error.config ?? {}) as AxiosConfigWithStart;
  const startedAt = config.__altechStartedAt ?? Date.now();
  const duration = Date.now() - startedAt;

  const log: ApiLog = {
    id: createId(),
    method: (config.method ?? "GET").toUpperCase(),
    url: resolveUrl(config),
    status: error.response?.status,
    statusText: error.response?.statusText,
    duration,
    requestHeaders: headersToObject(config.headers),
    requestBody: parseData(config.data),
    responseHeaders: headersToObject(error.response?.headers),
    responseBody: parseData(error.response?.data),
    error: error.message,
    timestamp: startedAt,
    retry: buildRetry(instance, config),
  };

  dispatchApiLog(log, { mode, console: consoleOptions });
}

export function attachAxiosInspector(
  axiosInstance: AxiosLike,
  options: AttachAxiosInspectorOptions = {},
): () => void {
  const enabled = options.enabled ?? __DEV__;
  const mode = options.mode ?? "both";
  const consoleOptions = options.console ?? {};
  if (!enabled || !__DEV__) {
    return () => undefined;
  }

  const requestInterceptorId = axiosInstance.interceptors.request.use((config) => {
    (config as InternalAxiosRequestConfig & { __altechStartedAt?: number }).__altechStartedAt =
      Date.now();
    return config;
  });

  const responseInterceptorId = axiosInstance.interceptors.response.use(
    (response) => {
      addSuccessLog(axiosInstance, response, mode, consoleOptions);
      return response;
    },
    (error: AxiosError) => {
      addErrorLog(axiosInstance, error, mode, consoleOptions);
      return Promise.reject(error);
    },
  );

  return () => {
    axiosInstance.interceptors.request.eject(requestInterceptorId);
    axiosInstance.interceptors.response.eject(responseInterceptorId);
  };
}
