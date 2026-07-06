// LoginScreen.jsx — Plaid-style entry: brand splash + connect-bank flow
function LoginScreen({ onLogin }) {
  const [step, setStep] = React.useState('welcome'); // welcome | banks | connecting

  const banks = [
    { id: 'chase',    name: 'Chase',           color: '#117ACA' },
    { id: 'bofa',     name: 'Bank of America', color: '#012169' },
    { id: 'wells',    name: 'Wells Fargo',     color: '#B31B1B' },
    { id: 'apple',    name: 'Apple Card',      color: '#1C1C1E' },
    { id: 'amex',     name: 'American Express',color: '#006FCF' },
    { id: 'schwab',   name: 'Charles Schwab',  color: '#00A0DF' },
  ];

  if (step === 'welcome') return (
    <div style={{
      flex: 1, padding: '88px 28px 36px',
      display: 'flex', flexDirection: 'column',
      background: tally.cream,
    }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
        <img src="../../assets/monogram.svg" width="60" height="60" alt=""/>
        <div>
          <h1 style={{ fontFamily: tally.serif, fontWeight: 400, fontSize: 56, lineHeight: 1.0, letterSpacing: '-0.03em', color: tally.ink1, margin: 0 }}>
            Money,<br/>
            <em style={{ color: tally.accent }}>understood.</em>
          </h1>
          <p style={{ fontFamily: tally.sans, fontSize: 16, lineHeight: 1.5, color: tally.ink2, marginTop: 18, maxWidth: 320 }}>
            Connect your bank in 30 seconds. Tally reads your transactions and answers questions about your spending.
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Button fullWidth size="lg" onClick={() => setStep('banks')}>Connect a bank</Button>
        <Button fullWidth size="lg" variant="ghost" onClick={() => setStep('banks')}>I already have an account</Button>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 6, color: tally.ink3 }}>
          <Icon name="lock" size={12}/>
          <span style={{ fontFamily: tally.sans, fontSize: 11, letterSpacing: '0.04em' }}>Secured by Plaid · 256-bit encryption</span>
        </div>
      </div>
    </div>
  );

  if (step === 'banks') return (
    <div style={{ flex: 1, padding: '8px 18px 28px', display: 'flex', flexDirection: 'column', background: tally.cream }}>
      <TallyHeader
        leading={<IconButton name="chevron-left" onClick={() => setStep('welcome')}/>}
        trailing={<div style={{ display: 'flex', alignItems: 'center', gap: 6, color: tally.ink3 }}>
          <Icon name="shield-check" size={14}/>
          <span style={{ fontFamily: tally.sans, fontSize: 11, letterSpacing: '0.04em' }}>Plaid</span>
        </div>}
        eyebrow="Step 1 of 3"
        title="Choose your bank"
      />
      <div style={{ position: 'relative', margin: '0 4px 14px' }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: tally.ink3 }}>
          <Icon name="search" size={16}/>
        </div>
        <input placeholder="Search 12,000+ banks" style={{
          width: '100%', boxSizing: 'border-box',
          padding: '12px 14px 12px 38px', borderRadius: 12,
          border: `1px solid ${tally.border}`, background: tally.raised,
          fontFamily: tally.sans, fontSize: 14, color: tally.ink1, outline: 'none',
        }}/>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '0 4px' }}>
        {banks.map(b => (
          <button key={b.id} onClick={() => setStep('connecting')} style={{
            background: tally.raised, border: `1px solid ${tally.borderSubtle}`,
            borderRadius: 14, padding: '16px 14px',
            display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10,
            cursor: 'pointer', minHeight: 96,
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: 9999, background: b.color,
              color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: tally.serif, fontSize: 16, fontWeight: 500,
            }}>{b.name[0]}</div>
            <div style={{ fontFamily: tally.sans, fontWeight: 500, fontSize: 13, color: tally.ink1, textAlign: 'left', lineHeight: 1.3 }}>
              {b.name}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // connecting
  return (
    <div style={{ flex: 1, padding: '88px 28px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 24, background: tally.cream }}>
      <PlaidConnecting/>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: tally.serif, fontWeight: 400, fontSize: 28, lineHeight: 1.1, color: tally.ink1, margin: 0 }}>
          Reading your transactions
        </h2>
        <p style={{ fontFamily: tally.sans, fontSize: 14, color: tally.ink2, marginTop: 10, maxWidth: 280 }}>
          We're loading the last 90 days from Chase. This usually takes about 20 seconds.
        </p>
      </div>
      <div style={{ width: '100%', maxWidth: 280 }}>
        <div style={{ height: 4, borderRadius: 2, background: tally.sunken, overflow: 'hidden' }}>
          <div style={{
            width: '64%', height: '100%', background: tally.accent,
            borderRadius: 2, transition: 'width 480ms cubic-bezier(0.32,0.72,0,1)',
          }}/>
        </div>
      </div>
      <div style={{ marginTop: 14 }}>
        <Button variant="ghost" onClick={onLogin}>Skip to demo →</Button>
      </div>
    </div>
  );
}

function PlaidConnecting() {
  return (
    <div style={{ position: 'relative', width: 96, height: 96 }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 9999,
        border: `2px solid ${tally.accentSoft}`,
      }}/>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 9999,
        border: `2px solid transparent`, borderTopColor: tally.accent,
        animation: 'tally-spin 900ms linear infinite',
      }}/>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: tally.accent }}>
        <Icon name="shield-check" size={28}/>
      </div>
      <style>{`@keyframes tally-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

window.LoginScreen = LoginScreen;
