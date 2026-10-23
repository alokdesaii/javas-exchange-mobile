// Design-only auth follow-ups: the 2FA code after Sign in, Forgot password, and KYC after Create account.
// Any 6 digits pass; uploads and checks are visual only.
import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Corners, CutButton } from '../components/Ledger';
import { c, f, t, themed } from '../theme';

// Six boxes over one hidden input, so the keyboard and paste behave like a normal field.
export function Otp({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <View>
      <View style={s.otp}>
        {Array.from({ length: 6 }, (_, i) => (
          <View key={i} style={[s.otpBox, i === value.length && s.otpActive, i < value.length && s.otpFilled]}>
            <Text style={s.otpText}>{value[i] ?? ''}</Text>
          </View>
        ))}
      </View>
      <TextInput value={value} onChangeText={v => onChange(v.replace(/\D/g, '').slice(0, 6))} keyboardType="number-pad" autoFocus
        style={s.otpInput} accessibilityLabel="6-digit code" textContentType="oneTimeCode" />
    </View>
  );
}

function Top({ step, total, onBack, kicker }: { step?: number; total?: number; onBack: () => void; kicker: string }) {
  return (
    <View style={s.top}>
      <Pressable onPress={onBack} style={s.back} accessibilityLabel="Back" hitSlop={8}><Ionicons name="arrow-back" size={20} color={c.ink} /></Pressable>
      <Text style={s.kicker}>{kicker}{step ? ` · STEP ${step} OF ${total}` : ''}</Text>
    </View>
  );
}

function Progress({ step, total }: { step: number; total: number }) {
  return <View style={[s.row, { gap: 4 }]}>{Array.from({ length: total }, (_, i) => <View key={i} style={[s.seg, i < step && { backgroundColor: c.signal }]} />)}</View>;
}

function Input({ label, value, onChange, secure, placeholder, hint }: { label: string; value: string; onChange: (v: string) => void; secure?: boolean; placeholder?: string; hint?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <View style={s.input}><TextInput value={value} onChangeText={onChange} secureTextEntry={secure} placeholder={placeholder} placeholderTextColor={c.ink4} autoCapitalize="none" style={s.inputText} /></View>
      {hint && <Text style={s.hint}>{hint}</Text>}
    </View>
  );
}

function Resend() {
  const [sent, setSent] = useState(false);
  return (
    <Pressable onPress={() => setSent(true)} style={{ alignSelf: 'center' }}>
      <Text style={s.sub}>Didn't get it? <Text style={s.link}>{sent ? 'Sent again' : 'Resend code'}</Text></Text>
    </Pressable>
  );
}

/* ---------- 2FA after sign-in ---------- */
export function TwoFactorStep({ onDone, onBack }: { onDone: () => void; onBack: () => void }) {
  const [code, setCode] = useState('');
  const [trust, setTrust] = useState(true);
  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <Top onBack={onBack} kicker="SIGN IN" />
      <View style={s.badge}><Ionicons name="shield-checkmark" size={28} color={c.deep} /></View>
      <View style={{ gap: 6 }}>
        <Text style={s.h1}>Enter your code</Text>
        <Text style={s.sub}>Open Google Authenticator and enter the 6-digit code for <Text style={{ color: c.ink }}>Javas Exchange · wingchan</Text>.</Text>
      </View>
      <Otp value={code} onChange={v => { setCode(v); if (v.length === 6) setTimeout(onDone, 250); }} />
      <Pressable style={s.check} onPress={() => setTrust(!trust)}>
        <View style={[s.box, trust && s.boxOn]}>{trust && <Ionicons name="checkmark" size={12} color="#fff" />}</View>
        <Text style={s.body}>Trust this device for 30 days</Text>
      </Pressable>
      <CutButton title="Verify" onPress={() => code.length === 6 && onDone()} height={54} />
      <View style={{ gap: 10, alignItems: 'center' }}>
        <Text style={s.link}>Use an SMS code to +852 •••• 4567</Text>
        <Text style={s.link}>Lost your authenticator?</Text>
      </View>
      <Text style={s.foot}>Preview: any 6 digits work.</Text>
    </ScrollView>
  );
}

