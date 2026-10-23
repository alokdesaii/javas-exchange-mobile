// Design-only: spot trade screen; data follows the pair picked in the sheet. Form maths and toggles work locally; nothing is sent.
import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Defs, LinearGradient, Stop, Line } from 'react-native-svg';
import { Corners, CutButton } from '../components/Ledger';
import { c, f, t, themed } from '../theme';
import { useNav } from '../components/Nav';
import PairPicker, { Asset } from '../components/PairPicker';
import { ASSETS, fmtPx, fmtVol } from './Markets';

// Book shape in USDT/HKD terms; other pairs reuse it, scaled to their price.
const ASK_AMTS = [15200, 44600, 9700, 31900, 6250, 18400];
const BID_AMTS = [22600, 8900, 37400, 26800, 52100, 11300];
const book = (a: Asset) => {
  const tick = a.px * (a.cat === 'Stablecoin' ? 0.0000128 : 0.0001), scale = 7.8241 / a.px;
  let run = 0;
  const asks = ASK_AMTS.map(x => x * scale).reverse().map((amt, i) => (run += amt, [a.px + tick * (i + 1), amt, run])).reverse();
  run = 0;
  const bids = BID_AMTS.map((amt0, i) => { const amt = amt0 * scale; run += amt; return [a.px - tick * (i + 1), amt, run]; });
  return { asks, bids, max: Math.max(asks[0][2], run), tick };
};
// Your balances, for the "Available" line.
export const BAL: Record<string, number> = { HKD: 986400, USDT: 318420, BTC: 1.9236, ETH: 34.6, USDC: 21400, SOL: 5, ADA: 1250, XRP: 200, LINK: 19.942 };
const amtDp = (p: number) => (p > 1000 ? 4 : 2);
const ORDERS = [
  ['USDT / HKD', 'Buy', 'Limit', '7.8150', '120,000', '0%', 'OPEN'],
  ['BTC / USDT', 'Sell', 'Limit', '84,900.00', '0.4200', '38%', 'PARTIAL'],
];
const FRAMES = ['1m', '5m', '15m', '1H', '4H', '1D', '1W'];

// Deterministic squiggle ending near the price, so the chart looks the same every load.
const series = (seed: number, a: Asset) => Array.from({ length: 48 }, (_, i) => a.lo + (a.hi - a.lo) * (0.5 + 0.28 * Math.sin(i / 4 + seed + a.sym.length) + 0.14 * Math.sin(i * 1.7 + seed * 3) + (i - 24) * 0.004 * Math.sign(a.chg)));

