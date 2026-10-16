import { View, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Outfit_300Light, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { useState } from 'react';
import Login from './screens/Login';
import Splash from './screens/Splash';
import Dashboard from './screens/Dashboard';
import Markets from './screens/Markets';
import TabBar, { Tab } from './components/TabBar';
import { c, f } from './theme';
import { GridBg } from './components/Ledger';

// Web preview only: hide the browser's focus outline and autofill tint on inputs —
// the field wrapper already draws the box.
if (typeof document !== 'undefined') {
  const css = document.createElement('style');
  css.textContent = `input{outline:none}
input:-webkit-autofill,input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px #fff inset;-webkit-text-fill-color:${c.ink};transition:background-color 9999s}`;
  document.head.appendChild(css);
}

export default function App() {
  const [loaded] = useFonts({ Outfit_300Light, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, JetBrainsMono_500Medium });
  const [splash, setSplash] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [tab, setTab] = useState<Tab>('Home');
  if (!loaded) return null;
  // ponytail: state-based screen switching, fine for a design prototype — move to expo-router if it becomes a real app.
  return (
    // Phone-width frame so desktop browsers show the mobile layout; no-op on devices.
    <View style={{ flex: 1, backgroundColor: '#e9e6ee' }}>
      <View style={{ flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center', backgroundColor: c.canvas }}>
        <GridBg />
        {!signedIn ? (
          <Login onSignIn={() => setSignedIn(true)} />
        ) : (
          <>
            <View style={{ flex: 1 }}>
              {tab === 'Home' ? <Dashboard /> : tab === 'Markets' ? <Markets /> : (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: c.ink3, fontFamily: f.med }}>{tab} — coming next</Text>
                </View>
              )}
            </View>
            <TabBar active={tab} onChange={setTab} />
          </>
        )}
        {splash && <Splash onDone={() => setSplash(false)} />}
      </View>
      <StatusBar style={splash ? "light" : "dark"} />
    </View>
  );
}
