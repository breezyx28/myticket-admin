/**
 * Future HTTP boundary for the admin app. RTK Query `fetchBaseQuery` implements this shape
 * when the real API is wired; today all traffic uses `fakeBaseQuery` in `adminApi`.
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
