// Floating ledger bar in Javas purple: a sharp box detached from the edges.
// Active tab borrows the web nav's hover mark — coral corner brackets.
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Corners } from './Ledger';
import { c, f, themed } from '../theme';

export const tabs = [
  ['Home', 'home'],
  ['Markets', 'stats-chart'],
  ['Trade', 'swap-horizontal'],
  ['Wallet', 'wallet'],
  ['Account', 'person'],
] as const;
export type Tab = (typeof tabs)[number][0];

export default function TabBar({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) {
  return (
    <View style={s.bar}>
      {tabs.map(([name, icon]) => {
        const on = name === active;
        return (
          <Pressable key={name} onPress={() => onChange(name)} style={[s.item, on && s.itemOn]} accessibilityLabel={name}>
            {on && <Corners color={c.signal} inset={0} weight={1.5} />}
            <Ionicons name={on ? icon : (`${icon}-outline` as any)} size={20} color={on ? '#fff' : 'rgba(255,255,255,.5)'} />
            <Text style={[s.text, on && { color: '#fff' }]}>{name.toUpperCase()}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = themed(() => StyleSheet.create({
  bar: {
    position: 'absolute', left: 20, right: 20, bottom: 28,
    flexDirection: 'row', backgroundColor: '#25165b', padding: 6,
  },
  item: { flex: 1, height: 54, alignItems: 'center', justifyContent: 'center', gap: 5 },
  itemOn: { backgroundColor: 'rgba(255,255,255,.08)' },
  text: { color: 'rgba(255,255,255,.5)', fontFamily: f.mono, fontSize: 9, letterSpacing: 0.8 },
}));
