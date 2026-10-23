// Design-only: spot orders from the web orders page. Tabs, side filter and cancel work locally.
import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Nav';
import { c, f, t, themed } from '../theme';

type Side = 'Buy' | 'Sell';
const OPEN0 = [
  { id: 'o-58213', t: '24 Sep 09:12', pair: 'USDT/HKD', type: 'Limit', side: 'Buy' as Side, px: 7.815, amt: 120000, filled: 0 },
  { id: 'o-58190', t: '22 Sep 15:40', pair: 'BTC/USDT', type: 'Limit', side: 'Sell' as Side, px: 84900, amt: 0.42, filled: 0.1596 },
];
const HIST = ([
  ['24 Sep 10:44', 'USDT/HKD', 'Market', 'Buy', 7.8241, 50000, 50000, 'Filled'],
  ['24 Sep 10:42', 'BTC/USDT', 'Limit', 'Sell', 83574.01, 0.0241, 0.0241, 'Filled'],
  ['24 Sep 10:39', 'ETH/USDT', 'Market', 'Buy', 2692.4, 0.12, 0.12, 'Filled'],
  ['24 Sep 10:35', 'XRP/USDT', 'Market', 'Sell', 1.5856, 320, 320, 'Filled'],
  ['24 Sep 10:31', 'BNB/USDT', 'Limit', 'Buy', 764.83, 0.46, 0.46, 'Filled'],
  ['24 Sep 09:58', 'SOL/USDT', 'Limit', 'Buy', 112, 10, 0, 'Cancelled'],
  ['23 Sep 16:05', 'USDC/HKD', 'Limit', 'Sell', 7.821, 20000, 20000, 'Filled'],
  ['23 Sep 11:20', 'ETH/USDT', 'Stop-limit', 'Sell', 2640, 2, 0, 'Expired'],
] as const).map(([t, pair, type, side, px, amt, filled, status]) => ({ t, pair, type, side: side as Side, px, amt, filled, status }));
// limit orders that rest earn maker, market orders pay taker
const FILLS = [...HIST.filter(h => h.filled), { t: '22 Sep 15:52', pair: 'BTC/USDT', type: 'Limit', side: 'Sell' as Side, px: 84900, amt: 0.1596, filled: 0.1596, status: 'Filled' as const }]
  .map(h => ({ ...h, role: h.type === 'Market' ? 'Taker' : 'Maker' }));
const FEE = { Maker: 0.0008, Taker: 0.0012 };

