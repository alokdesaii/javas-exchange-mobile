// Design-only: mock asset list copied from the web markets page. Search/filters/watchlist work locally.
import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Corners } from '../components/Ledger';
import { c, f, t, themed } from '../theme';
import { useNav } from '../components/Nav';

// sym, name, quote, category, price, 24h %, low, high, volume (HK$), colour, glyph
export const ASSETS = ([
  ['BTC', 'Bitcoin', 'USDT', 'Layer 1', 83560.2, 1.82, 81940, 84210, 1.24e9, '#f7931a', '₿'],
  ['USDT', 'Tether', 'HKD', 'Stablecoin', 7.8241, 0.04, 7.818, 7.829, 412.8e6, '#26a17b', '₮'],
  ['ETH', 'Ethereum', 'USDT', 'Layer 1', 2692.4, -0.61, 2668, 2741, 684.1e6, '#627eea', 'Ξ'],
  ['USDC', 'USD Coin', 'HKD', 'Stablecoin', 7.8198, 0.02, 7.816, 7.824, 198.4e6, '#2775ca', '$'],
  ['SOL', 'Solana', 'USDT', 'Layer 1', 117.17, 0.18, 113.4, 119.05, 139.2e6, '#14b37a', '◎'],
  ['XRP', 'XRP', 'USDT', 'Layer 1', 1.5856, 3.66, 1.519, 1.602, 103.8e6, '#23292f', '✕'],
  ['BNB', 'BNB', 'USDT', 'Layer 1', 764.83, -0.9, 752.1, 773.4, 77.9e6, '#d9a20b', 'B'],
  ['DOGE', 'Dogecoin', 'USDT', 'Meme', 0.09947, 1.36, 0.09702, 0.10115, 54.5e6, '#c2a633', 'Ð'],
  ['NEAR', 'NEAR Protocol', 'USDT', 'Layer 1', 4.53, 1.57, 4.41, 4.62, 53.5e6, '#23292f', 'N'],
  ['HYPE', 'Hyperliquid', 'USDT', 'DeFi', 95.908, 1.05, 93.12, 97.4, 41.6e6, '#14b39a', 'H'],
  ['UNI', 'Uniswap', 'USDT', 'DeFi', 9.842, 11.93, 8.705, 9.95, 40.4e6, '#e8458b', 'U'],
  ['AVAX', 'Avalanche', 'USDT', 'Layer 1', 10.23, -2.2, 9.81, 10.61, 40.7e6, '#e84142', 'A'],
  ['ADA', 'Cardano', 'USDT', 'Layer 1', 0.7012, 1.81, 0.6831, 0.7098, 36.9e6, '#0033ad', 'A'],
  ['LINK', 'Chainlink', 'USDT', 'DeFi', 12.91, 0.03, 12.26, 13.19, 33.9e6, '#2a5ada', 'L'],
  ['TRX', 'Tron', 'USDT', 'Layer 1', 0.3277, -0.88, 0.327, 0.3307, 29.2e6, '#c23631', 'T'],
  ['LTC', 'Litecoin', 'USDT', 'Layer 1', 62.71, 3.89, 60.02, 63.3, 27.0e6, '#345d9d', 'Ł'],
  ['POL', 'Polygon', 'USDT', 'Layer 1', 0.2214, 4.21, 0.211, 0.224, 18.3e6, '#7b3fe4', 'P'],
  ['DOT', 'Polkadot', 'USDT', 'Layer 1', 1.16, -4.61, 1.12, 1.22, 17.8e6, '#e6007a', '●'],
  ['BCH', 'Bitcoin Cash', 'USDT', 'Layer 1', 271.8, -0.66, 257.4, 275.6, 12.6e6, '#8dc351', 'B'],
  ['PEPE', 'Pepe', 'USDT', 'Meme', 0.00000405, 3.33, 0.00000388, 0.00000418, 2.2e6, '#3d9b3d', 'P'],
] as const).map(([sym, name, quote, cat, px, chg, lo, hi, vol, col, gl]) => ({ sym, name, quote, cat, px, chg, lo, hi, vol, col, gl }));

