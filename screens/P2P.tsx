// Design-only: P2P desk from the web p2p page. Quick-buy maths, filters and toggles work locally; nothing is ordered.
import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Corners, CutButton } from '../components/Ledger';
import { Header } from '../components/Nav';
import { c, f, t, themed } from '../theme';

// sym, glyph, colour, HKD price
const ASSETS = [['USDT', '₮', '#26a17b', 7.8241], ['USDC', '$', '#2775ca', 7.8198], ['BTC', '₿', '#f7931a', 653950], ['ETH', 'Ξ', '#627eea', 21065.61], ['SOL', '◎', '#14b37a', 917]] as const;
const METHODS = [['FPS', 'Hong Kong instant · under 2 min'], ['Bank transfer', 'CHATS / wire · 5–15 min'], ['Wise', '5–10 min'], ['Revolut', 'Under 3 min']] as const;
// initials, name, orders, completion, asset, price, available, limit, payments
const BOOK = [
  ['AE', 'ApexExpress_HK', 2840, 99.8, 'USDT', 7.822, '85,400.00', 'HK$ 500 – 50,000', ['FPS', 'Bank transfer']],
  ['KC', 'KowloonCrypto', 1950, 99.4, 'USDT', 7.825, '42,000.00', 'HK$ 1,000 – 80,000', ['FPS', 'Revolut']],
  ['HD', 'HarbourDesk', 1210, 99.6, 'USDC', 7.819, '30,500.00', 'HK$ 500 – 40,000', ['FPS', 'Wise']],
  ['PO', 'PacificOTC', 3410, 100, 'BTC', 653950, '4.5000', 'HK$ 2,000 – 150,000', ['Bank transfer']],
  ['DP', 'DragonPay', 4120, 99.9, 'SOL', 917, '1,240.00', 'HK$ 500 – 60,000', ['FPS', 'Wise', 'Revolut']],
  ['VH', 'VictoriaHarbour', 860, 98.9, 'ETH', 21071.2, '38.2000', 'HK$ 1,000 – 120,000', ['Bank transfer', 'Wise']],
] as const;
const PAY_FILTERS = ['All payments', 'FPS', 'Bank transfer', 'Wise', 'Revolut'] as const;

