import type { Metadata } from 'next';
import { DashboardContent } from '@/components/features/dashboard/DashboardContent';

export const metadata: Metadata = {
  title: 'Dashboard',
};

export default function DashboardPage() {
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
        Dashboard
      </h1>
      <DashboardContent />
    </div>
  );
}
