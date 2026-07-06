// TransactionDetail.jsx — single transaction view
function TransactionDetail({ tx, onClose }) {
  if (!tx) return null;
  const isPos = tx.amount > 0;
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: tally.cream }}>
      <TallyHeader
        leading={<IconButton name="chevron-left" onClick={onClose}/>}
        trailing={<><IconButton name="more-horizontal"/></>}
      />
      <div style={{ padding: '6px 24px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        <CategoryAvatar category={tx.category} size={64}/>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontFamily: tally.sans, fontSize: 13, fontWeight: 500, color: tally.ink2 }}>{tx.merchant}</div>
          <div style={{
            fontFamily: tally.serif, fontSize: 56, lineHeight: 1, marginTop: 6,
            color: isPos ? tally.pos : tally.ink1, letterSpacing: '-0.02em',
          }}>
            {isPos ? '+' : '−'}${Math.abs(tx.amount).toFixed(2)}
          </div>
          <div style={{ fontFamily: tally.sans, fontSize: 12, color: tally.ink3, marginTop: 6 }}>
            {tx.subtitle}
          </div>
        </div>
      </div>

      <div style={{ padding: '0 18px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card padding={0}>
          <DetailRow label="Account"   value="Chase ·· 4421"/>
          <DetailRow label="Category"  value={titleize(tx.category)} chevron/>
          <DetailRow label="Date"      value="May 3, 2026 · 2:14 PM"/>
          <DetailRow label="Merchant"  value="Whole Foods Market #142" last/>
        </Card>

        <Card padding={16}>
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 24, height: 24, borderRadius: 9999, background: tally.accent, color: tally.cream, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="sparkles" size={13}/>
            </div>
            <div>
              <div style={{ fontFamily: tally.sans, fontWeight: 600, fontSize: 13, color: tally.ink1, marginBottom: 4 }}>
                Tally noted
              </div>
              <div style={{ fontFamily: tally.sans, fontSize: 13, lineHeight: 1.5, color: tally.ink2 }}>
                This is your 4th grocery trip this week. You're on track to spend about $420 on groceries this month — roughly average.
              </div>
            </div>
          </div>
        </Card>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <Button variant="secondary" leadingIcon="repeat">Mark recurring</Button>
          <Button variant="secondary" leadingIcon="receipt">Add receipt</Button>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value, chevron, last }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px',
      borderBottom: last ? 'none' : `1px solid ${tally.borderSubtle}`,
    }}>
      <span style={{ fontFamily: tally.sans, fontSize: 13, color: tally.ink2 }}>{label}</span>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: tally.sans, fontSize: 14, fontWeight: 500, color: tally.ink1 }}>
        {value}{chevron && <Icon name="chevron-right" size={14} style={{ color: tally.ink3 }}/>}
      </span>
    </div>
  );
}

function titleize(s) { return s ? s[0].toUpperCase() + s.slice(1) : ''; }

window.TransactionDetail = TransactionDetail;
