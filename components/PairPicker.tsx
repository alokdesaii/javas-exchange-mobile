// Bottom sheet for choosing a trading pair. Rendered inside the phone frame (not a Modal) so it stays 430px wide on desktop.
import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ASSETS, fmtPx, fmtVol } from '../screens/Markets';
import { c, f, t, themed } from '../theme';

export type Asset = (typeof ASSETS)[number];
const QUOTES = ['All', 'Favourites', 'HKD', 'USDT'] as const;

export default function PairPicker({ current, favs, onFav, onPick, onClose }: { current: string; favs: Set<string>; onFav: (sym: string) => void; onPick: (a: Asset) => void; onClose: () => void }) {
  const [q, setQ] = useState('');
  const [quote, setQuote] = useState<(typeof QUOTES)[number]>('All');
  const [y] = useState(() => new Animated.Value(0));
  useEffect(() => { Animated.timing(y, { toValue: 1, duration: 260, useNativeDriver: true }).start(); }, [y]);

  const rows = ASSETS
    .filter(a => quote === 'All' || (quote === 'Favourites' ? favs.has(a.sym) : a.quote === quote))
    .filter(a => !q || (a.sym + a.name).toLowerCase().includes(q.toLowerCase()));

  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View style={[s.backdrop, { opacity: y }]}><Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close pair picker" /></Animated.View>
      <Animated.View style={[s.sheet, { transform: [{ translateY: y.interpolate({ inputRange: [0, 1], outputRange: [600, 0] }) }] }]}>
        <View style={s.grab} />
        <View style={s.between}>
          <Text style={s.title}>Select pair</Text>
          <Pressable onPress={onClose} hitSlop={10}><Ionicons name="close" size={22} color={c.ink2} /></Pressable>
        </View>

        <View style={s.search}>
          <Ionicons name="search" size={18} color={c.ink3} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search pairs" placeholderTextColor={c.ink4} style={s.searchInput} autoCapitalize="none" />
        </View>

        <View style={[s.row, { gap: 8 }]}>
          {QUOTES.map(k => (
            <Pressable key={k} onPress={() => setQuote(k)} style={[s.chip, quote === k && s.chipOn]}>
              {k === 'Favourites' && <Ionicons name="star" size={11} color={quote === k ? c.flag : c.ink3} />}
              <Text style={[s.chipText, quote === k && { color: '#fff' }]}>{k}</Text>
            </Pressable>
          ))}
        </View>

        <View style={[s.row, s.head]}>
          <Text style={[s.kicker, { flex: 1 }]}>PAIR · VOL</Text>
          <Text style={s.kicker}>PRICE · 24H</Text>
        </View>
        <ScrollView style={{ flexGrow: 0 }} keyboardShouldPersistTaps="handled">
          {rows.length === 0 && <Text style={[s.sub, { textAlign: 'center', paddingVertical: 28 }]}>No pairs match.</Text>}
          {rows.map(a => {
            const on = a.sym === current, up = a.chg >= 0;
            return (
              <Pressable key={a.sym} onPress={() => onPick(a)} style={[s.item, on && s.itemOn]}>
                <Pressable onPress={() => onFav(a.sym)} hitSlop={8}>
                  <Ionicons name={favs.has(a.sym) ? 'star' : 'star-outline'} size={15} color={favs.has(a.sym) ? c.flag : c.ink4} />
                </Pressable>
                <View style={[s.coin, { backgroundColor: a.col }]}><Text style={s.coinText}>{a.gl}</Text></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.body}>{a.sym}<Text style={s.quote}> / {a.quote}</Text></Text>
                  <Text style={s.sub}>HK$ {fmtVol(a.vol)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={s.mono}>{fmtPx(a.px)}</Text>
                  <Text style={[s.chg, { color: up ? c.gain : c.loss }]}>{up ? '▲' : '▼'} {Math.abs(a.chg).toFixed(2)}%</Text>
                </View>
                {on && <Ionicons name="checkmark" size={16} color={c.signal} />}
              </Pressable>
            );
          })}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const s = themed(() => StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(20,16,25,.45)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '82%', backgroundColor: c.sheet, borderTopWidth: 1, borderColor: c.ruleStrong, paddingHorizontal: 24, paddingTop: 10, paddingBottom: 28, gap: 16 },
  grab: { alignSelf: 'center', width: 36, height: 4, backgroundColor: c.ruleStrong },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
  title: { color: c.ink, fontFamily: f.semi, fontSize: t.h3 },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },

  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 46, paddingHorizontal: 14, backgroundColor: c.canvas, borderWidth: 1, borderColor: c.rule, borderRadius: 2 },
  searchInput: { flex: 1, minWidth: 0, height: '100%', color: c.ink, fontFamily: f.reg, fontSize: t.body },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 2, borderWidth: 1, borderColor: c.rule, backgroundColor: c.sheet },
  chipOn: { backgroundColor: c.deep, borderColor: c.deep },
  chipText: { color: c.ink2, fontFamily: f.med, fontSize: t.label },

  head: { paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: c.rule, marginBottom: -8 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: c.rule },
  itemOn: { backgroundColor: c.tint },
  coin: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  coinText: { color: '#fff', fontFamily: f.semi, fontSize: 13 },

  body: { color: c.ink, fontFamily: f.semi, fontSize: t.body },
  quote: { color: c.ink3, fontFamily: f.reg },
  sub: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, marginTop: 2 },
  mono: { color: c.ink, fontFamily: f.mono, fontSize: t.body },
  chg: { fontFamily: f.mono, fontSize: 11, marginTop: 2 },
}));
