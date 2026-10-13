import { useState, useEffect, useRef } from 'react';
import { CONFIG } from '../config';

// GRUB boot menu. Every entry really opens something:
//   Kali GNU/Linux                 -> boot
//   Advanced options               -> kernel submenu (normal / recovery mode)
//   Memory test                    -> a running memtest86+ screen
//   UEFI Firmware Settings         -> a firmware setup utility showing the
//                                     visitor's real machine/browser details
//   'e'                            -> edit the boot commands (Ctrl-x / F10 boots)
//   'c'                            -> a grub> command line

const KERNEL = '6.12.38+kali-amd64';
const UUID = '3f6c1a2e-8d4b-4c71-9b2e-a7d5c0e41f93';
const OS = CONFIG.osName.replace(' Rolling', '');

const MAIN = [
  { label: OS, action: 'boot' },
  { label: `Advanced options for ${OS}`, action: 'advanced' },
  { label: 'Memory test (memtest86+x64.efi)', action: 'memtest' },
  { label: 'UEFI Firmware Settings', action: 'uefi' },
];

const ADVANCED = [
  { label: `${OS}, with Linux ${KERNEL}`, action: 'boot' },
  { label: `${OS}, with Linux ${KERNEL} (recovery mode)`, action: 'recovery' },
];

const BOOT_SCRIPT = `setparams '${OS}'

        load_video
        insmod gzio
        if [ x$grub_platform = xxen ]; then insmod xzio; insmod lzopio; fi
        insmod part_gpt
        insmod ext2
        search --no-floppy --fs-uuid --set=root ${UUID}
        echo        'Loading Linux ${KERNEL} ...'
        linux        /boot/vmlinuz-${KERNEL} root=UUID=${UUID} ro quiet splash
        echo        'Loading initial ramdisk ...'
        initrd        /boot/initrd.img-${KERNEL}`;

// ------------------------------------------------------------------
// Real details about the visitor's machine, read from the browser
// ------------------------------------------------------------------
function machineInfo() {
  const nav = navigator;
  let gpu = 'Unknown';
  try {
    const gl = document.createElement('canvas').getContext('webgl');
    const ext = gl && gl.getExtension('WEBGL_debug_renderer_info');
    if (gl) gpu = ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER);
  } catch { /* no webgl */ }
  const ua = nav.userAgent;
  const browser = /Edg\//.test(ua) ? 'Microsoft Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox\//.test(ua) ? 'Firefox' : /Chrome\//.test(ua) ? 'Chrome' : /Safari\//.test(ua) ? 'Safari' : 'Unknown';
  const version = (ua.match(/(Edg|OPR|Firefox|Chrome|Version)\/([\d.]+)/) || [])[2] || '';
  const os = /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /Linux/.test(ua) ? 'Linux' : /iPhone|iPad/.test(ua) ? 'iOS' : 'Unknown';
  return {
    cores: nav.hardwareConcurrency || '?',
    memory: nav.deviceMemory ? `${nav.deviceMemory} GB (browser-reported)` : 'Not reported by this browser',
    platform: nav.userAgentData?.platform || nav.platform || os,
    os,
    browser: `${browser} ${version.split('.')[0] || ''}`.trim(),
    gpu: String(gpu).replace(/^ANGLE \((.*)\)$/, '$1').replace(/\s*\(0x[0-9a-f]+\).*$/i, '').slice(0, 60),
    screen: `${screen.width} x ${screen.height} @ ${window.devicePixelRatio || 1}x`,
    viewport: `${window.innerWidth} x ${window.innerHeight}`,
    colorDepth: `${screen.colorDepth}-bit`,
    language: nav.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    touch: nav.maxTouchPoints ? `${nav.maxTouchPoints} points` : 'None',
    online: nav.onLine ? 'Connected' : 'Offline',
    cookies: nav.cookieEnabled ? 'Enabled' : 'Disabled',
    wasm: typeof WebAssembly === 'object' ? 'Supported' : 'Not supported',
    sab: window.crossOriginIsolated ? 'Enabled (cross-origin isolated)' : 'Disabled',
    webcrypto: window.crypto?.subtle ? 'Available' : 'Unavailable',
    dnt: nav.doNotTrack === '1' ? 'Enabled' : 'Disabled',
  };
}

