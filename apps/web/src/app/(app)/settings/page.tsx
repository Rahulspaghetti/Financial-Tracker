import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings',
};

export default function SettingsPage() {
  return (
    <div>
      <h1
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 400,
          fontSize: 'var(--text-4xl)',
          letterSpacing: '-0.02em',
          color: 'var(--fg-1)',
          marginBottom: '8px',
        }}
      >
        Settings
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-md)',
          color: 'var(--fg-3)',
        }}
      >
        Coming in Phase 2 — profile, notifications, and connected accounts.
      </p>
    </div>
  );
}
