import { useEffect, useRef, useState } from 'react';
import { Cpu, HardDrive, WifiOff } from 'lucide-react';
import '@xterm/xterm/css/xterm.css';
import { CONFIG } from '../config';
import { useOS } from '../os/OSContext';
import { getFirmware } from '../os/firmware';

// A real Kali Linux (i386) booted in the browser with CheerpX.
// The disk image is streamed from GitHub Pages in 128 KB chunks,
// changes are kept in the visitor's IndexedDB.

const THEME = {
  background: '#14161d',
  foreground: '#e6e6e6',
  cursor: '#e6e6e6',
  selectionBackground: '#3b8eea55',
  black: '#1b1e26', red: '#ff6b6b', green: '#4fd16b', yellow: '#e5c07b',
  blue: '#3b8eea', magenta: '#c678dd', cyan: '#56b6c2', white: '#e6e6e6',
  brightBlack: '#5c6370', brightRed: '#ff8080', brightGreen: '#6be585', brightYellow: '#f0d08a',
  brightBlue: '#5aa2ff', brightMagenta: '#d68fe8', brightCyan: '#6fd0dc', brightWhite: '#ffffff',
};

const ENV = [
  'HOME=/home/kali', 'USER=kali', 'LOGNAME=kali', 'SHELL=/bin/zsh',
  'TERM=xterm-256color', 'LANG=C.UTF-8', 'EDITOR=nano',
  'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
];

const B = '\x1b[1;34m[*]\x1b[0m';
const OK = '\x1b[1;32m[+]\x1b[0m';
const ERR = '\x1b[1;31m[-]\x1b[0m';

