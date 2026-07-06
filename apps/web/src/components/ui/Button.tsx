'use client';

import * as React from 'react';
import { clsx } from 'clsx';

// ── Types ─────────────────────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'ghost' | 'outline' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Full-width block button */
  block?: boolean;
}

// ── Styles ────────────────────────────────────────────────────────────────────

const base = [
  'inline-flex items-center justify-center gap-2',
  'font-medium leading-none select-none',
  'border rounded-[8px]',
  'transition-[background-color,border-color,box-shadow,transform]',
  'duration-[200ms]',
  'ease-[cubic-bezier(0.32,0.72,0,1)]',
  'focus-visible:outline-none focus-visible:shadow-[var(--shadow-focus)]',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  // Press scale — applied via CSS custom property so it can be overridden
  'active:scale-[0.98]',
].join(' ');

const variants: Record<ButtonVariant, string> = {
  primary: [
    'bg-[var(--accent)] text-[var(--fg-onAccent)]',
    'border-transparent',
    'hover:bg-[var(--accent-hover)]',
    'active:bg-[var(--accent-press)]',
  ].join(' '),

  ghost: [
    'bg-transparent text-[var(--fg-2)]',
    'border-transparent',
    'hover:bg-[var(--surface-sunken)] hover:text-[var(--fg-1)]',
  ].join(' '),

  outline: [
    'bg-transparent text-[var(--fg-1)]',
    'border-[var(--border-default)]',
    'hover:border-[var(--border-strong)] hover:bg-[var(--surface-sunken)]',
    'shadow-[var(--shadow-sm)]',
  ].join(' '),

  destructive: [
    'bg-[var(--negative)] text-white',
    'border-transparent',
    'hover:opacity-90',
    'active:opacity-100',
  ].join(' '),
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-[13px]',
  md: 'h-10 px-4 text-[15px]',
  lg: 'h-12 px-5 text-[15px]',
};

// ── Component ─────────────────────────────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      block = false,
      disabled,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled ?? loading}
        className={clsx(
          base,
          variants[variant],
          sizes[size],
          block && 'w-full',
          className,
        )}
        {...props}
      >
        {loading && (
          <svg
            aria-hidden="true"
            className="animate-spin"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.75}
          >
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
