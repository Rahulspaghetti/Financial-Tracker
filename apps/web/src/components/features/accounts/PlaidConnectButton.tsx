'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePlaidLink, type PlaidLinkOnSuccess } from 'react-plaid-link';
import { useSession } from 'next-auth/react';
import { useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

interface PlaidConnectButtonProps {
  onSuccess?: () => void;
}

export function PlaidConnectButton({ onSuccess }: PlaidConnectButtonProps) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session?.accessToken) return;

    apiClient
      .post<{ linkToken: string }>(
        '/api/v1/plaid/link-token',
        {},
        { token: session.accessToken },
      )
      .then((res) => setLinkToken(res.linkToken))
      .catch((err: Error) => setError(err.message));
  }, [session?.accessToken]);

  const handleSuccess: PlaidLinkOnSuccess = useCallback(
    async (publicToken, metadata) => {
      if (!session?.accessToken) return;
      setLoading(true);
      setError(null);
      try {
        await apiClient.post(
          '/api/v1/plaid/exchange',
          {
            public_token: publicToken,
            institution_id: metadata.institution?.institution_id ?? '',
            institution_name: metadata.institution?.name ?? 'Bank',
          },
          { token: session.accessToken },
        );
        await queryClient.invalidateQueries({ queryKey: ['accounts'] });
        await queryClient.invalidateQueries({ queryKey: ['transactions'] });
        await queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        await queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to connect account');
      } finally {
        setLoading(false);
      }
    },
    [session?.accessToken, queryClient, onSuccess],
  );

  const { open, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: handleSuccess,
  });

  return (
    <div>
      <button
        type="button"
        disabled={!ready || loading || !linkToken}
        onClick={() => open()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '40px',
          padding: '0 16px',
          fontFamily: 'var(--font-body)',
          fontSize: '15px',
          fontWeight: 500,
          color: 'var(--fg-onAccent)',
          background: 'var(--accent)',
          border: 'none',
          borderRadius: '8px',
          cursor: ready && !loading ? 'pointer' : 'not-allowed',
          opacity: ready && !loading ? 1 : 0.6,
        }}
      >
        {loading ? 'Connecting…' : 'Connect account'}
      </button>
      {error && (
        <p style={{ marginTop: '8px', fontSize: '13px', color: 'var(--negative)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
