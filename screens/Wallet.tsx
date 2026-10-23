// Design-only: balances copied from the web wallet page. Search, small-balance filter and row expand work locally.
import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Corners, CutButton } from '../components/Ledger';
import { c, f, t, themed } from '../theme';
import { useNav } from '../components/Nav';

// sym, name, total, available, inOrders, valueHKD, rate note, colour, glyph, tradable
const ASSETS = [
  ['USDT', 'Tether', '318,420.00', '318,420.00', '—', 2491349.92, '@ 7.8241', '#26a17b', '₮', true],
  ['HKD', 'Hong Kong Dollar', '1,924,200.00', '986,400.00', '937,800.00', 1924200, 'Cash', '#5b45a8', 'HK$', false],
  ['BTC', 'Bitcoin', '2.1840', '1.9236', '0.2604', 1427862.86, '@ 653,783.36', '#f7931a', '₿', true],
  ['ETH', 'Ethereum', '34.6000', '34.6000', '—', 728870, '@ 21,065.61', '#627eea', 'Ξ', true],
  ['USDC', 'USD Coin', '21,400.00', '21,400.00', '—', 167343.72, '@ 7.8198', '#2775ca', '$', true],
  ['ADA', 'Cardano', '1,250.00', '1,250.00', '—', 6857.82, '@ 5.4863', '#0033ad', 'A', true],
  ['SOL', 'Solana', '5.0000', '5.0000', '—', 4583.75, '@ 916.75', '#14b37a', '◎', true],
  ['XRP', 'XRP', '200.00', '200.00', '—', 2481.18, '@ 12.4059', '#23292f', '✕', true],
  ['LINK', 'Chainlink', '19.9420', '19.9420', '—', 2014.32, '@ 101.01', '#2a5ada', 'L', true],
] as const;

