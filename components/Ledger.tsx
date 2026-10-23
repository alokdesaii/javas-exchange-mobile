// The web app's "ledger" design language: column rules, corner brackets, cut-corner buttons.
import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Polygon } from 'react-native-svg';
import { c, f } from '../theme';

// Page-long column lines: edges plus two interior rules (3 columns on a phone).
export function GridBg({ color = c.rule }: { color?: string }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {[0, 100 / 3, 200 / 3, 100].map(x => (
        <View key={x} style={{ position: 'absolute', top: 0, bottom: 0, left: `${x}%`, marginLeft: x === 100 ? -1 : 0, width: 1, backgroundColor: color }} />
      ))}
    </View>
  );
}

// Four L-marks inset 9px from each corner.
export function Corners({ color = c.ink3, inset = 9, size = 8, weight = 1 }: { color?: string; inset?: number; size?: number; weight?: number }) {
  const h = { position: 'absolute' as const, width: size, height: weight, backgroundColor: color };
  const v = { position: 'absolute' as const, width: weight, height: size, backgroundColor: color };
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={[h, { top: inset, left: inset }]} /><View style={[v, { top: inset, left: inset }]} />
      <View style={[h, { top: inset, right: inset }]} /><View style={[v, { top: inset, right: inset }]} />
      <View style={[h, { bottom: inset, left: inset }]} /><View style={[v, { bottom: inset, left: inset }]} />
      <View style={[h, { bottom: inset, right: inset }]} /><View style={[v, { bottom: inset, right: inset }]} />
    </View>
  );
}

const CUT = 9;
const BTN = '#d4434b'; // coral one step deeper, as on the web CTA, for white-text contrast

// Primary CTA: top-right and bottom-left corners cut at 45°, sized in real pixels.
export function CutButton({ title, onPress, style, height = 52 }: { title: string; onPress?: () => void; style?: ViewStyle; height?: number }) {
  const [w, setW] = useState(0);
  return (
    <Pressable onPress={onPress} onLayout={e => setW(e.nativeEvent.layout.width)} style={[{ height, justifyContent: 'center', alignItems: 'center' }, style]}>
      {({ pressed }) => (
        <>
          {w > 0 && (
            <Svg style={StyleSheet.absoluteFill} width={w} height={height}>
              <Polygon points={`0,0 ${w - CUT},0 ${w},${CUT} ${w},${height} ${CUT},${height} 0,${height - CUT}`} fill={pressed ? c.signal : BTN} />
            </Svg>
          )}
          <Text style={s.cutText}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  cutText: { color: '#fff', fontFamily: f.mono, fontSize: 12, letterSpacing: 1.2, textTransform: 'uppercase' },
});
