// ============================================================================
// Tally — API response wrapper types
// These wrap raw domain types as returned by the FastAPI backend.
// ============================================================================

// ── Generic wrappers ─────────────────────────────────────────────────────────

/** Standard success envelope */
export interface ApiResponse<T> {
  data: T;
  /** Human-readable status message, e.g. "ok" */
  message?: string;
}

/** Paginated list envelope */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

/** Standard error envelope (matches FastAPI HTTPException detail shape) */
export interface ApiError {
  detail: string | ApiErrorDetail[];
  status?: number;
}

export interface ApiErrorDetail {
  loc: string[];
  msg: string;
  type: string;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: 'bearer';
  expiresIn: number; // seconds
}

export interface GoogleAuthRequest {
  idToken: string;
}

// ── Transactions ──────────────────────────────────────────────────────────────

export interface TransactionListParams {
  accountId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

// ── Plaid ────────────────────────────────────────────────────────────────────

export interface PlaidLinkTokenResponse {
  linkToken: string;
  expiration: string;
}

export interface PlaidExchangeRequest {
  publicToken: string;
  institutionId: string;
  institutionName: string;
}

// ── AI Chat ──────────────────────────────────────────────────────────────────

export interface ChatRequest {
  message: string;
  sessionId?: string;
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  /** Optional tool-call result attached to the response */
  toolResult?: Record<string, unknown>;
}
