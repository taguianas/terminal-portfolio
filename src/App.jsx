import { useState, useCallback, useMemo, useEffect } from 'react';
import { INITIAL_FS, updateAt } from './data/fs';
import { Grub, BootLogs, Login, PoweredOff, KernelPanic, Matrix } from './os/Boot';
import Desktop from './os/Desktop';
import MobileShell from './os/MobileShell';

const KEY = 'kali-portfolio-booted';
const store = {
  get: () => { try { return sessionStorage.getItem(KEY) === '1'; } catch { return false; } },
  set: (v) => { try { v ? sessionStorage.setItem(KEY, '1') : sessionStorage.removeItem(KEY); } catch { /* storage blocked */ } },
};

const isSmall = () => window.innerWidth < 768;

// Boot flow: grub -> boot -> login -> desktop
// After the first visit in a tab, the desktop opens straight away.
export default function App() {
  const [stage, setStage] = useState(() => (store.get() ? 'desktop' : 'grub'));
  const [mobile, setMobile] = useState(isSmall);
  const [fs, setFs] = useState(INITIAL_FS);
  const [crashed, setCrashed] = useState(false);
  const [matrix, setMatrix] = useState(false);
  const [session, setSession] = useState(0);

  useEffect(() => {
    const onResize = () => setMobile(isSmall());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const updateFs = useCallback((path, fn) => setFs((f) => updateAt(f, path, fn)), []);

  const power = useCallback((action) => {
    if (action === 'lock') setStage('lock');
    else if (action === 'logout') { setSession((s) => s + 1); setStage('login'); }
    else if (action === 'reboot') { store.set(false); setSession((s) => s + 1); setStage('grub'); }
    else if (action === 'shutdown') { store.set(false); setSession((s) => s + 1); setStage('off'); }
  }, []);

  const crash = useCallback(() => {
    setCrashed(true);
    setTimeout(() => {
      store.set(false);
      setFs(INITIAL_FS);
      setSession((s) => s + 1);
      setCrashed(false);
      setStage('grub');
    }, 5000);
  }, []);

  const exitMatrix = useCallback(() => setMatrix(false), []);
  const base = useMemo(() => ({ fs, updateFs, crash, matrix: () => setMatrix(true), power }), [fs, updateFs, crash, power]);

  const login = () => { store.set(true); setStage('desktop'); };

  let screen;
  if (stage === 'off') screen = <PoweredOff onPowerOn={() => setStage('grub')} />;
  else if (stage === 'grub') screen = mobile ? <BootLogs fast onDone={() => setStage('login')} /> : <Grub onDone={() => setStage('boot')} />;
  else if (stage === 'boot') screen = <BootLogs onDone={() => setStage('login')} />;
  else if (stage === 'login' && !mobile) screen = <Login onLogin={login} />;
  else if (mobile) screen = <MobileShell key={session} base={base} />;
  else {
    screen = (
      <>
        <Desktop key={session} base={base} />
        {stage === 'lock' && <div className="fixed inset-0 z-[150000]"><Login locked onLogin={() => setStage('desktop')} /></div>}
      </>
    );
  }

  // on phones, skip the login screen once logs are done
  useEffect(() => {
    if (mobile && stage === 'login') login();
  });

  return (
    <>
      {screen}
      {matrix && <Matrix onExit={exitMatrix} />}
      {crashed && <KernelPanic />}
    </>
  );
}
