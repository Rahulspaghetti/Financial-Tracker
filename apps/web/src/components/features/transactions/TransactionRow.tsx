'use client';

import { formatCurrency, formatRelativeDate } from '@/lib/format';
import { formatCategoryLabel } from '@/lib/categories';
import type { Transaction } from '@/types/domain';

interface TransactionRowProps {
  transaction: Transaction;
}

export function TransactionRow({ transaction }: TransactionRowProps) {
  const isIncome = transaction.amount < 0;
  const displayAmount = Math.abs(transaction.amount);
  const subtitle = [
    formatCategoryLabel(transaction.category),
    formatRelativeDate(transaction.date),
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '12px 0',
        borderBottom: '1px solid var(--border-subtle)',
        opacity: transaction.pending ? 0.6 : 1,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
            fontWeight: 500,
            color: 'var(--fg-1)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {transaction.merchantName || transaction.name}
        </div>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--fg-3)' }}>
          {subtitle}
          {transaction.pending && ' · Pending'}
        </div>
      </div>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '14px',
          fontWeight: 500,
          color: isIncome ? 'var(--positive)' : 'var(--fg-1)',
          flexShrink: 0,
        }}
      >
        {isIncome ? '+' : '-'}
        {formatCurrency(displayAmount)}
      </span>
    </div>
  );
}
