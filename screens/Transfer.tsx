// Design-only Deposit / Withdraw, one screen with a mode toggle (as the web wallet dialog).
// All details are samples; nothing is moved.
import { useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path, Rect } from 'react-native-svg';
import { Corners, CutButton } from '../components/Ledger';
import { Header } from '../components/Nav';
import { c, f, t, themed } from '../theme';

// sym, name, available, colour, glyph, networks, network fee, decimals
const ASSETS = [
  ['HKD', 'Hong Kong Dollar', 986400, '#5b45a8', 'HK$', [], 0, 2],
  ['USDT', 'Tether', 318420, '#26a17b', '₮', ['Tron (TRC-20)', 'Ethereum (ERC-20)', 'Solana'], 1, 2],
  ['BTC', 'Bitcoin', 1.9236, '#f7931a', '₿', ['Bitcoin'], 0.0002, 4],
  ['ETH', 'Ethereum', 34.6, '#627eea', 'Ξ', ['Ethereum (ERC-20)'], 0.002, 4],
  ['USDC', 'USD Coin', 21400, '#2775ca', '$', ['Ethereum (ERC-20)', 'Solana'], 1, 2],
  ['SOL', 'Solana', 5, '#14b37a', '◎', ['Solana'], 0.01, 4],
] as const;

const ADDR: Record<string, string> = {
  'Tron (TRC-20)': 'TQ4Gm8vJx2Lr7pNw3KaZ9eYd1cBf6HsT5u',
  'Ethereum (ERC-20)': '0x7a3F9c21E84bD06e5A1f2C9b8D3e47A0c6B2d91E',
  Solana: '6GkP3rWq8vZ1yTnXc4M2bJ7dL9sHf5aE3uQoRiNw2Kx',
  Bitcoin: 'bc1q9h6tz0x4k7m2v8wn3e5r8ydl2f0qj6sa7cu4pk',
};
const WHITELIST = [['Fireblocks vault', '0x9c2e…4Ab1'], ['Ledger cold store', 'bc1q…7u4pk']];

// Looks like a QR, scans to nothing — same trick as the web sign-in QR.
export function FakeQR({ seed }: { seed: string }) {
  const cells = useMemo(() => {
    let h = [...seed].reduce((a, ch) => (a * 31 + ch.charCodeAt(0)) >>> 0, 7), d = '';
    const inFinder = (x: number, y: number) => (x < 8 && y < 8) || (x > 20 && y < 8) || (x < 8 && y > 20);
    for (let y = 0; y < 29; y++) for (let x = 0; x < 29; x++) {
      h = (h * 1103515245 + 12345) >>> 0;
      if (!inFinder(x, y) && (h >>> 16) % 100 < 48) d += `M${x} ${y}h1v1h-1z`;
    }
    return d;
  }, [seed]);
  const finder = (x: number, y: number) => `M${x} ${y}h7v7h-7z M${x + 1} ${y + 1}v5h5v-5z M${x + 2} ${y + 2}h3v3h-3z`;
  return (
    <Svg width={168} height={168} viewBox="-2 -2 33 33">
      <Rect x={-2} y={-2} width={33} height={33} fill="#fff" />
      <Path d={cells + finder(0, 0) + finder(22, 0) + finder(0, 22)} fill="#25165b" fillRule="evenodd" />
    </Svg>
  );
}

function Copyable({ label, value }: { label: string; value: string }) {
  const [done, setDone] = useState(false);
  return (
    <Pressable style={s.copyRow} onPress={() => { setDone(true); setTimeout(() => setDone(false), 1200); }}>
      <View style={{ flex: 1 }}>
        <Text style={s.kicker}>{label}</Text>
        <Text style={[s.mono, { marginTop: 4 }]} selectable>{value}</Text>
      </View>
      <Ionicons name={done ? 'checkmark' : 'copy-outline'} size={16} color={done ? c.gain : c.signal} />
    </Pressable>
  );
}

