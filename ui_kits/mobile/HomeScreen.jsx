// HomeScreen.jsx — spending dashboard, the daily-use app surface
function HomeScreen({ onOpenChat, onOpenTransaction }) {
  const [period, setPeriod] = React.useState('month');

  const txs = [
    { id: 't1', merchant: 'Whole Foods Market', subtitle: 'Groceries · 2 hrs ago',     category: 'groceries',     amount: -84.21 },
    { id: 't2', merchant: 'Direct deposit · Acme Inc', subtitle: 'Paycheck · Today',   category: 'income',        amount: 3420.00 },
    { id: 't3', merchant: 'Spotify',            subtitle: 'Subscription · Yesterday',  category: 'subscriptions', amount: -10.99 },
    { id: 't4', merchant: 'Lyft',               subtitle: 'Transport · Yesterday',     category: 'transport',     amount: -18.40 },
    { id: 't5', merchant: 'Blue Bottle',        subtitle: 'Coffee · Yesterday',        category: 'coffee',        amount: -6.50 },
    { id: 't6', merchant: 'Rent · May',         subtitle: 'Housing · May 1',           category: 'housing',       amount: -2150.00, pending: true },
    { id: 't7', merchant: 'Trader Joe\u2019s', subtitle: 'Groceries · 2 days ago',     category: 'groceries',     amount: -52.18 },
  ];

  return (
    <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 96, background: tally.cream }}>
      <TallyHeader
        leading={<img src="../../assets/monogram.svg" width="32" height="32" alt=""/>}
        trailing={<><IconButton name="bell"/><IconButton name="search"/></>}
      />

      {/* Hero amount */}
      <div style={{ padding: '0 24px 18px' }}>
        <div style={{ fontFamily: tally.sans, fontSize: 12, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: tally.ink3, marginBottom: 6 }}>
          Spent in May
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: tally.serif, fontSize: 60, lineHeight: 1, letterSpacing: '-0.03em', color: tally.ink1 }}>
            $2,140
          </span>
          <span style={{ fontFamily: tally.serif, fontSize: 32, color: tally.ink3 }}>.28</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            background: tally.negSoft, color: '#7A2E22',
            padding: '3px 8px', borderRadius: 9999,
            fontFamily: tally.mono, fontSize: 11, fontWeight: 500,
          }}>
            <Icon name="arrow-up" size={11}/> 8.2%
          </span>
          <span style={{ fontFamily: tally.sans, fontSize: 13, color: tally.ink2 }}>vs last month</span>
        </div>
      </div>

      {/* Period chips */}
      <div style={{ padding: '0 18px 16px', display: 'flex', gap: 6 }}>
        {['Week', 'Month', 'Year', 'All'].map(p => (
          <Chip key={p} active={p.toLowerCase() === period} onClick={() => setPeriod(p.toLowerCase())}>{p}</Chip>
        ))}
      </div>

      {/* Spending chart card */}
      <div style={{ padding: '0 18px 18px' }}>
        <Card padding={20}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
            <span style={{ fontFamily: tally.sans, fontSize: 13, fontWeight: 500, color: tally.ink1 }}>By category</span>
            <span style={{ fontFamily: tally.sans, fontSize: 12, color: tally.ink3 }}>Top 5 of 18</span>
          </div>
          {[
            { name: 'Housing',       amount: 2150, pct: 0.65, cat: 'housing' },
            { name: 'Groceries',     amount: 412,  pct: 0.18, cat: 'groceries' },
            { name: 'Dining',        amount: 286,  pct: 0.12, cat: 'coffee' },
            { name: 'Transport',     amount: 144,  pct: 0.06, cat: 'transport' },
            { name: 'Subscriptions', amount: 89,   pct: 0.04, cat: 'subscriptions' },
          ].map(r => (
            <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0' }}>
              <CategoryAvatar category={r.cat} size={28}/>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontFamily: tally.sans, fontSize: 13, fontWeight: 500, color: tally.ink1 }}>{r.name}</span>
                  <span style={{ fontFamily: tally.mono, fontSize: 12, color: tally.ink2 }}>${r.amount.toLocaleString()}</span>
                </div>
                <div style={{ height: 4, borderRadius: 2, background: tally.sunken, marginTop: 6, overflow: 'hidden' }}>
                  <div style={{ width: `${r.pct * 100}%`, height: '100%', background: CATEGORY_COLORS[r.cat]?.fg || tally.accent, borderRadius: 2 }}/>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* AI prompt card */}
      <div style={{ padding: '0 18px 22px' }}>
        <div onClick={onOpenChat} style={{
          background: 'linear-gradient(135deg, #1F4D3F, #163528)',
          borderRadius: 16, padding: '18px 18px',
          display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
          color: tally.cream,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: 9999,
            background: 'rgba(250,247,242,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><Icon name="sparkles" size={20}/></div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: tally.serif, fontSize: 18, lineHeight: 1.2, color: tally.cream }}>
              Ask Tally about your spending
            </div>
            <div style={{ fontFamily: tally.sans, fontSize: 12, color: 'rgba(250,247,242,0.7)', marginTop: 2 }}>
              "How much did I spend on coffee last month?"
            </div>
          </div>
          <Icon name="chevron-right" size={18} style={{ opacity: 0.5 }}/>
        </div>
      </div>

      {/* Transactions */}
      <div style={{ padding: '0 18px' }}>
        <SectionHeader action="See all">Recent transactions</SectionHeader>
        <Card padding={0}>
          {txs.map((tx, i) => (
            <TransactionRow key={tx.id} tx={tx} last={i === txs.length - 1} onClick={() => onOpenTransaction(tx)}/>
          ))}
        </Card>
      </div>
    </div>
  );
}

window.HomeScreen = HomeScreen;