const fmt = (v: number, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const pxFmt = (p: number) => (p < 100 ? fmt(p, 3) : fmt(p, 0));

export default function P2P() {
  const [side, setSide] = useState<'Buy' | 'Sell'>('Buy');
  const [sym, setSym] = useState('USDT');
  const [pay, setPay] = useState('10000');
  const [method, setMethod] = useState('FPS');
  const [filter, setFilter] = useState<(typeof PAY_FILTERS)[number]>('All payments');
  const [done, setDone] = useState(false);

  const a = ASSETS.find(x => x[0] === sym)!;
  const hkd = parseFloat(pay.replace(/,/g, '')) || 0;
  const receive = hkd / a[3];
  const buy = side === 'Buy';
  const offers = BOOK.filter(o => filter === 'All payments' || (o[8] as readonly string[]).includes(filter));

  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Header kicker="VERIFIED MERCHANTS · ESCROW" title="P2P" />

      <View style={s.stats}>
        {[['VOL · HK$', '11.1M'], ['ONLINE', '128'], ['AVG RELEASE', '1.8 min']].map(([k, v], i) => (
          <View key={k} style={[s.stat, i > 0 && { borderLeftWidth: 1, borderLeftColor: c.rule }]}>
            <Text style={s.kicker}>{k}</Text>
            <Text style={s.statVal}>{v}</Text>
          </View>
        ))}
      </View>

      {/* Quick buy */}
      <View style={s.panel}>
        <Corners color={c.deep} />
        <View style={s.toggle}>
          {(['Buy', 'Sell'] as const).map(k => (
            <Pressable key={k} onPress={() => { setSide(k); setDone(false); }} style={[s.toggleBtn, side === k && { backgroundColor: k === 'Buy' ? c.gain : c.loss }]}>
              <Text style={[s.toggleText, side === k && { color: '#fff' }]}>{k.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>

        <View style={[s.row, { gap: 8 }]}>
          {ASSETS.map(([k, g, col]) => (
            <Pressable key={k} onPress={() => { setSym(k); setDone(false); }} style={[s.asset, sym === k && s.assetOn]}>
              <View style={[s.coin, { backgroundColor: col }]}><Text style={s.coinText}>{g}</Text></View>
              <Text style={s.assetText}>{k}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ gap: 8 }}>
          <Text style={s.kicker}>{buy ? 'YOU PAY' : 'YOU RECEIVE'}</Text>
          <View style={s.field}>
            <TextInput value={pay} onChangeText={v => { setPay(v); setDone(false); }} keyboardType="decimal-pad" style={s.fieldInput} />
            <Text style={s.unit}>HKD</Text>
          </View>
          <View style={[s.between, { paddingHorizontal: 2 }]}>
            <Text style={s.sub}>{buy ? 'You receive (est.)' : 'You sell (est.)'}</Text>
            <Text style={[s.mono, { color: buy ? c.gain : c.ink }]}>{fmt(receive, a[3] > 1000 ? 6 : 2)} {sym}</Text>
          </View>
        </View>

        <View style={{ gap: 8 }}>
          <Text style={s.kicker}>PAYMENT METHOD</Text>
          <View style={s.methods}>
            {METHODS.map(([k, d], i) => (
              <Pressable key={k} onPress={() => setMethod(k)} style={[s.method, i > 0 && s.divider]}>
                <Ionicons name={method === k ? 'radio-button-on' : 'radio-button-off'} size={18} color={method === k ? c.signal : c.ink4} />
                <View style={{ flex: 1 }}>
                  <Text style={s.body}>{k}</Text>
                  <Text style={s.sub}>{d}</Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={s.summary}>
          {[['Reference price', `1 ${sym} ≈ ${pxFmt(a[3])} HKD`], ['Trading & escrow fee', '0.00%'], ['Price held for', '30 s once you confirm']].map(([k, v]) => (
            <View key={k} style={s.between}><Text style={s.sub}>{k}</Text><Text style={s.monoSm}>{v}</Text></View>
          ))}
        </View>

        {done
          ? <View style={s.done}><Ionicons name="lock-closed" size={16} color={c.gain} /><Text style={[s.body, { color: c.gain }]}>Escrow opened — pay by {method} within 15 min.</Text></View>
          : <CutButton title={`${side} ${sym}`} onPress={() => setDone(true)} />}
      </View>

      {/* Escrow steps */}
      <View>
        <Text style={[s.kicker, { marginBottom: 12 }]}>HOW ESCROW WORKS</Text>
        <View style={s.card}>
          {[['lock-closed-outline', 'Crypto locked in escrow', "The seller's crypto is held by Javas the moment you open an order."], ['card-outline', 'Pay the seller', 'Send the fiat by FPS, bank transfer, Wise or Revolut — directly, no fee.'], ['checkmark-circle-outline', 'Crypto released', 'Once the seller confirms payment, escrow releases it to your wallet. Disputes go to the desk.']].map(([icon, k, d], i) => (
            <View key={k} style={[s.step, i > 0 && s.divider]}>
              <Text style={s.stepNo}>0{i + 1}</Text>
              <View style={{ flex: 1, gap: 3 }}>
                <View style={[s.row, { gap: 8 }]}><Ionicons name={icon as 'lock-closed-outline'} size={15} color={c.deep} /><Text style={s.body}>{k}</Text></View>
                <Text style={s.sub}>{d}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Merchant book */}
      <View style={{ gap: 12 }}>
        <View style={s.between}>
          <Text style={s.kicker}>MERCHANT BOOK</Text>
          <Text style={s.small}>{offers.length} OFFERS</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}>
          {PAY_FILTERS.map(k => (
            <Pressable key={k} onPress={() => setFilter(k)} style={[s.chip, filter === k && s.chipOn]}>
              <Text style={[s.chipText, filter === k && { color: '#fff' }]}>{k}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {offers.map(([ini, name, orders, rate, asset, px, avail, limit, pays]) => (
          <View key={name} style={s.offer}>
            <View style={s.between}>
              <View style={[s.row, { gap: 12, flex: 1 }]}>
                <View style={s.avatar}><Text style={s.avatarText}>{ini}</Text></View>
                <View style={{ flex: 1 }}>
                  <View style={[s.row, { gap: 6 }]}>
                    <Text style={s.body} numberOfLines={1}>{name}</Text>
                    <Ionicons name="checkmark-circle" size={13} color={c.gain} />
                  </View>
                  <Text style={s.sub}>{fmt(orders, 0)} orders · {rate}%</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.price}>HK$ {pxFmt(px)}</Text>
                <Text style={s.small}>PER {asset}</Text>
              </View>
            </View>
            <View style={s.offerMeta}>
              <View><Text style={s.kicker}>AVAILABLE</Text><Text style={[s.monoSm, { marginTop: 3 }]}>{avail} {asset}</Text></View>
              <View style={{ alignItems: 'flex-end' }}><Text style={s.kicker}>LIMIT</Text><Text style={[s.monoSm, { marginTop: 3 }]}>{limit}</Text></View>
            </View>
            <View style={s.between}>
              <View style={[s.row, { gap: 6, flexWrap: 'wrap', flex: 1 }]}>
                {pays.map(p => <Text key={p} style={s.tag}>{p}</Text>)}
              </View>
              <Pressable style={s.buyBtn} onPress={() => { setSym(asset); setSide('Buy'); setDone(false); }}>
                <Text style={s.buyText}>BUY {asset}</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 48, gap: 28 },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },

  stats: { flexDirection: 'row', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule },
  stat: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, gap: 6 },
  statVal: { color: c.ink, fontFamily: f.mono, fontSize: t.h4 },

  panel: { backgroundColor: c.hero, borderWidth: 1, borderColor: c.rule, padding: 22, gap: 20 },
  toggle: { flexDirection: 'row', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, padding: 4 },
  toggleBtn: { flex: 1, height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 2 },
  toggleText: { color: c.ink2, fontFamily: f.mono, fontSize: 12, letterSpacing: 1.2 },
  asset: { flex: 1, alignItems: 'center', gap: 5, paddingVertical: 9, borderWidth: 1, borderColor: c.rule, backgroundColor: c.sheet },
  assetOn: { borderColor: c.signal, backgroundColor: c.tint },
  coin: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  coinText: { color: '#fff', fontFamily: f.semi, fontSize: 13 },
  assetText: { color: c.ink, fontFamily: f.mono, fontSize: 10 },
  field: { flexDirection: 'row', alignItems: 'center', height: 56, paddingHorizontal: 16, backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, borderRadius: 2 },
  fieldInput: { flex: 1, minWidth: 0, height: '100%', color: c.ink, fontFamily: f.mono, fontSize: t.h3 },
  unit: { color: c.ink3, fontFamily: f.mono, fontSize: 12 },
  methods: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, paddingHorizontal: 14 },
  method: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  summary: { gap: 10, paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.ruleStrong },
  done: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', minHeight: 52, paddingHorizontal: 12, borderWidth: 1, borderColor: c.gain, backgroundColor: c.sheet },

  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, paddingHorizontal: 16 },
  divider: { borderTopWidth: 1, borderTopColor: c.rule },
  step: { flexDirection: 'row', gap: 14, paddingVertical: 16 },
  stepNo: { color: c.signal, fontFamily: f.mono, fontSize: t.label, width: 22 },

  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 2, borderWidth: 1, borderColor: c.rule, backgroundColor: c.sheet },
  chipOn: { backgroundColor: c.deep, borderColor: c.deep },
  chipText: { color: c.ink2, fontFamily: f.med, fontSize: t.label },

  offer: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, padding: 16, gap: 14 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: c.deep, fontFamily: f.semi, fontSize: t.label, letterSpacing: 0.5 },
  price: { color: c.ink, fontFamily: f.mono, fontSize: t.h4 },
  offerMeta: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, backgroundColor: c.canvas, borderWidth: 1, borderColor: c.rule },
  tag: { color: c.ink2, fontFamily: f.mono, fontSize: 9, letterSpacing: 0.6, borderWidth: 1, borderColor: c.ruleStrong, paddingHorizontal: 6, paddingVertical: 2 },
  buyBtn: { backgroundColor: c.gain, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 2 },
  buyText: { color: '#fff', fontFamily: f.mono, fontSize: 10, letterSpacing: 1 },

  body: { color: c.ink, fontFamily: f.med, fontSize: t.body },
  sub: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, lineHeight: 17 },
  small: { color: c.ink3, fontFamily: f.mono, fontSize: 10 },
  mono: { color: c.ink, fontFamily: f.mono, fontSize: t.body },
  monoSm: { color: c.ink, fontFamily: f.mono, fontSize: t.label },
}));
