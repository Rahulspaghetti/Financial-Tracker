'use client';

import type { Period } from '@/types/domain';

interface PeriodChipsProps {
  value: Period;
  onChange: (period: Period) => void;
}

const OPTIONS: { value: Period; label: string }[] = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'quarter', label: 'Quarter' },
  { value: 'year', label: 'Year' },
];

export function PeriodChips({ value, onChange }: PeriodChipsProps) {
  return (
    <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            style={{
              padding: '6px 14px',
              borderRadius: '9999px',
              fontFamily: 'var(--font-body)',
              fontSize: '13px',
              fontWeight: 500,
              border: active ? '1px solid var(--accent)' : '1px solid var(--border-subtle)',
              background: active ? 'var(--accent-soft)' : 'transparent',
              color: active ? 'var(--accent)' : 'var(--fg-2)',
              cursor: 'pointer',
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
