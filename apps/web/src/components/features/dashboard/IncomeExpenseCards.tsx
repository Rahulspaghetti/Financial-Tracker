'use client';

import { formatCurrency } from '@/lib/format';

interface IncomeExpenseCardsProps {
  totalIncome: number;
  totalSpend: number;
  netCashFlow: number;
}

function StatCard({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        padding: '16px',
        borderRadius: '12px',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          color: 'var(--fg-3)',
          marginBottom: '4px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '20px',
          fontWeight: 500,
          color: accent ? 'var(--accent)' : 'var(--fg-1)',
        }}
      >
        {value}
      </div>
    </div>
  );
}

export function IncomeExpenseCards({ totalIncome, totalSpend, netCashFlow }: IncomeExpenseCardsProps) {
  return (
    <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
      <StatCard label="Income" value={formatCurrency(totalIncome)} />
      <StatCard label="Expenses" value={formatCurrency(totalSpend)} />
      <StatCard
        label="Net cash flow"
        value={formatCurrency(netCashFlow, { showSign: true })}
        accent
      />
    </div>
  );
}