const store = {
  get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch { /* blocked */ } },
};

// ------------------------------------------------------------------
export default function Grub({ onDone }) {
  const [view, setView] = useState('menu'); // menu | advanced | memtest | uefi | edit | cmd
  const [sel, setSel] = useState(0);
  const [left, setLeft] = useState(5);
  const [touched, setTouched] = useState(false);
  const [script, setScript] = useState(BOOT_SCRIPT);
  const done = useRef(false);

  const boot = (opts = {}) => {
    if (done.current) return;
    done.current = true;
    onDone(opts);
  };

  const entries = view === 'advanced' ? ADVANCED : MAIN;

  const activate = (action) => {
    setTouched(true);
    if (action === 'boot') boot({ verbose: !/\bquiet\b/.test(script), cmdline: script });
    else if (action === 'recovery') boot({ recovery: true, verbose: true });
    else if (action === 'advanced') { setView('advanced'); setSel(0); }
    else setView(action);
  };

  // auto-boot countdown, only on the untouched main menu
  useEffect(() => {
    if (touched || view !== 'menu') return;
    if (left <= 0) { boot({}); return; }
    const t = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(t);
  });

  useEffect(() => {
    if (view !== 'menu' && view !== 'advanced') return;
    const onKey = (e) => {
      setTouched(true);
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(entries.length - 1, s + 1)); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
      else if (e.key === 'Enter') activate(entries[sel].action);
      else if (e.key === 'Escape' && view === 'advanced') { setView('menu'); setSel(1); }
      else if (e.key === 'e') { e.preventDefault(); setView('edit'); }
      else if (e.key === 'c') { e.preventDefault(); setView('cmd'); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const back = () => { setView('menu'); setSel(0); setTouched(true); };

  if (view === 'memtest') return <MemTest onExit={back} />;
  if (view === 'uefi') return <Firmware onExit={back} onBoot={() => boot({})} />;
  if (view === 'edit') return <EditScreen script={script} setScript={setScript} onBoot={() => boot({ verbose: !/\bquiet\b/.test(script), cmdline: script })} onExit={back} onCmd={() => setView('cmd')} />;
  if (view === 'cmd') return <GrubShell onExit={back} onBoot={() => boot({})} onReboot={() => { back(); setLeft(5); setTouched(false); }} />;

  return (
    <Screen>
      <div className="mb-6 text-center">GNU GRUB  version 2.12-9</div>
      <div className="w-full max-w-4xl border border-[#c7c7c7] p-1 min-h-[260px]">
        {entries.map((e, i) => (
          <div
            key={e.label}
            onMouseEnter={() => { setTouched(true); setSel(i); }}
            onClick={() => { setSel(i); activate(e.action); }}
            className={`px-2 cursor-pointer whitespace-pre ${i === sel ? 'bg-[#c7c7c7] text-black' : ''}`}
          >
            {i === sel ? '*' : ' '}{e.label}
          </div>
        ))}
      </div>
      <div className="w-full max-w-4xl mt-4 px-2 leading-relaxed text-[12px] sm:text-[14px]">
        <div>Use the ▲ and ▼ keys to select which entry is highlighted (or click it).</div>
        <div>
          Press enter to boot the selected OS, <Key onClick={() => setView('edit')}>e</Key> to edit the commands
          before booting or <Key onClick={() => setView('cmd')}>c</Key> for a command-line.
          {view === 'advanced' && <> ESC to return previous menu.</>}
        </div>
        {!touched && view === 'menu' && <div className="mt-1">The highlighted entry will be executed automatically in {left}s.</div>}
      </div>
    </Screen>
  );
}

function Screen({ children, className = '' }) {
  return (
    <div className={`fixed inset-0 bg-black text-[#c7c7c7] font-mono text-[13px] sm:text-[15px] flex flex-col items-center justify-center p-4 select-none ${className}`}>
      {children}
    </div>
  );
}

function Key({ children, onClick }) {
  return <button onClick={onClick} className="underline decoration-dotted hover:text-white">`{children}'</button>;
}

// ------------------------------------------------------------------
// 'e' : edit boot commands
// ------------------------------------------------------------------
function EditScreen({ script, setScript, onBoot, onExit, onCmd }) {
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  const onKey = (e) => {
    if ((e.ctrlKey && e.key.toLowerCase() === 'x') || e.key === 'F10') { e.preventDefault(); onBoot(); }
    else if ((e.ctrlKey && e.key.toLowerCase() === 'c') || e.key === 'F2') { e.preventDefault(); onCmd(); }
    else if (e.key === 'Escape') { e.preventDefault(); onExit(); }
  };
  return (
    <Screen>
      <div className="mb-6 text-center">GNU GRUB  version 2.12-9</div>
      <div className="w-full max-w-4xl border border-[#c7c7c7] p-1">
        <textarea
          ref={ref}
          value={script}
          onChange={(e) => setScript(e.target.value)}
          onKeyDown={onKey}
          spellCheck={false}
          rows={13}
          className="w-full bg-black text-[#c7c7c7] outline-none resize-none font-mono text-[12px] sm:text-[14px] leading-snug select-text caret-white"
        />
      </div>
      <div className="w-full max-w-4xl mt-4 px-2 leading-relaxed text-[12px] sm:text-[14px]">
        Minimum Emacs-like screen editing is supported. TAB lists completions. Press{' '}
        <Key onClick={onBoot}>Ctrl-x</Key> or F10 to boot, <Key onClick={onCmd}>Ctrl-c</Key> or F2 for a command-line or{' '}
        <Key onClick={onExit}>ESC</Key> to discard edits and return to the GRUB menu.
        <div className="mt-2 text-[#8a8a8a]">Tip: remove "quiet" from the linux line to see every boot message.</div>
      </div>
    </Screen>
  );
}

// ------------------------------------------------------------------
// 'c' : grub> command line
// ------------------------------------------------------------------
function GrubShell({ onExit, onBoot, onReboot }) {
  const [lines, setLines] = useState([
    '                     GNU GRUB  version 2.12-9',
    '',
    '   Minimal BASH-like line editing is supported. For the first word, TAB',
    '   lists possible command completions. Anywhere else TAB lists possible',
    '   device or file completions. ESC at any time exits.',
    '',
  ]);
  const [input, setInput] = useState('');
  const ref = useRef(null);
  const end = useRef(null);
  useEffect(() => { ref.current?.focus(); }, []);
  useEffect(() => { end.current?.scrollIntoView(); }, [lines]);

  const FILES = {
    '': ['lost+found/', 'boot/', 'etc/', 'home/', 'opt/', 'root/', 'tmp/', 'usr/', 'var/'],
    boot: [`vmlinuz-${KERNEL}`, `initrd.img-${KERNEL}`, `config-${KERNEL}`, 'grub/'],
    etc: ['hostname', 'os-release', 'fstab', 'passwd'],
    home: [`${CONFIG.user}/`],
  };
  const CMDS = ['boot', 'cat', 'clear', 'echo', 'exit', 'help', 'linux', 'ls', 'lsmod', 'normal', 'reboot', 'set', 'videoinfo'];

  const run = (raw) => {
    const [cmd, ...args] = raw.trim().split(/\s+/);
    const out = [];
    const path = (args[0] || '').replace(/^\(hd0,gpt2\)/, '').replace(/^\/|\/$/g, '');
    switch (cmd) {
      case undefined: case '': break;
      case 'help': out.push(...CMDS.map((c) => `  ${c}`)); break;
      case 'ls':
        if (!args[0]) out.push('(hd0) (hd0,gpt1) (hd0,gpt2) (hd0,gpt3)');
        else if (args[0] === '(hd0,gpt2)') out.push(`        Partition hd0,gpt2: Filesystem type ext* - Last modification time ${new Date().toISOString().slice(0, 19).replace('T', ' ')} - UUID ${UUID} - Partition start at 1050624KiB - Total size 61865984KiB`);
        else if (FILES[path]) out.push(FILES[path].join(' '));
        else out.push(`error: file \`${args[0]}' not found.`);
        break;
      case 'cat': {
        const f = {
          'etc/hostname': CONFIG.host,
          'etc/os-release': `PRETTY_NAME="${CONFIG.osName}"\nNAME="Kali GNU/Linux"\nID=kali`,
          'etc/fstab': `UUID=${UUID} /    ext4 errors=remount-ro 0 1\nUUID=8c1d-2f4a /boot/efi vfat umask=0077 0 1`,
          'etc/passwd': `root:x:0:0:root:/root:/usr/bin/zsh\n${CONFIG.user}:x:1000:1000:${CONFIG.fullName},,,:/home/${CONFIG.user}:/usr/bin/zsh`,
        }[path];
        if (f) out.push(...f.split('\n'));
        else out.push(`error: file \`${args[0] || ''}' not found.`);
        break;
      }
      case 'echo': out.push(args.join(' ')); break;
      case 'set':
        out.push(`cmdpath=(hd0,gpt1)/EFI/kali`, `default=0`, `grub_cpu=x86_64`, `grub_platform=efi`, `lang=${navigator.language.replace('-', '_')}`, `prefix=(hd0,gpt2)/boot/grub`, `root=hd0,gpt2`, `timeout=5`);
        break;
      case 'lsmod': out.push('Name                    Ref Count       Dependencies', 'ext2                    1', 'part_gpt                1', 'gzio                    1', 'efi_gop                 1', 'video_fb                2', 'normal                  1'); break;
      case 'videoinfo': out.push('List of supported video modes:', `Adapter 'EFI GOP driver':`, `  0x000 ${screen.width} x ${screen.height} x 32 (${screen.width * 4})  Direct color, mask: 8/8/8/8  pos: 16/8/0/24  (current)`); break;
      case 'linux': out.push(args.length ? '' : 'error: filename expected.'); break;
      case 'clear': setLines([]); return;
      case 'boot': onBoot(); return;
      case 'reboot': onReboot(); return;
      case 'normal': case 'exit': onExit(); return;
      default: out.push(`error: can't find command \`${cmd}'.`);
    }
    setLines((l) => [...l, `grub> ${raw}`, ...out]);
  };

  return (
    <div className="fixed inset-0 bg-black text-[#c7c7c7] font-mono text-[13px] sm:text-[15px] p-4 overflow-y-auto" onClick={() => ref.current?.focus()}>
      {lines.map((l, i) => <div key={i} className="whitespace-pre-wrap min-h-[1.2em]">{l}</div>)}
      <div className="flex">
        <span>grub&gt;&nbsp;</span>
        <input
          ref={ref}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { run(input); setInput(''); }
            else if (e.key === 'Escape') onExit();
            else if (e.key === 'Tab') {
              e.preventDefault();
              const m = CMDS.filter((c) => c.startsWith(input));
              if (m.length === 1) setInput(m[0] + ' ');
              else setLines((l) => [...l, `grub> ${input}`, `Possible commands are: ${m.join(' ')}`]);
            }
          }}
          className="flex-1 bg-transparent outline-none caret-white text-[#c7c7c7]"
          spellCheck={false}
          autoComplete="off"
        />
      </div>
      <div ref={end} className="h-6" />
      <div className="fixed bottom-3 right-4 text-[11px] text-[#555]">try: help, ls, ls (hd0,gpt2)/, cat (hd0,gpt2)/etc/os-release, videoinfo, boot, ESC</div>
    </div>
  );
}

