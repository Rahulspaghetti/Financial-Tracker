'use client';

import * as React from 'react';
import { clsx } from 'clsx';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  /** Lucide icon rendered on the left side */
  leadingIcon?: React.ReactNode;
  /** Content rendered on the right side (e.g. a clear button) */
  trailingContent?: React.ReactNode;
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leadingIcon, trailingContent, className, id, ...props }, ref) => {
    const inputId = id ?? `input-${React.useId()}`;
    const errorId = `${inputId}-error`;

    return (
      <div className="flex flex-col gap-[6px]">
        {label && (
          <label
            htmlFor={inputId}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-sm)',
              fontWeight: 'var(--weight-medium)',
              color: 'var(--fg-1)',
              lineHeight: 'var(--leading-snug)',
            }}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {leadingIcon && (
            <span
              className="pointer-events-none absolute left-[14px] flex items-center"
              style={{ color: 'var(--fg-3)' }}
            >
              {leadingIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={clsx(
              'w-full rounded-[8px] border',
              'bg-[var(--surface-canvas)]',
              'text-[var(--fg-1)]',
              'placeholder:text-[var(--fg-3)]',
              'transition-[border-color,box-shadow] duration-[200ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
              'focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_rgba(31,77,63,0.12)]',
              error
                ? 'border-[var(--negative)]'
                : 'border-[var(--border-default)] hover:border-[var(--border-strong)]',
              leadingIcon ? 'pl-10' : 'pl-[14px]',
              trailingContent ? 'pr-10' : 'pr-[14px]',
              'py-[11px]',
              className,
            )}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-md)',
              lineHeight: 'var(--leading-body)',
            }}
            {...props}
          />

          {trailingContent && (
            <span className="absolute right-[14px] flex items-center">
              {trailingContent}
            </span>
          )}
        </div>

        {error && (
          <span
            id={errorId}
            role="alert"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 'var(--text-xs)',
              color: 'var(--negative)',
              lineHeight: 'var(--leading-snug)',
            }}
          >
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
