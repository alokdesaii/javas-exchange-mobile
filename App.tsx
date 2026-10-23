import { View, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts, Outfit_300Light, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { useState } from 'react';
import Login from './screens/Login';
import Splash from './screens/Splash';
import Dashboard from './screens/Dashboard';
import Markets from './screens/Markets';
import Wallet from './screens/Wallet';
import Trade from './screens/Trade';
import Account from './screens/Account';
import Transfer from './screens/Transfer';
import Transactions from './screens/Transactions';
import Orders from './screens/Orders';
import P2P from './screens/P2P';
import Referrals from './screens/Referrals';
import Notifications from './screens/Notifications';
import Security from './screens/Security';
import Profile from './screens/Profile';
import Products from './screens/Products';
import AssetDetail from './screens/AssetDetail';
import { NavContext, Sub } from './components/Nav';
import TabBar, { Tab } from './components/TabBar';
import { c, setMode, Mode } from './theme';
import { GridBg } from './components/Ledger';

// Web preview only: hide the browser's focus outline and autofill tint on inputs —
// the field wrapper already draws the box.
if (typeof document !== 'undefined') {
  const css = document.createElement('style');
  css.textContent = `input{outline:none}
input:-webkit-autofill,input:-webkit-autofill:focus{-webkit-box-shadow:0 0 0 1000px #fff inset;-webkit-text-fill-color:${c.ink};transition:background-color 9999s}`;
  document.head.appendChild(css);
  // Design preview: print any crash on the page so a blank phone screen tells us why.
  const show = (msg: string) => {
    const el = document.createElement('pre');
    el.style.cssText = 'position:fixed;inset:auto 0 0 0;z-index:9999;margin:0;padding:12px;max-height:50vh;overflow:auto;background:#c0414c;color:#fff;font:12px/1.4 monospace;white-space:pre-wrap';
    el.textContent = msg;
    document.body.appendChild(el);
  };
  window.addEventListener('error', e => show(`${e.message}\n${e.error?.stack ?? ''}`));
  window.addEventListener('unhandledrejection', e => show(`Unhandled: ${e.reason?.stack ?? e.reason}`));
}

export default function App() {
  const [loaded, fontError] = useFonts({ Outfit_300Light, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold, JetBrainsMono_500Medium });
  const [splash, setSplash] = useState(true);
  const [signedIn, setSignedIn] = useState(false);
  const [tab, setTab] = useState<Tab>('Home');
  const [sub, setSub] = useState<Sub>(null);
  const [sheet, setSheet] = useState(false);
  const [tradeSym, setTradeSym] = useState('USDT');
  const trade = (sym: string) => { setTradeSym(sym); setTab('Trade'); setSub(null); };
  const [mode, setModeState] = useState<Mode>('light');
  const toggleDark = (on: boolean) => { const m = on ? 'dark' : 'light'; setMode(m); setModeState(m); };
  // Font failure (e.g. a slow load timing out in iOS WebKit) falls back to system fonts instead of a blank screen.
  // Web doesn't wait: the splash covers the ~3s it takes fonts to arrive on a phone connection.
  if (!loaded && !fontError && Platform.OS !== 'web') return null;
  // ponytail: state-based screen switching, fine for a design prototype — move to expo-router if it becomes a real app.
  return (
    // Phone-width frame so desktop browsers show the mobile layout; no-op on devices.
    <View style={{ flex: 1, backgroundColor: mode === 'dark' ? '#0b080f' : '#e9e6ee' }}>
      <View key={mode} style={{ flex: 1, width: '100%', maxWidth: 430, alignSelf: 'center', backgroundColor: c.canvas }}>
        <GridBg />
        {!signedIn ? (
          <Login onSignIn={() => setSignedIn(true)} />
        ) : (
          <NavContext.Provider value={{ open: setSub, back: () => setSub(null), sheet: setSheet, trade }}>
            {sub?.screen === 'transfer' ? <Transfer mode={sub.mode} asset={sub.asset} /> : sub?.screen === 'transactions' ? <Transactions /> : sub?.screen === 'orders' ? <Orders /> : sub?.screen === 'p2p' ? <P2P /> : sub?.screen === 'referrals' ? <Referrals /> : sub?.screen === 'notifications' ? <Notifications /> : sub?.screen === 'security' ? <Security section={sub.section} /> : sub?.screen === 'profile' ? <Profile section={sub.section} /> : sub?.screen === 'product' ? <Products product={sub.product} /> : sub?.screen === 'asset' ? <AssetDetail sym={sub.sym} /> : <>
            <View style={{ flex: 1 }}>
              {tab === 'Home' ? <Dashboard /> : tab === 'Markets' ? <Markets /> : tab === 'Trade' ? <Trade key={tradeSym} initial={tradeSym} /> : tab === 'Wallet' ? <Wallet /> : (
                <Account dark={mode === 'dark'} onDark={toggleDark} onSignOut={() => { setSignedIn(false); setTab('Home'); }} />
              )}
            </View>
            {!sheet && <TabBar active={tab} onChange={setTab} />}
            </>}
          </NavContext.Provider>
        )}
        {splash && <Splash onDone={() => setSplash(false)} />}
      </View>
      <StatusBar style={splash || mode === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}
