// Design-only: referral programme from the web referrals page. Copy/share are visual only.
import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Corners } from '../components/Ledger';
import { Header } from '../components/Nav';
import { c, f, t, themed } from '../theme';

const FRIENDS = [
  ['K•••• L••', 'k•••@harbourfreight.hk', '14 Aug', 'Trading', 'HK$ 2,061,500', 'HK$ 1,284.60'],
  ['S•••• T•••', 's•••@pearlriverlogistics.com', '2 Sep', 'Verified', '—', '—'],
  ['M•••• C•••', 'm•••@gmail.com', '19 Sep', 'Signed up', '—', '—'],
] as const;
const PAYOUTS = [['October 2026', '1 Nov', 'HK$ 287.40', 'ACCRUING'], ['September 2026', '1 Oct', 'HK$ 412.30', 'PAID'], ['August 2026', '1 Sep', 'HK$ 584.90', 'PAID']] as const;
const TIERS = [['Starter', 'Any trading friend', '20%'], ['Partner', '5 trading friends', '30%'], ['Ambassador', '20 trading friends', '40%']] as const;
const STAGES = ['Signed up', 'Verified', 'Trading'];

function CopyRow({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <Pressable style={s.copy} onPress={() => { setDone(true); setTimeout(() => setDone(false), 1200); }}>
      <View style={{ flex: 1 }}>
        <Text style={s.kicker}>{label}</Text>
        <Text style={[s.mono, { marginTop: 4 }]} numberOfLines={1}>{value}</Text>
      </View>
      <Text style={[s.small, { color: done ? c.gain : c.signal }]}>{done ? 'COPIED' : 'COPY'}</Text>
    </Pressable>
  );
}

