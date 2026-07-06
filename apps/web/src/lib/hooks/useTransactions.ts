// Stub — Phase 2 will implement full data fetching
import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';
import type { Transaction } from '@/types/domain';
import type { PaginatedResponse, TransactionListParams } from '@/types/api';

export function useTransactions(params: TransactionListParams = {}) {
  const { data: session } = useSession();

  const query = new URLSearchParams();
  if (params.accountId) query.set('account_id', params.accountId);
  if (params.categoryId) query.set('category_id', params.categoryId);
  if (params.startDate) query.set('start_date', params.startDate);
  if (params.endDate) query.set('end_date', params.endDate);
  if (params.search) query.set('search', params.search);
  if (params.page) query.set('page', String(params.page));
  if (params.pageSize) query.set('page_size', String(params.pageSize));

  return useQuery<PaginatedResponse<Transaction>>({
    queryKey: ['transactions', params],
    queryFn: () =>
      apiClient.get<PaginatedResponse<Transaction>>(
        `/api/v1/transactions?${query.toString()}`,
        { token: session?.accessToken },
      ),
    enabled: !!session?.accessToken,
  });
}
