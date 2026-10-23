// Design-only security settings from the web settings page: one screen per Account → Security row.
// Forms validate lightly and "save" locally; nothing is sent.
import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Corners, CutButton } from '../components/Ledger';
import { Header } from '../components/Nav';
import { FakeQR } from './Transfer';
import { c, f, t, themed } from '../theme';

export type Section = '2fa' | 'password' | 'verification' | 'devices' | 'antiphishing' | 'whitelist';

function Field({ label, value, onChange, secure, hint, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; secure?: boolean; hint?: string; placeholder?: string; mono?: boolean }) {
  const [hidden, setHidden] = useState(true);
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <View style={s.input}>
        <TextInput value={value} onChangeText={onChange} secureTextEntry={secure && hidden} placeholder={placeholder} placeholderTextColor={c.ink4} autoCapitalize="none" style={[s.inputText, mono && { fontFamily: f.mono, letterSpacing: 2 }]} />
        {secure && <Pressable onPress={() => setHidden(!hidden)} hitSlop={10}><Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={18} color={c.ink3} /></Pressable>}
      </View>
      {hint && <Text style={s.hint}>{hint}</Text>}
    </View>
  );
}

function Done({ text }: { text: string }) {
  return <View style={s.done}><Ionicons name="checkmark-circle" size={18} color={c.gain} /><Text style={[s.body, { color: c.gain, flex: 1 }]}>{text}</Text></View>;
}

function TwoFA() {
  const [code, setCode] = useState('');
  const [on, setOn] = useState(false);
  if (on) return <Done text="Two-factor is on. You'll need a code on every sign-in and withdrawal." />;
  return (
    <>
      <View style={[s.panel, { alignItems: 'center' }]}>
        <Corners color={c.deep} />
        <Text style={[s.sub, { textAlign: 'center' }]}>Scan with Google Authenticator (or any TOTP app), then enter the 6-digit code it shows.</Text>
        <View style={s.qr}><FakeQR seed="totp-9642943" /></View>
        <Text style={s.kicker}>OR ENTER THIS KEY</Text>
        <Text style={[s.mono, { letterSpacing: 2 }]} selectable>JVXK 7Q2M 4DPA L9WE RT3B</Text>
      </View>
      <Field label="6-digit code" value={code} onChange={v => setCode(v.replace(/\D/g, '').slice(0, 6))} placeholder="000000" mono hint="Preview: any 6 digits work." />
      <CutButton title="Turn on" onPress={() => code.length === 6 && setOn(true)} />
    </>
  );
}

function Password() {
  const [p0, setP0] = useState(''), [p1, setP1] = useState(''), [p2, setP2] = useState('');
  const [done, setDone] = useState(false);
  const strength = Math.min(4, Math.floor(p1.length / 4));
  const err = p1 && p1.length < 12 ? 'At least 12 characters.' : p2 && p1 !== p2 ? "Passwords don't match." : '';
  if (done) return <Done text="Password changed. Other devices were signed out." />;
  return (
    <>
      <Text style={s.sub}>You'll stay signed in here; other devices are signed out. Last changed 41 days ago.</Text>
      <Field label="Current password" value={p0} onChange={setP0} secure />
      <View style={{ gap: 8 }}>
        <Field label="New password" value={p1} onChange={setP1} secure hint="At least 12 characters. A passphrase works well." />
        <View style={[s.row, { gap: 4 }]}>
          {[0, 1, 2, 3].map(i => <View key={i} style={[s.seg, i < strength && { backgroundColor: strength < 3 ? c.flag : c.gain }]} />)}
        </View>
      </View>
      <Field label="Confirm new password" value={p2} onChange={setP2} secure />
      {!!err && <Text style={[s.hint, { color: c.loss }]}>{err}</Text>}
      <CutButton title="Change password" onPress={() => p0 && p1.length >= 12 && p1 === p2 && setDone(true)} />
    </>
  );
}

function AntiPhishing() {
  const [code, setCode] = useState('');
  const [saved, setSaved] = useState(false);
  const ok = /^[a-z0-9]{4,20}$/i.test(code);
  return (
    <>
      <Text style={s.sub}>Pick a word only you would know. Every genuine Javas email will show it at the top, so you can spot fakes.</Text>
      <Field label="Your code" value={code} onChange={v => { setCode(v); setSaved(false); }} placeholder="e.g. harbourlight" hint="4–20 letters or numbers. Don't reuse a password." />
      <View>
        <Text style={[s.kicker, { marginBottom: 10 }]}>PREVIEW · HOW OUR EMAILS WILL LOOK</Text>
        <View style={s.email}>
          <View style={s.emailBar}><Ionicons name="shield-checkmark" size={14} color="#fff" /><Text style={s.emailBarText}>ANTI-PHISHING CODE: {code ? code.toUpperCase() : '———'}</Text></View>
          <View style={{ padding: 14, gap: 6 }}>
            <Text style={s.body}>Deposit received — HK$ 2,000,000</Text>
            <Text style={s.sub}>From Javas Exchange · no-reply@javas.exchange</Text>
          </View>
        </View>
      </View>
      {saved ? <Done text="Code saved. Look for it in every Javas email." /> : <CutButton title="Save code" onPress={() => ok && setSaved(true)} />}
    </>
  );
}