export default function Referrals() {
  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
      <Header kicker="INVITE · EARN A SHARE OF FEES" title="Referrals" />

      <View style={s.hero}>
        <Corners color={c.deep} />
        <Text style={s.big}>Invite friends.{'\n'}Earn together.</Text>
        <Text style={s.sub}>When a friend opens an account and trades, you earn up to 40% of the trading fees they pay — paid to your wallet every month.</Text>
        <CopyRow label="LINK" value="javas.exchange/ref/863D8C01" />
        <CopyRow label="CODE" value="863D8C01" />
        <View style={[s.row, { gap: 10 }]}>
          {[['logo-whatsapp', 'WhatsApp'], ['mail-outline', 'Email'], ['share-outline', 'More']].map(([icon, k]) => (
            <Pressable key={k} style={s.share}>
              <Ionicons name={icon as 'mail-outline'} size={16} color={c.ink} />
              <Text style={s.shareText}>{k.toUpperCase()}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={s.grid}>
        {[['FRIENDS INVITED', '3', '2 verified · 1 trading'], ['YOUR RATE', '20%', 'Of their trading fees'], ['LAST PAYOUT', 'HK$ 412.30', 'September · paid 1 Oct'], ['EARNED IN TOTAL', 'HK$ 1,284.60', 'Since 6 Aug 2026']].map(([k, v, d], i) => (
          <View key={k} style={[s.cell, i % 2 === 1 && s.cellR, i > 1 && s.cellB]}>
            <Text style={s.kicker}>{k}</Text>
            <Text style={[s.statVal, k === 'YOUR RATE' && { color: c.signal }]}>{v}</Text>
            <Text style={s.small}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Tiers */}
      <View>
        <Text style={[s.kicker, { marginBottom: 12 }]}>COMMISSION RATE · TBC</Text>
        <View style={s.card}>
          {TIERS.map(([k, d, r], i) => (
            <View key={k} style={[s.tier, i > 0 && s.divider]}>
              <Ionicons name={i === 0 ? 'radio-button-on' : 'radio-button-off'} size={18} color={i === 0 ? c.signal : c.ink4} />
              <View style={{ flex: 1 }}>
                <Text style={s.body}>{k}{i === 0 && <Text style={s.here}>  · YOU'RE HERE</Text>}</Text>
                <Text style={s.sub}>{d}</Text>
              </View>
              <Text style={[s.rate, i === 0 && { color: c.signal }]}>{r}</Text>
            </View>
          ))}
          <View style={[s.divider, { paddingVertical: 14, gap: 8 }]}>
            <View style={s.track}><View style={[s.fill, { width: '20%' }]} /></View>
            <Text style={s.sub}>1 of 5 trading friends to reach Partner.</Text>
          </View>
        </View>
      </View>

      {/* Friends */}
      <View>
        <Text style={[s.kicker, { marginBottom: 12 }]}>YOUR REFERRALS</Text>
        <View style={s.card}>
          {FRIENDS.map(([name, email, joined, stage, vol, earned], i) => {
            const step = STAGES.indexOf(stage);
            return (
              <View key={email} style={[s.friend, i > 0 && s.divider]}>
                <View style={s.between}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.body}>{name}</Text>
                    <Text style={s.sub} numberOfLines={1}>{email} · joined {joined}</Text>
                  </View>
                  <Text style={[s.mono, earned !== '—' && { color: c.gain }]}>{earned}</Text>
                </View>
                <View style={[s.row, { gap: 4, marginTop: 12 }]}>
                  {STAGES.map((st, n) => (
                    <View key={st} style={{ flex: 1, gap: 5 }}>
                      <View style={[s.seg, n <= step && { backgroundColor: n === 2 ? c.gain : c.deep }]} />
                      <Text style={[s.small, n === step && { color: c.ink }]}>{st.toUpperCase()}</Text>
                    </View>
                  ))}
                </View>
                {vol !== '—' && <Text style={[s.sub, { marginTop: 8 }]}>Their 30-day volume <Text style={s.monoSm}>{vol}</Text></Text>}
              </View>
            );
          })}
        </View>
        <Text style={[s.sub, { marginTop: 10 }]}>Names and emails are partly hidden to protect your friends' privacy.</Text>
      </View>

      {/* Payouts */}
      <View>
        <Text style={[s.kicker, { marginBottom: 12 }]}>MONTHLY PAYOUTS · USDT TO SPOT</Text>
        <View style={s.card}>
          {PAYOUTS.map(([m, paid, amt, st], i) => (
            <View key={m} style={[s.payout, i > 0 && s.divider]}>
              <View style={{ flex: 1 }}>
                <Text style={s.body}>{m}{st === 'ACCRUING' && <Text style={s.sub}> (so far)</Text>}</Text>
                <Text style={s.sub}>Paid {paid}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: 4 }}>
                <Text style={s.mono}>{amt}</Text>
                <Text style={[s.badge, st === 'PAID' ? { color: c.gain, borderColor: c.gain } : { color: '#9a7a12', borderColor: c.flag }]}>{st}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* How + terms */}
      <View>
        <Text style={[s.kicker, { marginBottom: 12 }]}>HOW IT WORKS</Text>
        <View style={s.card}>
          {[['Share your link', 'Send it to a friend or business contact, or give them your code.'], ['They open an account', 'They sign up with your link and pass verification.'], ['You both benefit', 'You earn a share of their trading fees for 12 months, paid monthly in USDT.']].map(([k, d], i) => (
            <View key={k} style={[s.tier, i > 0 && s.divider, { alignItems: 'flex-start' }]}>
              <Text style={s.stepNo}>0{i + 1}</Text>
              <View style={{ flex: 1, gap: 3 }}><Text style={s.body}>{k}</Text><Text style={s.sub}>{d}</Text></View>
            </View>
          ))}
        </View>
      </View>

      <View style={{ gap: 6 }}>
        <Text style={[s.kicker, { marginBottom: 6 }]}>TERMS · TBC</Text>
        {["Commission is a share of the trading fees your friend pays. It doesn't change what they pay.", 'Paid for 12 months from their first trade, on the 1st of each month.', "Self-referrals and accounts under common control don't qualify.", 'Javas Limited can change or end the programme with notice.'].map(x => (
          <Text key={x} style={s.sub}>·  {x}</Text>
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

  hero: { backgroundColor: c.hero, borderWidth: 1, borderColor: c.rule, padding: 24, gap: 16 },
  big: { color: c.ink, fontFamily: f.semi, fontSize: t.h1, lineHeight: 34 },
  copy: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule },
  share: { flex: 1, flexDirection: 'row', gap: 6, height: 42, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.ruleStrong, backgroundColor: c.sheet, borderRadius: 2 },
  shareText: { color: c.ink, fontFamily: f.mono, fontSize: 9, letterSpacing: 0.8 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule },
  cell: { width: '50%', padding: 16, gap: 6 },
  cellR: { borderLeftWidth: 1, borderLeftColor: c.rule },
  cellB: { borderTopWidth: 1, borderTopColor: c.rule },
  statVal: { color: c.ink, fontFamily: f.mono, fontSize: t.h4 },

  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, paddingHorizontal: 16 },
  divider: { borderTopWidth: 1, borderTopColor: c.rule },
  tier: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  here: { color: c.signal, fontFamily: f.mono, fontSize: 9, letterSpacing: 0.8 },
  rate: { color: c.ink, fontFamily: f.mono, fontSize: t.h4 },
  track: { height: 4, backgroundColor: c.sunk },
  fill: { height: 4, backgroundColor: c.signal },
  stepNo: { color: c.signal, fontFamily: f.mono, fontSize: t.label, width: 22, marginTop: 2 },

  friend: { paddingVertical: 16 },
  seg: { height: 3, backgroundColor: c.sunk },
  payout: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  badge: { fontFamily: f.mono, fontSize: 9, letterSpacing: 0.8, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 1 },

  body: { color: c.ink, fontFamily: f.med, fontSize: t.body },
  sub: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, lineHeight: 18 },
  small: { color: c.ink3, fontFamily: f.mono, fontSize: 9, letterSpacing: 0.6 },
  mono: { color: c.ink, fontFamily: f.mono, fontSize: t.body },
  monoSm: { color: c.ink, fontFamily: f.mono, fontSize: t.label },
}));
