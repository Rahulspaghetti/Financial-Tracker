// ============================================================================
// Tally — Domain types
// These are the canonical shapes used throughout the frontend.
// Keep in sync with Spring Boot API DTOs in apps/api/.
// ============================================================================

// ── User ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  createdAt: string; // ISO 8601
}

// ── Account ──────────────────────────────────────────────────────────────────

export type AccountType =
  | 'checking'
  | 'savings'
  | 'credit'
  | 'investment'
  | 'loan'
  | 'other';

export interface Account {
  id: string;
  plaidAccountId: string;
  name: string;
  officialName: string | null;
  type: AccountType;
  subtype: string | null;
  /** Current balance in dollars (positive = asset, negative = liability) */
  balanceCurrent: number;
  balanceAvailable: number | null;
  currencyCode: string;
  institutionName: string | null;
  institutionLogo: string | null;
  lastSyncedAt: string | null;
}

// ── Category ─────────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  icon: string | null; // lucide icon name, e.g. "utensils"
  colorVar: string | null; // CSS custom property, e.g. "--positive"
  parentId: string | null;
}

// ── Transaction ──────────────────────────────────────────────────────────────

export type TransactionType = 'debit' | 'credit';

export interface Transaction {
  id: string;
  plaidTransactionId: string | null;
  accountId: string;
  /** Amount in dollars. Positive = expense (money out). Negative = income (money in). */
  amount: number;
  type: TransactionType;
  name: string;
  merchantName: string | null;
  category: string | null;
  categoryId: string | null;
  date: string; // ISO 8601 date string: "YYYY-MM-DD"
  pending: boolean;
  notes: string | null;
  logoUrl: string | null;
}

// ── Dashboard / Analytics ────────────────────────────────────────────────────

export type Period = 'week' | 'month' | 'quarter' | 'year';

export interface SpendingSummary {
  period: Period;
  totalSpend: number;
  totalIncome: number;
  netCashFlow: number;
  /** Compared to previous period, as a fraction: 0.12 = 12% more */
  spendDelta: number;
  incomeDelta: number;
  byCategory: CategorySpend[];
  dailyTotals: DailyTotal[];
}

export interface CategorySpend {
  category: string;
  amount: number;
  percentage: number;
  transactionCount: number;
}

export interface DailyTotal {
  date: string; // "YYYY-MM-DD"
  spend: number;
  income: number;
}

// ── Chat / AI ────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string; // ISO 8601
  /** Optional structured data the assistant returned alongside its text */
  metadata?: Record<string, unknown>;
}

export interface ChatSession {
  id: string;
  title: string | null;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}
