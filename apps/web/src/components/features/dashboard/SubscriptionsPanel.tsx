'use client';

import { Repeat } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Subscription } from '@/lib/hooks/useSubscriptions';

interface SubscriptionsPanelProps {
  subscriptions: Subscription[];
}

export function SubscriptionsPanel({ subscriptions }: SubscriptionsPanelProps) {
  const active = subscriptions.filter((s) => s.isActive);
  const monthlyTotal = active.reduce((sum, s) => {
    if (s.frequency === 'annual') return sum + s.amount / 12;
    if (s.frequency === 'weekly') return sum + s.amount * 4.33;
    return sum + s.amount;
  }, 0);

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '14px',
        }}
      >
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--fg-1)' }}>
          Subscriptions
        </span>
        {active.length > 0 && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--fg-2)' }}>
            {formatCurrency(monthlyTotal)}/mo est.
          </span>
        )}
      </div>
      {active.length === 0 ? (
        <p style={{ fontSize: '14px', color: 'var(--fg-3)' }}>No recurring charges detected yet.</p>
      ) : (
        active.slice(0, 5).map((sub) => (
          <div
            key={`${sub.merchantName}-${sub.amount}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 0',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'var(--accent-soft)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent)',
              }}
            >
              <Repeat size={14} strokeWidth={1.75} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--fg-1)' }}>
                {sub.merchantName}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--fg-3)' }}>
                {sub.frequency} · last {formatDate(sub.lastChargeDate)}
              </div>
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--fg-2)' }}>
              {formatCurrency(sub.amount)}
            </span>
          </div>
        ))
      )}
    </div>
  );
}
