'use client';

import * as React from 'react';

export function AuthField({
  label,
  id,
  type,
  placeholder,
  autoComplete,
  value,
  onChange,
  error,
}: {
  label: string;
  id: string;
  type: string;
  placeholder: string;
  autoComplete?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-medium)',
          color: 'var(--fg-1)',
        }}
      >
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        style={{
          padding: '11px 14px',
          background: 'var(--surface-canvas)',
          border: `1px solid ${error ? 'var(--danger, #c0392b)' : 'var(--border-default)'}`,
          borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-body)',
          fontSize: 'var(--text-md)',
          color: 'var(--fg-1)',
          transition: [
            'border-color var(--duration-micro) var(--ease-settle)',
            'box-shadow var(--duration-micro) var(--ease-settle)',
          ].join(', '),
          outline: 'none',
        }}
        onFocus={(e) => {
          if (!error) {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31,77,63,0.12)';
          }
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error
            ? 'var(--danger, #c0392b)'
            : 'var(--border-default)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      />
      {error ? (
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: 'var(--text-xs)',
            color: 'var(--danger, #c0392b)',
          }}
        >
          {error}
        </span>
      ) : null}
    </div>
  );
}