const base = (p: string) => p.split('/')[0], quote = (p: string) => p.split('/')[1];
const aDp = (p: string) => (['BTC', 'ETH', 'BNB'].includes(base(p)) ? 4 : 2);
const pDp = (px: number) => (px < 10 ? 4 : 2);
const fmt = (v: number, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

function Cells({ items }: { items: [string, string][] }) {
  return (
    <View style={s.cells}>
      {items.map(([k, v]) => (
        <View key={k} style={s.cellItem}>
          <Text style={s.kicker}>{k}</Text>
          <Text style={[s.monoSm, { marginTop: 3 }]}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

export default function Orders() {
  const [tab, setTab] = useState<'open' | 'hist' | 'fills'>('open');
  const [side, setSide] = useState<'All' | Side>('All');
  const [open, setOpen] = useState(OPEN0);
  const [confirm, setConfirm] = useState<string | null>(null);
  const bySide = <T extends { side: Side }>(rows: T[]) => rows.filter(r => side === 'All' || r.side === side);
  const statusTone = (st: string) => (st === 'Filled' ? c.gain : st === 'Cancelled' ? c.ink3 : '#9a7a12');
  const sideText = (sd: Side) => <Text style={{ color: sd === 'Buy' ? c.gain : c.loss }}>{sd}</Text>;

  const TABS = [['open', 'Open', open.length], ['hist', 'History', HIST.length], ['fills', 'Trades', FILLS.length]] as const;

  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
      <Header kicker="SPOT ORDERS" title="Orders" />

      <View style={s.grid}>
        {[['OPEN ORDERS', String(open.length), open.length ? 'HK$ 937,800 + 0.2604 BTC held' : 'Nothing held'], ['FILLED TODAY', '5', 'Fully or partly'], ["TODAY'S VOLUME", 'HK$ 416K', 'Filled value'], ['MATCHING', '14 ms', 'Operational']].map(([k, v, d], i) => (
          <View key={k} style={[s.cell, i % 2 === 1 && s.cellR, i > 1 && s.cellB]}>
            <Text style={s.kicker}>{k}</Text>
            <Text style={s.statVal}>{v}</Text>
            <Text style={s.small} numberOfLines={1}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={{ gap: 14 }}>
        <View style={s.tabs}>
          {TABS.map(([k, label, n]) => (
            <Pressable key={k} onPress={() => setTab(k)} style={[s.tab, tab === k && s.tabOn]}>
              <Text style={[s.tabText, tab === k && { color: c.ink }]}>{label} <Text style={s.count}>{n}</Text></Text>
            </Pressable>
          ))}
        </View>
        <View style={[s.row, { gap: 8 }]}>
          {(['All', 'Buy', 'Sell'] as const).map(k => (
            <Pressable key={k} onPress={() => setSide(k)} style={[s.chip, side === k && s.chipOn]}>
              <Text style={[s.chipText, side === k && { color: '#fff' }]}>{k === 'All' ? 'All sides' : k}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {tab === 'open' && (
        bySide(open).length === 0 ? (
          <View style={[s.card, s.empty]}>
            <Ionicons name="checkmark-done-outline" size={22} color={c.ink3} />
            <Text style={s.body}>No open orders</Text>
            <Text style={s.sub}>Orders you place on Trade show up here until they fill.</Text>
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            {bySide(open).map(o => {
              const pct = o.filled / o.amt;
              return (
                <View key={o.id} style={s.order}>
                  <View style={s.between}>
                    <Text style={s.pair}>{o.pair.replace('/', ' / ')} · {sideText(o.side)}</Text>
                    <Text style={[s.badge, pct > 0 && { color: '#9a7a12', borderColor: c.flag }]}>{pct > 0 ? 'PARTIAL' : 'OPEN'}</Text>
                  </View>
                  <Text style={s.sub}>{o.type} · placed {o.t}</Text>
                  <Cells items={[['PRICE', fmt(o.px, pDp(o.px))], ['AMOUNT', `${fmt(o.amt, aDp(o.pair))} ${base(o.pair)}`], ['TOTAL', `${fmt(o.px * o.amt)} ${quote(o.pair)}`], ['FILLED', `${Math.round(pct * 100)}%`]]} />
                  <View style={s.track}><View style={[s.fill, { width: `${pct * 100}%` }]} /></View>
                  {confirm === o.id ? (
                    <View style={[s.row, { gap: 8 }]}>
                      <Text style={[s.sub, { flex: 1 }]}>Cancel this order?</Text>
                      <Pressable style={s.btn} onPress={() => setConfirm(null)}><Text style={s.btnText}>KEEP</Text></Pressable>
                      <Pressable style={[s.btn, s.btnDanger]} onPress={() => { setOpen(open.filter(x => x.id !== o.id)); setConfirm(null); }}><Text style={[s.btnText, { color: '#fff' }]}>CANCEL ORDER</Text></Pressable>
                    </View>
                  ) : (
                    <Pressable style={[s.btn, { alignSelf: 'flex-start' }]} onPress={() => setConfirm(o.id)}><Text style={s.btnText}>CANCEL</Text></Pressable>
                  )}
                </View>
              );
            })}
            <Pressable onPress={() => setOpen([])} style={s.cancelAll}>
              <Text style={[s.btnText, { color: c.loss }]}>CANCEL ALL {open.length} WORKING</Text>
            </Pressable>
          </View>
        )
      )}

      {tab === 'hist' && (
        <View style={s.card}>
          {bySide(HIST).map((h, i) => (
            <View key={h.t + h.pair} style={[s.listRow, i > 0 && s.divider]}>
              <View style={s.between}>
                <Text style={s.body}>{h.pair.replace('/', ' / ')} · {sideText(h.side)}</Text>
                <Text style={[s.badge, { color: statusTone(h.status), borderColor: statusTone(h.status) }]}>{h.status.toUpperCase()}</Text>
              </View>
              <View style={[s.between, { marginTop: 6 }]}>
                <Text style={s.sub}>{h.t} · {h.type}</Text>
                <Text style={s.monoSm}>@ {fmt(h.px, pDp(h.px))}</Text>
              </View>
              <Text style={[s.sub, { marginTop: 4, fontFamily: f.mono }]}>Filled {fmt(h.filled, aDp(h.pair))} / {fmt(h.amt, aDp(h.pair))} {base(h.pair)}</Text>
            </View>
          ))}
        </View>
      )}

      {tab === 'fills' && (
        <View style={s.card}>
          {bySide(FILLS).map((x, i) => {
            const value = x.px * x.filled, fee = value * FEE[x.role as 'Maker' | 'Taker'];
            return (
              <View key={x.t + x.pair} style={[s.listRow, i > 0 && s.divider]}>
                <View style={s.between}>
                  <Text style={s.body}>{x.pair.replace('/', ' / ')} · {sideText(x.side)}</Text>
                  <Text style={s.monoSm}>{fmt(value)} {quote(x.pair)}</Text>
                </View>
                <View style={[s.between, { marginTop: 6 }]}>
                  <Text style={s.sub}>{x.t} · {x.role} {x.role === 'Maker' ? '0.08%' : '0.12%'}</Text>
                  <Text style={[s.sub, { fontFamily: f.mono }]}>fee {fmt(fee)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Text style={[s.small, { textAlign: 'center' }]}>TIMES IN HKT</Text>
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 48, gap: 28 },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule },
  cell: { width: '50%', padding: 16, gap: 6 },
  cellR: { borderLeftWidth: 1, borderLeftColor: c.rule },
  cellB: { borderTopWidth: 1, borderTopColor: c.rule },
  statVal: { color: c.ink, fontFamily: f.mono, fontSize: t.h3 },

  tabs: { flexDirection: 'row', gap: 22 },
  tab: { paddingBottom: 6 },
  tabOn: { borderBottomWidth: 2, borderBottomColor: c.signal },
  tabText: { color: c.ink3, fontFamily: f.semi, fontSize: t.h4 },
  count: { fontFamily: f.mono, fontSize: 11, color: c.ink3 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 2, borderWidth: 1, borderColor: c.rule, backgroundColor: c.sheet },
  chipOn: { backgroundColor: c.deep, borderColor: c.deep },
  chipText: { color: c.ink2, fontFamily: f.med, fontSize: t.label },

  order: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, padding: 18, gap: 12 },
  pair: { color: c.ink, fontFamily: f.semi, fontSize: t.h4 },
  cells: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: c.canvas, borderWidth: 1, borderColor: c.rule },
  cellItem: { width: '50%', padding: 10 },
  track: { height: 3, backgroundColor: c.sunk },
  fill: { height: 3, backgroundColor: c.flag },
  badge: { color: c.deep, fontFamily: f.mono, fontSize: 9, letterSpacing: 0.8, borderWidth: 1, borderColor: c.ruleStrong, paddingHorizontal: 5, paddingVertical: 1 },
  btn: { borderWidth: 1, borderColor: c.ruleStrong, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 2 },
  btnDanger: { backgroundColor: c.loss, borderColor: c.loss },
  btnText: { color: c.ink, fontFamily: f.mono, fontSize: 10, letterSpacing: 1 },
  cancelAll: { height: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(192,65,76,.4)', backgroundColor: c.sheet },

  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, paddingHorizontal: 16 },
  listRow: { paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: c.rule },
  empty: { alignItems: 'center', paddingVertical: 36, gap: 8 },

  body: { color: c.ink, fontFamily: f.med, fontSize: t.body },
  sub: { color: c.ink3, fontFamily: f.reg, fontSize: t.label },
  small: { color: c.ink3, fontFamily: f.mono, fontSize: 10 },
  monoSm: { color: c.ink, fontFamily: f.mono, fontSize: t.label },
}));
