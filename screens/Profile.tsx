// Design-only: Account → Profile and More rows. Edits and code checks are local; nothing is saved.
import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Corners, CutButton } from '../components/Ledger';
import { Header } from '../components/Nav';
import { Otp } from './AuthSteps';
import { c, f, t, themed } from '../theme';

export type ProfileSection = 'personal' | 'email' | 'mobile' | 'company' | 'approver' | 'bank' | 'vip' | 'language' | 'help';

function Field({ label, value, onChange, editable = true, prefix }: { label: string; value: string; onChange?: (v: string) => void; editable?: boolean; prefix?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <View style={[s.input, !editable && { backgroundColor: c.sunk }]}>
        {prefix && <Text style={s.prefix}>{prefix}</Text>}
        <TextInput value={value} onChangeText={onChange} editable={editable} autoCapitalize="none" style={[s.inputText, !editable && { color: c.ink3 }]} />
        {!editable && <Ionicons name="lock-closed-outline" size={14} color={c.ink4} />}
      </View>
    </View>
  );
}

function Rows({ rows }: { rows: [string, string][] }) {
  return (
    <View style={s.card}>
      {rows.map(([k, v], i) => (
        <View key={k} style={[s.kv, i > 0 && s.divider]}>
          <Text style={s.kicker}>{k}</Text>
          <Text style={[s.bodyInk, { marginTop: 4 }]}>{v}</Text>
        </View>
      ))}
    </View>
  );
}

function Done({ text }: { text: string }) {
  return <View style={s.done}><Ionicons name="checkmark-circle" size={18} color={c.gain} /><Text style={[s.bodyInk, { color: c.gain, flex: 1 }]}>{text}</Text></View>;
}

function Personal() {
  const [edit, setEdit] = useState(false);
  const [saved, setSaved] = useState(false);
  const [v, setV] = useState({ name: 'Wing Chan', user: 'wingchan', country: 'Hong Kong', tz: 'Asia/Hong_Kong (HKT, UTC+8)' });
  if (!edit) return (
    <>
      {saved && <Done text="Saved." />}
      <Rows rows={[['FULL NAME', v.name], ['USERNAME', `@${v.user}`], ['COUNTRY / REGION', v.country], ['PREFERRED LANGUAGE', 'English'], ['TIME ZONE', v.tz]]} />
      <Pressable style={s.ghost} onPress={() => { setEdit(true); setSaved(false); }}><Ionicons name="create-outline" size={16} color={c.ink} /><Text style={s.ghostText}>EDIT</Text></Pressable>
    </>
  );
  return (
    <>
      <Field label="Full name" value={v.name} editable={false} />
      <Text style={s.hint}>Your legal name matches your verified ID. Contact support to change it.</Text>
      <Field label="Username" value={v.user} onChange={user => setV({ ...v, user })} />
      <Field label="Country / region" value={v.country} onChange={country => setV({ ...v, country })} />
      <Field label="Time zone" value={v.tz} onChange={tz => setV({ ...v, tz })} />
      <View style={[s.row, { gap: 10 }]}>
        <Pressable style={[s.ghost, { flex: 1 }]} onPress={() => setEdit(false)}><Text style={s.ghostText}>CANCEL</Text></Pressable>
        <CutButton title="Save" style={{ flex: 2 }} onPress={() => { setEdit(false); setSaved(true); }} />
      </View>
    </>
  );
}