function Devices() {
  const [list, setList] = useState([
    ['laptop-outline', 'MacBook Pro · Chrome', 'Hong Kong · active now', true],
    ['phone-portrait-outline', 'iPhone 15 · Javas app', 'Hong Kong · 3 days ago', false],
    ['desktop-outline', 'Windows · Edge', 'Hong Kong · 6 days ago', false],
    ['tablet-portrait-outline', 'iPad · Safari', 'Shenzhen · 12 days ago', false],
  ] as [string, string, string, boolean][]);
  return (
    <>
      <View style={s.card}>
        {list.map(([icon, name, where, me], i) => (
          <View key={name} style={[s.item, i > 0 && s.divider]}>
            <View style={s.icon}><Ionicons name={icon as 'laptop-outline'} size={18} color={c.deep} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.body}>{name}</Text>
              <Text style={s.sub}>{where}</Text>
            </View>
            {me ? <Text style={[s.badge, { color: c.gain, borderColor: c.gain }]}>THIS DEVICE</Text>
              : <Pressable style={s.btn} onPress={() => setList(list.filter(d => d[1] !== name))}><Text style={s.btnText}>SIGN OUT</Text></Pressable>}
          </View>
        ))}
      </View>
      <Text style={s.sub}>And 6 older sessions, signed out automatically after 30 days of inactivity.</Text>
      {list.length > 1 && (
        <Pressable style={s.danger} onPress={() => setList(list.filter(d => d[3]))}>
          <Text style={[s.btnText, { color: c.loss }]}>SIGN OUT ALL OTHER DEVICES</Text>
        </Pressable>
      )}
    </>
  );
}

const NETS = ['Bitcoin', 'Ethereum (ERC-20)', 'Tron (TRC-20)', 'Solana'] as const;
function Whitelist() {
  const [list, setList] = useState<[string, string, string, string][]>([
    ['Treasury cold wallet', 'Ethereum (ERC-20)', '0x3f9a…a41c', 'ACTIVE'],
    ['OTC settlement', 'Tron (TRC-20)', 'TQ7x…Q7xk', 'ACTIVE'],
    ['Fireblocks vault', 'Bitcoin', 'bc1q…9c2e', 'ACTIVE'],
    ['Fireblocks vault', 'Solana', '9c2e…Fb7q', 'ACTIVE'],
    ['HSBC', 'Bank · CHATS / FPS', '808-•••417', 'ACTIVE'],
    ['Bank of China (HK)', 'Bank · CHATS', '012-•••832', 'ACTIVE'],
  ]);
  const [adding, setAdding] = useState(false);
  const [net, setNet] = useState<(typeof NETS)[number]>('Tron (TRC-20)');
  const [label, setLabel] = useState(''), [addr, setAddr] = useState('');
  const add = () => {
    if (!label || addr.length < 12) return;
    setList([[label, net, `${addr.slice(0, 4)}…${addr.slice(-4)}`, 'PENDING'], ...list]);
    setAdding(false); setLabel(''); setAddr('');
  };
  return (
    <>
      <Text style={s.sub}>Withdrawals can only go to these destinations. A new one needs Ho Mei Lin's approval and can be used 24 hours after.</Text>
      {adding ? (
        <View style={s.panel}>
          <Corners color={c.deep} />
          <Text style={s.kicker}>ADD A WITHDRAWAL ADDRESS</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {NETS.map(k => (
              <Pressable key={k} onPress={() => setNet(k)} style={[s.chip, net === k && s.chipOn]}>
                <Text style={[s.chipText, net === k && { color: '#fff' }]}>{k}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <Field label="Label" value={label} onChange={setLabel} placeholder="e.g. Treasury hot wallet" />
          <Field label="Address" value={addr} onChange={setAddr} placeholder="Paste address" mono />
          <View style={[s.row, { gap: 10 }]}>
            <Pressable style={[s.btn, { flex: 1, alignItems: 'center', paddingVertical: 14 }]} onPress={() => setAdding(false)}><Text style={s.btnText}>CANCEL</Text></Pressable>
            <CutButton title="Send for approval" style={{ flex: 2 }} height={46} onPress={add} />
          </View>
        </View>
      ) : (
        <Pressable style={s.addBtn} onPress={() => setAdding(true)}>
          <Ionicons name="add" size={18} color={c.signal} />
          <Text style={[s.btnText, { color: c.signal }]}>ADD ADDRESS</Text>
        </Pressable>
      )}
      <View style={s.card}>
        {list.map(([lbl, n, a, st], i) => (
          <View key={lbl + n} style={[s.item, i > 0 && s.divider]}>
            <View style={s.icon}><Ionicons name={n.startsWith('Bank') ? 'business-outline' : 'wallet-outline'} size={17} color={c.deep} /></View>
            <View style={{ flex: 1 }}>
              <Text style={s.body}>{lbl}</Text>
              <Text style={s.sub}>{n}</Text>
              <Text style={[s.sub, { fontFamily: f.mono }]}>{a}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 8 }}>
              <Text style={[s.badge, st === 'ACTIVE' ? { color: c.gain, borderColor: c.gain } : { color: '#9a7a12', borderColor: c.flag }]}>{st}</Text>
              <Pressable onPress={() => setList(list.filter((_, j) => j !== i))} hitSlop={8}><Text style={[s.small, { color: c.loss }]}>REMOVE</Text></Pressable>
            </View>
          </View>
        ))}
      </View>
    </>
  );
}

function Verification() {
  return (
    <>
      <View style={s.panel}>
        <Corners color={c.deep} />
        <View style={[s.row, { gap: 14 }]}>
          <View style={[s.icon, { width: 48, height: 48, borderColor: c.gain }]}><Ionicons name="finger-print" size={24} color={c.gain} /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Level 3 · verified</Text>
            <Text style={s.sub}>Corporate documents · approved 12 Aug 2026</Text>
          </View>
        </View>
      </View>
      <View style={s.card}>
        {[['Level 1', 'Email and mobile', 'Deposits up to HK$ 50,000 / day'], ['Level 2', 'ID and proof of address', 'Spot and P2P, HK$ 2M / day'], ['Level 3', 'Corporate documents, directors, UBOs', 'OTC desk, no daily limit']].map(([k, need, gets], i) => (
          <View key={k} style={[s.item, i > 0 && s.divider]}>
            <Ionicons name="checkmark-circle" size={18} color={c.gain} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.body}>{k} <Text style={s.sub}>· {need}</Text></Text>
              <Text style={s.sub}>{gets}</Text>
            </View>
          </View>
        ))}
      </View>
      <Text style={s.sub}>Company details come from your onboarding documents. To change them, contact your relationship manager.</Text>
    </>
  );
}

