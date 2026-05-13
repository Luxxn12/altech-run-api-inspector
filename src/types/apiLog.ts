export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS" | string;

export type RetryRequestFn = () => Promise<void>;

export type ApiLog = {
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

export type StatusFilter = "ALL" | "2xx" | "3xx" | "4xx" | "5xx" | "ERROR";
