// Design-only: profile from the web account page, plus the settings hub a phone app needs.
import { useState } from 'react';
import { View, Text, Pressable, ScrollView, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Corners } from '../components/Ledger';
import { c, f, t, themed } from '../theme';
import { useNav } from '../components/Nav';
import type { Section } from './Security';
import type { ProfileSection } from './Profile';

type Row = [icon: keyof typeof Ionicons.glyphMap, label: string, value?: string, tone?: string];

const GROUPS: [string, Row[]][] = [
  ['SECURITY', [
    ['key-outline', 'Change password', 'Last changed 41 days ago'],
    ['shield-checkmark-outline', 'Two-factor (2FA)', 'Off — turn on', c.signal],
    ['finger-print-outline', 'Identity verification', 'Level 3 · verified', c.gain],
    ['phone-portrait-outline', 'Devices', '10 signed in'],
    ['mail-unread-outline', 'Anti-phishing code', 'Set up', c.signal],
    ['list-outline', 'Withdrawal whitelist', '2 addresses'],
  ]],
  ['PROFILE', [
    ['person-outline', 'Personal information', 'Wing Chan · Hong Kong'],
    ['at-outline', 'Email', 'wing.chan@wingchantrading.com.hk'],
    ['call-outline', 'Mobile', '+852 9123 4567'],
    ['business-outline', 'Company', 'Wing Chan Trading Limited'],
    ['people-outline', 'Second approver', 'Ho Mei Lin · Finance'],
    ['card-outline', 'Settlement bank', 'HSBC ••4417'],
  ]],
  ['MORE', [
    ['gift-outline', 'Referrals', 'Earn up to 40%'],
    ['ribbon-outline', 'VIP programme', 'VIP 3 · 0.08% / 0.12%'],
    ['language-outline', 'Language', 'English'],
    ['help-circle-outline', 'Help & support'],
  ]],
];

const PROFILE: Record<string, ProfileSection> = { 'Personal information': 'personal', Email: 'email', Mobile: 'mobile', Company: 'company', 'Second approver': 'approver', 'Settlement bank': 'bank', 'VIP programme': 'vip', Language: 'language', 'Help & support': 'help' };
const SECTIONS: Record<string, Section> = { 'Change password': 'password', 'Two-factor (2FA)': '2fa', 'Identity verification': 'verification', Devices: 'devices', 'Anti-phishing code': 'antiphishing', 'Withdrawal whitelist': 'whitelist' };

const STEPS = [['Basic information', true], ['Contact details verified', true], ['Profile photo', false], ['Identity verification', true]] as const;