function ChangeContact({ kind }: { kind: 'email' | 'mobile' }) {
  const email = kind === 'email';
  const [step, setStep] = useState(0);
  const [val, setVal] = useState('');
  const [code, setCode] = useState('');
  const current = email ? 'wing.chan@wingchantrading.com.hk' : '+852 9123 4567';
  return (
    <>
      <View style={s.panel}>
        <Corners color={c.deep} />
        <Text style={s.kicker}>CURRENT {email ? 'EMAIL' : 'MOBILE'}</Text>
        <View style={s.between}>
          <Text style={[s.mono, { flex: 1 }]} numberOfLines={1}>{current}</Text>
          <Text style={[s.tag, { color: c.gain, borderColor: c.gain }]}>VERIFIED</Text>
        </View>
        <Text style={s.hint}>{email ? 'Also your sign-in. Every Javas email shows your anti-phishing code.' : 'Used for SMS verification and withdrawal alerts.'}</Text>
      </View>
      {step === 0 && <Pressable style={s.ghost} onPress={() => setStep(1)}><Text style={s.ghostText}>CHANGE {email ? 'EMAIL' : 'MOBILE'}</Text></Pressable>}
      {step === 1 && (
        <>
          <Field label={email ? 'New email address' : 'New mobile number'} value={val} onChange={setVal} prefix={email ? undefined : '🇭🇰 +852'} />
          <Text style={s.hint}>We'll send a code to the new {email ? 'address' : 'number'}. The change takes effect once you confirm it.</Text>
          <CutButton title="Send code" onPress={() => val.length > 5 && setStep(2)} />
        </>
      )}
      {step === 2 && (
        <>
          <Text style={s.sub}>Enter the code sent to <Text style={{ color: c.ink }}>{email ? val : `+852 ${val}`}</Text>.</Text>
          <Otp value={code} onChange={setCode} />
          <CutButton title="Confirm change" onPress={() => code.length === 6 && setStep(3)} />
        </>
      )}
      {step === 3 && <Done text={`${email ? 'Email' : 'Mobile'} updated. Withdrawals pause for 24 hours as a safety measure.`} />}
    </>
  );
}

function Company() {
  return (
    <>
      <Rows rows={[['REGISTERED NAME', 'Wing Chan Trading Limited'], ['BUSINESS REGISTRATION NO.', '7314 2856'], ['YOUR ROLE', 'Director · account owner'], ['ACCOUNT TIER', 'VIP 3 · Maker 0.08% · Taker 0.12%'], ['ONBOARDED', '6 Aug 2026']]} />
      <View style={s.note}><Ionicons name="information-circle-outline" size={16} color={c.ink2} /><Text style={[s.hint, { flex: 1, marginTop: 0 }]}>Company details come from your onboarding documents. To change them, contact your relationship manager.</Text></View>
      <Pressable style={s.ghost}><Ionicons name="chatbubble-ellipses-outline" size={16} color={c.ink} /><Text style={s.ghostText}>MESSAGE RELATIONSHIP MANAGER</Text></Pressable>
    </>
  );
}

function Approver() {
  const [asked, setAsked] = useState(false);
  return (
    <>
      <View style={s.panel}>
        <Corners color={c.deep} />
        <View style={[s.row, { gap: 14 }]}>
          <View style={s.avatar}><Text style={s.avatarText}>HM</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Ho Mei Lin</Text>
            <Text style={s.hint}>Finance Manager · added 9 Aug 2026</Text>
          </View>
          <Text style={[s.tag, { color: c.gain, borderColor: c.gain }]}>ACTIVE</Text>
        </View>
      </View>
      <View style={s.card}>
        {['Approves every withdrawal before it is sent', 'Approves new whitelist addresses', 'Gets an alert for sign-ins on new devices'].map((x, i) => (
          <View key={x} style={[s.kv, s.row, { gap: 10 }, i > 0 && s.divider]}><Ionicons name="checkmark" size={16} color={c.gain} /><Text style={s.body}>{x}</Text></View>
        ))}
      </View>
      {asked ? <Done text="Request sent. Your relationship manager will confirm the change." />
        : <Pressable style={s.ghost} onPress={() => setAsked(true)}><Text style={s.ghostText}>REQUEST A CHANGE</Text></Pressable>}
    </>
  );
}

function Bank() {
  return (
    <>
      {[['HSBC Hong Kong', '808-•••417', 'CHATS · FPS', true], ['Bank of China (HK)', '012-•••832', 'CHATS', false]].map(([b, n, rails, primary]) => (
        <View key={b as string} style={s.panel}>
          <Corners color={primary ? c.deep : c.ink4} />
          <View style={s.between}>
            <Text style={s.title}>{b}</Text>
            {primary && <Text style={[s.tag, { color: c.deep, borderColor: c.deep }]}>SETTLEMENT</Text>}
          </View>
          <Text style={s.mono}>{n}</Text>
          <Text style={s.hint}>Wing Chan Trading Limited · {rails}</Text>
        </View>
      ))}
      <Text style={s.hint}>Deposits must come from, and withdrawals go to, accounts in your company's own name.</Text>
      <Pressable style={s.add}><Ionicons name="add" size={18} color={c.signal} /><Text style={[s.ghostText, { color: c.signal }]}>ADD BANK ACCOUNT</Text></Pressable>
    </>
  );
}

