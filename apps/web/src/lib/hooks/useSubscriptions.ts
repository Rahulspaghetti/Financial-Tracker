import { useQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { apiClient } from '@/lib/api-client';

export interface Subscription {
  merchantName: string;
  amount: number;
  frequency: string;
  lastChargeDate: string;
  nextEstimatedDate: string;
  category: string | null;
  logoUrl: string | null;
  isActive: boolean;
}

export function useSubscriptions() {
  const { data: session } = useSession();

  return useQuery<Subscription[]>({
    queryKey: ['subscriptions'],
    queryFn: () =>
      apiClient.get<Subscription[]>('/api/v1/subscriptions', {
        token: session?.accessToken,
      }),
    enabled: !!session?.accessToken,
  });
}
