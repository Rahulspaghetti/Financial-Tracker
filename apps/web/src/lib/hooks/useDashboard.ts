// Stub — Phase 2 will implement full data fetching
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import type { SpendingSummary, Period } from '@/types/domain';

export function useDashboard(period: Period = 'month') {
  const { data: session } = useSession();

  return useQuery<SpendingSummary>({
    queryKey: ['dashboard', period],
    queryFn: () =>
      apiClient.get<SpendingSummary>(`/api/v1/transactions/summary?period=${period}`, {
        token: session?.accessToken,
      }),
    enabled: !!session?.accessToken,
  });
}