function Vip() {
  const tiers = [['VIP 1', '< HK$ 1M', '0.12%', '0.16%'], ['VIP 2', 'HK$ 1M', '0.10%', '0.14%'], ['VIP 3', 'HK$ 10M', '0.08%', '0.12%'], ['VIP 4', 'HK$ 25M', '0.06%', '0.10%'], ['VIP 5', 'HK$ 100M', '0.04%', '0.08%']];
  return (
    <>
      <View style={s.panel}>
        <Corners color={c.deep} />
        <View style={s.between}><Text style={[s.big, { color: '#9a7a12' }]}>VIP 3</Text><Text style={s.small}>FEE TODAY 0.12%</Text></View>
        <View style={s.track}><View style={[s.fill, { width: '74%' }]} /></View>
        <Text style={s.hint}>HK$ 18.4M of HK$ 25M 30-day volume to VIP 4. Levels update daily at 00:00 HKT.</Text>
      </View>
      <View style={s.card}>
        <View style={[s.tierRow, { paddingVertical: 10 }]}>
          {['LEVEL', '30D VOL', 'MAKER', 'TAKER'].map(h => <Text key={h} style={[s.kicker, s.tierCell]}>{h}</Text>)}
        </View>
        {tiers.map(([lv, vol, mk, tk]) => {
          const me = lv === 'VIP 3';
          return (
            <View key={lv} style={[s.tierRow, s.divider, me && { backgroundColor: c.tint }]}>
              <Text style={[s.monoSm, s.tierCell, me && { color: c.signal }]}>{lv}</Text>
              <Text style={[s.monoSm, s.tierCell]}>{vol}</Text>
              <Text style={[s.monoSm, s.tierCell]}>{mk}</Text>
              <Text style={[s.monoSm, s.tierCell]}>{tk}</Text>
            </View>
          );
        })}
      </View>
      <Text style={s.hint}>VIP 4 and above get a dedicated OTC trader and same-day CHATS settlement.</Text>
    </>
  );
}

function Language() {
  const [lang, setLang] = useState('English');
  return (
    <View style={s.card}>
      {[['English', 'English'], ['繁體中文', 'Traditional Chinese'], ['简体中文', 'Simplified Chinese']].map(([k, d], i) => (
        <Pressable key={k} onPress={() => setLang(k)} style={[s.kv, s.row, { gap: 14 }, i > 0 && s.divider]}>
          <Ionicons name={lang === k ? 'radio-button-on' : 'radio-button-off'} size={20} color={lang === k ? c.signal : c.ink4} />
          <View style={{ flex: 1 }}><Text style={s.bodyInk}>{k}</Text><Text style={s.hint}>{d}</Text></View>
        </Pressable>
      ))}
    </View>
  );
}

