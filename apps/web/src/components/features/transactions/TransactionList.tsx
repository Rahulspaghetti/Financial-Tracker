'use client';

import { TransactionRow } from './TransactionRow';
import type { Transaction } from '@/types/domain';

interface TransactionListProps {
  transactions: Transaction[];
  emptyMessage?: string;
}

export function TransactionList({
  transactions,
  emptyMessage = 'No transactions yet.',
}: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <p style={{ fontFamily: 'var(--font-body)', fontSize: '14px', color: 'var(--fg-3)', padding: '24px 0' }}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div>
      {transactions.map((tx) => (
        <TransactionRow key={tx.id} transaction={tx} />
      ))}
    </div>
  );
}
