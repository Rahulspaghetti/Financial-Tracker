'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { GoogleButton } from './GoogleButton';
import { AuthField } from './AuthField';
import { signInSchema } from '@/lib/validations/auth';

// ── Tally wordmark (inline so no network round-trip on the login page) ────────

function TallyWordmark({ size = 26 }: { size?: number }) {
  return (
    <span
      aria-label="Tally"
      style={{
        fontFamily: 'var(--font-display)',
        fontSize: `${size}px`,
        color: 'var(--accent)',
        letterSpacing: '-1px',
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'baseline',
      }}
    >
      Tally
      <span
        aria-hidden="true"
        style={{
          display: 'inline-block',
          width: '1.75px',
          height: `${Math.round(size * 0.27)}px`,
          background: 'var(--accent)',
          borderRadius: '1px',
          marginLeft: '1px',
          marginBottom: `${Math.round(size * 0.34)}px`,
          verticalAlign: 'bottom',
        }}
      />
    </span>
  );
}

// ── Divider ───────────────────────────────────────────────────────────────────

function OrDivider() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '24px 0',
      }}
    >
      <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
      <span
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--fg-3)',
          whiteSpace: 'nowrap',
        }}
      >
        or sign in with email
      </span>
      <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
    </div>
  );
}

// ── Main LoginCard ────────────────────────────────────────────────────────────

export function LoginCard() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState<{ email?: string; password?: string }>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const parsed = signInSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors: { email?: string; password?: string } = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as 'email' | 'password';
        if (!fieldErrors[key]) fieldErrors[key] = issue.message;
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const result = await signIn('credentials', {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    setLoading(false);

    if (result?.error) {
      setSubmitError('Invalid email or password');
      return;
    }

    router.push('/dashboard');
  }

  return (
    <div style={{ width: '100%', maxWidth: '360px' }}>
      {/* Logo */}
      <div style={{ marginBottom: '32px' }}>
        <TallyWordmark size={26} />
      </div>

      {/* Heading */}
      <h2
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 'var(--weight-regular)',
          fontSize: 'var(--text-3xl)',
          lineHeight: '1.1',
          letterSpacing: '-0.02em',
          color: 'var(--fg-1)',
          margin: '0 0 8px',
        }}
      >
        Sign in
      </h2>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-md)',
          color: 'var(--fg-2)',
          lineHeight: '1.5',
          margin: '0 0 32px',
        }}
      >
        Your money, at a glance. Connect once and let Tally do the reading.
      </p>

      {/* Google OAuth */}
      <GoogleButton callbackUrl="/dashboard" />

      <OrDivider />

      {/* Email / password form */}
      <form onSubmit={handleSubmit}>
        <AuthField
          label="Email"
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={setEmail}
          error={errors.email}
        />
        <AuthField
          label="Password"
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
          error={errors.password}
        />

        {submitError ? (
          <p
            style={{
              margin: '0 0 12px',
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--danger, #c0392b)',
            }}
          >
            {submitError}
          </p>
        ) : null}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '16px',
          }}
        >
          <a
            href="#"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              color: 'var(--fg-3)',
              borderBottom: '1px solid var(--border-subtle)',
            }}
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '13px 20px',
            background: loading ? 'var(--fg-3)' : 'var(--accent)',
            color: 'var(--fg-onAccent)',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-md)',
            fontWeight: 'var(--weight-medium)',
            cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: [
              'background var(--duration-micro) var(--ease-settle)',
              'transform var(--duration-micro) var(--ease-settle)',
            ].join(', '),
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--accent-hover)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'var(--accent)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.transform = 'scale(0.98)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {loading ? 'Signing in…' : 'Sign in'}
          <ArrowRight size={14} strokeWidth={1.75} color="currentColor" />
        </button>
      </form>

      {/* Legal */}
      <p
        style={{
          marginTop: '24px',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-xs)',
          color: 'var(--fg-3)',
          lineHeight: '1.55',
          textAlign: 'center',
        }}
      >
        By continuing you agree to our{' '}
        <a
          href="#"
          style={{ color: 'var(--fg-2)', borderBottom: '1px solid var(--border-subtle)' }}
        >
          Terms of service
        </a>{' '}
        and{' '}
        <a
          href="#"
          style={{ color: 'var(--fg-2)', borderBottom: '1px solid var(--border-subtle)' }}
        >
          Privacy policy
        </a>
        . We use Plaid to connect your bank — your credentials never touch our servers.
      </p>

      {/* Footer */}
      <div
        style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid var(--border-subtle)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          color: 'var(--fg-3)',
          textAlign: 'center',
        }}
      >
        No account yet?{' '}
        <Link href="/signup" style={{ color: 'var(--accent)', fontWeight: 'var(--weight-medium)' }}>
          Create one — it&apos;s free
        </Link>
      </div>
    </div>
  );
}
