'use client';

import { useState } from 'react';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { useSubscriptions } from '@/lib/hooks/useSubscriptions';
import { SpendingHero } from '@/components/features/dashboard/SpendingHero';
import { PeriodChips } from '@/components/features/dashboard/PeriodChips';
import { IncomeExpenseCards } from '@/components/features/dashboard/IncomeExpenseCards';
import { CategoryBreakdown } from '@/components/features/dashboard/CategoryBreakdown';
import { CashFlowSparkline } from '@/components/features/dashboard/CashFlowSparkline';
import { SubscriptionsPanel } from '@/components/features/dashboard/SubscriptionsPanel';
import { TransactionList } from '@/components/features/transactions/TransactionList';
import type { Period } from '@/types/domain';

function Card({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div
      style={{
        padding: '20px',
        borderRadius: '16px',
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-sm)',
        marginBottom: '18px',
      }}
    >
      {title && (
        <h2
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--fg-1)',
            marginBottom: '14px',
          }}
        >
          {title}
        </h2>
      )}
      {children}
    </div>
  );
}

export function DashboardContent() {
  const [period, setPeriod] = useState<Period>('month');
  const { data: summary, isLoading, error } = useDashboard(period);
  const { data: recentTx } = useTransactions({ page: 1, pageSize: 7 });
  const { data: subscriptions } = useSubscriptions();

  if (isLoading) {
    return <p style={{ color: 'var(--fg-3)' }}>Loading dashboard…</p>;
  }

  if (error || !summary) {
    return (
      <div>
        <SpendingHero totalSpend={0} spendDelta={0} period={period} />
        <PeriodChips value={period} onChange={setPeriod} />
        <Card>
          <p style={{ color: 'var(--fg-3)', fontSize: '14px' }}>
            Connect an account to see your spending summary.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <SpendingHero
        totalSpend={summary.totalSpend}
        spendDelta={summary.spendDelta}
        period={period}
      />
      <PeriodChips value={period} onChange={setPeriod} />
      <IncomeExpenseCards
        totalIncome={summary.totalIncome}
        totalSpend={summary.totalSpend}
        netCashFlow={summary.netCashFlow}
      />
      <Card title="Cash flow">
        <CashFlowSparkline data={summary.dailyTotals} />
      </Card>
      <Card>
        <CategoryBreakdown items={summary.byCategory} />
      </Card>
      <Card>
        <SubscriptionsPanel subscriptions={subscriptions ?? []} />
      </Card>
      <Card title="Recent transactions">
        <TransactionList
          transactions={recentTx?.data ?? []}
          emptyMessage="No transactions yet. Connect an account to get started."
        />
      </Card>
    </div>
  );
}
