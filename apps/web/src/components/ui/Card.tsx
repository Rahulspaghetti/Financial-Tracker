import * as React from 'react';
import { clsx } from 'clsx';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Remove default padding */
  noPadding?: boolean;
  /** Elevation level — controls shadow */
  elevation?: 'flat' | 'raised' | 'lifted';
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ noPadding = false, elevation = 'raised', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx(
          'rounded-[16px] border',
          'bg-[var(--surface-raised)]',
          'border-[var(--border-subtle)]',
          !noPadding && 'p-6',
          elevation === 'raised' && 'shadow-[var(--shadow-sm)]',
          elevation === 'lifted' && 'shadow-[var(--shadow-md)]',
          elevation === 'flat' && 'shadow-none',
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

// ── Sub-components ────────────────────────────────────────────────────────────

export const CardHeader = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={clsx('flex flex-col gap-1 pb-4', className)}
    {...props}
  >
    {children}
  </div>
);

export const CardTitle = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={clsx(className)}
    style={{
      fontFamily: 'var(--font-body)',
      fontWeight: 'var(--weight-semibold)',
      fontSize: 'var(--text-lg)',
      lineHeight: 'var(--leading-snug)',
      color: 'var(--fg-1)',
    }}
    {...props}
  >
    {children}
  </h3>
);

export const CardContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={clsx(className)} {...props}>
    {children}
  </div>
);
