// TallyKit.jsx — shared mobile primitives. Loads after Icon.jsx.
// All components use CSS vars from colors_and_type.css.

const tally = {
  cream:    'var(--surface-canvas)',
  raised:   'var(--surface-raised)',
  sunken:   'var(--surface-sunken)',
  ink1:     'var(--fg-1)',
  ink2:     'var(--fg-2)',
  ink3:     'var(--fg-3)',
  accent:   'var(--accent)',
  accentSoft: 'var(--accent-soft)',
  border:   'var(--border-default)',
  borderSubtle: 'var(--border-subtle)',
  pos:      'var(--positive)',
  posSoft:  'var(--positive-soft)',
  neg:      'var(--negative)',
  negSoft:  'var(--negative-soft)',
  caution:  'var(--caution)',
  cautionSoft: 'var(--caution-soft)',
  serif:    'var(--font-display)',
  sans:     'var(--font-body)',
  mono:     'var(--font-mono)',
};

// ─── Button ──────────────────────────────────────────────
function Button({
  children, onClick, variant = 'primary', size = 'md',
  leadingIcon, trailingIcon, fullWidth, disabled, style = {},
}) {
  const base = {
    fontFamily: tally.sans, fontWeight: 500,
    border: '1px solid transparent', cursor: disabled ? 'not-allowed' : 'pointer',
    borderRadius: size === 'lg' ? 12 : 8,
    padding: size === 'lg' ? '14px 22px' : size === 'sm' ? '8px 12px' : '11px 18px',
    fontSize: size === 'lg' ? 16 : size === 'sm' ? 13 : 14, lineHeight: 1,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'all 200ms cubic-bezier(0.32,0.72,0,1)',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.4 : 1,
    ...style,
  };
  const variants = {
    primary:     { background: tally.accent, color: 'var(--fg-onAccent)' },
    secondary:   { background: tally.raised, color: tally.ink1, borderColor: tally.border },
    ghost:       { background: 'transparent', color: tally.ink1 },
    soft:        { background: tally.accentSoft, color: 'var(--accent-ink)' },
    destructive: { background: tally.neg, color: 'var(--fg-onAccent)' },
  };
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}
            onMouseDown={e => !disabled && (e.currentTarget.style.transform = 'scale(0.98)')}
            onMouseUp={e   => (e.currentTarget.style.transform = '')}
            onMouseLeave={e => (e.currentTarget.style.transform = '')}>
      {leadingIcon && <Icon name={leadingIcon} size={16}/>}
      {children}
      {trailingIcon && <Icon name={trailingIcon} size={16}/>}
    </button>
  );
}

// ─── Card ────────────────────────────────────────────────
function Card({ children, padding = 16, style = {}, raised = false, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: tally.raised, borderRadius: 16,
      border: `1px solid ${tally.borderSubtle}`,
      boxShadow: raised ? 'var(--shadow-sm)' : 'none',
      padding, cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>{children}</div>
  );
}

// ─── Chip / Pill ─────────────────────────────────────────
function Chip({ children, active, onClick, variant = 'ghost' }) {
  const styles = active
    ? { background: tally.ink1, color: tally.cream, borderColor: tally.ink1 }
    : variant === 'soft'
    ? { background: tally.accentSoft, color: 'var(--accent-ink)', borderColor: 'transparent' }
    : { background: 'transparent', color: tally.ink1, borderColor: tally.border };
  return (
    <button onClick={onClick} style={{
      fontFamily: tally.sans, fontWeight: 500, fontSize: 13,
      padding: '7px 13px', borderRadius: 9999,
      border: '1px solid', cursor: 'pointer',
      transition: 'all 200ms cubic-bezier(0.32,0.72,0,1)',
      ...styles,
    }}>{children}</button>
  );
}

