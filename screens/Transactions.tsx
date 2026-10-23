// Design-only: transaction history from the web transactions page. Filters, search and row details work locally.
import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Nav';
import { c, f, t, themed } from '../theme';

type Tx = { id: string; day: number; time: string; type: 'Deposit' | 'Withdrawal' | 'Transfer'; asset: string; amt: number; fee: number; net: string; who: string; status: 'Completed' | 'Processing' | 'Failed'; conf?: string; hkd: number; ref: string };

// day (Sep 2026), time, type, asset, amount, fee, rail, counterparty, status, HKD value, reference, confirmations
const TX: Tx[] = ([
  [24, '09:30', 'Withdrawal', 'USDT', 8500, 1, 'Tron (TRC-20)', 'OTC settlement ••Q7xk', 'Processing', 66504.85, '94c59596…a75107', '14 / 20'],
  [24, '07:40', 'Deposit', 'HKD', 2000000, 0, 'CHATS', 'HSBC ••4417 · Wing Chan Trading Ltd', 'Completed', 2000000, 'JVX-9642943-4801'],
  [23, '18:02', 'Deposit', 'USDT', 50000, 0, 'Tron (TRC-20)', 'External address', 'Completed', 391205, '93f18c58…d2cd1b', '20 / 20'],
  [23, '10:15', 'Transfer', 'USDT', 15000, 0, 'Internal', 'Spot → P2P wallet', 'Completed', 117361.5, 'Internal transfer'],
  [22, '16:30', 'Withdrawal', 'HKD', 500000, 0, 'CHATS', 'Bank of China (HK) ••0832', 'Completed', 500000, 'JVX-9642943-4804'],
  [19, '11:08', 'Withdrawal', 'USDC', 10000, 1, 'Solana', 'Address not on your whitelist', 'Failed', 78198, '3ZwRZs1P…wKUhwG'],
  [18, '14:50', 'Transfer', 'USDT', 5000, 0, 'Internal', 'P2P wallet → Spot', 'Completed', 39120.5, 'Internal transfer'],
  [12, '11:20', 'Withdrawal', 'BTC', 1.2, 0.0002, 'Bitcoin', 'Fireblocks vault ••9c2e', 'Completed', 784540.03, 'b7e1d0a2…9f44c1', '6 / 6'],
  [10, '09:05', 'Deposit', 'ETH', 12.5, 0, 'Ethereum (ERC-20)', 'Treasury cold wallet ••3f9a', 'Completed', 263321.15, '0x5c9e…a18b7d', '64 / 64'],
  [8, '16:40', 'Deposit', 'SOL', 5, 0, 'Solana', 'External address', 'Completed', 4583.75, '4kQp9xNa…Vt2LhM', 'Finalised'],
  [2, '10:00', 'Deposit', 'HKD', 1500000, 0, 'FPS', 'HSBC ••4417 · Wing Chan Trading Ltd', 'Completed', 1500000, 'JVX-9642943-4810'],
] as const).map(([day, time, type, asset, amt, fee, net, who, status, hkd, ref, conf], i) => ({ id: `TX${90412 - i}`, day, time, type, asset, amt, fee, net, who, status, hkd, ref, conf }));

const TYPES = ['All', 'Deposits', 'Withdrawals', 'Transfers'] as const;
const STATUS = ['Any status', 'Completed', 'Processing', 'Failed'] as const;
const dp = (a: string) => (['HKD', 'USDT', 'USDC'].includes(a) ? 2 : 4);
const fmt = (v: number, d = 2) => v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const ICON = { Deposit: 'arrow-down', Withdrawal: 'arrow-up', Transfer: 'swap-horizontal' } as const;

