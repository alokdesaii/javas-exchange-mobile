// Design-only asset page opened from a Markets row: price, chart, stats, your holding, and a hand-off to Trade.
import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Corners, CutButton } from '../components/Ledger';
import { Header, useNav } from '../components/Nav';
import { ASSETS, fmtPx, fmtVol } from './Markets';
import { Chart, BAL } from './Trade';
import { c, f, t, themed } from '../theme';

const ABOUT: Record<string, string> = {
  BTC: 'The first and largest cryptocurrency, with a fixed supply of 21 million coins.',
  ETH: 'The network behind most smart contracts and stablecoins, secured by proof of stake.',
  USDT: 'A US-dollar stablecoin issued by Tether. On Javas it is quoted inside the HKD peg band.',
  USDC: 'A US-dollar stablecoin issued by Circle, backed by cash and short-dated US Treasuries.',
  SOL: 'A high-throughput proof-of-stake chain, popular for payments and trading apps.',
};
const FRAMES = ['1D', '1W', '1M', '3M', '1Y'];

export default function AssetDetail({ sym }: { sym: string }) {
  const { open, trade } = useNav();
  const a = ASSETS.find(x => x.sym === sym) ?? ASSETS[0];
  const [frame, setFrame] = useState(0);
  const [fav, setFav] = useState(false);
  const up = a.chg >= 0;
  const held = BAL[a.sym] ?? 0;
  const hkd = held * a.px * (a.quote === 'USDT' ? 7.8241 : 1);

  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
      <View style={s.between}>
        <Header kicker={`${a.cat.toUpperCase()} · ${a.sym}`} title={a.name} />
        <Pressable style={s.iconBtn} onPress={() => setFav(!fav)} accessibilityLabel="Favourite">
          <Ionicons name={fav ? 'star' : 'star-outline'} size={18} color={fav ? c.flag : c.ink} />
        </Pressable>
      </View>

      <View style={[s.row, { gap: 14 }]}>
        <View style={[s.coin, { backgroundColor: a.col }]}><Text style={s.coinText}>{a.gl}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={s.price} numberOfLines={1} adjustsFontSizeToFit>{fmtPx(a.px)} <Text style={s.quote}>{a.quote}</Text></Text>
          <Text style={[s.chg, { color: up ? c.gain : c.loss }]}>{up ? '▲' : '▼'} {Math.abs(a.chg).toFixed(2)}% · 24h</Text>
        </View>
      </View>

      <View style={s.card}>
        <Chart frame={frame + 3} a={a} />
        <View style={[s.between, { marginTop: 12 }]}>
          {FRAMES.map((k, i) => (
            <Pressable key={k} onPress={() => setFrame(i)} style={[s.frame, frame === i && s.frameOn]}>
              <Text style={[s.frameText, frame === i && { color: '#fff' }]}>{k}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={s.grid}>
        {[['24H HIGH', fmtPx(a.hi)], ['24H LOW', fmtPx(a.lo)], ['24H VOLUME', `HK$ ${fmtVol(a.vol)}`], ['QUOTED IN', a.quote]].map(([k, v], i) => (
          <View key={k} style={[s.cell, i % 2 === 1 && s.cellR, i > 1 && s.cellB]}>
            <Text style={s.kicker}>{k}</Text>
            <Text style={s.mono}>{v}</Text>
          </View>
        ))}
      </View>

      <View style={s.panel}>
        <Corners color={c.deep} />
        <Text style={s.kicker}>YOUR {a.sym}</Text>
        <View style={s.between}>
          <Text style={s.holding}>{held.toLocaleString('en-US', { maximumFractionDigits: 4 })} {a.sym}</Text>
          <Text style={s.sub}>≈ HK$ {hkd.toLocaleString('en-US', { maximumFractionDigits: 0 })}</Text>
        </View>
        <View style={[s.row, { gap: 10 }]}>
          <Pressable style={s.ghost} onPress={() => open({ screen: 'transfer', mode: 'deposit', asset: a.sym })}><Text style={s.ghostText}>DEPOSIT</Text></Pressable>
          <Pressable style={s.ghost} onPress={() => open({ screen: 'transfer', mode: 'withdraw', asset: a.sym })}><Text style={s.ghostText}>WITHDRAW</Text></Pressable>
        </View>
      </View>

      <View>
        <Text style={[s.kicker, { marginBottom: 10 }]}>ABOUT {a.sym}</Text>
        <Text style={s.sub}>{ABOUT[a.sym] ?? `${a.name} trades on Javas against ${a.quote}. Prices are indicative and refresh in real time.`}</Text>
      </View>

      <View style={[s.row, { gap: 10 }]}>
        <Pressable style={[s.side, { backgroundColor: c.gain }]} onPress={() => trade(a.sym)}><Text style={s.sideText}>BUY {a.sym}</Text></Pressable>
        <Pressable style={[s.side, { backgroundColor: c.loss }]} onPress={() => trade(a.sym)}><Text style={s.sideText}>SELL {a.sym}</Text></Pressable>
      </View>
      <CutButton title={`Open ${a.sym}/${a.quote} in Trade`} onPress={() => trade(a.sym)} />
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 48, gap: 24 },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  iconBtn: { width: 44, height: 44, borderWidth: 1, borderColor: c.ruleStrong, backgroundColor: c.sheet, alignItems: 'center', justifyContent: 'center' },

  coin: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  coinText: { color: '#fff', fontFamily: f.semi, fontSize: t.h3 },
  price: { color: c.ink, fontFamily: f.mono, fontSize: 30 },
  quote: { color: c.ink3, fontSize: t.body },
  chg: { fontFamily: f.mono, fontSize: t.label, marginTop: 2 },

  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, padding: 16 },
  frame: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 2 },
  frameOn: { backgroundColor: c.deep },
  frameText: { color: c.ink3, fontFamily: f.mono, fontSize: 11 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule },
  cell: { width: '50%', padding: 16, gap: 6 },
  cellR: { borderLeftWidth: 1, borderLeftColor: c.rule },
  cellB: { borderTopWidth: 1, borderTopColor: c.rule },

  panel: { backgroundColor: c.hero, borderWidth: 1, borderColor: c.rule, padding: 22, gap: 14 },
  holding: { color: c.ink, fontFamily: f.mono, fontSize: t.h3 },
  ghost: { flex: 1, height: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.ink4, backgroundColor: c.sheet, borderRadius: 2 },
  ghostText: { color: c.ink, fontFamily: f.mono, fontSize: 11, letterSpacing: 1 },
  side: { flex: 1, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 2 },
  sideText: { color: '#fff', fontFamily: f.mono, fontSize: 12, letterSpacing: 1.2 },

  sub: { color: c.ink2, fontFamily: f.reg, fontSize: t.body, lineHeight: 21 },
  mono: { color: c.ink, fontFamily: f.mono, fontSize: t.body },
}));
