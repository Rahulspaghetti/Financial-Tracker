'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { AuthField } from './AuthField';
import { signUpSchema, type SignUpInput } from '@/lib/validations/auth';
import { apiClient, TallyApiError } from '@/lib/api-client';

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

export function SignUpCard() {
  const router = useRouter();
  const [form, setForm] = React.useState<SignUpInput>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const [errors, setErrors] = React.useState<Partial<Record<keyof SignUpInput, string>>>({});
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  function updateField<K extends keyof SignUpInput>(key: K, value: SignUpInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
    setSubmitError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const parsed = signUpSchema.safeParse(form);
    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof SignUpInput, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof SignUpInput;
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/api/v1/auth/register', {
        email: parsed.data.email,
        first_name: parsed.data.firstName,
        last_name: parsed.data.lastName,
        password: parsed.data.password,
      });

      const result = await signIn('credentials', {
        email: parsed.data.email,
        password: parsed.data.password,
        redirect: false,
      });

      if (result?.error) {
        setSubmitError('Account created, but sign-in failed. Please sign in manually.');
        router.push('/login');
        return;
      }

      router.push('/dashboard');
    } catch (err) {
      if (err instanceof TallyApiError) {
        setSubmitError(typeof err.detail === 'string' ? err.detail : 'Could not create account');
      } else if (err instanceof TypeError) {
        setSubmitError(
          'Cannot reach the server. Make sure the API is running at http://localhost:8000.',
        );
      } else {
        setSubmitError('Could not create account. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '360px' }}>
      <div style={{ marginBottom: '32px' }}>
        <TallyWordmark size={26} />
      </div>

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
        Create account
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
        Start tracking your money in minutes. Free to get started.
      </p>

      <form onSubmit={handleSubmit}>
        <AuthField
          label="Email"
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={form.email}
          onChange={(v) => updateField('email', v)}
          error={errors.email}
        />
        <AuthField
          label="First name"
          id="firstName"
          type="text"
          placeholder="Jane"
          autoComplete="given-name"
          value={form.firstName}
          onChange={(v) => updateField('firstName', v)}
          error={errors.firstName}
        />
        <AuthField
          label="Last name"
          id="lastName"
          type="text"
          placeholder="Doe"
          autoComplete="family-name"
          value={form.lastName}
          onChange={(v) => updateField('lastName', v)}
          error={errors.lastName}
        />
        <AuthField
          label="Password"
          id="password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          value={form.password}
          onChange={(v) => updateField('password', v)}
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
          }}
        >
          {loading ? 'Creating account…' : 'Create account'}
          {!loading ? <ArrowRight size={14} strokeWidth={1.75} color="currentColor" /> : null}
        </button>
      </form>

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
        Already have an account?{' '}
        <Link href="/login" style={{ color: 'var(--accent)', fontWeight: 'var(--weight-medium)' }}>
          Sign in
        </Link>
      </div>
    </div>
  );
}
