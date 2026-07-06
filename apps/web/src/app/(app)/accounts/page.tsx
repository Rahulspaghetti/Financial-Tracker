import type { Metadata } from 'next';
import { AccountsContent } from '@/components/features/accounts/AccountsContent';

export const metadata: Metadata = {
  title: 'Accounts',
};

export default function AccountsPage() {
  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: 'var(--text-4xl)',
          letterSpacing: '-0.02em',
          color: 'var(--fg-1)',
          marginBottom: '24px',
        }}
      >
        Accounts
      </h1>
      <AccountsContent />
    </div>
  );
}