export default function Account({ onSignOut, dark, onDark }: { onSignOut: () => void; dark: boolean; onDark: (on: boolean) => void }) {
  const { open } = useNav();
  const [notify, setNotify] = useState(true);
  const [faceId, setFaceId] = useState(false);

  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false}>
      <View>
        <Text style={s.kicker}>PROFILE · SECURITY · SETTINGS</Text>
        <Text style={s.h1}>Account</Text>
      </View>

      {/* Profile */}
      <View style={s.hero}>
        <Corners color={c.deep} />
        <View style={s.row}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>WC</Text>
            <View style={s.cam}><Ionicons name="camera" size={11} color="#fff" /></View>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.name}>Wing Chan</Text>
            <Text style={s.sub}>@wingchan</Text>
          </View>
        </View>
        <View style={[s.row, { flexWrap: 'wrap', gap: 6, marginTop: 18 }]}>
          <Text style={[s.badge, { backgroundColor: c.deep, color: '#fff', borderColor: c.deep }]}>CORPORATE</Text>
          <Text style={[s.badge, { color: '#8a6d0f', borderColor: c.flag }]}>VIP 3</Text>
          <Text style={[s.badge, { color: c.gain, borderColor: 'rgba(31,122,85,.35)' }]}>✓ LEVEL 3</Text>
        </View>
        <View style={[s.between, s.uid]}>
          <Text style={s.small}>UID <Text style={{ color: c.ink }}>9642943</Text></Text>
          <View style={s.row}><Ionicons name="copy-outline" size={13} color={c.signal} /><Text style={[s.small, { color: c.signal }]}>COPY</Text></View>
        </View>
      </View>

      {/* Completeness */}
      <View style={s.card}>
        <View style={s.between}>
          <Text style={s.body}>Profile completeness</Text>
          <Text style={s.mono}>75%</Text>
        </View>
        <View style={s.track}><View style={[s.fill, { width: '75%' }]} /></View>
        <View style={{ gap: 10 }}>
          {STEPS.map(([k, done]) => (
            <View key={k} style={s.between}>
              <View style={s.row}>
                <Ionicons name={done ? 'checkmark-circle' : 'ellipse-outline'} size={16} color={done ? c.gain : c.ink4} />
                <Text style={[s.sub, { marginTop: 0, color: done ? c.ink2 : c.ink }]}>{k}</Text>
              </View>
              {!done && <Text style={s.link}>Add</Text>}
            </View>
          ))}
        </View>
      </View>

      {GROUPS.map(([title, rows]) => (
        <View key={title}>
          <Text style={[s.kicker, { marginBottom: 12 }]}>{title}</Text>
          <View style={[s.card, { paddingVertical: 0, gap: 0 }]}>
            {rows.map(([icon, label, value, tone], i) => (
              <Pressable key={label} style={[s.item, i > 0 && s.divider]} onPress={() => label === 'Referrals' ? open({ screen: 'referrals' }) : PROFILE[label] ? open({ screen: 'profile', section: PROFILE[label] }) : SECTIONS[label] && open({ screen: 'security', section: SECTIONS[label] })}>
                <View style={s.itemIcon}><Ionicons name={icon} size={17} color={c.deep} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={s.body}>{label}</Text>
                  {value && <Text style={[s.sub, tone && { color: tone }]} numberOfLines={1}>{value}</Text>}
                </View>
                <Ionicons name="chevron-forward" size={16} color={c.ink4} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}

      <View>
        <Text style={[s.kicker, { marginBottom: 12 }]}>PREFERENCES</Text>
        <View style={[s.card, { paddingVertical: 0, gap: 0 }]}>
          {([['moon-outline', 'Dark mode', dark, onDark], ['notifications-outline', 'Push notifications', notify, setNotify], ['scan-outline', 'Sign in with Face ID', faceId, setFaceId]] as const).map(([icon, label, on, set], i) => (
            <View key={label} style={[s.item, i > 0 && s.divider]}>
              <View style={s.itemIcon}><Ionicons name={icon} size={17} color={c.deep} /></View>
              <Text style={[s.body, { flex: 1 }]}>{label}</Text>
              <Switch value={on} onValueChange={set} trackColor={{ true: c.deep, false: c.ruleStrong }} thumbColor="#fff" {...{ activeThumbColor: "#fff" }} />
            </View>
          ))}
        </View>
      </View>

      <Pressable style={s.signOut} onPress={onSignOut}>
        <Ionicons name="log-out-outline" size={18} color={c.loss} />
        <Text style={s.signOutText}>SIGN OUT</Text>
      </Pressable>
      <Text style={[s.small, { textAlign: 'center' }]}>Javas Limited · Hong Kong · v1.0 design preview</Text>
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 130, gap: 28 },
  h1: { color: c.ink, fontFamily: f.semi, fontSize: t.h1, marginTop: 4 },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },

  hero: { backgroundColor: c.hero, borderWidth: 1, borderColor: c.rule, padding: 24 },
  avatar: { width: 64, height: 64, borderRadius: 32, backgroundColor: c.deep, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: f.semi, fontSize: t.h3, letterSpacing: 1 },
  cam: { position: 'absolute', right: -2, bottom: -2, width: 22, height: 22, borderRadius: 11, backgroundColor: c.signal, borderWidth: 2, borderColor: c.hero, alignItems: 'center', justifyContent: 'center' },
  name: { color: c.ink, fontFamily: f.semi, fontSize: t.h2 },
  badge: { fontFamily: f.mono, fontSize: 10, letterSpacing: 1, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 3, overflow: 'hidden' },
  uid: { marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: c.ruleStrong },

  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, paddingHorizontal: 16, paddingVertical: 18, gap: 14 },
  track: { height: 4, backgroundColor: c.sunk },
  fill: { height: 4, backgroundColor: c.signal },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: c.rule },
  itemIcon: { width: 36, height: 36, borderWidth: 1, borderColor: c.rule, backgroundColor: c.canvas, alignItems: 'center', justifyContent: 'center' },

  signOut: { flexDirection: 'row', gap: 8, height: 52, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(192,65,76,.4)', backgroundColor: c.sheet },
  signOutText: { color: c.loss, fontFamily: f.mono, fontSize: 12, letterSpacing: 1.2 },

  body: { color: c.ink, fontFamily: f.med, fontSize: t.body },
  sub: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, marginTop: 3 },
  small: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 0.6 },
  mono: { color: c.ink, fontFamily: f.mono, fontSize: t.body },
  link: { color: c.signal, fontFamily: f.med, fontSize: t.label },
}));