// ------------------------------------------------------------------
// memtest86+
// ------------------------------------------------------------------
const TESTS = [
  'Address test, walking ones', 'Address test, own address', 'Moving inversions, ones & zeros',
  'Moving inversions, 8 bit pattern', 'Moving inversions, random pattern', 'Block move',
  'Moving inversions, 32 bit pattern', 'Random number sequence', 'Modulo 20, random pattern', 'Bit fade test',
];

function MemTest({ onExit }) {
  const info = useRef(machineInfo()).current;
  const [t, setT] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setT((x) => x + 1), 120);
    const key = (e) => e.key === 'Escape' && onExit();
    window.addEventListener('keydown', key);
    return () => { clearInterval(id); window.removeEventListener('keydown', key); };
  }, [onExit]);
  const perTest = 25;
  const testIdx = Math.floor(t / perTest) % TESTS.length;
  const testPct = Math.round(((t % perTest) / perTest) * 100);
  const passPct = Math.min(100, Math.round(((t % (perTest * TESTS.length)) / (perTest * TESTS.length)) * 100));
  const passes = Math.floor(t / (perTest * TESTS.length));
  const secs = Math.floor((t * 120) / 1000);
  const time = `${String(Math.floor(secs / 3600)).padStart(1, '0')}:${String(Math.floor(secs / 60) % 60).padStart(2, '0')}:${String(secs % 60).padStart(2, '0')}`;
  const bar = (p, n = 30) => '#'.repeat(Math.round((p / 100) * n)).padEnd(n, ' ');
  return (
    <div className="fixed inset-0 bg-[#0000a8] text-[#a8a8a8] font-mono text-[12px] sm:text-[14px] p-3 overflow-hidden select-none" onClick={onExit}>
      <div className="whitespace-pre">
        <span className="bg-[#a8a8a8] text-[#0000a8] font-bold px-1"> Memtest86+ v7.20 </span>{'   '}
        <span className="text-white">| Pass {String(passPct).padStart(3)}%  {bar(passPct)}</span>
      </div>
      <div className="whitespace-pre">{`CLK/Temp: ${info.cores} cores     | Test ${String(testPct).padStart(3)}%  ${bar(testPct)}`}</div>
      <div className="whitespace-pre">{`L1 Cache:   48KB  OK           | Test #${testIdx}  [${TESTS[testIdx]}]`}</div>
      <div className="whitespace-pre">{`L2 Cache: 1280KB  OK           | Testing: 1MB - ${info.memory.split(' ')[0] === 'Not' ? '8GB' : info.memory.split(' ')[0] + 'GB'}`}</div>
      <div className="whitespace-pre">{`Memory  : ${info.memory}`}</div>
      <div className="whitespace-pre">{`CPU     : ${info.platform}, ${info.cores} logical cores (SMP: ${info.cores}T)`}</div>
      <div className="text-white mt-3 whitespace-pre">{'─'.repeat(78)}</div>
      <div className="whitespace-pre text-white">{` Time: ${time}   Pass: ${passes}   Errors: 0   Status: ${passes ? 'PASS' : 'Testing...'}`}</div>
      <div className="whitespace-pre">{'─'.repeat(78)}</div>
      <div className="mt-3 whitespace-pre">{` GPU     : ${info.gpu}`}</div>
      <div className="whitespace-pre">{` Display : ${info.screen}, ${info.colorDepth}`}</div>
      {passes > 0 && <div className="mt-4 text-[#55ff55] font-bold">                ** Pass completed, no errors, press ESC to exit **</div>}
      <div className="absolute bottom-0 left-0 right-0 bg-[#a8a8a8] text-[#0000a8] px-3 py-0.5 whitespace-pre">
        {'<ESC> exit   <F1> configuration   <SP> scroll lock          '}
        <span className="hidden sm:inline">(click anywhere to exit)</span>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// UEFI firmware setup utility
// ------------------------------------------------------------------
function Firmware({ onExit, onBoot }) {
  const info = useRef(machineInfo()).current;
  const [tab, setTab] = useState(0);
  const [row, setRow] = useState(0);
  const [now, setNow] = useState(new Date());
  const [fastBoot, setFastBoot] = useState(store.get('kali-fastboot') === '1');
  const [numlock, setNumlock] = useState(true);
  const [dirty, setDirty] = useState(false);
  const [dialog, setDialog] = useState(null);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const save = () => { store.set('kali-fastboot', fastBoot ? '1' : '0'); setDirty(false); };

  const TABS = [
    {
      name: 'Main',
      rows: [
        ['BIOS Vendor', 'Portfolio Megatrends'],
        ['Version', '2.22.1287 x64'],
        ['Build Date', '10/13/2026'],
        ['Owner', CONFIG.fullName],
        null,
        ['Processor', `${info.cores} logical cores`],
        ['Platform', info.platform],
        ['Total Memory', info.memory],
        ['Graphics', info.gpu],
        null,
        ['System Language', info.language],
        ['Time Zone', info.timezone],
        ['System Date', now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' })],
        ['System Time', now.toLocaleTimeString('en-GB')],
      ],
      help: 'Information read live from your own computer and browser. Nothing is sent anywhere.',
    },
    {
      name: 'Advanced',
      rows: [
        ['Host OS', info.os],
        ['Browser', info.browser],
        ['Screen Resolution', info.screen],
        ['Viewport', info.viewport],
        ['Color Depth', info.colorDepth],
        ['Touch Support', info.touch],
        null,
        ['WebAssembly', info.wasm],
        ['SharedArrayBuffer', info.sab],
        ['Web Crypto', info.webcrypto],
        ['Network', info.online],
        ['Cookies', info.cookies],
        ['Do Not Track', info.dnt],
      ],
      help: 'WebAssembly and SharedArrayBuffer must be enabled for the real Kali VM (CheerpX) to run.',
    },
    {
      name: 'Boot',
      rows: [
        ['Boot Option #1', `${OS} (hd0,gpt2)`],
        ['Boot Option #2', 'UEFI: Built-in EFI Shell'],
        null,
        ['Fast Boot', fastBoot ? '[Enabled]' : '[Disabled]', () => { setFastBoot((v) => !v); setDirty(true); }],
        ['Bootup NumLock State', numlock ? '[On]' : '[Off]', () => { setNumlock((v) => !v); setDirty(true); }],
        ['Boot Mode', '[UEFI]'],
      ],
      help: 'Fast Boot: skip this GRUB menu on your next visits and boot straight into Kali. Press Enter or click to change, then Save Changes.',
    },
    {
      name: 'Security',
      rows: [
        ['Administrator Password', 'Not Installed'],
        ['User Password', 'Not Installed'],
        ['Secure Boot', '[Disabled]'],
        ['TPM Device', info.webcrypto === 'Available' ? 'Web Crypto API (software)' : 'Not Present'],
        ['Sandbox', 'Browser same-origin + WebAssembly'],
      ],
      help: 'Kali is not signed for Secure Boot on this machine.',
    },
    {
      name: 'Save & Exit',
      rows: [
        ['Save Changes and Exit', '', () => { save(); onExit(); }],
        ['Discard Changes and Exit', '', () => onExit()],
        ['Save Changes', '', () => { save(); setDialog('Changes saved.'); }],
        ['Discard Changes', '', () => { setFastBoot(store.get('kali-fastboot') === '1'); setDirty(false); }],
        null,
        ['Boot Override', ''],
        [OS, '', () => { save(); onBoot(); }],
      ],
      help: 'Exit system setup. Boot Override starts Kali directly.',
    },
  ];

  const cur = TABS[tab];
  const selectable = cur.rows.map((r, i) => (r && r[2] ? i : -1)).filter((i) => i >= 0);

  useEffect(() => {
    const onKey = (e) => {
      if (dialog) { setDialog(null); return; }
      if (e.key === 'ArrowRight') { setTab((t) => (t + 1) % TABS.length); setRow(0); }
      else if (e.key === 'ArrowLeft') { setTab((t) => (t + TABS.length - 1) % TABS.length); setRow(0); }
      else if (e.key === 'ArrowDown' && selectable.length) setRow((r) => selectable[(selectable.indexOf(r) + 1) % selectable.length] ?? selectable[0]);
      else if (e.key === 'ArrowUp' && selectable.length) setRow((r) => selectable[(selectable.indexOf(r) - 1 + selectable.length) % selectable.length] ?? selectable[0]);
      else if (e.key === 'Enter' && cur.rows[row]?.[2]) cur.rows[row][2]();
      else if (e.key === 'F10') { e.preventDefault(); save(); onExit(); }
      else if (e.key === 'Escape') { if (dirty) setDialog('exit'); else onExit(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div className="fixed inset-0 bg-[#c0c0c0] text-[#1c2a6b] font-mono text-[12px] sm:text-[14px] flex flex-col select-none">
      <div className="bg-[#1c3fa0] text-white text-center py-1">Portfolio Setup Utility - Copyright (C) 2026 {CONFIG.fullName}</div>
      <div className="bg-[#1c3fa0] text-white flex px-2 overflow-x-auto">
        {TABS.map((t, i) => (
          <button key={t.name} onClick={() => { setTab(i); setRow(0); }} className={`px-3 py-0.5 whitespace-nowrap ${i === tab ? 'bg-[#c0c0c0] text-[#1c3fa0]' : 'hover:bg-white/15'}`}>
            {t.name}
          </button>
        ))}
      </div>
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 p-3 overflow-y-auto border-r-2 border-[#1c3fa0]">
          {cur.rows.map((r, i) =>
            r === null ? (
              <div key={i} className="h-4" />
            ) : (
              <div
                key={i}
                onClick={() => { if (r[2]) { setRow(i); r[2](); } }}
                className={`flex gap-2 px-1 ${r[2] ? 'cursor-pointer' : ''} ${r[2] && row === i ? 'bg-[#1c3fa0] text-white' : r[2] ? 'text-[#1c3fa0] hover:bg-[#1c3fa0]/20' : ''}`}
              >
                <span className={`w-[46%] shrink-0 ${r[2] ? '' : 'text-[#222]'}`}>{r[0]}</span>
                <span className={r[2] ? '' : 'text-[#0b5c2e]'}>{r[1]}</span>
              </div>
            ),
          )}
        </div>
        <div className="w-[34%] p-3 text-[#222] hidden sm:block">
          <div className="mb-2">{cur.help}</div>
          <div className="border-t border-[#1c3fa0] mt-4 pt-2 leading-relaxed text-[#1c3fa0]">
            <div>→←: Select Screen</div>
            <div>↑↓: Select Item</div>
            <div>Enter / Click: Select</div>
            <div>F10: Save & Exit</div>
            <div>ESC: Exit</div>
          </div>
        </div>
      </div>
      <div className="bg-[#1c3fa0] text-white text-center py-0.5 text-[11px]">Version 2.22.1287. Copyright (C) 2026 Portfolio Megatrends, Inc.</div>

      {dialog && (
        <div className="absolute inset-0 flex items-center justify-center" onClick={() => setDialog(null)}>
          <div className="bg-[#1c3fa0] text-white border-2 border-white p-4 min-w-[280px] text-center" onClick={(e) => e.stopPropagation()}>
            {dialog === 'exit' ? (
              <>
                <div className="mb-3">Save configuration and exit?</div>
                <div className="flex justify-center gap-4">
                  <button className="px-3 bg-white text-[#1c3fa0]" onClick={() => { save(); onExit(); }}>Yes</button>
                  <button className="px-3 border border-white" onClick={() => onExit()}>No</button>
                </div>
              </>
            ) : (
              <>
                <div className="mb-3">{dialog}</div>
                <button className="px-3 bg-white text-[#1c3fa0]" onClick={() => setDialog(null)}>OK</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
