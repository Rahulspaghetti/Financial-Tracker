'use client';

import type { TransactionListParams } from '@/types/api';

interface FilterBarProps {
  params: TransactionListParams;
  onChange: (params: TransactionListParams) => void;
}

export function FilterBar({ params, onChange }: FilterBarProps) {
  return (
    <div
      style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}
    >
      <input
        type="search"
        placeholder="Search transactions"
        value={params.search ?? ''}
        onChange={(e) => onChange({ ...params, search: e.target.value || undefined, page: 1 })}
        style={{
          flex: 1,
          minWidth: '200px',
          height: '40px',
          padding: '0 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-default)',
          background: 'var(--surface-raised)',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--fg-1)',
        }}
      />
      <input
        type="date"
        value={params.startDate ?? ''}
        onChange={(e) => onChange({ ...params, startDate: e.target.value || undefined, page: 1 })}
        style={{
          height: '40px',
          padding: '0 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-default)',
          background: 'var(--surface-raised)',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
        }}
      />
      <input
        type="date"
        value={params.endDate ?? ''}
        onChange={(e) => onChange({ ...params, endDate: e.target.value || undefined, page: 1 })}
        style={{
          height: '40px',
          padding: '0 12px',
          borderRadius: '8px',
          border: '1px solid var(--border-default)',
          background: 'var(--surface-raised)',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
        }}
      />
    </div>
  );
}