function Help() {
  const [open, setOpen] = useState<number | null>(0);
  const faq = [
    ['How long do HKD deposits take?', 'FPS usually lands in under 2 minutes. CHATS arrives the same business day if sent before 4 pm HKT.'],
    ['Why is my withdrawal pending?', 'Every withdrawal needs your 2FA code and your second approver. New whitelist addresses can be used 24 hours after approval.'],
    ['What are the trading fees?', 'They depend on your VIP level. At VIP 3 you pay 0.08% maker and 0.12% taker.'],
    ['How does P2P escrow work?', "The seller's crypto is locked by Javas when you open an order and released once they confirm your payment."],
  ];
  return (
    <>
      <View style={[s.row, { gap: 10 }]}>
        {[['chatbubbles-outline', 'Live chat', '~2 min'], ['call-outline', 'Call desk', '9am–9pm'], ['mail-outline', 'Email', '< 4 h']].map(([icon, k, d]) => (
          <Pressable key={k} style={s.contact}>
            <Ionicons name={icon as 'call-outline'} size={20} color={c.deep} />
            <Text style={s.bodyInk}>{k}</Text>
            <Text style={s.small}>{d.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>
      <View style={s.panel}>
        <Corners color={c.deep} />
        <Text style={s.kicker}>YOUR RELATIONSHIP MANAGER</Text>
        <View style={[s.row, { gap: 14 }]}>
          <View style={s.avatar}><Text style={s.avatarText}>JL</Text></View>
          <View style={{ flex: 1 }}><Text style={s.title}>Jason Lau</Text><Text style={s.hint}>OTC desk · +852 3700 1288</Text></View>
        </View>
      </View>
      <View>
        <Text style={[s.kicker, { marginBottom: 12 }]}>COMMON QUESTIONS</Text>
        <View style={s.card}>
          {faq.map(([q, a], i) => (
            <Pressable key={q} onPress={() => setOpen(open === i ? null : i)} style={[s.kv, i > 0 && s.divider]}>
              <View style={s.between}><Text style={[s.bodyInk, { flex: 1 }]}>{q}</Text><Ionicons name={open === i ? 'remove' : 'add'} size={18} color={c.ink3} /></View>
              {open === i && <Text style={[s.sub, { marginTop: 8 }]}>{a}</Text>}
            </Pressable>
          ))}
        </View>
      </View>
      <Text style={[s.small, { textAlign: 'center' }]}>ALL SYSTEMS OPERATIONAL · v1.0 DESIGN PREVIEW</Text>
    </>
  );
}

const META: Record<ProfileSection, [string, string, () => React.JSX.Element]> = {
  personal: ['PROFILE', 'Personal information', Personal],
  email: ['PROFILE', 'Email', () => <ChangeContact kind="email" />],
  mobile: ['PROFILE', 'Mobile', () => <ChangeContact kind="mobile" />],
  company: ['PROFILE', 'Company', Company],
  approver: ['PROFILE', 'Second approver', Approver],
  bank: ['PROFILE', 'Settlement bank', Bank],
  vip: ['MORE', 'VIP programme', Vip],
  language: ['MORE', 'Language', Language],
  help: ['MORE', 'Help & support', Help],
};

export default function Profile({ section }: { section: ProfileSection }) {
  const [kicker, title, Body] = META[section];
  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Header kicker={kicker} title={title} />
      <Body />
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 48, gap: 20 },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10 },

  label: { color: c.ink2, fontFamily: f.med, fontSize: t.label },
  input: { flexDirection: 'row', alignItems: 'center', height: 52, paddingHorizontal: 16, backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, borderRadius: 2 },
  inputText: { flex: 1, minWidth: 0, height: '100%', color: c.ink, fontFamily: f.reg, fontSize: t.body },
  prefix: { color: c.ink, fontFamily: f.reg, fontSize: t.body, marginRight: 10, paddingRight: 10, borderRightWidth: 1, borderRightColor: c.rule },

  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, paddingHorizontal: 16 },
  kv: { paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: c.rule },
  panel: { backgroundColor: c.hero, borderWidth: 1, borderColor: c.rule, padding: 22, gap: 12 },
  note: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  done: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 16, borderWidth: 1, borderColor: c.gain, backgroundColor: c.sheet },
  ghost: { flexDirection: 'row', gap: 8, height: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: c.ink4, backgroundColor: c.sheet, borderRadius: 2 },
  ghostText: { color: c.ink, fontFamily: f.mono, fontSize: 11, letterSpacing: 1.2 },
  add: { flexDirection: 'row', gap: 6, height: 50, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: c.signal, backgroundColor: c.sheet },
  tag: { fontFamily: f.mono, fontSize: 9, letterSpacing: 0.8, borderWidth: 1, paddingHorizontal: 6, paddingVertical: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: c.deep, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: f.semi, fontSize: t.body },
  contact: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 16, borderWidth: 1, borderColor: c.rule, backgroundColor: c.sheet },

  track: { height: 4, backgroundColor: c.sunk },
  fill: { height: 4, backgroundColor: c.signal },
  tierRow: { flexDirection: 'row', paddingVertical: 12, marginHorizontal: -16, paddingHorizontal: 16 },
  tierCell: { flex: 1 },

  big: { fontFamily: f.mono, fontSize: t.h2 },
  title: { color: c.ink, fontFamily: f.semi, fontSize: t.h4 },
  bodyInk: { color: c.ink, fontFamily: f.med, fontSize: t.body },
  body: { color: c.ink2, fontFamily: f.reg, fontSize: t.body },
  sub: { color: c.ink2, fontFamily: f.reg, fontSize: t.body, lineHeight: 21 },
  hint: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, lineHeight: 18 },
  small: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 0.8 },
  mono: { color: c.ink, fontFamily: f.mono, fontSize: t.body },
  monoSm: { color: c.ink, fontFamily: f.mono, fontSize: t.label },
}));
