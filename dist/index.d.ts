import * as react_jsx_runtime from 'react/jsx-runtime';
import { AxiosInstance } from 'axios';

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | string;
type RetryRequestFn = () => Promise<void>;
type ApiLog = {
    id: string;
    method: HttpMethod;
    url: string;
    status?: number;
    statusText?: string;
    duration: number;
    requestHeaders?: Record<string, any>;
    requestBody?: any;
    responseHeaders?: Record<string, any>;
    responseBody?: any;
    error?: string;
    timestamp: number;
    retry?: RetryRequestFn;
};
type StatusFilter = "ALL" | "2xx" | "3xx" | "4xx" | "5xx" | "ERROR";

type InspectorMode = "ui" | "console" | "both";
type ConsoleVerbosity = "compact" | "detailed";
type ConsoleLoggerOptions = {
    maxBodyLength?: number;
    verbosity?: ConsoleVerbosity;
    showHeaders?: boolean;
    showTimestamp?: boolean;
    onLog?: (log: ApiLog) => void | Promise<void>;
};

type AltechApiInspectorProps = {
    enabled?: boolean;
    maxLogs?: number;
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left";
    defaultOpen?: boolean;
    allowOpenInBrowser?: boolean;
    allowCopy?: boolean;
    mode?: InspectorMode;
    showFloatingButton?: boolean;
    console?: ConsoleLoggerOptions;
};
declare function AltechApiInspector({ enabled, maxLogs, position, defaultOpen, allowOpenInBrowser, allowCopy, mode, showFloatingButton, console, }: AltechApiInspectorProps): react_jsx_runtime.JSX.Element | null;

type InitApiInspectorOptions = {
    enabled?: boolean;
    maxLogs?: number;
    mode?: InspectorMode;
    interceptFetch?: boolean;
    console?: ConsoleLoggerOptions;
};
declare function initApiInspector(options?: InitApiInspectorOptions): () => void;

type AttachFetchInspectorOptions = {
    enabled?: boolean;
    mode?: InspectorMode;
    console?: ConsoleLoggerOptions;
};
declare function attachFetchInspector(options?: AttachFetchInspectorOptions): void;
declare function restoreFetchInspector(): void;
declare function isFetchInspectorAttached(): boolean;

type AttachAxiosInspectorOptions = {
    enabled?: boolean;
    mode?: InspectorMode;
    console?: ConsoleLoggerOptions;
};
type AxiosLike = AxiosInstance;
declare function attachAxiosInspector(axiosInstance: AxiosLike, options?: AttachAxiosInspectorOptions): () => void;

export { AltechApiInspector, type AltechApiInspectorProps, type ApiLog, type ConsoleLoggerOptions, type InitApiInspectorOptions, type InspectorMode, type StatusFilter, attachAxiosInspector, attachFetchInspector, initApiInspector, isFetchInspectorAttached, restoreFetchInspector };