/* ---------- Forgot password ---------- */
export function ForgotFlow({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [p1, setP1] = useState(''), [p2, setP2] = useState('');
  const back = () => (step === 1 || step === 4 ? onBack() : setStep(step - 1));
  const pwErr = p1 && p1.length < 12 ? 'At least 12 characters.' : p2 && p1 !== p2 ? "Passwords don't match." : '';

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <Top onBack={back} kicker="RESET PASSWORD" step={Math.min(step, 3)} total={3} />
      <Progress step={step} total={3} />
      {step === 1 && (
        <>
          <View style={{ gap: 6 }}>
            <Text style={s.h1}>Forgot password?</Text>
            <Text style={s.sub}>Enter the email you sign in with. We'll send a 6-digit code to reset it.</Text>
          </View>
          <Input label="Email address" value={email} onChange={setEmail} placeholder="you@company.com.hk" />
          <CutButton title="Send code" height={54} onPress={() => /\S+@\S+\.\S+/.test(email) && setStep(2)} />
        </>
      )}
      {step === 2 && (
        <>
          <View style={{ gap: 6 }}>
            <Text style={s.h1}>Check your email</Text>
            <Text style={s.sub}>We sent a code to <Text style={{ color: c.ink }}>{email}</Text>. It expires in 10 minutes.</Text>
          </View>
          <Otp value={code} onChange={setCode} />
          <CutButton title="Continue" height={54} onPress={() => code.length === 6 && setStep(3)} />
          <Resend />
        </>
      )}
      {step === 3 && (
        <>
          <View style={{ gap: 6 }}>
            <Text style={s.h1}>New password</Text>
            <Text style={s.sub}>All your devices will be signed out. Withdrawals pause for 24 hours as a safety measure.</Text>
          </View>
          <Input label="New password" value={p1} onChange={setP1} secure hint="At least 12 characters. A passphrase works well." />
          <Input label="Confirm new password" value={p2} onChange={setP2} secure />
          {!!pwErr && <Text style={[s.hint, { color: c.loss }]}>{pwErr}</Text>}
          <CutButton title="Reset password" height={54} onPress={() => p1.length >= 12 && p1 === p2 && setStep(4)} />
        </>
      )}
      {step === 4 && (
        <>
          <View style={[s.badge, { borderColor: c.gain }]}><Ionicons name="checkmark" size={30} color={c.gain} /></View>
          <View style={{ gap: 6 }}>
            <Text style={s.h1}>Password reset</Text>
            <Text style={s.sub}>Sign in with your new password. Withdrawals are paused until tomorrow at this time.</Text>
          </View>
          <CutButton title="Back to sign in" height={54} onPress={onBack} />
        </>
      )}
    </ScrollView>
  );
}

/* ---------- KYC after create account ---------- */
function Upload({ label, sub }: { label: string; sub: string }) {
  const [done, setDone] = useState(false);
  return (
    <Pressable onPress={() => setDone(!done)} style={[s.upload, done && { borderStyle: 'solid', borderColor: c.gain }]}>
      <Ionicons name={done ? 'checkmark-circle' : 'cloud-upload-outline'} size={22} color={done ? c.gain : c.deep} />
      <View style={{ flex: 1 }}>
        <Text style={s.bodyInk}>{label}</Text>
        <Text style={s.hint}>{done ? 'passport_wing_chan.pdf · 1.2 MB' : sub}</Text>
      </View>
      <Text style={[s.small, { color: done ? c.loss : c.signal }]}>{done ? 'REMOVE' : 'UPLOAD'}</Text>
    </Pressable>
  );
}

