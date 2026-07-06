'use client';

import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

export function TopBar() {
  const { data: session } = useSession();

  return (
    <header
      style={{
        height: '60px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--surface-canvas)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '22px',
          color: 'var(--accent)',
          letterSpacing: '-1px',
        }}
      >
        Tally
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '1.75px',
            height: '6px',
            background: 'var(--accent)',
            borderRadius: '1px',
            marginLeft: '1px',
            marginBottom: '8px',
            verticalAlign: 'bottom',
          }}
        />
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {session?.user?.name && (
          <span style={{ fontSize: '14px', color: 'var(--fg-2)' }}>{session.user.name}</span>
        )}
        {session?.user?.image && (
          <Image
            src={session.user.image}
            alt=""
            width={32}
            height={32}
            style={{ borderRadius: '50%' }}
          />
        )}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: '/login' })}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            color: 'var(--fg-3)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-subtle)',
            cursor: 'pointer',
            background: 'transparent',
          }}
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