export default function Transactions() {
  const [type, setType] = useState<(typeof TYPES)[number]>('All');
  const [status, setStatus] = useState<(typeof STATUS)[number]>('Any status');
  const [q, setQ] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const tone = { Completed: c.gain, Processing: '#9a7a12', Failed: c.loss };

  const rows = TX
    .filter(x => type === 'All' || `${x.type}s` === type)
    .filter(x => status === 'Any status' || x.status === status)
    .filter(x => !q || (x.ref + x.id + x.asset + x.who).toLowerCase().includes(q.toLowerCase()));
  const days = [...new Set(rows.map(x => x.day))];

  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Header kicker="DEPOSITS · WITHDRAWALS · TRANSFERS" title="Transactions" />

      <View style={s.grid}>
        {[['DEPOSITED', 'HK$ 4.16M', '5 inbound · 30d'], ['WITHDRAWN', 'HK$ 1.35M', '3 outbound · 30d'], ['TRANSFERS', 'HK$ 156K', 'Spot ⇄ P2P'], ['IN PROGRESS', '1', 'USDT · 14 / 20']].map(([k, v, d], i) => (
          <View key={k} style={[s.cell, i % 2 === 1 && s.cellR, i > 1 && s.cellB]}>
            <Text style={s.kicker}>{k}</Text>
            <Text style={[s.statVal, k === 'IN PROGRESS' && { color: '#9a7a12' }]}>{v}</Text>
            <Text style={s.small}>{d}</Text>
          </View>
        ))}
      </View>

      <View style={{ gap: 12 }}>
        <View style={s.search}>
          <Ionicons name="search" size={18} color={c.ink3} />
          <TextInput value={q} onChangeText={setQ} placeholder="Search reference or hash" placeholderTextColor={c.ink4} style={s.searchInput} />
        </View>
        {[TYPES, STATUS].map((list, n) => (
          <ScrollView key={n} horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}>
            {list.map(k => {
              const on = n === 0 ? type === k : status === k;
              return (
                <Pressable key={k} onPress={() => (n === 0 ? setType(k as typeof type) : setStatus(k as typeof status))} style={[s.chip, on && s.chipOn]}>
                  <Text style={[s.chipText, on && { color: '#fff' }]}>{k}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ))}
      </View>

      {rows.length === 0 && (
        <View style={[s.card, { alignItems: 'center', paddingVertical: 36 }]}>
          <Text style={s.body}>No transactions match</Text>
          <Pressable onPress={() => { setType('All'); setStatus('Any status'); setQ(''); }}><Text style={[s.link, { marginTop: 10 }]}>Clear filters</Text></Pressable>
        </View>
      )}

      {days.map(day => (
        <View key={day}>
          <Text style={[s.kicker, { marginBottom: 10 }]}>{day} SEP 2026</Text>
          <View style={s.card}>
            {rows.filter(x => x.day === day).map((x, i) => {
              const isOpen = open === x.id, out = x.type === 'Withdrawal';
              const sign = x.type === 'Deposit' ? '+' : out ? '−' : '';
              return (
                <View key={x.id} style={i > 0 && s.divider}>
                  <Pressable style={s.row} onPress={() => setOpen(isOpen ? null : x.id)}>
                    <View style={[s.icon, x.status === 'Failed' && { borderColor: c.loss }]}>
                      <Ionicons name={ICON[x.type]} size={16} color={x.status === 'Failed' ? c.loss : c.deep} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.body}>{x.type} · {x.asset}</Text>
                      <Text style={s.sub} numberOfLines={1}>{x.time} · {x.net}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={[s.mono, x.type === 'Deposit' && { color: c.gain }]}>{sign}{fmt(x.amt, dp(x.asset))}</Text>
                      <Text style={[s.badge, { color: tone[x.status], borderColor: tone[x.status] }]}>{x.status.toUpperCase()}</Text>
                    </View>
                  </Pressable>
                  {isOpen && (
                    <View style={s.detail}>
                      {[['ID', x.id], ['Counterparty', x.who], ['Value', `HK$ ${fmt(x.hkd)}`], ['Fee', x.fee ? `${fmt(x.fee, dp(x.asset))} ${x.asset}` : 'Free'], ['Reference', x.ref], ...(x.conf ? [['Confirmations', x.conf]] : [])].map(([k, v]) => (
                        <View key={k} style={s.kv}>
                          <Text style={s.sub}>{k}</Text>
                          <Text style={[s.monoSm, { flexShrink: 1, textAlign: 'right' }]} selectable>{v}</Text>
                        </View>
                      ))}
                      {x.status === 'Failed' && <Text style={[s.sub, { color: c.loss }]}>Withdrawals can only go to whitelisted addresses. Add it in Account → Withdrawal whitelist.</Text>}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      ))}

      <Pressable style={s.export}>
        <Ionicons name="download-outline" size={16} color={c.ink} />
        <Text style={s.exportText}>EXPORT CSV</Text>
      </Pressable>
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 48, gap: 28 },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule },
  cell: { width: '50%', padding: 16, gap: 6 },
  cellR: { borderLeftWidth: 1, borderLeftColor: c.rule },
  cellB: { borderTopWidth: 1, borderTopColor: c.rule },
  statVal: { color: c.ink, fontFamily: f.mono, fontSize: t.h3 },

  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingHorizontal: 16, backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, borderRadius: 2 },
  searchInput: { flex: 1, minWidth: 0, height: '100%', color: c.ink, fontFamily: f.reg, fontSize: t.body },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 2, borderWidth: 1, borderColor: c.rule, backgroundColor: c.sheet },
  chipOn: { backgroundColor: c.deep, borderColor: c.deep },
  chipText: { color: c.ink2, fontFamily: f.med, fontSize: t.label },

  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, paddingHorizontal: 16 },
  divider: { borderTopWidth: 1, borderTopColor: c.rule },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 15 },
  icon: { width: 36, height: 36, borderWidth: 1, borderColor: c.rule, backgroundColor: c.canvas, alignItems: 'center', justifyContent: 'center' },
  badge: { fontFamily: f.mono, fontSize: 9, letterSpacing: 0.8, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 1 },
  detail: { gap: 10, paddingBottom: 16, paddingLeft: 48 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },

  export: { flexDirection: 'row', gap: 8, height: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.ink4, backgroundColor: c.sheet },
  exportText: { color: c.ink, fontFamily: f.mono, fontSize: 12, letterSpacing: 1.2 },

  body: { color: c.ink, fontFamily: f.med, fontSize: t.body },
  sub: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, marginTop: 2 },
  small: { color: c.ink3, fontFamily: f.mono, fontSize: 10 },
  mono: { color: c.ink, fontFamily: f.mono, fontSize: t.body },
  monoSm: { color: c.ink, fontFamily: f.mono, fontSize: t.label },
  link: { color: c.signal, fontFamily: f.med, fontSize: t.body },
}));
