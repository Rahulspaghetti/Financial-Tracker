'use client';

import { PlaidConnectButton } from '@/components/features/accounts/PlaidConnectButton';
import { useAccounts, usePlaidSync } from '@/lib/hooks/useAccounts';
import { formatCurrency } from '@/lib/format';

export function AccountsContent() {
  const { data: accounts, isLoading } = useAccounts();
  const sync = usePlaidSync();

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '12px',
          flexWrap: 'wrap',
        }}
      >
        <PlaidConnectButton />
        {accounts && accounts.length > 0 && (
          <button
            type="button"
            onClick={() => sync.mutate()}
            disabled={sync.isPending}
            style={{
              height: '40px',
              padding: '0 16px',
              borderRadius: '8px',
              border: '1px solid var(--border-default)',
              background: 'var(--surface-raised)',
              fontFamily: 'var(--font-body)',
              fontSize: '14px',
              cursor: sync.isPending ? 'not-allowed' : 'pointer',
              opacity: sync.isPending ? 0.6 : 1,
            }}
          >
            {sync.isPending ? 'Syncing…' : 'Sync now'}
          </button>
        )}
      </div>

      {isLoading && <p style={{ color: 'var(--fg-3)' }}>Loading accounts…</p>}

      {!isLoading && (!accounts || accounts.length === 0) && (
        <div
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            borderRadius: '16px',
            border: '1px dashed var(--border-default)',
            background: 'var(--surface-raised)',
          }}
        >
          <p style={{ fontSize: '15px', color: 'var(--fg-2)', marginBottom: '8px' }}>
            No accounts connected
          </p>
          <p style={{ fontSize: '13px', color: 'var(--fg-3)' }}>
            Link your bank to see balances and transactions.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {accounts?.map((account) => (
          <div
            key={account.id}
            style={{
              padding: '20px',
              borderRadius: '12px',
              background: 'var(--surface-raised)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--fg-1)' }}>
                {account.name}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--fg-3)', marginTop: '2px' }}>
                {account.institutionName ?? 'Bank'} · {account.type}
                {account.subtype ? ` · ${account.subtype}` : ''}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '18px', fontWeight: 500 }}>
                {formatCurrency(account.balanceCurrent)}
              </div>
              {account.balanceAvailable != null && (
                <div style={{ fontSize: '12px', color: 'var(--fg-3)' }}>
                  {formatCurrency(account.balanceAvailable)} available
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