const TOTAL = 6755563.57;
const ALLOC = [['USDT', 36.9, '#26a17b'], ['HKD', 28.5, '#5b45a8'], ['BTC', 21.1, '#f7931a'], ['ETH', 10.8, '#627eea'], ['USDC', 2.5, '#2775ca'], ['Other', 0.2, '#b4aeb8']] as const;
const hk = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function Wallet() {
  const nav = useNav();
  const [hidden, setHidden] = useState(false);
  const [q, setQ] = useState('');
  const [hideSmall, setHideSmall] = useState(false);
  const [open, setOpen] = useState<string | null>('USDT');
  const mask = (v: string) => (hidden ? '••••••' : v);

  const rows = ASSETS
    .filter(a => !q || (a[0] + a[1]).toLowerCase().includes(q.toLowerCase()))
    .filter(a => !hideSmall || a[5] >= 5000);

  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={s.between}>
        <View>
          <Text style={s.kicker}>FIAT AND DIGITAL ASSETS</Text>
          <Text style={s.h1}>Wallet</Text>
        </View>
        <Pressable style={s.iconBtn} onPress={() => nav.open({ screen: 'transactions' })} accessibilityLabel="Transaction history"><Ionicons name="time-outline" size={20} color={c.ink} /></Pressable>
      </View>

      {/* Balance */}
      <View style={s.hero}>
        <Corners color={c.deep} />
        <Pressable style={s.row} onPress={() => setHidden(!hidden)}>
          <Text style={s.kicker}>TOTAL ESTIMATED BALANCE</Text>
          <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={15} color={c.ink3} />
        </Pressable>
        <Text style={s.balance} numberOfLines={1} adjustsFontSizeToFit>{mask('HK$ 6,755,563')}<Text style={s.cents}>{hidden ? '' : '.57'}</Text></Text>

        <View style={s.split}>
          <View style={s.splitCol}>
            <Text style={s.kicker}>■ AVAILABLE</Text>
            <Text style={s.mono}>{mask('HK$ 5,647,518')}</Text>
          </View>
          <View style={[s.splitCol, { borderLeftWidth: 1, borderLeftColor: c.ruleStrong, paddingLeft: 16 }]}>
            <Text style={s.kicker}>IN ORDERS · 2</Text>
            <Text style={s.mono}>{mask('HK$ 1,108,045')}</Text>
          </View>
        </View>

        <View style={[s.row, { gap: 10, marginTop: 22 }]}>
          <CutButton title="Deposit" height={46} style={{ flex: 1 }} onPress={() => nav.open({ screen: 'transfer', mode: 'deposit' })} />
          <Pressable style={s.ghost} onPress={() => nav.open({ screen: 'transfer', mode: 'withdraw' })}><Text style={s.ghostText}>WITHDRAW</Text></Pressable>
          <Pressable style={s.ghost}><Text style={s.ghostText}>TRADE</Text></Pressable>
        </View>
      </View>

      {/* Allocation */}
      <View>
        <Text style={[s.kicker, { marginBottom: 12 }]}>ALLOCATION</Text>
        <View style={s.alloc}>
          {ALLOC.map(([k, p, col]) => <View key={k} style={{ flex: p, backgroundColor: col }} />)}
        </View>
        <View style={s.legend}>
          {ALLOC.map(([k, p, col]) => (
            <View key={k} style={s.legendItem}>
              <View style={[s.swatch, { backgroundColor: col }]} />
              <Text style={s.small}>{k} <Text style={{ color: c.ink }}>{p}%</Text></Text>
            </View>
          ))}
        </View>
      </View>

      {/* Assets */}
      <View>
        <View style={[s.between, { marginBottom: 12 }]}>
          <Text style={s.kicker}>YOUR ASSETS</Text>
          <View style={s.row}>
            <Text style={s.small}>HIDE &lt; HK$ 5K</Text>
            <Switch value={hideSmall} onValueChange={setHideSmall} trackColor={{ true: c.deep, false: c.ruleStrong }} thumbColor="#fff" {...{ activeThumbColor: "#fff" }} style={{ transform: [{ scale: 0.8 }] }} />
          </View>
        </View>

        <View style={s.search}>
          <Ionicons name="search" size={18} color={c.ink3} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search assets" placeholderTextColor={c.ink4} style={s.searchInput} />
        </View>

        <View style={s.card}>
          {rows.length === 0 && <Text style={[s.sub, { textAlign: 'center', paddingVertical: 32 }]}>No assets match.</Text>}
          {rows.map(([sym, name, total, avail, inOrd, val, note, col, gl, tradable], i) => {
            const isOpen = open === sym;
            return (
              <View key={sym} style={i > 0 && s.divider}>
                <Pressable style={s.assetRow} onPress={() => setOpen(isOpen ? null : sym)}>
                  <View style={[s.coin, { backgroundColor: col }]}><Text style={[s.coinText, gl.length > 1 && { fontSize: 10 }]}>{gl}</Text></View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.body}>{sym}</Text>
                    <Text style={s.sub}>{name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={s.mono}>{mask(total)}</Text>
                    <Text style={s.sub}>{mask(`HK$ ${hk(val)}`)}</Text>
                  </View>
                  <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={c.ink4} />
                </Pressable>

                {isOpen && (
                  <View style={s.detail}>
                    <View style={s.detailGrid}>
                      {[['AVAILABLE', avail], ['IN ORDERS', inOrd], ['RATE', note], ['SHARE', `${((val / TOTAL) * 100).toFixed(1)}%`]].map(([k, v]) => (
                        <View key={k} style={s.detailCell}>
                          <Text style={s.kicker}>{k}</Text>
                          <Text style={[s.mono, { marginTop: 4 }]}>{k === 'RATE' || k === 'SHARE' ? v : mask(v)}</Text>
                        </View>
                      ))}
                    </View>
                    <View style={[s.row, { gap: 8 }]}>
                      {['Deposit', 'Withdraw', ...(tradable ? ['Trade'] : [])].map(a => (
                        <Pressable key={a} style={[s.mini, a === 'Deposit' && s.miniOn]} onPress={() => a !== 'Trade' && nav.open({ screen: 'transfer', mode: a === 'Deposit' ? 'deposit' : 'withdraw', asset: sym })}>
                          <Text style={[s.miniText, a === 'Deposit' && { color: '#fff' }]}>{a.toUpperCase()}</Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        <Text style={[s.small, { marginTop: 10 }]}>Values in HKD at indicative rates · 09:42 HKT</Text>
      </View>
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 130, gap: 32 },
  h1: { color: c.ink, fontFamily: f.semi, fontSize: t.h1, marginTop: 4 },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  iconBtn: { width: 44, height: 44, borderWidth: 1, borderColor: c.ruleStrong, backgroundColor: c.sheet, alignItems: 'center', justifyContent: 'center' },

  hero: { backgroundColor: c.hero, borderWidth: 1, borderColor: c.rule, padding: 28 },
  balance: { color: c.ink, fontFamily: f.mono, fontSize: 26, marginTop: 10 },
  cents: { color: c.ink3, fontSize: 18 },
  split: { flexDirection: 'row', marginTop: 22, gap: 16 },
  splitCol: { flex: 1, gap: 6 },
  ghost: { flex: 1, height: 46, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.ink4, backgroundColor: c.sheet, borderRadius: 2 },
  ghostText: { color: c.ink, fontFamily: f.mono, fontSize: 11, letterSpacing: 1 },

  alloc: { flexDirection: 'row', height: 10, gap: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 16, rowGap: 8, marginTop: 14 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  swatch: { width: 8, height: 8 },

  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingHorizontal: 16, backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, borderRadius: 2, marginBottom: 12 },
  searchInput: { flex: 1, height: '100%', color: c.ink, fontFamily: f.reg, fontSize: t.body },

  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, paddingHorizontal: 16 },
  divider: { borderTopWidth: 1, borderTopColor: c.rule },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16 },
  coin: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  coinText: { color: '#fff', fontFamily: f.semi, fontSize: t.body },
  detail: { paddingBottom: 18, gap: 16 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: c.canvas, borderWidth: 1, borderColor: c.rule },
  detailCell: { width: '50%', padding: 12 },
  mini: { flex: 1, height: 38, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.ruleStrong, borderRadius: 2 },
  miniOn: { backgroundColor: c.deep, borderColor: c.deep },
  miniText: { color: c.ink, fontFamily: f.mono, fontSize: 10, letterSpacing: 1 },

  body: { color: c.ink, fontFamily: f.semi, fontSize: t.body },
  sub: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, marginTop: 3 },
  small: { color: c.ink3, fontFamily: f.mono, fontSize: 10 },
  mono: { color: c.ink, fontFamily: f.mono, fontSize: t.body },
}));
