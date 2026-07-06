import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import type { Account } from '@/types/domain';

export function useAccounts() {
  const { data: session } = useSession();

  return useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () =>
      apiClient.get<Account[]>('/api/v1/accounts', { token: session?.accessToken }),
    enabled: !!session?.accessToken,
  });
}

export function usePlaidSync() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () =>
      apiClient.post<{ transactionsSynced: number; message: string }>(
        '/api/v1/plaid/sync',
        {},
        { token: session?.accessToken },
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}
