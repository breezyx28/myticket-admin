/**
 * Typed HTTP boundary shape. Admin traffic uses RTK Query (`adminApi` + `fetchBaseQuery`)
 * against `VITE_API_BASE_URL`; this interface remains for future non-RTK callers.
 */
export type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export type HttpRequest = {
  path: string;
  method: HttpMethod;
  body?: unknown;
  headers?: Record<string, string>;
};

export type HttpResponse<T = unknown> = {
  status: number;
  data: T;
};

export interface HttpClient {
  request<T>(req: HttpRequest): Promise<HttpResponse<T>>;
}
