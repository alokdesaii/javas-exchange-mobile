// Minimal push-screen navigation: one screen on top of the tabs, with a back button.
// ponytail: single level, no history stack — swap for expo-router if screens start nesting.
import { createContext, useContext } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { c, f, t, themed } from '../theme';
import type { Section } from '../screens/Security';
import type { ProfileSection } from '../screens/Profile';

export type Sub = { screen: 'transfer'; mode: 'deposit' | 'withdraw'; asset?: string } | { screen: 'transactions' } | { screen: 'orders' } | { screen: 'p2p' } | { screen: 'referrals' } | { screen: 'notifications' } | { screen: 'security'; section: Section } | { screen: 'profile'; section: ProfileSection } | { screen: 'product'; product: 'Earn' | 'Futures' } | { screen: 'asset'; sym: string } | null;

// sheet(true) hides the tab bar while a bottom sheet is up, as native sheets cover it.
// trade(sym) jumps to the Trade tab on that pair.
export const NavContext = createContext<{ open: (s: Sub) => void; back: () => void; sheet: (on: boolean) => void; trade: (sym: string) => void }>({ open: () => {}, back: () => {}, sheet: () => {}, trade: () => {} });
export const useNav = () => useContext(NavContext);

export function Header({ kicker, title }: { kicker: string; title: string }) {
  const { back } = useNav();
  return (
    <View style={s.head}>
      <Pressable onPress={back} style={s.back} accessibilityLabel="Back" hitSlop={8}>
        <Ionicons name="arrow-back" size={20} color={c.ink} />
      </Pressable>
      <View>
        <Text style={s.kicker}>{kicker}</Text>
        <Text style={s.title}>{title}</Text>
      </View>
    </View>
  );
}

const s = themed(() => StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  back: { width: 44, height: 44, borderWidth: 1, borderColor: c.ruleStrong, backgroundColor: c.sheet, alignItems: 'center', justifyContent: 'center' },
  kicker: { color: c.ink3, fontFamily: f.mono, fontSize: 10, letterSpacing: 1.2 },
  title: { color: c.ink, fontFamily: f.semi, fontSize: t.h2, marginTop: 2 },
}));
