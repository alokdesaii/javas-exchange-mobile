// Design-only: mock data lifted from the web dashboard, trimmed to what a phone glance needs.
import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { c, f, t, themed } from '../theme';
import { Corners } from '../components/Ledger';
import { useNav } from '../components/Nav';

const lists = {
  Hot: [['₮', 'USDT', 'Tether', '7.8241', '+4 bps'], ['₿', 'BTC', 'Bitcoin', '83,560.20', '+1.82%'], ['Ξ', 'ETH', 'Ethereum', '2,692.40', '+0.61%'], ['◎', 'SOL', 'Solana', '117.17', '-0.18%']],
  New: [['H', 'HYPE', 'Hyperliquid', '95.908', '+1.05%'], ['P', 'POL', 'Polygon', '0.2214', '+4.21%'], ['A', 'ADA', 'Cardano', '0.7012', '-1.81%'], ['N', 'NEAR', 'NEAR', '4.53', '+1.57%']],
  Gainers: [['U', 'UNI', 'Uniswap', '9.842', '+11.93%'], ['P', 'POL', 'Polygon', '0.2214', '+4.21%'], ['Ł', 'LTC', 'Litecoin', '62.71', '+3.89%'], ['✕', 'XRP', 'XRP', '1.5856', '+3.66%']],
};

const activity = [
  ['arrow-down', 'Deposit from HSBC', '2h ago', '+ HK$ 2,000,000', 'gain'],
  ['swap-horizontal', 'P2P · Buy USDT', '1d ago', 'HK$ 78,240', 'ink'],
  ['arrow-up', 'Withdrawal · 1.20 BTC', '12d ago', '− HK$ 784,120', 'ink'],
] as const;

const actions = [['arrow-down', 'Deposit'], ['arrow-up', 'Withdraw'], ['people-outline', 'P2P'], ['leaf-outline', 'Earn'], ['trending-up', 'Futures']] as const;

function Section({ title, link, onLink, children }: { title: string; link?: string; onLink?: () => void; children: React.ReactNode }) {
  return (
    <View>
      <View style={s.sectionHead}>
        <Text style={s.kicker}>{title.toUpperCase()}</Text>
        {link && <Pressable onPress={onLink} hitSlop={8}><Text style={s.link}>{link}</Text></Pressable>}
      </View>
      {children}
    </View>
  );
}

