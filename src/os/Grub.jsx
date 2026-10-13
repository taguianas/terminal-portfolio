import { useState, useEffect, useRef } from 'react';
import { CONFIG } from '../config';
import { getFirmware, saveFirmware, hashPassword, DEFAULTS } from './firmware';

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
  { label: 'Recruiter mode (one-page profile)', action: 'recruiter' },
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


// ------------------------------------------------------------------
export default function Grub({ onDone, onRecruiter }) {
  const [fw, setFw] = useState(getFirmware);
  // menu | advanced | memtest | uefi | uefiauth | edit | cmd | pxe | secure | auth
  const [view, setView] = useState(() => (getFirmware().bootFirst === 'pxe' ? 'pxe' : 'menu'));
  const [pending, setPending] = useState(null);
  const [sel, setSel] = useState(0);
  const [left, setLeft] = useState(() => getFirmware().timeout);
  const [touched, setTouched] = useState(false);
  const [script, setScript] = useState(BOOT_SCRIPT);
  const done = useRef(false);

  const reallyBoot = (opts = {}) => {
    if (done.current) return;
    done.current = true;
    onDone({ ...opts, verbose: opts.verbose || !fw.quietBoot });
  };

  // firmware checks before handing over to the kernel
  const boot = (opts = {}) => {
    setTouched(true);
    if (fw.secureBoot) { setView('secure'); return; }
    if (fw.userPw) { setPending(opts); setView('auth'); return; }
    reallyBoot(opts);
  };

  const openUefi = () => setView(fw.adminPw ? 'uefiauth' : 'uefi');

  const entries = view === 'advanced' ? ADVANCED : MAIN;

  const activate = (action) => {
    setTouched(true);
    if (action === 'boot') boot({ verbose: !/\bquiet\b/.test(script), cmdline: script });
    else if (action === 'recovery') boot({ recovery: true, verbose: true });
    else if (action === 'advanced') { setView('advanced'); setSel(0); }
    else if (action === 'uefi') openUefi();
    else if (action === 'recruiter') onRecruiter?.();
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

  if (view === 'pxe') return <PxeBoot onDone={() => setView('menu')} />;
  if (view === 'secure') return <SecureBootError onExit={back} />;
  if (view === 'auth') return <GrubAuth onOk={() => reallyBoot(pending || {})} onFail={back} check={fw.userPw} />;
  if (view === 'uefiauth') return <FirmwarePassword check={fw.adminPw} onOk={() => setView('uefi')} onCancel={back} />;
  if (view === 'memtest') return <MemTest onExit={back} />;
  if (view === 'uefi') return <Firmware onExit={() => { setFw(getFirmware()); back(); }} onBoot={() => { const f = getFirmware(); setFw(f); if (f.secureBoot) setView('secure'); else reallyBoot({}); }} />;
  if (view === 'edit') return <EditScreen script={script} setScript={setScript} onBoot={() => boot({ verbose: !/\bquiet\b/.test(script), cmdline: script })} onExit={back} onCmd={() => setView('cmd')} />;
  if (view === 'cmd') return <GrubShell onExit={back} onBoot={() => boot({})} onReboot={() => { back(); setLeft(fw.timeout); setTouched(false); }} />;

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
// Network boot attempt (Boot Option #1 = PXE)
// ------------------------------------------------------------------
const PXE = [
  '>>Checking Media Presence......',
  '>>Media Present......',
  '>>Start PXE over IPv4.',
  '  Station IP address is 10.0.2.15',
  '',
  '  Server IP address is 10.0.2.2',
  '  NBP filename is pxelinux.0',
  '  NBP filesize is 0 Bytes',
  '  PXE-E18: Server response timeout.',
  '>>Start PXE over IPv6.',
  '  PXE-E16: No valid offer received.',
  '',
  'BdsDxe: failed to load Boot0001 "UEFI PXEv4 (MAC:080027A7A500)": Not Found',
  `BdsDxe: loading Boot0000 "${OS}" from HD(2,GPT,${UUID.toUpperCase()})`,
  `BdsDxe: starting Boot0000 "${OS}"`,
];

function PxeBoot({ onDone }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= PXE.length) { const t = setTimeout(onDone, 700); return () => clearTimeout(t); }
    const t = setTimeout(() => setN((x) => x + 1), n < 3 ? 350 : n === 8 ? 1400 : 220);
    return () => clearTimeout(t);
  }, [n, onDone]);
  return (
    <div className="fixed inset-0 bg-black text-[#c7c7c7] font-mono text-[13px] sm:text-[15px] p-5 select-none" onClick={onDone}>
      {PXE.slice(0, n).map((l, i) => <div key={i} className="whitespace-pre min-h-[1.2em]">{l}</div>)}
      <div className="absolute bottom-3 right-4 text-[11px] text-[#555]">Boot Option #1 is set to Network (PXE) in the UEFI settings</div>
    </div>
  );
}