const PEG = [['DAI', 7.8164], ['USDC', 7.8198], ['USDT', 7.8241]] as const;

const FILTERS = ['All', 'Watchlist', 'Layer 1', 'DeFi', 'Meme', 'Stablecoin', 'Gainers', 'Losers'] as const;

export const fmtPx = (p: number) => p < 0.001 ? p.toFixed(8) : p < 1 ? p.toFixed(4) : p.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: p < 10 ? 4 : 2 });
export const fmtVol = (v: number) => v >= 1e9 ? `${(v / 1e9).toFixed(2)}B` : `${(v / 1e6).toFixed(1)}M`;

export default function Markets() {
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [watch, setWatch] = useState(new Set(['BTC', 'ETH', 'USDT']));

  const rows = ASSETS
    .filter(a => !q || (a.sym + a.name).toLowerCase().includes(q.toLowerCase()))
    .filter(a => filter === 'All' || (filter === 'Watchlist' ? watch.has(a.sym) : filter === 'Gainers' ? a.chg > 0 : filter === 'Losers' ? a.chg < 0 : a.cat === filter))
    .sort((a, b) => filter === 'Gainers' ? b.chg - a.chg : filter === 'Losers' ? a.chg - b.chg : b.vol - a.vol);

  const { open } = useNav();
  const toggle = (sym: string) => setWatch(w => { const n = new Set(w); n.has(sym) ? n.delete(sym) : n.add(sym); return n; });

  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View>
        <Text style={s.kicker}>20 ASSETS · UPDATED 09:42 HKT</Text>
        <Text style={s.h1}>Markets</Text>
      </View>

      <View style={s.search}>
        <Ionicons name="search" size={18} color={c.ink3} />
        <TextInput value={q} onChangeText={setQ} placeholder="Search assets" placeholderTextColor={c.ink4} style={s.searchInput} />
        {!!q && <Pressable onPress={() => setQ('')} hitSlop={10}><Ionicons name="close" size={18} color={c.ink3} /></Pressable>}
      </View>

      {/* Stat strip */}
      <View style={s.stats}>
        {[['VOL · HK$', '27.2B', '▲ 8.4%'], ['BTC DOM.', '58.20%', '▲ 0.4 pts'], ['SETTLEMENT', 'T+0', 'FPS · CHATS']].map(([k, v, d], i) => (
          <View key={k} style={[s.stat, i > 0 && { borderLeftWidth: 1, borderLeftColor: c.rule }]}>
            <Text style={s.kicker}>{k}</Text>
            <Text style={s.statVal}>{v}</Text>
            <Text style={[s.small, i < 2 && { color: c.gain }]}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Peg band */}
      <View style={s.peg}>
        <Corners color={c.deep} />
        <Text style={s.kicker}>HKD PEG — WHERE OUR STABLECOINS SIT</Text>
        <View style={s.band}>
          {PEG.map(([k, v]) => (
            <View key={k} style={[s.marker, { left: `${((+v - 7.75) / 0.1) * 100}%` }]}>
              <View style={[s.markerDot, k === 'USDT' && { backgroundColor: c.signal }]} />
            </View>
          ))}
        </View>
        <View style={s.legend}>
          {PEG.map(([k, v]) => (
            <View key={k} style={s.legendItem}>
              <View style={[s.markerDot, { borderWidth: 0, width: 8, height: 8 }, k === 'USDT' && { backgroundColor: c.signal }]} />
              <Text style={s.small}>{k} <Text style={{ color: c.ink }}>{v}</Text></Text>
            </View>
          ))}
        </View>
        <View style={s.between}>
          <Text style={s.small}>7.7500 · strong</Text>
          <Text style={s.small}>7.8000</Text>
          <Text style={s.small}>weak · 7.8500</Text>
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}>
        {FILTERS.map(k => (
          <Pressable key={k} onPress={() => setFilter(k)} style={[s.chip, filter === k && s.chipOn]}>
            {k === 'Watchlist' && <Ionicons name="star" size={11} color={filter === k ? c.flag : c.ink3} />}
            <Text style={[s.chipText, filter === k && { color: '#fff' }]}>{k === 'Stablecoin' ? 'Stablecoins' : k}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* List */}
      <View style={s.card}>
        <View style={s.head}>
          <Text style={[s.kicker, { flex: 1 }]}>ASSET · VOL</Text>
          <Text style={s.kicker}>PRICE · 24H</Text>
        </View>
        {rows.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.body}>No assets match</Text>
            <Text style={s.sub}>Try a different asset, or clear the filters.</Text>
            <Pressable onPress={() => { setQ(''); setFilter('All'); }}><Text style={[s.link, { marginTop: 12 }]}>Clear filters</Text></Pressable>
          </View>
        ) : rows.map(a => {
          const up = a.chg >= 0;
          return (
            <Pressable key={a.sym} style={s.row} onPress={() => open({ screen: 'asset', sym: a.sym })}>
              <Pressable onPress={() => toggle(a.sym)} hitSlop={8}>
                <Ionicons name={watch.has(a.sym) ? 'star' : 'star-outline'} size={15} color={watch.has(a.sym) ? c.flag : c.ink4} />
              </Pressable>
              <View style={[s.coin, { backgroundColor: a.col }]}><Text style={s.coinText}>{a.gl}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.body}>{a.sym}<Text style={s.quote}> / {a.quote}</Text></Text>
                <Text style={s.sub}>HK$ {fmtVol(a.vol)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 5 }}>
                <Text style={s.mono}>{fmtPx(a.px)}</Text>
                <View style={[s.chg, { backgroundColor: up ? 'rgba(31,122,85,.1)' : 'rgba(192,65,76,.1)' }]}>
                  <Text style={[s.chgText, { color: up ? c.gain : c.loss }]}>{up ? '▲' : '▼'} {Math.abs(a.chg).toFixed(2)}%</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 130, gap: 24 },
  h1: { color: c.ink, fontFamily: f.semi, fontSize: t.h1, marginTop: 4 },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },
  between: { flexDirection: 'row', justifyContent: 'space-between' },

  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 50, paddingHorizontal: 16, backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, borderRadius: 2 },
  searchInput: { flex: 1, height: '100%', color: c.ink, fontFamily: f.reg, fontSize: t.body },

  stats: { flexDirection: 'row', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule },
  stat: { flex: 1, paddingVertical: 16, paddingHorizontal: 12, gap: 6 },
  statVal: { color: c.ink, fontFamily: f.mono, fontSize: t.h4 },

  peg: { backgroundColor: c.hero, borderWidth: 1, borderColor: c.rule, padding: 22, gap: 18 },
  band: { height: 2, backgroundColor: c.ruleStrong, marginVertical: 8 },
  marker: { position: 'absolute', top: -5, alignItems: 'center', width: 0 },
  markerDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: c.deep, borderWidth: 2, borderColor: c.hero },
  legend: { flexDirection: 'row', justifyContent: 'space-between' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 2, borderWidth: 1, borderColor: c.rule, backgroundColor: c.sheet },
  chipOn: { backgroundColor: c.deep, borderColor: c.deep },
  chipText: { color: c.ink2, fontFamily: f.med, fontSize: t.label },

  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, paddingHorizontal: 16 },
  head: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: c.rule },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: c.rule },
  coin: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  coinText: { color: '#fff', fontFamily: f.semi, fontSize: t.body },
  chg: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 2 },
  chgText: { fontFamily: f.mono, fontSize: 11 },
  empty: { alignItems: 'center', paddingVertical: 40 },

  body: { color: c.ink, fontFamily: f.semi, fontSize: t.body },
  quote: { color: c.ink3, fontFamily: f.reg },
  sub: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, marginTop: 3 },
  small: { color: c.ink3, fontFamily: f.mono, fontSize: 10 },
  mono: { color: c.ink, fontFamily: f.mono, fontSize: t.body },
  link: { color: c.signal, fontFamily: f.med, fontSize: t.body },
}));