export default function Dashboard() {
  const { open } = useNav();
  const [hidden, setHidden] = useState(false);
  const [tab, setTab] = useState<keyof typeof lists>('Hot');
  const mask = (v: string) => (hidden ? '••••••' : v);

  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
      <View style={s.top}>
        <View>
          <Text style={s.hello}>Good morning</Text>
          <Text style={s.name}>Wing Chan</Text>
        </View>
        <Pressable style={s.iconBtn} onPress={() => open({ screen: 'notifications' })} accessibilityLabel="Notifications, 4 unread">
          <Ionicons name="notifications-outline" size={20} color={c.ink} />
          <View style={s.dot} />
        </Pressable>
      </View>

      {/* Portfolio */}
      <View style={s.hero}>
        <Corners color={c.deep} />
        <Pressable style={s.row} onPress={() => setHidden(!hidden)}>
          <Text style={s.kicker}>TOTAL BALANCE · HKD</Text>
          <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={15} color={c.ink3} />
        </Pressable>
        <Text style={s.balance} numberOfLines={1} adjustsFontSizeToFit>{mask('HK$ 3,482,610')}<Text style={s.cents}>{hidden ? '' : '.40'}</Text></Text>
        <View style={s.pill}><Text style={s.pillText}>▲ 1.23% today</Text></View>

        <View style={s.actions}>
          {actions.map(([icon, label]) => (
            <Pressable key={label} style={s.action} onPress={() => label === 'P2P' ? open({ screen: 'p2p' }) : label === 'Earn' || label === 'Futures' ? open({ screen: 'product', product: label }) : (label === 'Deposit' || label === 'Withdraw') && open({ screen: 'transfer', mode: label === 'Deposit' ? 'deposit' : 'withdraw' })}>
              <View style={[s.actionIcon, label === 'Deposit' && { backgroundColor: c.signal, borderColor: c.signal }]}>
                <Ionicons name={icon} size={20} color={label === 'Deposit' ? '#fff' : c.deep} />
              </View>
              <Text style={s.actionText}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Markets */}
      <Section title="Markets" link="See all">
        <View style={s.chips}>
          {(Object.keys(lists) as (keyof typeof lists)[]).map(k => (
            <Pressable key={k} onPress={() => setTab(k)} style={[s.chip, tab === k && s.chipOn]}>
              <Text style={[s.chipText, tab === k && { color: '#fff' }]}>{k}</Text>
            </Pressable>
          ))}
        </View>
        <View style={s.card}>
          {lists[tab].map(([sym, code, name, px, chg], i) => (
            <View key={code} style={[s.listRow, i > 0 && s.divider]}>
              <View style={s.coin}><Text style={s.coinText}>{sym}</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.body}>{code}</Text>
                <Text style={s.sub}>{name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={s.mono}>{px}</Text>
                <Text style={[s.change, { color: chg.startsWith('-') ? c.loss : c.gain }]}>{chg}</Text>
              </View>
            </View>
          ))}
        </View>
      </Section>

      {/* Activity */}
      <Section title="Recent activity" link="See all" onLink={() => open({ screen: 'transactions' })}>
        <View style={s.card}>
          {activity.map(([icon, title, when, amt, col], i) => (
            <View key={title} style={[s.listRow, i > 0 && s.divider]}>
              <View style={s.coin}><Ionicons name={icon} size={16} color={c.ink2} /></View>
              <View style={{ flex: 1 }}>
                <Text style={s.body} numberOfLines={1}>{title}</Text>
                <Text style={s.sub}>{when}</Text>
              </View>
              <Text style={[s.amt, { color: c[col] }]}>{mask(amt)}</Text>
            </View>
          ))}
        </View>
      </Section>

      {/* One nudge instead of the full security card */}
      <Pressable style={[s.card, s.nudge, { borderLeftWidth: 2, borderLeftColor: c.signal }]}>
        <View style={[s.coin, { backgroundColor: '#fdeced' }]}><Ionicons name="shield-checkmark-outline" size={18} color={c.signal} /></View>
        <View style={{ flex: 1 }}>
          <Text style={s.body}>Turn on two-factor authentication</Text>
          <Text style={s.sub}>Security score 50 / 100</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={c.ink4} />
      </Pressable>
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  // bottom padding clears the floating tab bar
  wrap: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 130, gap: 32 },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  hello: { color: c.ink3, fontFamily: f.reg, fontSize: t.body },
  name: { color: c.ink, fontFamily: f.semi, fontSize: t.h2, marginTop: 2 },
  iconBtn: { width: 44, height: 44, borderWidth: 1, borderColor: c.ruleStrong, backgroundColor: c.sheet, alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute', top: 11, right: 12, width: 7, height: 7, borderRadius: 4, backgroundColor: c.signal },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  hero: { backgroundColor: c.hero, borderWidth: 1, borderColor: c.rule, padding: 28 },
  balance: { color: c.ink, fontFamily: f.mono, fontSize: 26, marginTop: 10, letterSpacing: -0.5 },
  cents: { color: c.ink3, fontSize: 22 },
  pill: { alignSelf: 'flex-start', backgroundColor: 'rgba(31,122,85,.1)', borderRadius: 2, paddingHorizontal: 10, paddingVertical: 4, marginTop: 10 },
  pillText: { color: c.gain, fontFamily: f.mono, fontSize: t.label },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 28 },
  action: { alignItems: 'center', gap: 8, flex: 1 },
  actionIcon: { width: 46, height: 46, borderWidth: 1, borderColor: c.rule, backgroundColor: c.sheet, alignItems: 'center', justifyContent: 'center' },
  actionText: { color: c.ink2, fontFamily: f.med, fontSize: t.label },

  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  chips: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 2, borderWidth: 1, borderColor: c.rule, backgroundColor: c.sheet },
  chipOn: { backgroundColor: c.deep, borderColor: c.deep },
  chipText: { color: c.ink2, fontFamily: f.med, fontSize: t.label },

  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, paddingHorizontal: 18 },
  listRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  divider: { borderTopWidth: 1, borderTopColor: c.rule },
  coin: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center' },
  coinText: { color: c.deep, fontFamily: f.semi, fontSize: t.h4 },
  nudge: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 18 },

  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: t.meta, letterSpacing: 1.4 },
  h3: { color: c.ink, fontFamily: f.semi, fontSize: t.h3 },
  body: { color: c.ink, fontFamily: f.med, fontSize: t.body },
  sub: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, marginTop: 3 },
  label: { color: c.ink2, fontFamily: f.reg, fontSize: t.body },
  link: { color: c.signal, fontFamily: f.med, fontSize: t.body },
  amt: { fontFamily: f.semi, fontSize: t.body },
  mono: { color: c.ink, fontFamily: f.mono, fontSize: t.body },
  change: { fontFamily: f.mono, fontSize: t.label, marginTop: 3 },
}));
