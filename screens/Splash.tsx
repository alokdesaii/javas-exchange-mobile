// Animated intro: glow pulses in, logo springs up, wordmark + tagline rise, then fade out.
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { GridBg } from '../components/Ledger';
import Logo from '../components/Logo';
import { c, f, t } from '../theme';

// Splash stays on the dark brand palette; the rest of the app is light.
const dark = { canvas: '#141019', ink: '#efedf1', ink3: '#817a87' };

export default function Splash({ onDone }: { onDone: () => void }) {
  const glow = useRef(new Animated.Value(0)).current;
  const logo = useRef(new Animated.Value(0)).current;
  const word = useRef(new Animated.Value(0)).current;
  const bar = useRef(new Animated.Value(0)).current;
  const out = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const ease = Easing.bezier(0.23, 1, 0.32, 1); // brand --ease
    Animated.sequence([
      Animated.parallel([
        Animated.timing(glow, { toValue: 1, duration: 900, easing: ease, useNativeDriver: true }),
        Animated.spring(logo, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
      ]),
      Animated.timing(word, { toValue: 1, duration: 600, easing: ease, useNativeDriver: true }),
      Animated.timing(bar, { toValue: 1, duration: 900, easing: ease, useNativeDriver: false }),
      Animated.timing(out, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start(onDone);
  }, []);

  const rise = (v: Animated.Value, d = 16) => ({
    opacity: v,
    transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [d, 0] }) }],
  });

  return (
    <Animated.View style={[s.wrap, { opacity: out }]}>
      <GridBg color="rgba(255,255,255,.07)" />
      <Animated.View style={[s.glow, { opacity: glow, transform: [{ scale: glow.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) }] }]}>
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="g" cx="50%" cy="50%" r="50%">
              <Stop offset="0" stopColor={c.signal} stopOpacity={0.45} />
              <Stop offset="0.45" stopColor="#81226a" stopOpacity={0.3} />
              <Stop offset="1" stopColor="#25165b" stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Circle cx="50%" cy="50%" r="50%" fill="url(#g)" />
        </Svg>
      </Animated.View>

      <Animated.View style={{ opacity: logo, transform: [{ scale: logo.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }, { rotate: logo.interpolate({ inputRange: [0, 1], outputRange: ['-12deg', '0deg'] }) }] }}>
        <Logo size={96} />
      </Animated.View>

      <Animated.View style={[{ alignItems: 'center', marginTop: 28 }, rise(word)]}>
        <Text style={s.word}>JAVAS <Text style={{ fontFamily: f.light }}>EXCHANGE</Text></Text>
        <Text style={s.tag}>The stablecoin desk for Hong Kong.</Text>
      </Animated.View>

      <View style={s.track}>
        <Animated.View style={[s.fill, { width: bar.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }]} />
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFill, backgroundColor: dark.canvas, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 520, height: 520 },
  word: { color: dark.ink, fontFamily: f.semi, fontSize: t.h2, letterSpacing: 4 },
  tag: { color: dark.ink3, fontFamily: f.reg, fontSize: t.body, marginTop: 8 },
  track: { position: 'absolute', bottom: 80, width: 120, height: 2, backgroundColor: 'rgba(255,255,255,.09)', overflow: 'hidden' },
  fill: { height: 2, backgroundColor: c.signal },
});