export default function KaliVM({ active, setTitle }) {
  const os = useOS();
  const notifyRef = useRef(null);
  notifyRef.current = os?.notify;
  const boxRef = useRef(null);
  const termRef = useRef(null);
  const [status, setStatus] = useState('starting');
  const [disk, setDisk] = useState(false);

  useEffect(() => { setTitle?.('kali@kali: ~  (real Kali VM)'); }, [setTitle]);

  useEffect(() => {
    if (active) termRef.current?.focus();
  }, [active]);

  useEffect(() => {
    let disposed = false;
    let cx = null;
    let term = null;
    let ro = null;
    let diskTimer = null;

    const boot = async () => {
      const [{ Terminal }, { FitAddon }] = await Promise.all([import('@xterm/xterm'), import('@xterm/addon-fit')]);
      if (disposed) return;
      term = new Terminal({
        cursorBlink: true,
        convertEol: true,
        fontFamily: '"Fira Code", "DejaVu Sans Mono", ui-monospace, monospace',
        fontSize: 14,
        theme: THEME,
        scrollback: 3000,
      });
      const fit = new FitAddon();
      term.loadAddon(fit);
      term.open(boxRef.current);
      termRef.current = term;
      fit.fit();
      ro = new ResizeObserver(() => { try { fit.fit(); } catch { /* hidden */ } });
      ro.observe(boxRef.current);
      const say = (s = '') => term.write(s + '\r\n');

      say(`${B} Starting a real Kali Linux (i386) inside your browser ...`);

      if (!getFirmware().vtx) {
        say(`${ERR} kvm: VT-x is disabled in the firmware (BIOS/UEFI).`);
        say('    The virtual machine cannot start without hardware virtualization.');
        say('    Restart, open GRUB > UEFI Firmware Settings > Advanced and enable');
        say('    "Intel Virtualization Technology", then Save Changes.');
        setStatus('error');
        return;
      }

      if (!window.crossOriginIsolated) {
        say(`${ERR} This page is not cross-origin isolated, so the VM cannot start.`);
        say('    The server must send these headers:');
        say('      Cross-Origin-Opener-Policy: same-origin');
        say('      Cross-Origin-Embedder-Policy: require-corp');
        say('    (already set in vercel.json and vite.config.js)');
        setStatus('error');
        return;
      }

      const base = CONFIG.kaliImage.replace(/[^/]+$/, '');
      let version;
      try {
        const r = await fetch(base + 'version.txt', { cache: 'no-store' });
        if (!r.ok) throw new Error(r.status);
        version = (await r.text()).trim().split(/\s+/)[0];
      } catch {
        say(`${ERR} The Kali disk image was not found at:`);
        say(`    ${CONFIG.kaliImage}`);
        say('    Run the "Build Kali VM image" workflow on GitHub to publish it.');
        setStatus('error');
        return;
      }
      say(`${B} Disk image ${version}, streamed on demand and cached by your browser.`);
      say(`${B} First boot can take 20-60 s. Later visits are much faster.`);

      const CheerpX = await import('@leaningtech/cheerpx');
      if (disposed) return;
      say(`${B} CheerpX engine loaded (x86 -> WebAssembly JIT).`);

      const blockDevice = await CheerpX.GitHubDevice.create(CONFIG.kaliImage);
      const cache = await CheerpX.IDBDevice.create(`kali-vm-${version}`);
      const overlay = await CheerpX.OverlayDevice.create(blockDevice, cache);
      const data = await CheerpX.DataDevice.create();
      cx = await CheerpX.Linux.create({
        mounts: [
          { type: 'ext2', dev: overlay, path: '/' },
          { type: 'dir', dev: data, path: '/data' },
          { type: 'devs', path: '/dev' },
          { type: 'devpts', path: '/dev/pts' },
          { type: 'proc', path: '/proc' },
          { type: 'sys', path: '/sys' },
        ],
      });
      if (disposed) { cx.delete(); return; }

      cx.registerCallback('diskActivity', (state) => {
        setDisk(state === 'ready' ? false : true);
        clearTimeout(diskTimer);
        diskTimer = setTimeout(() => setDisk(false), 400);
      });

      say(`${OK} Kernel ready. Logging in as kali ...`);
      say();
      setStatus('running');
      notifyRef.current?.('Kali VM is running', 'A real Kali Linux (i386) booted inside your browser.');
      fit.fit();
      const send = cx.setCustomConsole((buf, vt) => { if (vt === 1) term.write(new Uint8Array(buf)); }, term.cols, term.rows);
      term.onData((str) => { for (let i = 0; i < str.length; i++) send(str.charCodeAt(i)); });
      term.focus();

      // like a real terminal: if the shell exits, start a new one
      while (!disposed) {
        await cx.run('/bin/zsh', ['-l'], { env: ENV, cwd: '/home/kali', uid: 1000, gid: 1000 });
        if (!disposed) say(`\r\n${B} Shell exited, starting a new one ...`);
      }
    };

    // the timeout lets React StrictMode's double mount cancel the first boot
    const t = setTimeout(() => {
      boot().catch((e) => {
        if (disposed) return;
        term?.write(`\r\n${ERR} The VM failed to start: ${e?.message || e}\r\n`);
        term?.write('    Try a recent Chrome, Edge or Firefox on a computer.\r\n');
        setStatus('error');
      });
    }, 0);

    return () => {
      disposed = true;
      clearTimeout(t);
      clearTimeout(diskTimer);
      ro?.disconnect();
      try { cx?.delete(); } catch { /* already gone */ }
      term?.dispose();
      termRef.current = null;
    };
  }, []);

  return (
    <div className="h-full flex flex-col bg-[#14161d]">
      <div className="flex-1 min-h-0 px-2 pt-1.5" onMouseUp={() => termRef.current?.focus()}>
        <div ref={boxRef} className="h-full w-full" />
      </div>
      <div className="h-6 shrink-0 flex items-center gap-4 px-3 text-[11px] text-[#8b93a3] border-t border-[#2b2e38] bg-[#181a21] font-ui select-none">
        <span className={`flex items-center gap-1.5 ${status === 'running' ? 'text-[#4fd16b]' : status === 'error' ? 'text-[#ff6b6b]' : 'text-[#e5c07b]'}`}>
          <Cpu size={12} /> {status === 'running' ? 'VM running' : status === 'error' ? 'VM stopped' : 'Booting ...'}
        </span>
        <span className={`flex items-center gap-1.5 ${disk ? 'text-[#5aa2ff]' : ''}`}><HardDrive size={12} /> disk</span>
        <span className="flex items-center gap-1.5"><WifiOff size={12} /> offline</span>
        <span className="ml-auto truncate">Real Kali i386 via CheerpX. Runs 100% in your browser. user: kali / pass: kali</span>
      </div>
    </div>
  );
}
