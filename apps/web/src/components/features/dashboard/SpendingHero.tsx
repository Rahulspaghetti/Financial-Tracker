'use client';

import { ArrowDown, ArrowUp } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/format';
import type { Period } from '@/types/domain';

interface SpendingHeroProps {
  totalSpend: number;
  spendDelta: number;
  period: Period;
}

const PERIOD_LABELS: Record<Period, string> = {
  week: 'this week',
  month: 'this month',
  quarter: 'this quarter',
  year: 'this year',
};

export function SpendingHero({ totalSpend, spendDelta, period }: SpendingHeroProps) {
  const dollars = Math.floor(totalSpend);
  const cents = Math.round((totalSpend - dollars) * 100)
    .toString()
    .padStart(2, '0');
  const isUp = spendDelta > 0;

  return (
    <div style={{ marginBottom: '24px' }}>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: '12px',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--fg-3)',
          marginBottom: '6px',
        }}
      >
        Spent {PERIOD_LABELS[period]}
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '60px',
            lineHeight: 1,
            letterSpacing: '-0.03em',
            color: 'var(--fg-1)',
          }}
        >
          {formatCurrency(dollars).replace('.00', '')}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: '32px',
            color: 'var(--fg-3)',
          }}
        >
          .{cents}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: isUp ? 'var(--negative-soft)' : 'var(--positive-soft)',
            color: isUp ? 'var(--negative-ink)' : 'var(--positive-ink)',
            padding: '3px 8px',
            borderRadius: '9999px',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 500,
          }}
        >
          {isUp ? (
            <ArrowUp size={11} strokeWidth={1.75} />
          ) : (
            <ArrowDown size={11} strokeWidth={1.75} />
          )}
          {formatPercent(spendDelta)}
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--fg-2)' }}>
          vs last period
        </span>
      </div>
    </div>
  );
}
