'use client';

import { formatCurrency } from '@/lib/format';
import { formatCategoryLabel } from '@/lib/categories';
import { CategoryIcon } from '@/components/features/shared/CategoryIcon';
import type { CategorySpend } from '@/types/domain';

interface CategoryBreakdownProps {
  items: CategorySpend[];
}

export function CategoryBreakdown({ items }: CategoryBreakdownProps) {
  if (items.length === 0) {
    return (
      <p style={{ fontSize: '14px', color: 'var(--fg-3)' }}>No spending data for this period.</p>
    );
  }

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
          By category
        </span>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '12px', color: 'var(--fg-3)' }}>
          Top {items.length}
        </span>
      </div>
      {items.map((row) => (
          <div
            key={row.category}
            style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}
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
                flexShrink: 0,
              }}
            >
              <CategoryIcon category={row.category} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'baseline',
                }}
              >
                <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500, color: 'var(--fg-1)' }}>
                  {formatCategoryLabel(row.category)}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--fg-2)' }}>
                  {formatCurrency(row.amount)}
                </span>
              </div>
              <div
                style={{
                  height: '4px',
                  borderRadius: '2px',
                  background: 'var(--surface-sunken)',
                  marginTop: '6px',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${Math.min(row.percentage * 100, 100)}%`,
                    height: '100%',
                    background: 'var(--accent)',
                    borderRadius: '2px',
                  }}
                />
              </div>
            </div>
          </div>
        ))}
    </div>
  );
}
