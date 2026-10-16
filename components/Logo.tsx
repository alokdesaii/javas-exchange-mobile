// Javas mark, copied from the web app's login header SVG.
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';

const purple = [['0', '#dd3b8c'], ['.14', '#b6307e'], ['.35', '#81226a'], ['.56', '#56165b'], ['.74', '#380e50'], ['.89', '#250949'], ['1', '#1f0847']];

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <Svg width={size * 224.34 / 303.37} height={size} viewBox="0 0 224.34 303.37">
      <Defs>
        <LinearGradient id="a" x1="0" y1="209.8" x2="224.34" y2="209.8" gradientUnits="userSpaceOnUse">
          {purple.map(([o, c]) => <Stop key={o} offset={o} stopColor={c} />)}
        </LinearGradient>
        <LinearGradient id="b" x1="112.17" y1="68.39" x2="112.17" y2="240.23" gradientUnits="userSpaceOnUse">
          {purple.map(([o, c]) => <Stop key={o} offset={o} stopColor={c} />)}
        </LinearGradient>
        <LinearGradient id="c" x1="140.21" y1="-89.55" x2="140.21" y2="262.61" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ff9700" />
          <Stop offset="1" stopColor="#dd3b8c" />
        </LinearGradient>
      </Defs>
      <Path fill="url(#a)" d="M112.17,201.81v-7.78c0-42.96-50.22-77.79-112.17-77.79v109.34c0,42.96,50.22,77.79,112.17,77.79s112.17-34.83,112.17-77.79-50.22-23.77-112.17-23.77Z" />
      <Path fill="url(#b)" d="M112.17,252.59v7.78c39.15,0,73.6-13.09,93.67,8,11.68-12.28,18.5-26.97,18.5-42.78,0-42.96-50.22-23.77-112.17-23.77v-7.78c0-42.96-50.22-77.79-112.17-77.79v58.56c61.95,0,112.17,34.83,112.17,77.79Z" />
      <Path fill="url(#c)" d="M224.34,0c-61.95,0-112.17,34.83-112.17,77.79v147.79c0,28.79-22.57,53.9-56.08,67.35,16.5,6.62,35.65,10.43,56.08,10.43,61.95,0,112.17-34.83,112.17-77.79V0h0Z" />
    </Svg>
  );
}