export function Chart({ frame, a }: { frame: number; a: Asset }) {
  const W = 300, H = 120, pts = series(frame, a), lo = Math.min(...pts), hi = Math.max(...pts);
  const xy = pts.map((p, i) => [(i / (pts.length - 1)) * W, H - ((p - lo) / (hi - lo)) * (H - 12) - 6]);
  const line = xy.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)},${y.toFixed(1)}`).join('');
  return (
    <Svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <Defs>
        <LinearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c.deep} stopOpacity={0.16} />
          <Stop offset="1" stopColor={c.deep} stopOpacity={0} />
        </LinearGradient>
      </Defs>
      {[0.25, 0.5, 0.75].map(y => <Line key={y} x1="0" x2={W} y1={H * y} y2={H * y} stroke={c.rule} strokeWidth={1} />)}
      <Path d={`${line}L${W},${H}L0,${H}Z`} fill="url(#fill)" />
      <Path d={line} stroke={c.deep} strokeWidth={1.6} fill="none" />
    </Svg>
  );
}

export default function Trade({ initial = 'USDT' }: { initial?: string }) {
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [type, setType] = useState('Limit');
  const [frame, setFrame] = useState(2);
  const [a, setA] = useState<Asset>(ASSETS.find(x => x.sym === initial) ?? ASSETS[1]);
  const [picking, setPicking] = useState(false);
  const [favs, setFavs] = useState(new Set(['BTC', 'ETH', 'USDT']));
  const [px, setPx] = useState(String(a.px));
  const [amt, setAmt] = useState('');
  const [tab, setTab] = useState<'book' | 'orders'>('book');
  const { open, sheet } = useNav();

  const price = parseFloat(px) || a.px;
  const { asks, bids, max, tick } = book(a);
  const showPicker = (on: boolean) => { setPicking(on); sheet(on); };
  const pick = (x: Asset) => { setA(x); setPx(String(x.px)); setAmt(''); showPicker(false); };
  const toggleFav = (sym: string) => setFavs(v => { const n = new Set(v); n.has(sym) ? n.delete(sym) : n.add(sym); return n; });
  const up = a.chg >= 0, stable = a.cat === 'Stablecoin';
  const amount = parseFloat(amt.replace(/,/g, '')) || 0;
  const value = price * amount;
  const fee = value * 0.0008;
  const buy = side === 'Buy';
  const accent = buy ? c.gain : c.loss;
  const pct = (p: number) => setAmt((buy ? (BAL[a.quote] * p) / price : BAL[a.sym] * p).toFixed(amtDp(a.px)));
  const money = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <View style={{ flex: 1 }}>
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      {/* Pair header */}
      <View style={s.between}>
        <Pressable style={s.row} onPress={() => showPicker(true)} accessibilityLabel="Change pair">
          <View style={[s.coin, { backgroundColor: a.col }]}><Text style={s.coinText}>{a.gl}</Text></View>
          <View>
            <View style={s.row}>
              <Text style={s.pair}>{a.sym} / {a.quote}</Text>
              <Ionicons name="chevron-down" size={14} color={c.ink3} />
            </View>
            <Text style={s.kicker}>SPOT · MAKER 0.08%</Text>
          </View>
        </Pressable>
        <Pressable style={s.iconBtn} onPress={() => toggleFav(a.sym)} accessibilityLabel="Favourite"><Ionicons name={favs.has(a.sym) ? 'star' : 'star-outline'} size={18} color={favs.has(a.sym) ? c.flag : c.ink} /></Pressable>
      </View>

      <View style={s.between}>
        <Text style={s.price} numberOfLines={1} adjustsFontSizeToFit>{fmtPx(a.px)}</Text>
        <View style={[s.chg, { backgroundColor: up ? 'rgba(31,122,85,.1)' : 'rgba(192,65,76,.1)' }]}><Text style={[s.chgText, { color: up ? c.gain : c.loss }]}>{up ? '▲' : '▼'} {stable ? `${Math.round(Math.abs(a.chg) * 100)} bps` : `${Math.abs(a.chg).toFixed(2)}%`} · 24h</Text></View>
      </View>

      <View style={s.stats}>
        {[['24H HIGH', fmtPx(a.hi)], ['24H LOW', fmtPx(a.lo)], ['VOL · HK$', fmtVol(a.vol)]].map(([k, v], i) => (
          <View key={k} style={[s.stat, i > 0 && { borderLeftWidth: 1, borderLeftColor: c.rule }]}>
            <Text style={s.kicker}>{k}</Text>
            <Text style={s.mono}>{v}</Text>
          </View>
        ))}
      </View>

      {/* Chart */}
      <View style={s.card}>
        <View style={[s.between, { marginBottom: 14 }]}>
          {FRAMES.map((k, i) => (
            <Pressable key={k} onPress={() => setFrame(i)} style={[s.frame, frame === i && s.frameOn]}>
              <Text style={[s.frameText, frame === i && { color: '#fff' }]}>{k}</Text>
            </Pressable>
          ))}
        </View>
        <Chart frame={frame} a={a} />
        <View style={[s.between, { marginTop: 10 }]}>
          <Text style={s.small}>H {fmtPx(a.hi)}  L {fmtPx(a.lo)}</Text>
          <Text style={[s.small, { color: up ? c.gain : c.loss }]}>C {fmtPx(a.px)}</Text>
        </View>
      </View>

      {/* Order form */}
      <View style={s.form}>
        <Corners color={c.deep} />
        <View style={s.sideToggle}>
          {(['Buy', 'Sell'] as const).map(k => (
            <Pressable key={k} onPress={() => setSide(k)} style={[s.sideBtn, side === k && { backgroundColor: k === 'Buy' ? c.gain : c.loss }]}>
              <Text style={[s.sideText, side === k && { color: '#fff' }]}>{k.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>

        <View style={[s.row, { gap: 18 }]}>
          {['Limit', 'Market', 'Stop-limit'].map(k => (
            <Pressable key={k} onPress={() => setType(k)}>
              <Text style={[s.typeText, type === k && s.typeOn]}>{k}</Text>
            </Pressable>
          ))}
        </View>

        <View style={s.between}>
          <Text style={s.small}>AVAILABLE</Text>
          <Text style={s.mono}>{buy ? `${money(BAL[a.quote])} ${a.quote}` : `${BAL[a.sym]?.toLocaleString('en-US', { minimumFractionDigits: amtDp(a.px) }) ?? '0.00'} ${a.sym}`}</Text>
        </View>

        <View style={s.field}>
          <Text style={s.fieldLabel}>Price</Text>
          <TextInput value={type === 'Market' ? 'Market' : px} editable={type !== 'Market'} onChangeText={setPx} keyboardType="decimal-pad" style={s.fieldInput} />
          <Text style={s.unit}>{a.quote}</Text>
        </View>
        <View style={s.field}>
          <Text style={s.fieldLabel}>Amount</Text>
          <TextInput value={amt} onChangeText={setAmt} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={c.ink4} style={s.fieldInput} />
          <Text style={s.unit}>{a.sym}</Text>
        </View>

        <View style={[s.row, { gap: 8 }]}>
          {[0.25, 0.5, 0.75, 1].map(p => (
            <Pressable key={p} onPress={() => pct(p)} style={s.pct}><Text style={s.pctText}>{p * 100}%</Text></Pressable>
          ))}
        </View>

        <View style={s.summary}>
          {[['Order value', value], ['Fee · maker 0.08%', fee], [buy ? 'Total to pay' : 'You receive', buy ? value + fee : value - fee]].map(([k, v], i) => (
            <View key={k as string} style={s.between}>
              <Text style={[s.sub, i === 2 && { color: c.ink, fontFamily: f.semi }]}>{k}</Text>
              <Text style={[s.mono, i === 2 && { color: accent }]}>{money(v as number)} {a.quote}</Text>
            </View>
          ))}
        </View>

        <CutButton title={`Review ${side.toLowerCase()} ${a.sym}`} height={52} />
        <Text style={[s.sub, { textAlign: 'center' }]}>You'll see the final price before anything is executed.</Text>
      </View>

      {/* Book / orders */}
      <View>
        <View style={s.tabs}>
          {([['book', 'Order book'], ['orders', 'Open orders · 2']] as const).map(([k, label]) => (
            <Pressable key={k} onPress={() => setTab(k)} style={[s.tab, tab === k && s.tabOn]}>
              <Text style={[s.tabText, tab === k && { color: c.ink }]}>{label}</Text>
            </Pressable>
          ))}
        </View>

        {tab === 'book' ? (
          <View style={s.card}>
            <View style={[s.bookRow, { marginBottom: 6 }]}>
              <Text style={[s.kicker, s.c1]}>PRICE</Text><Text style={[s.kicker, s.c2]}>AMOUNT</Text><Text style={[s.kicker, s.c3]}>TOTAL</Text>
            </View>
            {asks.map(([p, n, tot]) => (
              <Pressable key={p} onPress={() => setPx(String(+fmtPx(p).replace(/,/g, '')))} style={s.bookRow}>
                <View style={[s.depth, { width: `${(tot / max) * 100}%`, backgroundColor: 'rgba(192,65,76,.08)' }]} />
                <Text style={[s.bookText, s.c1, { color: c.loss }]}>{fmtPx(p)}</Text>
                <Text style={[s.bookText, s.c2]}>{n.toLocaleString('en-US', { maximumFractionDigits: amtDp(a.px) })}</Text>
                <Text style={[s.bookText, s.c3]}>{tot.toLocaleString('en-US', { maximumFractionDigits: amtDp(a.px) })}</Text>
              </Pressable>
            ))}
            <View style={s.mid}>
              <Text style={[s.mono, { fontSize: t.h4 }]}>{fmtPx(a.px)}</Text>
              <Text style={s.small}>SPREAD {fmtPx(tick * 2)} · {((tick * 2) / a.px * 10000).toFixed(1)} BPS</Text>
            </View>
            {bids.map(([p, n, tot]) => (
              <Pressable key={p} onPress={() => setPx(String(+fmtPx(p).replace(/,/g, '')))} style={s.bookRow}>
                <View style={[s.depth, { width: `${(tot / max) * 100}%`, backgroundColor: 'rgba(31,122,85,.08)' }]} />
                <Text style={[s.bookText, s.c1, { color: c.gain }]}>{fmtPx(p)}</Text>
                <Text style={[s.bookText, s.c2]}>{n.toLocaleString('en-US', { maximumFractionDigits: amtDp(a.px) })}</Text>
                <Text style={[s.bookText, s.c3]}>{tot.toLocaleString('en-US', { maximumFractionDigits: amtDp(a.px) })}</Text>
              </Pressable>
            ))}
            <View style={[s.ratio, { marginTop: 14 }]}>
              <View style={{ flex: 55.8, backgroundColor: c.gain }} /><View style={{ flex: 44.2, backgroundColor: c.loss }} />
            </View>
            <View style={[s.between, { marginTop: 6, marginBottom: 14 }]}>
              <Text style={[s.small, { color: c.gain }]}>B 55.80%</Text>
              <Text style={[s.small, { color: c.loss }]}>44.20% S</Text>
            </View>
          </View>
        ) : (
          <View style={s.card}>
            {ORDERS.map(([pair, sd, ty, p, a, filled, st], i) => (
              <View key={pair} style={[s.orderRow, i > 0 && { borderTopWidth: 1, borderTopColor: c.rule }]}>
                <View style={s.between}>
                  <Text style={s.body}>{pair} <Text style={{ color: sd === 'Buy' ? c.gain : c.loss }}>· {sd}</Text></Text>
                  <Text style={[s.badge, st === 'PARTIAL' && { color: '#9a7a12', borderColor: c.flag }]}>{st}</Text>
                </View>
                <View style={[s.between, { marginTop: 10 }]}>
                  {[['TYPE', ty], ['PRICE', p], ['AMOUNT', a], ['FILLED', filled]].map(([k, v]) => (
                    <View key={k}><Text style={s.kicker}>{k}</Text><Text style={[s.mono, { marginTop: 3 }]}>{v}</Text></View>
                  ))}
                </View>
                <Pressable style={s.cancel}><Text style={s.cancelText}>CANCEL</Text></Pressable>
              </View>
            ))}
            <View style={[s.between, s.ordersFoot]}>
              <Text style={s.small}>HELD FOR BUYS · HK$ 937,800</Text>
              <Pressable onPress={() => open({ screen: 'orders' })} hitSlop={8}><Text style={[s.small, { color: c.signal }]}>ALL ORDERS ›</Text></Pressable>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
    {picking && <PairPicker current={a.sym} favs={favs} onFav={toggleFav} onPick={pick} onClose={() => showPicker(false)} />}
    </View>
  );
}

const s = themed(() => StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 130, gap: 24 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },
  iconBtn: { width: 44, height: 44, borderWidth: 1, borderColor: c.ruleStrong, backgroundColor: c.sheet, alignItems: 'center', justifyContent: 'center' },
  coin: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  coinText: { color: '#fff', fontFamily: f.semi, fontSize: t.h4 },
  pair: { color: c.ink, fontFamily: f.semi, fontSize: t.h3 },
  price: { color: c.ink, fontFamily: f.mono, fontSize: 34 },
  chg: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 2 },
  chgText: { fontFamily: f.mono, fontSize: t.label },

  stats: { flexDirection: 'row', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule },
  stat: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, gap: 6 },

  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, padding: 16 },
  frame: { paddingHorizontal: 7, paddingVertical: 5, borderRadius: 2 },
  frameOn: { backgroundColor: c.deep },
  frameText: { color: c.ink3, fontFamily: f.mono, fontSize: 11 },

  form: { backgroundColor: c.hero, borderWidth: 1, borderColor: c.rule, padding: 24, gap: 18 },
  sideToggle: { flexDirection: 'row', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, padding: 4 },
  sideBtn: { flex: 1, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 2 },
  sideText: { color: c.ink2, fontFamily: f.mono, fontSize: 12, letterSpacing: 1.2 },
  typeText: { color: c.ink3, fontFamily: f.med, fontSize: t.body, paddingBottom: 4 },
  typeOn: { color: c.ink, borderBottomWidth: 2, borderBottomColor: c.signal },
  field: { flexDirection: 'row', alignItems: 'center', height: 52, paddingHorizontal: 14, backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, borderRadius: 2 },
  fieldLabel: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, width: 60 },
  fieldInput: { flex: 1, height: '100%', textAlign: 'right', color: c.ink, fontFamily: f.mono, fontSize: t.h4 },
  unit: { color: c.ink3, fontFamily: f.mono, fontSize: 11, marginLeft: 10, width: 36, textAlign: 'right' },
  pct: { flex: 1, height: 34, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.ruleStrong, backgroundColor: c.sheet, borderRadius: 2 },
  pctText: { color: c.ink2, fontFamily: f.mono, fontSize: 11 },
  summary: { gap: 10, paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.ruleStrong },

  tabs: { flexDirection: 'row', gap: 20, marginBottom: 14 },
  tab: { paddingBottom: 6 },
  tabOn: { borderBottomWidth: 2, borderBottomColor: c.signal },
  tabText: { color: c.ink3, fontFamily: f.semi, fontSize: t.h4 },

  bookRow: { flexDirection: 'row', paddingVertical: 5 },
  depth: { position: 'absolute', right: 0, top: 1, bottom: 1 },
  c1: { flex: 1 }, c2: { flex: 1, textAlign: 'right' }, c3: { flex: 1, textAlign: 'right' },
  bookText: { color: c.ink2, fontFamily: f.mono, fontSize: t.label },
  mid: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, marginVertical: 6, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.rule },
  ratio: { flexDirection: 'row', height: 4, gap: 2 },

  orderRow: { paddingVertical: 14 },
  badge: { color: c.deep, fontFamily: f.mono, fontSize: 10, letterSpacing: 1, borderWidth: 1, borderColor: c.ruleStrong, paddingHorizontal: 6, paddingVertical: 2 },
  cancel: { alignSelf: 'flex-start', marginTop: 12, borderWidth: 1, borderColor: c.ruleStrong, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 2 },
  cancelText: { color: c.ink, fontFamily: f.mono, fontSize: 10, letterSpacing: 1 },
  ordersFoot: { paddingTop: 12, borderTopWidth: 1, borderTopColor: c.rule },

  body: { color: c.ink, fontFamily: f.semi, fontSize: t.body },
  sub: { color: c.ink3, fontFamily: f.reg, fontSize: t.label },
  small: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 0.6 },
  mono: { color: c.ink, fontFamily: f.mono, fontSize: t.body },
}));