// ------------------------------------------------------------------
// Secure Boot enabled: the unsigned kernel is refused
// ------------------------------------------------------------------
function SecureBootError({ onExit }) {
  useEffect(() => {
    const k = () => onExit();
    const t = setTimeout(() => window.addEventListener('keydown', k), 300);
    return () => { clearTimeout(t); window.removeEventListener('keydown', k); };
  }, [onExit]);
  return (
    <div className="fixed inset-0 bg-black text-[#c7c7c7] font-mono text-[13px] sm:text-[15px] p-5 select-none" onClick={onExit}>
      <div>error: ../../grub-core/kern/efi/sb.c:182:bad shim signature.</div>
      <div>error: ../../grub-core/loader/i386/efi/linux.c:258:you need to load the kernel first.</div>
      <div className="mt-4">Press any key to continue...</div>
      <div className="mt-8 text-[#777]">Secure Boot is enabled in the UEFI settings and this Kali kernel is not signed for this machine.</div>
      <div className="text-[#777]">Disable it in UEFI Firmware Settings &gt; Security &gt; Secure Boot.</div>
    </div>
  );
}

// ------------------------------------------------------------------
// GRUB superuser login (User Password set in the UEFI settings)
// ------------------------------------------------------------------
function GrubAuth({ check, onOk, onFail }) {
  const [step, setStep] = useState('user');
  const [user, setUser] = useState('');
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState(null);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, [step]);
  const submit = async () => {
    if (step === 'user') { setStep('pw'); return; }
    if ((await hashPassword(pw)) === check) onOk();
    else { setMsg('error: access denied.'); setTimeout(onFail, 1500); }
  };
  return (
    <div className="fixed inset-0 bg-black text-[#c7c7c7] font-mono text-[13px] sm:text-[15px] p-5" onClick={() => ref.current?.focus()}>
      <div>Enter username:</div>
      {step === 'user' ? (
        <input ref={ref} value={user} onChange={(e) => setUser(e.target.value)} onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); submit(); } }} className="bg-transparent outline-none caret-white w-full" autoComplete="off" spellCheck={false} />
      ) : (
        <>
          <div>{user || 'root'}</div>
          <div>Enter password:</div>
          <input ref={ref} type="password" value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); submit(); } }} className="bg-transparent outline-none text-transparent caret-transparent w-full" autoComplete="off" />
        </>
      )}
      {msg && <div className="mt-2">{msg}</div>}
      <div className="absolute bottom-3 right-4 text-[11px] text-[#555]">A User Password is set in the UEFI settings (Security tab)</div>
    </div>
  );
}

