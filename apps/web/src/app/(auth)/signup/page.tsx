import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { SignUpCard } from '@/components/features/auth/SignUpCard';

export const metadata: Metadata = {
  title: 'Create account',
};

export default async function SignUpPage() {
  const session = await auth();
  if (session) redirect('/dashboard');

  return (
    <>
      <style>{`
        .signup-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--surface-canvas);
        }
        .signup-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 48px;
          border-bottom: 1px solid var(--border-subtle);
          background: var(--surface-canvas);
        }
        .signup-wordmark {
          font-family: var(--font-display);
          font-size: 28px;
          line-height: 1;
          color: var(--accent);
          letter-spacing: -1px;
        }
        .signup-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 24px;
        }
        .signup-panel {
          width: 100%;
          max-width: 480px;
          background: var(--surface-raised);
          border: 1px solid var(--border-subtle);
          border-radius: var(--radius-lg);
          padding: 48px 40px;
          box-shadow: var(--shadow-sm);
        }
      `}</style>

      <div className="signup-page">
        <header className="signup-topbar">
          <span className="signup-wordmark" aria-label="Tally">
            Tally
          </span>
        </header>
        <main className="signup-main">
          <div className="signup-panel">
            <SignUpCard />
          </div>
        </main>
      </div>
    </>
  );
}