// ─── CategoryAvatar ──────────────────────────────────────
const CATEGORY_COLORS = {
  groceries:     { fg: '#2E5538', bg: tally.posSoft, icon: 'shopping-basket' },
  coffee:        { fg: '#5C4318', bg: tally.cautionSoft, icon: 'coffee' },
  shopping:      { fg: '#1F324A', bg: 'var(--info-soft)', icon: 'shopping-bag' },
  transport:     { fg: '#7A2E22', bg: tally.negSoft, icon: 'car' },
  travel:        { fg: '#1F324A', bg: 'var(--info-soft)', icon: 'plane' },
  housing:       { fg: '#2E5538', bg: tally.posSoft, icon: 'home' },
  utilities:     { fg: '#5C4318', bg: tally.cautionSoft, icon: 'zap' },
  subscriptions: { fg: 'var(--accent-ink)', bg: tally.accentSoft, icon: 'repeat' },
  income:        { fg: tally.pos, bg: tally.posSoft, icon: 'arrow-down-left' },
  transfer:      { fg: '#1F324A', bg: 'var(--info-soft)', icon: 'arrow-left-right' },
  savings:       { fg: '#2E5538', bg: tally.posSoft, icon: 'piggy-bank' },
  other:         { fg: tally.ink2, bg: tally.sunken, icon: 'circle-dashed' },
};
function CategoryAvatar({ category = 'other', size = 36 }) {
  const c = CATEGORY_COLORS[category] || CATEGORY_COLORS.other;
  return (
    <div style={{
      width: size, height: size, borderRadius: 9999,
      background: c.bg, color: c.fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <Icon name={c.icon} size={size * 0.5}/>
    </div>
  );
}

// ─── TransactionRow ──────────────────────────────────────
function TransactionRow({ tx, onClick, last }) {
  const isPos = tx.amount > 0;
  const amtColor = tx.pending ? tally.ink3 : isPos ? tally.pos : tally.ink1;
  const amtPrefix = isPos ? '+' : '−';
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px',
      borderBottom: last ? 'none' : `1px solid ${tally.borderSubtle}`,
      cursor: onClick ? 'pointer' : 'default',
    }}>
      <CategoryAvatar category={tx.category}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: tally.sans, fontWeight: 500, fontSize: 15, color: tally.ink1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tx.merchant}
        </div>
        <div style={{ fontFamily: tally.sans, fontSize: 12, color: tally.ink3, marginTop: 2 }}>
          {tx.subtitle}
        </div>
      </div>
      <div style={{
        fontFamily: tally.mono, fontFeatureSettings: '"tnum" 1', fontWeight: 500,
        fontSize: 14, color: amtColor, fontStyle: tx.pending ? 'italic' : 'normal',
      }}>
        {tx.pending ? `Pending · ${amtPrefix}$${Math.abs(tx.amount).toFixed(0)}` : `${amtPrefix}$${Math.abs(tx.amount).toFixed(2)}`}
      </div>
    </div>
  );
}

// ─── Section header ──────────────────────────────────────
function SectionHeader({ children, action }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', padding: '0 4px 10px' }}>
      <div style={{ fontFamily: tally.sans, fontWeight: 600, fontSize: 13, color: tally.ink1, letterSpacing: '-0.01em' }}>{children}</div>
      {action && <div style={{ fontFamily: tally.sans, fontSize: 13, color: tally.accent, fontWeight: 500, cursor: 'pointer' }}>{action}</div>}
    </div>
  );
}

// ─── Bottom tab bar ──────────────────────────────────────
function BottomTabBar({ active, onChange }) {
  const tabs = [
    { id: 'home',  icon: 'home',           label: 'Home' },
    { id: 'feed',  icon: 'compass',        label: 'Activity' },
    { id: 'chat',  icon: 'sparkles',       label: 'Tally' },
    { id: 'cards', icon: 'credit-card',    label: 'Accounts' },
    { id: 'me',    icon: 'user',           label: 'You' },
  ];
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      paddingBottom: 28, paddingTop: 8,
      background: 'rgba(250,247,242,0.85)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderTop: `1px solid ${tally.borderSubtle}`,
      display: 'flex',
      zIndex: 5,
    }}>
      {tabs.map(t => {
        const on = t.id === active;
        const isAi = t.id === 'chat';
        return (
          <button key={t.id} onClick={() => onChange(t.id)} style={{
            flex: 1, background: 'transparent', border: 'none', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '6px 0',
            color: on ? (isAi ? tally.accent : tally.ink1) : tally.ink3,
          }}>
            {isAi
              ? <div style={{
                  width: 30, height: 30, borderRadius: 9999,
                  background: on ? tally.accent : 'transparent',
                  border: on ? 'none' : `1.5px solid ${tally.ink3}`,
                  color: on ? tally.cream : tally.ink3,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}><Icon name="sparkles" size={16}/></div>
              : <Icon name={t.icon} size={22}/>}
            <span style={{ fontFamily: tally.sans, fontSize: 10, fontWeight: 500, letterSpacing: '0.02em' }}>{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Tally header (generic, for in-app screens) ──────────
function TallyHeader({ title, leading, trailing, eyebrow }) {
  return (
    <div style={{ padding: '64px 18px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{leading}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{trailing}</div>
      </div>
      {eyebrow && <div style={{ fontFamily: tally.sans, fontSize: 11, fontWeight: 500, color: tally.ink3, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{eyebrow}</div>}
      {title && <h1 style={{ fontFamily: tally.serif, fontWeight: 400, fontSize: 34, lineHeight: 1.05, letterSpacing: '-0.02em', color: tally.ink1, margin: 0 }}>{title}</h1>}
    </div>
  );
}

// ─── IconButton ──────────────────────────────────────────
function IconButton({ name, onClick, size = 36, variant = 'ghost' }) {
  const styles = variant === 'soft'
    ? { background: tally.sunken }
    : { background: 'transparent', border: `1px solid ${tally.borderSubtle}` };
  return (
    <button onClick={onClick} style={{
      width: size, height: size, borderRadius: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', color: tally.ink1,
      ...styles, border: styles.border || 'none',
    }}><Icon name={name} size={size * 0.5}/></button>
  );
}

Object.assign(window, {
  tally, Button, Card, Chip, CategoryAvatar, TransactionRow,
  SectionHeader, BottomTabBar, TallyHeader, IconButton,
  CATEGORY_COLORS,
});
