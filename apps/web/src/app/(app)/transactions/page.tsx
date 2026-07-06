import type { Metadata } from 'next';
import { TransactionsContent } from '@/components/features/transactions/TransactionsContent';

export const metadata: Metadata = {
  title: 'Transactions',
};

export default function TransactionsPage() {
  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: 'var(--text-4xl)',
          letterSpacing: '-0.02em',
          color: 'var(--fg-1)',
          marginBottom: '24px',
        }}
      >
        Transactions
      </h1>
      <TransactionsContent />
    </div>
  );
}
