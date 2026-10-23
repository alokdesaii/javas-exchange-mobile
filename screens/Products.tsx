// Design-only Earn and Futures. Both sit behind a compliance check, as on the web dashboard ("Compliance check").
// Passing the check is local state; nothing is subscribed or traded.
import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Corners, CutButton } from '../components/Ledger';
import { Header } from '../components/Nav';
import { c, f, t, themed } from '../theme';

// A short suitability check before derivatives or yield products (SFC-style; wording is a placeholder).
function ComplianceGate({ product, onPass }: { product: 'Earn' | 'Futures'; onPass: () => void }) {
  const futures = product === 'Futures';
  const Q = futures
    ? [['Have you traded derivatives (futures, options, CFDs) in the last 3 years?', ['Yes, regularly', 'A few times', 'Never']],
       ['With 10x leverage, a 10% move against you…', ['Wipes out the margin', 'Loses 10%', 'Is capped by Javas']],
       ['Does the company hold a portfolio of at least HK$ 40M?', ['Yes', 'No']]]
    : [['Yield products can lose value if a counterparty fails. Do you understand?', ['Yes', 'No']],
       ['Locked products can be redeemed before the term ends.', ['True', 'False']],
       ['Does the company hold a portfolio of at least HK$ 40M?', ['Yes', 'No']]];
  const RIGHT = futures ? [0, 0, 0] : [0, 1, 0];
  const [a, setA] = useState<(number | null)[]>([null, null, null]);
  const [failed, setFailed] = useState(false);
  const done = a.every(x => x !== null);
  return (
    <>
      <View style={s.panel}>
        <Corners color={c.deep} />
        <View style={[s.row, { gap: 12 }]}>
          <View style={s.gateIcon}><Ionicons name="shield-half-outline" size={22} color={c.deep} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Compliance check</Text>
            <Text style={s.hint}>{futures ? 'Futures' : 'Earn'} is offered to Professional Investors only. Three questions, about a minute.</Text>
          </View>
        </View>
      </View>
      {Q.map(([q, opts], i) => (
        <View key={q as string} style={{ gap: 10 }}>
          <Text style={s.bodyInk}><Text style={s.qNo}>0{i + 1}  </Text>{q}</Text>
          {(opts as string[]).map((o, j) => (
            <Pressable key={o} onPress={() => { const n = [...a]; n[i] = j; setA(n); setFailed(false); }} style={[s.opt, a[i] === j && s.optOn]}>
              <Ionicons name={a[i] === j ? 'radio-button-on' : 'radio-button-off'} size={18} color={a[i] === j ? c.signal : c.ink4} />
              <Text style={s.body}>{o}</Text>
            </Pressable>
          ))}
        </View>
      ))}
      {failed && <Text style={[s.hint, { color: c.loss }]}>Based on your answers, {product} isn't suitable right now. Your relationship manager can walk you through it.</Text>}
      <CutButton title="Submit answers" onPress={() => done && (a.every((x, i) => x === RIGHT[i]) ? onPass() : setFailed(true))} />
      <Text style={[s.small, { textAlign: 'center' }]}>PREVIEW: THE FIRST OPTION IN EACH PASSES</Text>
    </>
  );
}

const EARN = [
  ['USDT', '₮', '#26a17b', 'Flexible', '4.20%', 'Redeem any time', 'Simple'],
  ['USDC', '$', '#2775ca', 'Flexible', '3.85%', 'Redeem any time', 'Simple'],
  ['USDT', '₮', '#26a17b', '30-day locked', '5.60%', 'Pays at maturity', 'Fixed'],
  ['HKD', 'HK$', '#5b45a8', '90-day locked', '4.90%', 'Bank-placed, HKD only', 'Fixed'],
  ['ETH', 'Ξ', '#627eea', 'Staking', '3.10%', '~2 days to unstake', 'Staking'],
  ['SOL', '◎', '#14b37a', 'Staking', '6.40%', '~3 days to unstake', 'Staking'],
] as const;

function Earn() {
  const [kind, setKind] = useState<'All' | 'Simple' | 'Fixed' | 'Staking'>('All');
  const [pick, setPick] = useState<number | null>(null);
  const [amt, setAmt] = useState('');
  const [subscribed, setSubscribed] = useState<number[]>([]);
  return (
    <>
      <View style={s.stats}>
        {[['IN EARN', 'HK$ 0'], ['EARNED', 'HK$ 0'], ['BEST APR', '6.40%']].map(([k, v], i) => (
          <View key={k} style={[s.stat, i > 0 && { borderLeftWidth: 1, borderLeftColor: c.rule }]}><Text style={s.kicker}>{k}</Text><Text style={s.statVal}>{v}</Text></View>
        ))}
      </View>
      <View style={[s.row, { gap: 8 }]}>
        {(['All', 'Simple', 'Fixed', 'Staking'] as const).map(k => (
          <Pressable key={k} onPress={() => setKind(k)} style={[s.chip, kind === k && s.chipOn]}><Text style={[s.chipText, kind === k && { color: '#fff' }]}>{k}</Text></Pressable>
        ))}
      </View>
      {EARN.map((p, i) => [p, i] as const).filter(([p]) => kind === 'All' || p[6] === kind).map(([[sym, gl, col, term, apr, note], i]) => (
        <View key={i} style={s.product}>
          <Pressable style={s.between} onPress={() => { setPick(pick === i ? null : i); setAmt(''); }}>
            <View style={[s.row, { gap: 12, flex: 1 }]}>
              <View style={[s.coin, { backgroundColor: col }]}><Text style={[s.coinText, gl.length > 1 && { fontSize: 9 }]}>{gl}</Text></View>
              <View><Text style={s.bodyInk}>{sym} · {term}</Text><Text style={s.hint}>{note}</Text></View>
            </View>
            <View style={{ alignItems: 'flex-end' }}><Text style={[s.apr]}>{apr}</Text><Text style={s.small}>APR</Text></View>
          </Pressable>
          {subscribed.includes(i) && <Text style={[s.hint, { color: c.gain }]}>✓ Subscribed · first reward tomorrow 08:00 HKT</Text>}
          {pick === i && !subscribed.includes(i) && (
            <View style={{ gap: 12, paddingTop: 4 }}>
              <View style={s.field}>
                <TextInput value={amt} onChangeText={setAmt} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={c.ink4} style={s.fieldInput} />
                <Text style={s.unit}>{sym}</Text>
              </View>
              <View style={s.between}><Text style={s.hint}>Est. daily reward</Text><Text style={s.monoSm}>{((parseFloat(amt) || 0) * parseFloat(apr) / 100 / 365).toFixed(4)} {sym}</Text></View>
              <CutButton title={`Subscribe ${sym}`} height={46} onPress={() => parseFloat(amt) > 0 && setSubscribed([...subscribed, i])} />
            </View>
          )}
        </View>
      ))}
      <Text style={s.hint}>APRs are indicative and change daily. Earn products are not deposits and are not protected by the Deposit Protection Scheme.</Text>
    </>
  );
}

const PERPS = [['BTC-PERP', '83,571.4', '+1.84%', '0.0100%', '20x', '#f7931a', '₿'], ['ETH-PERP', '2,693.1', '−0.58%', '0.0082%', '20x', '#627eea', 'Ξ'], ['SOL-PERP', '117.22', '+0.21%', '0.0125%', '10x', '#14b37a', '◎'], ['XRP-PERP', '1.5861', '+3.70%', '0.0094%', '10x', '#23292f', '✕']] as const;

function Futures() {
  const [sel, setSel] = useState(0);
  const [lev, setLev] = useState(5);
  const [side, setSide] = useState<'Long' | 'Short'>('Long');
  const [margin, setMargin] = useState('1000');
  const [px, sym] = [parseFloat(PERPS[sel][1].replace(/,/g, '')), PERPS[sel][0]];
  const size = ((parseFloat(margin) || 0) * lev) / px;
  const liq = side === 'Long' ? px * (1 - 0.9 / lev) : px * (1 + 0.9 / lev);
  return (
    <>
      <View style={s.card}>
        {PERPS.map(([k, p, ch, fund, maxLev, col, gl], i) => (
          <Pressable key={k} onPress={() => setSel(i)} style={[s.perp, i > 0 && s.divider, sel === i && { backgroundColor: c.tint }]}>
            <View style={[s.coin, { backgroundColor: col }]}><Text style={s.coinText}>{gl}</Text></View>
            <View style={{ flex: 1 }}><Text style={s.bodyInk}>{k}</Text><Text style={s.hint}>Funding {fund} · up to {maxLev}</Text></View>
            <View style={{ alignItems: 'flex-end' }}><Text style={s.mono}>{p}</Text><Text style={[s.small, { color: ch.startsWith('+') ? c.gain : c.loss }]}>{ch}</Text></View>
          </Pressable>
        ))}
      </View>

      <View style={s.panel}>
        <Corners color={c.deep} />
        <View style={s.toggle}>
          {(['Long', 'Short'] as const).map(k => (
            <Pressable key={k} onPress={() => setSide(k)} style={[s.toggleBtn, side === k && { backgroundColor: k === 'Long' ? c.gain : c.loss }]}>
              <Text style={[s.toggleText, side === k && { color: '#fff' }]}>{k.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
        <View style={{ gap: 8 }}>
          <View style={s.between}><Text style={s.kicker}>LEVERAGE</Text><Text style={[s.mono, { color: c.signal }]}>{lev}x</Text></View>
          <View style={[s.row, { gap: 6 }]}>
            {[1, 2, 5, 10, 20].map(l => (
              <Pressable key={l} onPress={() => setLev(l)} style={[s.lev, lev === l && s.levOn]}><Text style={[s.levText, lev === l && { color: '#fff' }]}>{l}x</Text></Pressable>
            ))}
          </View>
        </View>
        <View style={s.field}>
          <Text style={[s.hint, { width: 60, marginTop: 0 }]}>Margin</Text>
          <TextInput value={margin} onChangeText={setMargin} keyboardType="decimal-pad" style={[s.fieldInput, { textAlign: 'right' }]} />
          <Text style={s.unit}>USDT</Text>
        </View>
        <View style={s.summary}>
          {[['Position size', `${size.toFixed(4)} ${sym.split('-')[0]}`], ['Entry (mark)', PERPS[sel][1]], ['Est. liquidation', liq.toLocaleString('en-US', { maximumFractionDigits: 2 })], ['Fee · taker', '0.05%']].map(([k, v], i) => (
            <View key={k} style={s.between}><Text style={s.hint}>{k}</Text><Text style={[s.monoSm, i === 2 && { color: c.loss }]}>{v}</Text></View>
          ))}
        </View>
        <CutButton title={`Open ${side.toLowerCase()} ${sym}`} />
      </View>
      <Text style={s.hint}>Leveraged trading can lose more than your margin in fast markets. Positions are marked to an index of major venues.</Text>
    </>
  );
}

export default function Products({ product }: { product: 'Earn' | 'Futures' }) {
  const [passed, setPassed] = useState(false);
  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Header kicker={product === 'Earn' ? 'YIELD PRODUCTS' : 'USDT-MARGINED PERPETUALS'} title={product} />
      {!passed ? <ComplianceGate product={product} onPass={() => setPassed(true)} /> : product === 'Earn' ? <Earn /> : <Futures />}
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 48, gap: 22 },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },

  panel: { backgroundColor: c.hero, borderWidth: 1, borderColor: c.rule, padding: 22, gap: 16 },
  gateIcon: { width: 44, height: 44, borderWidth: 1, borderColor: c.deep, backgroundColor: c.sheet, alignItems: 'center', justifyContent: 'center' },
  qNo: { color: c.signal, fontFamily: f.mono, fontSize: t.label },
  opt: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1, borderColor: c.rule, backgroundColor: c.sheet },
  optOn: { borderColor: c.signal },

  stats: { flexDirection: 'row', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule },
  stat: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, gap: 6 },
  statVal: { color: c.ink, fontFamily: f.mono, fontSize: t.h4 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 2, borderWidth: 1, borderColor: c.rule, backgroundColor: c.sheet },
  chipOn: { backgroundColor: c.deep, borderColor: c.deep },
  chipText: { color: c.ink2, fontFamily: f.med, fontSize: t.label },

  product: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, padding: 16, gap: 10 },
  coin: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  coinText: { color: '#fff', fontFamily: f.semi, fontSize: t.body },
  apr: { color: c.gain, fontFamily: f.mono, fontSize: t.h3 },
  field: { flexDirection: 'row', alignItems: 'center', height: 50, paddingHorizontal: 14, backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, borderRadius: 2 },
  fieldInput: { flex: 1, minWidth: 0, height: '100%', color: c.ink, fontFamily: f.mono, fontSize: t.h4 },
  unit: { color: c.ink3, fontFamily: f.mono, fontSize: 11, marginLeft: 10 },

  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule },
  divider: { borderTopWidth: 1, borderTopColor: c.rule },
  perp: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  toggle: { flexDirection: 'row', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, padding: 4 },
  toggleBtn: { flex: 1, height: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 2 },
  toggleText: { color: c.ink2, fontFamily: f.mono, fontSize: 12, letterSpacing: 1.2 },
  lev: { flex: 1, height: 36, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.ruleStrong, backgroundColor: c.sheet, borderRadius: 2 },
  levOn: { backgroundColor: c.deep, borderColor: c.deep },
  levText: { color: c.ink2, fontFamily: f.mono, fontSize: 11 },
  summary: { gap: 10, paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.ruleStrong },

  title: { color: c.ink, fontFamily: f.semi, fontSize: t.h4 },
  bodyInk: { color: c.ink, fontFamily: f.med, fontSize: t.body, lineHeight: 20 },
  body: { color: c.ink2, fontFamily: f.reg, fontSize: t.body },
  hint: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, lineHeight: 18, marginTop: 2 },
  small: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 0.6 },
  mono: { color: c.ink, fontFamily: f.mono, fontSize: t.body },
  monoSm: { color: c.ink, fontFamily: f.mono, fontSize: t.label },
}));
