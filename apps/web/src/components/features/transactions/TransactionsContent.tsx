'use client';

import { useState } from 'react';
import { useTransactions } from '@/lib/hooks/useTransactions';
import { FilterBar } from '@/components/features/transactions/FilterBar';
import { TransactionList } from '@/components/features/transactions/TransactionList';
import type { TransactionListParams } from '@/types/api';

export function TransactionsContent() {
  const [params, setParams] = useState<TransactionListParams>({ page: 1, pageSize: 25 });
  const { data, isLoading } = useTransactions(params);

  return (
    <div>
      <FilterBar params={params} onChange={setParams} />

      {isLoading && <p style={{ color: 'var(--fg-3)' }}>Loading transactions…</p>}

      <TransactionList transactions={data?.data ?? []} />

      {data && data.total > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <span style={{ fontSize: '13px', color: 'var(--fg-3)' }}>
            Page {data.page} · {data.total} total
          </span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              disabled={data.page <= 1}
              onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-default)',
                background: 'var(--surface-raised)',
                fontSize: '13px',
                cursor: data.page <= 1 ? 'not-allowed' : 'pointer',
                opacity: data.page <= 1 ? 0.5 : 1,
              }}
            >
              Previous
            </button>
            <button
              type="button"
              disabled={!data.hasNextPage}
              onClick={() => setParams((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border-default)',
                background: 'var(--surface-raised)',
                fontSize: '13px',
                cursor: !data.hasNextPage ? 'not-allowed' : 'pointer',
                opacity: !data.hasNextPage ? 0.5 : 1,
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