const META: Record<Section, [string, string, () => React.JSX.Element]> = {
  '2fa': ['SECURITY', 'Two-factor (2FA)', TwoFA],
  password: ['SECURITY', 'Change password', Password],
  verification: ['SECURITY', 'Identity verification', Verification],
  devices: ['SECURITY', 'Devices', Devices],
  antiphishing: ['SECURITY', 'Anti-phishing code', AntiPhishing],
  whitelist: ['SECURITY', 'Withdrawal whitelist', Whitelist],
};

export default function Security({ section }: { section: Section }) {
  const [kicker, title, Body] = META[section];
  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Header kicker={kicker} title={title} />
      <Body />
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 48, gap: 24 },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },
  row: { flexDirection: 'row', alignItems: 'center' },

  label: { color: c.ink2, fontFamily: f.med, fontSize: t.label },
  input: { flexDirection: 'row', alignItems: 'center', height: 52, paddingHorizontal: 16, backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, borderRadius: 2 },
  inputText: { flex: 1, minWidth: 0, height: '100%', color: c.ink, fontFamily: f.reg, fontSize: t.body },
  hint: { color: c.ink3, fontFamily: f.reg, fontSize: t.label },
  seg: { flex: 1, height: 3, backgroundColor: c.sunk },

  panel: { backgroundColor: c.hero, borderWidth: 1, borderColor: c.rule, padding: 22, gap: 14 },
  qr: { padding: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: c.rule },
  done: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 16, borderWidth: 1, borderColor: c.gain, backgroundColor: c.sheet },

  email: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule },
  emailBar: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#25165b', paddingHorizontal: 14, paddingVertical: 10 },
  emailBarText: { color: '#fff', fontFamily: f.mono, fontSize: 10, letterSpacing: 1 },

  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, paddingHorizontal: 16 },
  divider: { borderTopWidth: 1, borderTopColor: c.rule },
  item: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14 },
  icon: { width: 36, height: 36, borderWidth: 1, borderColor: c.rule, backgroundColor: c.canvas, alignItems: 'center', justifyContent: 'center' },
  badge: { fontFamily: f.mono, fontSize: 9, letterSpacing: 0.8, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 1 },
  btn: { borderWidth: 1, borderColor: c.ruleStrong, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 2 },
  btnText: { color: c.ink, fontFamily: f.mono, fontSize: 10, letterSpacing: 1 },
  danger: { height: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(192,65,76,.4)', backgroundColor: c.sheet },
  addBtn: { flexDirection: 'row', gap: 6, height: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: c.signal, backgroundColor: c.sheet },
  chip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 2, borderWidth: 1, borderColor: c.rule, backgroundColor: c.sheet },
  chipOn: { backgroundColor: c.deep, borderColor: c.deep },
  chipText: { color: c.ink2, fontFamily: f.med, fontSize: t.label },

  title: { color: c.ink, fontFamily: f.semi, fontSize: t.h4 },
  body: { color: c.ink, fontFamily: f.med, fontSize: t.body },
  sub: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, lineHeight: 18 },
  small: { color: c.ink3, fontFamily: f.mono, fontSize: 9, letterSpacing: 0.6 },
  mono: { color: c.ink, fontFamily: f.mono, fontSize: t.body },
}));