// ------------------------------------------------------------------
// Setup utility password prompt (Administrator Password)
// ------------------------------------------------------------------
function FirmwarePassword({ check, onOk, onCancel }) {
  const [pw, setPw] = useState('');
  const [tries, setTries] = useState(0);
  const ref = useRef(null);
  useEffect(() => { ref.current?.focus(); }, [tries]);
  const submit = async () => {
    if ((await hashPassword(pw)) === check) onOk();
    else if (tries >= 2) onCancel();
    else { setTries((t) => t + 1); setPw(''); }
  };
  return (
    <div className="fixed inset-0 bg-[#c0c0c0] flex items-center justify-center font-mono text-[14px]">
      <div className="bg-[#1c3fa0] text-white border-2 border-white p-5 w-[340px]">
        <div className="text-center mb-3">Enter Password</div>
        <input ref={ref} type="password" value={pw} onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') submit(); if (e.key === 'Escape') onCancel(); }}
          className="w-full bg-[#0d2470] border border-white/60 px-2 py-1 outline-none" />
        {tries > 0 && <div className="mt-2 text-[#ffb4b4] text-[12px]">Invalid Password ({3 - tries} attempt{3 - tries > 1 ? 's' : ''} left)</div>}
        <div className="mt-3 flex justify-center gap-3">
          <button onClick={submit} className="px-3 bg-white text-[#1c3fa0]">OK</button>
          <button onClick={onCancel} className="px-3 border border-white">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// UEFI firmware setup utility. Every option changes something real.
// ------------------------------------------------------------------
function Firmware({ onExit, onBoot }) {
  const info = useRef(machineInfo()).current;
  const saved = useRef(getFirmware());
  const [fw, setFw] = useState(saved.current);
  const [tab, setTab] = useState(0);
  const [row, setRow] = useState(0);
  const [now, setNow] = useState(new Date());
  const [dialog, setDialog] = useState(null); // {type:'msg'|'exit'|'pw', ...}
  const [cryptoTest, setCryptoTest] = useState(null);
  const [status, setStatus] = useState(null);
  const flash = (t) => { setStatus(t); setTimeout(() => setStatus((x) => (x === t ? null : x)), 4000); };
  const dirty = JSON.stringify(fw) !== JSON.stringify(saved.current);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const set = (patch) => setFw((f) => ({ ...f, ...patch }));
  const save = () => { saveFirmware(fw); saved.current = fw; };
  const onOff = (v) => (v ? '[Enabled]' : '[Disabled]');
  const cycle = (list, v) => list[(list.indexOf(v) + 1) % list.length];

  const runCryptoTest = async () => {
    const t0 = performance.now();
    const key = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
    const msg = new TextEncoder().encode(`attestation ${Date.now()}`);
    const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key.privateKey, msg);
    const ok = await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, key.publicKey, sig, msg);
    const raw = new Uint8Array(await crypto.subtle.exportKey('raw', key.publicKey));
    const fp = [...new Uint8Array(await crypto.subtle.digest('SHA-256', raw))].slice(0, 8).map((b) => b.toString(16).padStart(2, '0')).join(':');
    setCryptoTest(`${ok ? 'PASS' : 'FAIL'}, ECDSA P-256 key ${fp}, ${Math.round(performance.now() - t0)} ms`);
  };

  // [label, value, action?, help]
  const TABS = [
    {
      name: 'Main',
      help: 'Information read live from your own computer and browser. Nothing is sent anywhere.',
      rows: [
        ['BIOS Vendor', 'Portfolio Megatrends', null, 'The firmware of this portfolio, written in React.'],
        ['Version', '2.22.1287 x64', null, 'Firmware version.'],
        ['Owner', CONFIG.fullName, null, 'The person who built this machine. Hire him :)'],
        null,
        ['Processor', `${info.cores} logical cores`, null, 'navigator.hardwareConcurrency: the number of logical CPU cores of YOUR computer.'],
        ['Platform', info.platform, null, 'The operating system your browser reports.'],
        ['Total Memory', info.memory, null, 'navigator.deviceMemory: browsers round it and cap it at 8 GB for privacy.'],
        ['Graphics', info.gpu, null, 'Your GPU, from the WEBGL_debug_renderer_info extension.'],
        null,
        ['System Language', info.language, null, 'navigator.language'],
        ['Time Zone', info.timezone, null, 'Intl.DateTimeFormat().resolvedOptions().timeZone'],
        ['System Date', now.toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }), null, 'Your computer\'s clock.'],
        ['System Time', now.toLocaleTimeString('en-GB'), null, 'Your computer\'s clock, live.'],
      ],
    },
    {
      name: 'Advanced',
      help: 'Hardware features. Some of them really change how the machine behaves.',
      rows: [
        ['Intel Virtualization Technology', onOff(fw.vtx), () => set({ vtx: !fw.vtx }), 'Hardware virtualization for the real Kali VM. Disable it and the "Kali Linux (real VM)" window refuses to start, like on a real PC.'],
        ['HD Audio Controller', onOff(fw.audio), () => set({ audio: !fw.audio }), 'Disable it and the desktop makes no sound at all (login, notifications).'],
        null,
        ['Host OS', info.os, null, 'Detected from your browser user agent.'],
        ['Browser', info.browser, null, 'Detected from your browser user agent.'],
        ['Screen Resolution', info.screen, null, 'screen.width x screen.height @ devicePixelRatio'],
        ['Touch Support', info.touch, null, 'navigator.maxTouchPoints'],
        ['WebAssembly', info.wasm, null, 'Needed by CheerpX to run the real Kali VM.'],
        ['SharedArrayBuffer', info.sab, null, 'Needed by the Kali VM. Requires the COOP/COEP headers this site sends.'],
        ['Network', info.online, null, 'navigator.onLine'],
      ],
    },
    {
      name: 'Boot',
      help: 'Boot configuration. Changes apply after Save Changes and a restart.',
      rows: [
        ['Boot Option #1', fw.bootFirst === 'kali' ? `[${OS}]` : '[UEFI PXE: Network]', () => set({ bootFirst: fw.bootFirst === 'kali' ? 'pxe' : 'kali' }), 'Boot order. Put the network (PXE) first and the machine tries to boot from the network before falling back to Kali.'],
        ['Boot Option #2', fw.bootFirst === 'kali' ? '[UEFI PXE: Network]' : `[${OS}]`, () => set({ bootFirst: fw.bootFirst === 'kali' ? 'pxe' : 'kali' }), 'Second boot device.'],
        null,
        ['Fast Boot', onOff(fw.fastBoot), () => set({ fastBoot: !fw.fastBoot }), 'Skip the GRUB menu and boot straight into Kali on your next visits.'],
        ['GRUB Timeout', `[${fw.timeout} s]`, () => set({ timeout: cycle([1, 3, 5, 10, 30], fw.timeout) }), 'How long the GRUB menu waits before booting the default entry.'],
        ['Quiet Boot', onOff(fw.quietBoot), () => set({ quietBoot: !fw.quietBoot }), 'Disabled: every kernel message is printed during boot.'],
        ['Boot Mode', '[UEFI]', null, 'Legacy BIOS is not supported by this machine.'],
      ],
    },
    {
      name: 'Security',
      help: 'Passwords are hashed with SHA-256 (Web Crypto) and stored only in your browser.',
      rows: [
        ['Administrator Password', fw.adminPw ? 'Installed' : 'Not Installed', () => setDialog({ type: 'pw', field: 'adminPw' }), 'Protects this setup utility: it will be asked before entering UEFI settings. Set an empty password to remove it.'],
        ['User Password', fw.userPw ? 'Installed' : 'Not Installed', () => setDialog({ type: 'pw', field: 'userPw' }), 'GRUB will ask for it before booting Kali. Set an empty password to remove it.'],
        ['Secure Boot', onOff(fw.secureBoot), () => set({ secureBoot: !fw.secureBoot }), 'Only signed bootloaders and kernels may run. This Kali kernel is not signed for this machine, so GRUB will refuse to boot it. Try it!'],
        ['TPM Device', info.webcrypto === 'Available' ? 'Web Crypto API (software)' : 'Not Present', info.webcrypto === 'Available' ? runCryptoTest : null, 'Press Enter to run a self-test: generate an ECDSA P-256 key, sign and verify a message.'],
        ...(cryptoTest ? [['TPM Self-Test', cryptoTest, null, 'Result of the Web Crypto self-test.']] : []),
        ['Sandbox', 'Browser same-origin + WebAssembly', null, 'Everything here runs inside your browser sandbox. Nothing can touch your real computer.'],
      ],
    },
    {
      name: 'Save & Exit',
      help: 'Exit system setup.',
      rows: [
        ['Save Changes and Exit', '', () => { save(); onExit(); }, 'Save the configuration and return to GRUB.'],
        ['Discard Changes and Exit', '', () => onExit(), 'Return to GRUB without saving.'],
        ['Save Changes', '', () => { save(); flash('Changes saved.'); }, 'Save without leaving.'],
        ['Discard Changes', '', () => setFw(saved.current), 'Undo every change since the last save.'],
        ['Restore Defaults', '', () => { setFw({ ...DEFAULTS }); flash('Optimized defaults loaded. Save to apply.'); }, 'Load the default configuration (passwords removed).'],
        null,
        ['Boot Override', '', null, 'Start a boot device right now (saves first).'],
        [OS, '', () => { save(); onBoot(); }, 'Save and boot Kali now.'],
      ],
    },
  ];

  const cur = TABS[tab];
  const rowsIdx = cur.rows.map((r, i) => (r ? i : -1)).filter((i) => i >= 0);
  const selRow = cur.rows[row] || cur.rows[rowsIdx[0]];

  const move = (d) => setRow((r) => {
    const k = rowsIdx.indexOf(r);
    return rowsIdx[(k + d + rowsIdx.length) % rowsIdx.length];
  });

  useEffect(() => {
    const onKey = (e) => {
      if (dialog) {
        if (dialog.type === 'msg' && (e.key === 'Enter' || e.key === 'Escape')) { e.preventDefault(); setDialog(null); }
        if (dialog.type === 'exit' && e.key === 'Escape') setDialog(null);
        return;
      }
      if (e.key === 'ArrowRight') { setTab((t) => (t + 1) % TABS.length); setRow(0); }
      else if (e.key === 'ArrowLeft') { setTab((t) => (t + TABS.length - 1) % TABS.length); setRow(0); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter' && selRow?.[2]) selRow[2]();
      else if (e.key === 'F10') { e.preventDefault(); save(); onExit(); }
      else if (e.key === 'F9') { e.preventDefault(); setFw({ ...DEFAULTS }); flash('Optimized defaults loaded. Save to apply.'); }
      else if (e.key === 'Escape') { if (dirty) setDialog({ type: 'exit' }); else onExit(); }
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
        {dirty && <span className="ml-auto px-2 py-0.5 text-[#ffd76a]">* unsaved changes</span>}
      </div>
      <div className="flex-1 flex min-h-0">
        <div className="flex-1 p-3 overflow-y-auto border-r-2 border-[#1c3fa0] relative">
          {status && <div className="mb-2 px-2 py-1 bg-[#1c3fa0] text-[#ffd76a] inline-block">{status}</div>}
          {cur.rows.map((r, i) =>
            r === null ? (
              <div key={i} className="h-4" />
            ) : (
              <div
                key={i}
                onClick={() => { setRow(i); if (r[2]) r[2](); }}
                onMouseEnter={() => setRow(i)}
                className={`flex gap-2 px-1 cursor-pointer ${row === i ? (r[2] ? 'bg-[#1c3fa0] text-white' : 'bg-[#a9b4d8]') : ''}`}
              >
                <span className={`w-[46%] shrink-0 ${r[2] ? (row === i ? '' : 'text-[#1c3fa0]') : 'text-[#222]'}`}>{r[0]}</span>
                <span className={row === i && r[2] ? '' : r[2] ? 'text-[#1c3fa0]' : 'text-[#0b5c2e]'}>{r[1]}</span>
              </div>
            ),
          )}
        </div>
        <div className="w-[34%] p-3 text-[#222] hidden sm:flex flex-col">
          <div className="mb-2 min-h-[5em]">{selRow?.[3] || cur.help}</div>
          {selRow?.[2] && <div className="text-[#1c3fa0] text-[12px]">Enter / click to change.</div>}
          <div className="border-t border-[#1c3fa0] mt-4 pt-2 leading-relaxed text-[#1c3fa0]">
            <div>→←: Select Screen</div>
            <div>↑↓: Select Item</div>
            <div>Enter / Click: Select</div>
            <div>F9: Optimized Defaults</div>
            <div>F10: Save & Exit</div>
            <div>ESC: Exit</div>
          </div>
        </div>
      </div>
      <div className="bg-[#1c3fa0] text-white text-center py-0.5 text-[11px]">Version 2.22.1287. Copyright (C) 2026 Portfolio Megatrends, Inc.</div>

      {dialog && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20" onClick={() => dialog.type === 'msg' && setDialog(null)}>
          <div className="bg-[#1c3fa0] text-white border-2 border-white p-4 min-w-[300px] text-center" onClick={(e) => e.stopPropagation()}>
            {dialog.type === 'exit' && (
              <>
                <div className="mb-3">Save configuration and exit?</div>
                <div className="flex justify-center gap-4">
                  <button className="px-3 bg-white text-[#1c3fa0]" onClick={() => { save(); onExit(); }}>Yes</button>
                  <button className="px-3 border border-white" onClick={() => onExit()}>No</button>
                  <button className="px-3 border border-white" onClick={() => setDialog(null)}>Cancel</button>
                </div>
              </>
            )}
            {dialog.type === 'msg' && (
              <>
                <div className="mb-3">{dialog.text}</div>
                <button autoFocus className="px-3 bg-white text-[#1c3fa0]" onClick={() => setDialog(null)}>OK</button>
              </>
            )}
            {dialog.type === 'pw' && (
              <PasswordDialog
                title={dialog.field === 'adminPw' ? 'Administrator Password' : 'User Password'}
                onCancel={() => setDialog(null)}
                onSet={async (pw) => {
                  set({ [dialog.field]: pw ? await hashPassword(pw) : null });
                  setDialog(null);
                  flash(pw ? 'Password installed. Save Changes to apply.' : 'Password removed. Save Changes to apply.');
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PasswordDialog({ title, onSet, onCancel }) {
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [err, setErr] = useState('');
  const submit = () => {
    if (a !== b) { setErr('Passwords do not match.'); return; }
    onSet(a);
  };
  const key = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') { e.preventDefault(); submit(); }
    if (e.key === 'Escape') onCancel();
  };
  return (
    <div className="text-left">
      <div className="text-center mb-3">{title}</div>
      <div className="text-[12px] mb-1">Create New Password (empty = remove)</div>
      <input autoFocus type="password" value={a} onChange={(e) => setA(e.target.value)} onKeyDown={key} className="w-full bg-[#0d2470] border border-white/60 px-2 py-1 outline-none mb-2" />
      <div className="text-[12px] mb-1">Confirm New Password</div>
      <input type="password" value={b} onChange={(e) => setB(e.target.value)} onKeyDown={key} className="w-full bg-[#0d2470] border border-white/60 px-2 py-1 outline-none" />
      {err && <div className="mt-2 text-[#ffb4b4] text-[12px]">{err}</div>}
      <div className="mt-3 flex justify-center gap-3">
        <button onClick={submit} className="px-3 bg-white text-[#1c3fa0]">OK</button>
        <button onClick={onCancel} className="px-3 border border-white">Cancel</button>
      </div>
    </div>
  );
}
