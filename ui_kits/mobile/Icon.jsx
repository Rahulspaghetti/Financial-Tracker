// Icon.jsx — Tally icon helper
// Lucide-derived rounded-stroke icons. Stroke 1.75, currentColor.
// Usage: <Icon name="coffee" size={20} />

const ICON_PATHS = {
  // ── nav / chrome
  'home':            'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10',
  'compass':         'M12 22a10 10 0 100-20 10 10 0 000 20z M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36z',
  'message-circle': 'M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8z',
  'sparkles':        'M12 3l1.6 4.4 4.4 1.6-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z M19 14l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2L16 17l2.2-.8z M5 3l.6 1.6L7 5l-1.4.4L5 7l-.6-1.6L3 5l1.4-.4z',
  'user':            'M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M16 7a4 4 0 11-8 0 4 4 0 018 0z',
  'settings':        'M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z',
  'bell':            'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9 M13.7 21a2 2 0 01-3.4 0',
  // ── navigation
  'chevron-left':    'M15 18l-6-6 6-6',
  'chevron-right':   'M9 18l6-6-6-6',
  'chevron-down':    'M6 9l6 6 6-6',
  'chevron-up':      'M18 15l-6-6-6 6',
  'arrow-up':        'M12 19V5 M5 12l7-7 7 7',
  'arrow-down':      'M12 5v14 M19 12l-7 7-7-7',
  'arrow-up-right':  'M7 17l10-10 M7 7h10v10',
  'arrow-down-left': 'M17 7l-10 10 M17 17H7V7',
  'plus':            'M12 5v14 M5 12h14',
  'x':               'M18 6L6 18 M6 6l12 12',
  'check':           'M20 6L9 17l-5-5',
  'search':          'M11 19a8 8 0 100-16 8 8 0 000 16z M21 21l-4.35-4.35',
  'filter':          'M3 6h18 M6 12h12 M10 18h4',
  'more-horizontal': 'M5 12h.01 M12 12h.01 M19 12h.01',
  'send':            'M22 2L11 13 M22 2l-7 20-4-9-9-4z',
  // ── finance / categories
  'shopping-basket': 'M3 11l3-7h12l3 7 M3 11v9a1 1 0 001 1h16a1 1 0 001-1v-9 M3 11h18 M8 16h.01 M12 16h.01 M16 16h.01',
  'coffee':          'M18 8h1a4 4 0 010 8h-1 M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z M6 1v3 M10 1v3 M14 1v3',
  'shopping-bag':    'M14 9V5a3 3 0 00-6 0v4 M5 9h14l-1 12H6z',
  'car':             'M14 16H9 M19 16h3v-3.15a1 1 0 00-.84-.99L16 11l-2.7-3.6a1 1 0 00-.8-.4H5.24a2 2 0 00-1.8 1.1l-.8 1.63A6 6 0 002 12.42V16h2',
  'plane':           'M17.8 19.2L16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z',
  'zap':             'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  'repeat':          'M17 1l4 4-4 4 M3 11V9a4 4 0 014-4h14 M7 23l-4-4 4-4 M21 13v2a4 4 0 01-4 4H3',
  'piggy-bank':      'M20 12V8H6a2 2 0 010-4h12v4 M4 6v12a2 2 0 002 2h14v-4 M18 12a2 2 0 00-2 2c0 1.1.9 2 2 2h4v-4z',
  'arrow-left-right':'M22 12l-3-3 m3 3l-3 3 m3-3H9 m4-9l-3 3 m3-3l3 3 M3 21l9-9',
  'trending-up':     'M22 7l-9.5 9.5-5-5L1 18 M16 7h6v6',
  'receipt':         'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  'gift':            'M20 12v10H4V12 M2 7h20v5H2z M12 22V7 M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z',
  'circle-dashed':   'M10.1 2.18a10 10 0 013.8 0 M16.7 3.43a10 10 0 012.7 2.7 M20.6 8.1a10 10 0 010 7.8 M19.4 18.6a10 10 0 01-2.7 2.7 M13.9 21.8a10 10 0 01-3.8 0 M7.3 20.6a10 10 0 01-2.7-2.7 M3.4 15.9a10 10 0 010-7.8 M4.6 5.4a10 10 0 012.7-2.7',
  'wallet':          'M21 12V7H5a2 2 0 010-4h14v4 M3 5v14a2 2 0 002 2h16v-5 M18 12a2 2 0 100 4h4v-4z',
  'credit-card':     'M3 5h18a2 2 0 012 2v10a2 2 0 01-2 2H3a2 2 0 01-2-2V7a2 2 0 012-2z M2 10h20',
  'lock':            'M5 11h14a2 2 0 012 2v8H3v-8a2 2 0 012-2z M7 11V7a5 5 0 0110 0v4',
  'shield-check':    'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z M9 12l2 2 4-4',
  'eye':             'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 100-6 3 3 0 000 6z',
  'eye-off':         'M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94 M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19 M14.12 14.12a3 3 0 11-4.24-4.24 M1 1l22 22',
  'mic':             'M12 2a3 3 0 00-3 3v6a3 3 0 006 0V5a3 3 0 00-3-3z M19 11a7 7 0 01-14 0 M12 18v4 M8 22h8',
  'paperclip':       'M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66L9.41 17.41a2 2 0 01-2.83-2.83l8.49-8.48',
};

function Icon({ name, size = 20, strokeWidth = 1.75, style = {}, className = '' }) {
  const path = ICON_PATHS[name];
  if (!path) return <span style={{ display: 'inline-block', width: size, height: size, ...style }} title={`missing: ${name}`}/>;
  // split on space-then-uppercase letter to support multi-path glyphs
  const parts = path.split(/ (?=[MmAaCcHhLlQqSsTtVvZz])/).reduce((acc, seg) => {
    if (/^[Mm]/.test(seg) && acc.length) { acc.push(seg); }
    else if (acc.length) { acc[acc.length - 1] += ' ' + seg; }
    else { acc.push(seg); }
    return acc;
  }, []);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={strokeWidth}
         strokeLinecap="round" strokeLinejoin="round"
         style={{ display: 'block', flexShrink: 0, ...style }} className={className}>
      {parts.map((d, i) => <path key={i} d={d}/>)}
    </svg>
  );
}

window.Icon = Icon;
