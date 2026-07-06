// ============================================================================
// Tally — API client
// Thin wrapper around fetch that handles auth headers, JSON parsing,
// and consistent error throwing.
// ============================================================================

import type { ApiError } from '@/types/api';
import { snakeToCamel } from '@/lib/case';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

// ── Custom error class ────────────────────────────────────────────────────────

export class TallyApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: ApiError['detail'],
  ) {
    super(typeof detail === 'string' ? detail : 'An unexpected error occurred');
    this.name = 'TallyApiError';
  }
}

// ── Core fetcher ─────────────────────────────────────────────────────────────

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Tally JWT access token. Pass from session.accessToken. */
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, token, ...init } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let detail: ApiError['detail'] = response.statusText;
    try {
      const errorBody = (await response.json()) as ApiError;
      detail = errorBody.detail ?? detail;
    } catch {
      // keep statusText
    }
    throw new TallyApiError(response.status, detail);
  }

  // 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return snakeToCamel<T>(await response.json());
}

// ── Exported helpers ──────────────────────────────────────────────────────────

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'GET', ...options }),

  post: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'POST', body, ...options }),

  patch: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'PATCH', body, ...options }),

  put: <T>(path: string, body: unknown, options?: RequestOptions) =>
    request<T>(path, { method: 'PUT', body, ...options }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { method: 'DELETE', ...options }),
};
