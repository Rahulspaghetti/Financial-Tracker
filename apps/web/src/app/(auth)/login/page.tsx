import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LoginCard } from '@/components/features/auth/LoginCard';
import { Shield, Lock, Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Sign in',
};

// ── Trust badge row ───────────────────────────────────────────────────────────

function TrustBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontFamily: 'var(--font-body)',
        fontSize: 'var(--text-sm)',
        color: 'var(--fg-3)',
      }}
    >
      {icon}
      {label}
    </span>
  );
}

// ── Stat badge ────────────────────────────────────────────────────────────────

function StatBadge({ value, label }: { value: string; label: string }) {
  return (
    <div
      style={{
        background: 'var(--surface-raised)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 20px',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'var(--text-3xl)',
          lineHeight: 1,
          letterSpacing: '-0.02em',
          color: 'var(--fg-1)',
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--fg-3)',
          marginTop: '4px',
        }}
      >
        {label}
      </div>
    </div>
  );
}

// ── Login page ────────────────────────────────────────────────────────────────

export default async function LoginPage() {
  // Server-side: if already authenticated, redirect to dashboard
  const session = await auth();
  if (session) redirect('/dashboard');

  const iconProps = { size: 14, strokeWidth: 1.75, color: 'currentColor' } as const;

  return (
    <>
      {/*
        Inline styles are used instead of Tailwind utilities here so the
        page works even before Tailwind is configured in Phase 2.
        This mirrors the approved index.html prototype exactly.
      */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .login-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--surface-canvas);
        }
        .login-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 48px;
          border-bottom: 1px solid var(--border-subtle);
          position: sticky;
          top: 0;
          z-index: 10;
          background: var(--surface-canvas);
        }
        .login-wordmark {
          font-family: var(--font-display);
          font-size: 28px;
          line-height: 1;
          color: var(--accent);
          letter-spacing: -1px;
          display: inline-flex;
          align-items: baseline;
        }
        .login-wordmark-tick {
          display: inline-block;
          width: 1.75px;
          height: 8px;
          background: var(--accent);
          border-radius: 1px;
          margin-left: 1px;
          margin-bottom: 10px;
          vertical-align: bottom;
        }
        .login-topbar-links {
          display: flex;
          gap: 28px;
          align-items: center;
        }
        .login-topbar-links a {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          color: var(--fg-2);
          text-decoration: none;
          border-bottom: none;
          transition: color var(--duration-micro) var(--ease-settle);
        }
        .login-topbar-links a:hover { color: var(--fg-1); }
        .login-main {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 480px;
          min-height: calc(100vh - 65px);
        }
        .login-hero {
          padding: 80px 64px 80px 48px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 680px;
        }
        .login-hero-eyebrow {
          font-family: var(--font-body);
          font-size: var(--text-2xs);
          font-weight: var(--weight-medium);
          letter-spacing: var(--tracking-caps);
          text-transform: uppercase;
          color: var(--fg-3);
          margin: 0 0 20px;
        }
        .login-hero h1 {
          font-family: var(--font-display);
          font-weight: 400;
          font-size: 72px;
          line-height: 0.97;
          letter-spacing: -0.03em;
          color: var(--fg-1);
          margin: 0 0 24px;
        }
        .login-hero h1 em {
          color: var(--accent);
          font-style: italic;
        }
        .login-hero-body {
          font-family: var(--font-body);
          font-size: var(--text-lg);
          line-height: 1.6;
          color: var(--fg-2);
          margin: 0 0 40px;
          max-width: 480px;
        }
        .login-trust-row {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          align-items: center;
        }
        .login-stats {
          display: flex;
          gap: 20px;
          margin-top: 48px;
        }
        .login-auth-panel {
          background: var(--surface-raised);
          border-left: 1px solid var(--border-subtle);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
        }
        @media (max-width: 900px) {
          .login-topbar { padding: 18px 24px; }
          .login-topbar-links { display: none; }
          .login-main { grid-template-columns: 1fr; }
          .login-hero {
            padding: 48px 24px 32px;
            max-width: 100%;
          }
          .login-hero h1 { font-size: 52px; }
          .login-stats { flex-wrap: wrap; }
          .login-auth-panel {
            border-left: none;
            border-top: 1px solid var(--border-subtle);
            padding: 40px 24px 56px;
          }
        }
      `}</style>

      <div className="login-page">
        {/* Top bar */}
        <header className="login-topbar">
          <span className="login-wordmark" aria-label="Tally">
            Tally<span className="login-wordmark-tick" aria-hidden="true" />
          </span>
          <nav className="login-topbar-links">
            <a href="#">Security</a>
            <a href="#">How it works</a>
            <a href="#">Pricing</a>
          </nav>
        </header>

        {/* Main split */}
        <main className="login-main">
          {/* Left: hero */}
          <section className="login-hero">
            <p className="login-hero-eyebrow">AI-powered personal finance</p>
            <h1>
              Money,
              <br />
              <em>understood.</em>
            </h1>
            <p className="login-hero-body">
              Connect your accounts in 30 seconds. Tally reads your transactions and answers
              plain-English questions about how you spend — without ever touching your credentials.
            </p>

            <div className="login-trust-row">
              <TrustBadge icon={<Shield {...iconProps} />} label="Secured by Plaid" />
              <TrustBadge icon={<Lock {...iconProps} />} label="Bank-level encryption" />
              <TrustBadge icon={<Clock {...iconProps} />} label="Read-only access" />
            </div>

            <div className="login-stats">
              <StatBadge value="$0" label="Free to start" />
              <StatBadge value="30s" label="To connect your bank" />
              <StatBadge value="100%" label="Read-only access" />
            </div>
          </section>

          {/* Right: auth panel */}
          <aside className="login-auth-panel">
            <LoginCard />
          </aside>
        </main>
      </div>
    </>
  );
}
