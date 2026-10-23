// Design-only: the web top-bar notifications, plus a few read ones. Read state and filters work locally.
import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header, useNav, Sub } from '../components/Nav';
import { c, f, t, themed } from '../theme';

type Kind = 'Trading' | 'Wallet' | 'Security';
type Note = { id: string; kind: Kind; icon: keyof typeof Ionicons.glyphMap; title: string; body: string; when: string; today: boolean; tone?: 'loss' | 'gain' | 'flag'; go?: Sub };

const NOTES: Note[] = [
  { id: 'n4', kind: 'Trading', icon: 'alert-circle-outline', title: 'P2P order #10482 is in dispute', body: 'The desk will review within 24 hours.', when: '1h ago', today: true, tone: 'loss', go: { screen: 'p2p' } },
  { id: 'n3', kind: 'Wallet', icon: 'arrow-down-circle-outline', title: 'Deposit received — HK$ 2,000,000', body: 'HSBC ••4417 · credited to your wallet.', when: '2h ago', today: true, tone: 'gain', go: { screen: 'transactions' } },
  { id: 'n2', kind: 'Security', icon: 'phone-portrait-outline', title: 'New sign-in from iPhone 15', body: 'Hong Kong · not you? Review devices.', when: '3d ago', today: false, tone: 'flag' },
  { id: 'n1', kind: 'Trading', icon: 'pulse-outline', title: 'USDT/HKD crossed 7.8240', body: 'Your price alert.', when: '4d ago', today: false },
  { id: 'n0', kind: 'Trading', icon: 'checkmark-done-outline', title: 'Order filled — 50,000 USDT', body: 'USDT/HKD market buy at 7.8241.', when: '5d ago', today: false, go: { screen: 'orders' } },
  { id: 'm9', kind: 'Wallet', icon: 'arrow-up-circle-outline', title: 'Withdrawal sent — 1.20 BTC', body: 'To Fireblocks vault ••9c2e · 6 / 6 confirmations.', when: '12d ago', today: false, go: { screen: 'transactions' } },
  { id: 'm8', kind: 'Security', icon: 'shield-checkmark-outline', title: 'Identity verification approved', body: 'Level 3 · corporate documents.', when: '12 Aug', today: false },
];
const FILTERS = ['All', 'Unread', 'Trading', 'Wallet', 'Security'] as const;

export default function Notifications() {
  const { open } = useNav();
  const [unread, setUnread] = useState(new Set(['n4', 'n3', 'n2', 'n1']));
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const toneColor = { loss: c.loss, gain: c.gain, flag: '#9a7a12' };

  const rows = NOTES.filter(n => filter === 'All' || (filter === 'Unread' ? unread.has(n.id) : n.kind === filter));
  const tap = (n: Note) => {
    setUnread(u => { const x = new Set(u); x.delete(n.id); return x; });
    if (n.go) open(n.go);
  };

  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
      <View style={s.between}>
        <Header kicker={`${unread.size} UNREAD`} title="Notifications" />
        {unread.size > 0 && <Pressable onPress={() => setUnread(new Set())} hitSlop={8}><Text style={s.link}>Mark all read</Text></Pressable>}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24, flexGrow: 0 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}>
        {FILTERS.map(k => (
          <Pressable key={k} onPress={() => setFilter(k)} style={[s.chip, filter === k && s.chipOn]}>
            <Text style={[s.chipText, filter === k && { color: '#fff' }]}>{k}{k === 'Unread' && unread.size ? ` · ${unread.size}` : ''}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {rows.length === 0 && (
        <View style={[s.card, s.empty]}>
          <Ionicons name="notifications-off-outline" size={22} color={c.ink3} />
          <Text style={s.body}>You're all caught up</Text>
        </View>
      )}

      {[true, false].map(today => {
        const list = rows.filter(n => n.today === today);
        if (!list.length) return null;
        return (
          <View key={String(today)}>
            <Text style={[s.kicker, { marginBottom: 12 }]}>{today ? 'TODAY' : 'EARLIER'}</Text>
            <View style={s.card}>
              {list.map((n, i) => {
                const isNew = unread.has(n.id), col = n.tone ? toneColor[n.tone] : c.deep;
                return (
                  <Pressable key={n.id} onPress={() => tap(n)} style={[s.item, i > 0 && s.divider, isNew && s.itemNew]}>
                    <View style={[s.icon, { borderColor: n.tone ? col : c.rule }]}><Ionicons name={n.icon} size={17} color={col} /></View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={[s.title, !isNew && { fontFamily: f.reg, color: c.ink2 }]}>{n.title}</Text>
                      <Text style={s.sub}>{n.body}</Text>
                      <Text style={s.small}>{n.kind.toUpperCase()} · {n.when.toUpperCase()}</Text>
                    </View>
                    {isNew ? <View style={s.dot} /> : n.go ? <Ionicons name="chevron-forward" size={16} color={c.ink4} /> : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}

      <Pressable style={s.settings}>
        <Ionicons name="options-outline" size={16} color={c.ink} />
        <Text style={s.settingsText}>NOTIFICATION SETTINGS</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 48, gap: 24 },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },

  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 2, borderWidth: 1, borderColor: c.rule, backgroundColor: c.sheet },
  chipOn: { backgroundColor: c.deep, borderColor: c.deep },
  chipText: { color: c.ink2, fontFamily: f.med, fontSize: t.label },

  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  divider: { borderTopWidth: 1, borderTopColor: c.rule },
  item: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, padding: 16 },
  itemNew: { backgroundColor: c.tint },
  icon: { width: 36, height: 36, borderWidth: 1, backgroundColor: c.sheet, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: c.signal, marginTop: 6 },

  settings: { flexDirection: 'row', gap: 8, height: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.ink4, backgroundColor: c.sheet },
  settingsText: { color: c.ink, fontFamily: f.mono, fontSize: 11, letterSpacing: 1.2 },

  title: { color: c.ink, fontFamily: f.semi, fontSize: t.body },
  body: { color: c.ink, fontFamily: f.med, fontSize: t.body },
  sub: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, lineHeight: 17 },
  small: { color: c.ink4, fontFamily: f.mono, fontSize: 9, letterSpacing: 0.6, marginTop: 2 },
  link: { color: c.signal, fontFamily: f.med, fontSize: t.label },
}));
