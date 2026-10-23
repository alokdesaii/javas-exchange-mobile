// Design-only: nothing is submitted, buttons are inert.
import { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { c, f, t, themed } from '../theme';
import { CutButton } from '../components/Ledger';
import Logo from '../components/Logo';
import { TwoFactorStep, ForgotFlow, KycFlow } from './AuthSteps';

function Field({ label, secure, hint, placeholder, prefix }: { label: string; secure?: boolean; hint?: string; placeholder?: string; prefix?: string }) {
  const [hidden, setHidden] = useState(true);
  return (
    <View style={s.field}>
      <Text style={s.label}>{label} <Text style={{ color: c.signal }}>*</Text></Text>
      <View style={s.input}>
        {prefix && <Text style={s.prefix}>{prefix}</Text>}
        <TextInput style={s.inputText} placeholder={placeholder} placeholderTextColor={c.ink4} secureTextEntry={secure && hidden} />
        {secure && (
          <Pressable onPress={() => setHidden(!hidden)} hitSlop={10}>
            <Ionicons name={hidden ? 'eye-outline' : 'eye-off-outline'} size={18} color={c.ink3} />
          </Pressable>
        )}
      </View>
      {hint && <Text style={s.hint}>{hint}</Text>}
    </View>
  );
}

function Primary({ title, onPress }: { title: string; onPress?: () => void }) {
  return <CutButton title={title} onPress={onPress} height={54} />;
}

export default function Login({ onSignIn }: { onSignIn: () => void }) {
  const [tab, setTab] = useState<'in' | 'up'>('in');
  const [type, setType] = useState<'Individual' | 'Corporate'>('Individual');
  const [remember, setRemember] = useState(false);
  const [step, setStep] = useState<'form' | '2fa' | 'forgot' | 'kyc'>('form');

  if (step === '2fa') return <TwoFactorStep onDone={onSignIn} onBack={() => setStep('form')} />;
  if (step === 'forgot') return <ForgotFlow onBack={() => setStep('form')} />;
  if (step === 'kyc') return <KycFlow corporate={type === 'Corporate'} onDone={onSignIn} onBack={() => setStep('form')} />;

  return (
    <ScrollView contentContainerStyle={s.wrap} keyboardShouldPersistTaps="handled">
      <View style={s.top}>
        <View style={s.lang}><Text style={s.langText}>EN</Text><Ionicons name="chevron-down" size={12} color={c.ink2} /></View>
      </View>

      <View style={s.hero}>
        <Logo size={88} />
        <Text style={s.brandText}>JAVAS <Text style={{ fontFamily: f.light }}>EXCHANGE</Text></Text>
        <Text style={s.tagline}>The stablecoin desk for Hong Kong.</Text>
      </View>

      <View style={s.tabs}>
        {(['in', 'up'] as const).map(k => (
          <Pressable key={k} onPress={() => setTab(k)} style={[s.tab, tab === k && s.tabOn]}>
            <Text style={[s.tabText, tab === k && { color: '#fff' }]}>{k === 'in' ? 'Sign in' : 'Create account'}</Text>
          </Pressable>
        ))}
      </View>

      {tab === 'in' ? (
        <>
          <Field label="Email address" placeholder="you@company.com.hk" />
          <Field label="Password" secure />
          <View style={s.between}>
            <Pressable style={s.check} onPress={() => setRemember(!remember)}>
              <View style={[s.box, remember && s.boxOn]}>{remember && <Ionicons name="checkmark" size={12} color="#fff" />}</View>
              <Text style={s.body}>Remember me</Text>
            </Pressable>
            <Pressable onPress={() => setStep('forgot')} hitSlop={8}><Text style={s.link}>Forgot password?</Text></Pressable>
          </View>
          <Primary title="Sign in" onPress={() => setStep('2fa')} />
          <View style={s.or}><View style={s.rule} /><Text style={s.meta}>or continue with</Text><View style={s.rule} /></View>
          <View style={s.row}>
            <Pressable style={s.ghost}><Ionicons name="logo-google" size={16} color={c.ink} /><Text style={s.ghostText}>Google</Text></Pressable>
            <Pressable style={s.ghost}><Ionicons name="key-outline" size={16} color={c.ink} /><Text style={s.ghostText}>Passkey</Text></Pressable>
          </View>
          <Text style={s.foot}>Two-factor authentication is required on every account.{'\n'}Javas Limited is registered in Hong Kong. <Text style={{ color: c.ink }}>Need help signing in?</Text></Text>
        </>
      ) : (
        <>
          <Text style={s.h1}>Open an account</Text>
          <Text style={s.sub}>Takes about two minutes. Verification comes after.</Text>
          <Text style={s.label}>Account type <Text style={{ color: c.signal }}>*</Text></Text>
          <View style={[s.tabs, { marginBottom: 6 }]}>
            {(['Individual', 'Corporate'] as const).map(k => (
              <Pressable key={k} onPress={() => setType(k)} style={[s.tab, type === k && s.segOn]}>
                <Text style={[s.tabText, type === k && { color: '#fff' }]}>{k}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={[s.hint, { marginBottom: 16 }]}>Corporate accounts unlock OTC quotes and collections.</Text>
          <Field label="Full name" />
          <Field label="Username" />
          <Field label="Email address" placeholder="you@company.com.hk" />
          <Field label="Mobile number" prefix="🇭🇰 +852  ▾" />
          <Field label="Password" secure hint="At least 12 characters. A passphrase works well." />
          <Field label="Confirm password" secure />
          <View style={s.field}>
            <Text style={s.label}>Referral code (optional)</Text>
            <View style={s.input}><TextInput style={s.inputText} /></View>
          </View>
          <Pressable style={[s.check, { alignItems: 'flex-start', marginBottom: 20 }]} onPress={() => setRemember(!remember)}>
            <View style={[s.box, remember && s.boxOn]}>{remember && <Ionicons name="checkmark" size={12} color="#fff" />}</View>
            <Text style={[s.body, { flex: 1 }]}>I agree to the <Text style={s.link}>Terms</Text>, <Text style={s.link}>Risk Disclosure</Text> and <Text style={s.link}>Privacy Policy</Text> of Javas Limited.</Text>
          </Pressable>
          <Primary title="Create account" onPress={() => setStep('kyc')} />
        </>
      )}

      <Text style={[s.foot, { marginTop: 32, color: c.ink4 }]}>Javas Limited — Hong Kong. Digital asset trading carries risk, including loss of capital. Services are offered to eligible clients only.</Text>
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  wrap: { paddingHorizontal: 28, paddingTop: 64, paddingBottom: 48 },
  top: { flexDirection: 'row', justifyContent: 'flex-end' },
  hero: { alignItems: 'center', marginTop: 28, marginBottom: 48 },
  tagline: { color: c.ink3, fontFamily: f.reg, fontSize: t.body, marginTop: 8 },
  brandText: { color: c.ink, fontFamily: f.semi, fontSize: t.h2, letterSpacing: 4, marginTop: 24 },
  lang: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, paddingHorizontal: 12, paddingVertical: 7 },
  langText: { color: c.ink2, fontFamily: f.med, fontSize: t.label },


  tabs: { flexDirection: 'row', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, padding: 4, marginBottom: 28 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 2 },
  tabOn: { backgroundColor: c.deep },
  segOn: { backgroundColor: c.deep },
  tabText: { color: c.ink2, fontFamily: f.med, fontSize: t.body },

  h1: { color: c.ink, fontFamily: f.semi, fontSize: t.h1 },
  sub: { color: c.ink2, fontFamily: f.reg, fontSize: t.body, marginTop: 4, marginBottom: 24 },
  field: { marginBottom: 20 },
  label: { color: c.ink2, fontFamily: f.med, fontSize: t.label, marginBottom: 6 },
  input: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, borderRadius: 2, paddingHorizontal: 16, height: 52 },
  inputText: { flex: 1, color: c.ink, fontFamily: f.reg, fontSize: t.body, height: '100%' },
  prefix: { color: c.ink, fontFamily: f.reg, fontSize: t.body, marginRight: 10, paddingRight: 10, borderRightWidth: 1, borderRightColor: c.rule },
  hint: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, marginTop: 6 },

  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  check: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  box: { width: 20, height: 20, borderRadius: 2, borderWidth: 1, borderColor: c.ruleStrong, backgroundColor: c.sheet, alignItems: 'center', justifyContent: 'center' },
  boxOn: { backgroundColor: c.signal, borderColor: c.signal },
  body: { color: c.ink2, fontFamily: f.reg, fontSize: t.body },
  link: { color: c.signal, fontFamily: f.med, fontSize: t.body },

  or: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 28 },
  rule: { flex: 1, height: 1, backgroundColor: c.rule },
  row: { flexDirection: 'row', gap: 12 },
  ghost: { flex: 1, flexDirection: 'row', gap: 8, height: 52, alignItems: 'center', justifyContent: 'center', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.ink4, borderRadius: 2 },
  ghostText: { color: c.ink, fontFamily: f.med, fontSize: t.body },
  meta: { color: c.ink3, fontFamily: f.med, fontSize: t.meta, letterSpacing: 0.8 },
  foot: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, textAlign: 'center', marginTop: 24, lineHeight: 18 },
}));