function Chips<T extends string>({ items, value, onChange }: { items: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 8 }}>
      {items.map(k => (
        <Pressable key={k} onPress={() => onChange(k)} style={[s.chip, value === k && s.chipOn]}>
          <Text style={[s.chipText, value === k && { color: '#fff' }]}>{k}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export default function Transfer({ mode: initial, asset: initialAsset = 'HKD' }: { mode: 'deposit' | 'withdraw'; asset?: string }) {
  const [mode, setMode] = useState(initial);
  const [sym, setSym] = useState(initialAsset);
  const a = ASSETS.find(x => x[0] === sym) ?? ASSETS[0];
  const [, name, avail, col, gl, nets, netFee, dp] = a;
  const fiat = sym === 'HKD';
  const [net, setNet] = useState<string>(nets[0] ?? '');
  const [method, setMethod] = useState<'FPS' | 'CHATS'>('FPS');
  const [to, setTo] = useState(0);
  const [amt, setAmt] = useState('');
  const [sent, setSent] = useState(false);

  const pick = (k: string) => { setSym(k); setNet((ASSETS.find(x => x[0] === k)?.[5][0]) ?? ''); setAmt(''); setSent(false); };
  const amount = parseFloat(amt.replace(/,/g, '')) || 0;
  const fee = fiat ? (method === 'FPS' ? 0 : 50) : netFee;
  const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
  const deposit = mode === 'deposit';

  return (
    <ScrollView contentContainerStyle={s.wrap} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <Header kicker="WALLET · FUNDING" title={deposit ? `Deposit ${sym}` : `Withdraw ${sym}`} />

      <View style={s.toggle}>
        {(['deposit', 'withdraw'] as const).map(k => (
          <Pressable key={k} onPress={() => { setMode(k); setSent(false); }} style={[s.toggleBtn, mode === k && s.toggleOn]}>
            <Ionicons name={k === 'deposit' ? 'arrow-down' : 'arrow-up'} size={14} color={mode === k ? '#fff' : c.ink3} />
            <Text style={[s.toggleText, mode === k && { color: '#fff' }]}>{k.toUpperCase()}</Text>
          </Pressable>
        ))}
      </View>

      {/* Asset */}
      <View style={{ gap: 12 }}>
        <Text style={s.kicker}>ASSET</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -24 }} contentContainerStyle={{ paddingHorizontal: 24, gap: 10 }}>
          {ASSETS.map(([k, , , cl, g]) => (
            <Pressable key={k} onPress={() => pick(k)} style={[s.asset, sym === k && s.assetOn]}>
              <View style={[s.coin, { backgroundColor: cl }]}><Text style={[s.coinText, g.length > 1 && { fontSize: 9 }]}>{g}</Text></View>
              <Text style={s.assetText}>{k}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={s.sub}>{name} · Available <Text style={s.monoSm}>{fmt(avail)} {sym}</Text></Text>
      </View>

      {/* Rail / network */}
      <View style={{ gap: 12 }}>
        <Text style={s.kicker}>{fiat ? 'METHOD' : 'NETWORK'}</Text>
        {fiat
          ? <Chips items={['FPS', 'CHATS'] as const} value={method} onChange={setMethod} />
          : <Chips items={nets} value={net} onChange={setNet} />}
        {!fiat && <Text style={[s.sub, { color: c.loss }]}>Only send {sym} on {net}. Other networks lose the funds.</Text>}
      </View>

      {deposit ? (
        fiat ? (
          <View style={s.panel}>
            <Corners color={c.deep} />
            <Text style={s.kicker}>{method === 'FPS' ? 'PAY BY FPS' : 'BANK TRANSFER (CHATS)'}</Text>
            {method === 'FPS'
              ? <Copyable label="FPS ID" value="1749 2286" />
              : <><Copyable label="BANK" value="HSBC Hong Kong · 004" /><Copyable label="ACCOUNT NO." value="848-219330-838" /></>}
            <Copyable label="ACCOUNT NAME" value="Javas Limited — Client Account" />
            <Copyable label="REFERENCE (REQUIRED)" value="JVX-9642943" />
            <View style={s.note}>
              <Ionicons name="information-circle-outline" size={16} color={c.ink2} />
              <Text style={[s.sub, { flex: 1 }]}>Send from an account in your company's own name and include the reference, or the deposit can't be matched and will be returned.</Text>
            </View>
            <Text style={[s.small, { textAlign: 'center' }]}>SAMPLE DETAILS · NOT REAL</Text>
          </View>
        ) : (
          <View style={[s.panel, { alignItems: 'center' }]}>
            <Corners color={c.deep} />
            <View style={s.qr}><FakeQR seed={sym + net} /></View>
            <View style={{ alignSelf: 'stretch' }}><Copyable label={`${sym} ADDRESS · ${net.toUpperCase()}`} value={ADDR[net] ?? ''} /></View>
            <View style={[s.kv, { alignSelf: 'stretch' }]}>
              <Text style={s.sub}>Minimum deposit</Text><Text style={s.monoSm}>{fiat ? '' : `${fmt(netFee * 10)} ${sym}`}</Text>
            </View>
            <View style={[s.kv, { alignSelf: 'stretch' }]}>
              <Text style={s.sub}>Credited after</Text><Text style={s.monoSm}>{net === 'Bitcoin' ? '2 confirmations' : '12 confirmations'}</Text>
            </View>
          </View>
        )
      ) : (
        <View style={{ gap: 20 }}>
          <View style={{ gap: 12 }}>
            <Text style={s.kicker}>TO · WHITELISTED ONLY</Text>
            <View style={s.card}>
              {(fiat ? [['HSBC ••4417', 'Wing Chan Trading Limited']] : WHITELIST).map(([k, v], i) => (
                <Pressable key={k} onPress={() => setTo(i)} style={[s.dest, i > 0 && s.divider]}>
                  <Ionicons name={to === i ? 'radio-button-on' : 'radio-button-off'} size={18} color={to === i ? c.signal : c.ink4} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.body}>{k}</Text>
                    <Text style={[s.sub, { fontFamily: f.mono }]}>{v}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={{ gap: 12 }}>
            <Text style={s.kicker}>AMOUNT</Text>
            <View style={s.field}>
              <TextInput value={amt} onChangeText={setAmt} keyboardType="decimal-pad" placeholder="0.00" placeholderTextColor={c.ink4} style={s.fieldInput} />
              <Text style={s.unit}>{sym}</Text>
              <Pressable onPress={() => setAmt(fmt(avail).replace(/,/g, ''))} style={s.max}><Text style={s.maxText}>MAX</Text></Pressable>
            </View>
            <View style={s.summary}>
              <View style={s.kv}><Text style={s.sub}>Available</Text><Text style={s.monoSm}>{fmt(avail)} {sym}</Text></View>
              <View style={s.kv}><Text style={s.sub}>{fiat ? `${method} fee` : 'Network fee'}</Text><Text style={s.monoSm}>{fmt(fee)} {sym}</Text></View>
              <View style={s.kv}><Text style={[s.body, { fontFamily: f.semi }]}>You receive</Text><Text style={[s.mono, { color: c.gain }]}>{fmt(Math.max(0, amount - fee))} {sym}</Text></View>
            </View>
            {amount > avail && <Text style={[s.sub, { color: c.loss }]}>More than your available balance.</Text>}
          </View>

          <View style={s.note}>
            <Ionicons name="shield-checkmark-outline" size={16} color={c.ink2} />
            <Text style={[s.sub, { flex: 1 }]}>Withdrawals need your 2FA code and your second approver (Ho Mei Lin) before they're sent.</Text>
          </View>
        </View>
      )}

      {sent
        ? <View style={s.done}><Ionicons name="checkmark-circle" size={18} color={c.gain} /><Text style={[s.body, { color: c.gain }]}>{deposit ? "Noted — we'll credit it once it lands." : 'Sent for approval.'}</Text></View>
        : <CutButton title={deposit ? (fiat ? "I've sent it" : 'Share address') : 'Review withdrawal'} onPress={() => setSent(true)} />}
    </ScrollView>
  );
}

const s = themed(() => StyleSheet.create({
  wrap: { paddingHorizontal: 24, paddingTop: 64, paddingBottom: 48, gap: 28 },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },

  toggle: { flexDirection: 'row', backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, padding: 4 },
  toggleBtn: { flex: 1, height: 42, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 2 },
  toggleOn: { backgroundColor: c.deep },
  toggleText: { color: c.ink2, fontFamily: f.mono, fontSize: 12, letterSpacing: 1.2 },

  asset: { alignItems: 'center', gap: 6, width: 64, paddingVertical: 10, borderWidth: 1, borderColor: c.rule, backgroundColor: c.sheet },
  assetOn: { borderColor: c.signal, backgroundColor: c.tint },
  coin: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  coinText: { color: '#fff', fontFamily: f.semi, fontSize: t.body },
  assetText: { color: c.ink, fontFamily: f.mono, fontSize: 11 },

  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: 2, borderWidth: 1, borderColor: c.rule, backgroundColor: c.sheet },
  chipOn: { backgroundColor: c.deep, borderColor: c.deep },
  chipText: { color: c.ink2, fontFamily: f.med, fontSize: t.label },

  panel: { backgroundColor: c.hero, borderWidth: 1, borderColor: c.rule, padding: 24, gap: 14 },
  qr: { padding: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: c.rule, marginBottom: 6 },
  copyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule },
  note: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },

  card: { backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, paddingHorizontal: 16 },
  dest: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  divider: { borderTopWidth: 1, borderTopColor: c.rule },

  field: { flexDirection: 'row', alignItems: 'center', height: 56, paddingLeft: 16, backgroundColor: c.sheet, borderWidth: 1, borderColor: c.rule, borderRadius: 2 },
  fieldInput: { flex: 1, minWidth: 0, height: '100%', color: c.ink, fontFamily: f.mono, fontSize: t.h3 },
  unit: { color: c.ink3, fontFamily: f.mono, fontSize: 12, marginHorizontal: 10 },
  max: { height: '100%', width: 60, alignItems: 'center', justifyContent: 'center', borderLeftWidth: 1, borderLeftColor: c.rule },
  maxText: { color: c.signal, fontFamily: f.mono, fontSize: 11, letterSpacing: 1 },
  summary: { gap: 10, paddingVertical: 14, borderTopWidth: 1, borderBottomWidth: 1, borderColor: c.ruleStrong },
  kv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  done: { flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', height: 52, borderWidth: 1, borderColor: c.gain },

  body: { color: c.ink, fontFamily: f.med, fontSize: t.body },
  sub: { color: c.ink3, fontFamily: f.reg, fontSize: t.label, lineHeight: 18 },
  small: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 0.6 },
  mono: { color: c.ink, fontFamily: f.mono, fontSize: t.body },
  monoSm: { color: c.ink, fontFamily: f.mono, fontSize: t.label },
}));