export function KycFlow({ corporate, onDone, onBack }: { corporate: boolean; onDone: () => void; onBack: () => void }) {
  const TOTAL = 4;
  const [step, setStep] = useState(1);
  const [code, setCode] = useState('');
  const [f1, setF1] = useState(''), [f2, setF2] = useState(''), [f3, setF3] = useState('');
  const next = () => setStep(step + 1);
  const back = () => (step === 1 ? onBack() : setStep(step - 1));
  const titles = ['Verify your email', corporate ? 'Company details' : 'Personal details', 'Documents', corporate ? 'Directors & owners' : 'Selfie check'];

  if (step > TOTAL) {
    return (
      <ScrollView contentContainerStyle={s.wrap}>
        <View style={[s.badge, { marginTop: 40 }]}><Ionicons name="hourglass-outline" size={28} color={c.deep} /></View>
        <View style={{ gap: 6 }}>
          <Text style={s.h1}>Under review</Text>
          <Text style={s.sub}>{corporate ? 'Corporate reviews usually take 1–2 business days. Your relationship manager will call if anything is missing.' : 'Most reviews finish within an hour.'} You can look around and deposit in the meantime; trading unlocks once you're verified.</Text>
        </View>
        <View style={s.card}>
          {[['Email', 'Verified', c.gain], [titles[1], 'Submitted', c.gain], ['Documents', 'In review', '#9a7a12'], [titles[3], 'In review', '#9a7a12']].map(([k, v, col], i) => (
            <View key={k} style={[s.between, s.cardRow, i > 0 && s.divider]}>
              <Text style={s.bodyInk}>{k}</Text>
              <Text style={[s.small, { color: col }]}>{v.toUpperCase()}</Text>
            </View>
          ))}
        </View>
        <CutButton title="Go to the app" height={54} onPress={onDone} />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <Top onBack={back} kicker="VERIFICATION" step={step} total={TOTAL} />
      <Progress step={step} total={TOTAL} />
      <View style={{ gap: 6 }}>
        <Text style={s.h1}>{titles[step - 1]}</Text>
        <Text style={s.sub}>
          {step === 1 && 'We sent a 6-digit code to the email you signed up with.'}
          {step === 2 && (corporate ? 'As shown on your Business Registration certificate.' : 'As shown on your ID or passport.')}
          {step === 3 && (corporate ? 'Clear scans or photos, all four corners visible.' : 'A government ID and a proof of address from the last 3 months.')}
          {step === 4 && (corporate ? 'Everyone who owns 25% or more, and every director.' : 'Take a quick selfie so we can match it to your ID.')}
        </Text>
      </View>

      {step === 1 && <><Otp value={code} onChange={setCode} /><Resend /></>}

      {step === 2 && (corporate ? (
        <>
          <Input label="Registered company name" value={f1} onChange={setF1} placeholder="Wing Chan Trading Limited" />
          <Input label="Business Registration no." value={f2} onChange={setF2} placeholder="7314 2856" />
          <Input label="Registered address" value={f3} onChange={setF3} placeholder="Unit, building, street, district" />
        </>
      ) : (
        <>
          <Input label="Legal name" value={f1} onChange={setF1} placeholder="As on your ID" />
          <Input label="Date of birth" value={f2} onChange={setF2} placeholder="DD / MM / YYYY" />
          <Input label="Residential address" value={f3} onChange={setF3} placeholder="Flat, building, street, district" />
        </>
      ))}

      {step === 3 && (
        <View style={{ gap: 12 }}>
          {(corporate
            ? [['Certificate of Incorporation', 'PDF, JPG or PNG · up to 10 MB'], ['Business Registration certificate', 'Current year'], ['Board resolution', 'Authorising this account'], ['Bank statement', 'Company account, last 3 months']]
            : [['HKID or passport', 'Both sides if HKID'], ['Proof of address', 'Utility bill or bank statement']]
          ).map(([k, d]) => <Upload key={k} label={k} sub={d} />)}
        </View>
      )}

      {step === 4 && (corporate ? (
        <View style={s.card}>
          {[['Wing Chan', 'Director · 60%', true], ['Ho Mei Lin', 'Director · 0% · second approver', false], ['Pearl Holdings Ltd', 'Shareholder · 40%', false]].map(([n, r, me], i) => (
            <View key={n as string} style={[s.cardRow, s.row, { gap: 12 }, i > 0 && s.divider]}>
              <View style={s.avatar}><Text style={s.avatarText}>{(n as string).split(' ').map(w => w[0]).join('').slice(0, 2)}</Text></View>
              <View style={{ flex: 1 }}><Text style={s.bodyInk}>{n}</Text><Text style={s.hint}>{r}</Text></View>
              <Text style={[s.small, { color: me ? c.gain : c.signal }]}>{me ? 'YOU · DONE' : 'SEND INVITE'}</Text>
            </View>
          ))}
          <Pressable style={[s.cardRow, s.divider, s.row, { gap: 8 }]}><Ionicons name="add" size={16} color={c.signal} /><Text style={s.link}>Add person</Text></Pressable>
        </View>
      ) : (
        <View style={[s.panel, { alignItems: 'center' }]}>
          <Corners color={c.deep} />
          <View style={s.selfie}><Ionicons name="person-outline" size={64} color={c.ink4} /></View>
          <Text style={[s.hint, { textAlign: 'center' }]}>Good light, no glasses or hat. Look straight at the camera.</Text>
        </View>
      ))}

      <CutButton title={step === TOTAL ? 'Submit for review' : 'Continue'} height={54} onPress={next} />
      <Text style={s.foot}>Your data is encrypted and only used for verification under Hong Kong AML rules.</Text>
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  wrap: { paddingHorizontal: 28, paddingTop: 64, paddingBottom: 48, gap: 24 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  back: { width: 44, height: 44, borderWidth: 1, borderColor: c.ruleStrong, backgroundColor: c.sheet, alignItems: 'center', justifyContent: 'center' },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },
  row: { flexDirection: 'row', alignItems: 'center' },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  seg: { flex: 1, height: 3, backgroundColor: c.ruleStrong },
  badge: { width: 64, height: 64, borderWidth: 1, borderColor: c.deep, backgroundColor: c.hero, alignItems: 'center', justifyContent: 'center' },

  h1: { color: c.ink, fontFamily: f.semi, fontSize: t.h1 },
  sub: { color: c.ink2, fontFamily: f.reg, fontSize: t.body, lineHeight: 21 },
  body: { color: c.ink2, fontFamily: f.reg, fontSize: t.body },
  bodyInk: { color: c.ink, fontFamily: f.med, fontSize: t.body },
  link: { color: c.signal, fontFamily: f.med, fontSize: t.body },
  hint: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, marginTop: 2 },
  small: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 0.8 },
  foot: { color: c.ink4, fontFamily: f.reg, fontSize: t.label, textAlign: 'center', lineHeight: 18 },

  otp: { flexDirection: 'row', gap: 8 },
  otpBox: { flex: 1, height: 58, borderWidth: 1, borderColor: c.ruleStrong, backgroundColor: c.sheet, alignItems: 'center', justifyContent: 'center' },
  otpActive: { borderColor: c.signal, borderWidth: 2 },
  otpFilled: { backgroundColor: c.hero },
  otpText: { color: c.ink, fontFamily: f.mono, fontSize: t.h2 },
  otpInput: { ...StyleSheet.absoluteFill, opacity: 0.01, color: 'transparent' },

  check: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  box: { width: 20, height: 20, borderRadius: 2, borderWidth: 1, borderColor: c.ruleStrong, backgroundColor: c.sheet, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: c.signal, borderColor: c.signal },

  label: { color: c.ink2, fontFamily: f.med, fontSize: t.label },
  input: { height: 52, paddingHorizontal: 16, justifyContent: 'center', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, borderRadius: 2 },
  inputText: { flex: 1, minWidth: 0, color: c.ink, fontFamily: f.reg, fontSize: t.body },

  upload: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderWidth: 1, borderStyle: 'dashed', borderColor: c.ink4, backgroundColor: c.sheet },
  panel: { backgroundColor: c.hero, borderWidth: 1, borderColor: c.rule, padding: 24, gap: 16 },
  selfie: { width: 180, height: 220, borderRadius: 90, borderWidth: 2, borderStyle: 'dashed', borderColor: c.deep, alignItems: 'center', justifyContent: 'center', backgroundColor: c.sheet },
  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, paddingHorizontal: 16 },
  cardRow: { paddingVertical: 14 },
  divider: { borderTopWidth: 1, borderTopColor: c.rule },
  avatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: c.tint, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: c.deep, fontFamily: f.semi, fontSize: 12 },
}));
