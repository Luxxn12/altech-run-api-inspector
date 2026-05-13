export { AltechApiInspector } from "./AltechApiInspector";
export type { AltechApiInspectorProps } from "./AltechApiInspector";
export { initApiInspector } from "./initApiInspector";
export type { InitApiInspectorOptions } from "./initApiInspector";

export { attachFetchInspector, restoreFetchInspector, isFetchInspectorAttached } from "./interceptors/fetchInterceptor";
export { attachAxiosInspector } from "./interceptors/axiosInterceptor";

export type { ApiLog, StatusFilter } from "./types/apiLog";
export type { InspectorMode, ConsoleLoggerOptions } from "./types/inspector";
