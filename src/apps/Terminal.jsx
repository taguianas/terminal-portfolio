import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowUp, ArrowDown, Star, GitFork } from 'lucide-react';
import { useOS } from '../os/OSContext';
import { CONFIG } from '../config';
import { HOME, getNode, resolvePath, displayPath, absPath, listDir, nodeSize } from '../data/fs';
import Linkify from '../components/Linkify';
import { Logo } from '../components/Icons';

const GREEN = 'text-[#4fd16b]';
const BLUE = 'text-[#3b8eea]';
const RED = 'text-[#ff6b6b]';
const DIM = 'text-[#8b93a3]';
const YELLOW = 'text-[#e5c07b]';

const BOOT_TIME = Date.now();

export const COMMANDS = {
  help: 'Show this help',
  ls: 'List files (ls -la to see hidden ones)',
  cd: 'Change directory',
  cat: 'Print a file',
  open: 'Open a file or folder in its app (also: xdg-open)',
  pwd: 'Print working directory',
  clear: 'Clear the screen (Ctrl+L)',
  history: 'Show command history',
  whoami: 'Print current user',
  neofetch: 'System information',
  nmap: 'Scan a host (try: nmap anas)',
  msfconsole: 'Metasploit console (my projects)',
  github: 'Live GitHub repos (github [user])',
  weather: 'Live weather (weather <city>)',
  resume: 'Open and download my resume',
  contact: 'How to reach me',
  'kali-vm': 'Boot a REAL Kali Linux in your browser',
  firefox: 'Open the browser (firefox [url])',
  thunar: 'Open the file manager',
  mousepad: 'Open the text editor',
  mkdir: 'Create a directory',
  touch: 'Create a file',
  echo: 'Print text (echo hi > file.txt works too)',
  uname: 'Kernel information',
  ifconfig: 'Network interfaces',
  date: 'Print date',
  matrix: 'Wake up, Neo...',
  sudo: 'Try it',
  reboot: 'Restart the machine',
  exit: 'Close the terminal',
};

const BANNER = String.raw`
    _    _   _    _    ____
   / \  | \ | |  / \  / ___|
  / _ \ |  \| | / _ \ \___ \
 / ___ \| |\  |/ ___ \ ___) |
/_/   \_\_| \_/_/   \_\____/
 _____    _    ____ _   _ ___
|_   _|  / \  / ___| | | |_ _|
  | |   / _ \| |  _| | | || |
  | |  / ___ \ |_| | |_| || |
  |_| /_/   \_\____|\___/|___|`;

// ------------------------------------------------------------------

function Prompt({ path }) {
  return (
    <div className="whitespace-pre-wrap break-all">
      <span className={GREEN}>┌──(</span>
      <span className={`${BLUE} font-bold`}>{CONFIG.user}㉿{CONFIG.host}</span>
      <span className={GREEN}>)-[</span>
      <span className="font-bold text-white">{path}</span>
      <span className={GREEN}>]</span>
    </div>
  );
}

function PromptTail() {
  return (
    <>
      <span className={GREEN}>└─</span>
      <span className={`${BLUE} font-bold`}>$ </span>
    </>
  );
}

function Text({ children, onUrl }) {
  return (
    <div className="whitespace-pre-wrap break-words">
      <Linkify text={children} onUrl={onUrl} />
    </div>
  );
}

function GitHubWidget({ username, onUrl }) {
  const [state, setState] = useState({ loading: true });
  useEffect(() => {
    let alive = true;
    fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=6`)
      .then((r) => {
        if (!r.ok) throw new Error(r.status === 404 ? 'user not found' : 'API rate limit reached, try later');
        return r.json();
      })
      .then((repos) => alive && setState({ repos }))
      .catch((e) => alive && setState({ error: e.message }));
    return () => { alive = false; };
  }, [username]);

  if (state.loading) return <div className={`${DIM} animate-pulse`}>[*] Connecting to api.github.com ...</div>;
  if (state.error) return <div className={RED}>[-] github: {state.error}</div>;
  return (
    <div className="space-y-1">
      <div className={GREEN}>[+] {state.repos.length} recently updated repositories for {username}</div>
      {state.repos.map((r) => (
        <div key={r.id} className="border-l-2 border-[#2c3140] pl-3 py-0.5">
          <div className="flex flex-wrap items-center gap-x-3">
            <a href={r.html_url} target="_blank" rel="noreferrer" className={`${BLUE} font-bold hover:underline`}
               onClick={(e) => { e.preventDefault(); onUrl(r.html_url); }}>{r.name}</a>
            <span className={`${YELLOW} inline-flex items-center gap-1 text-xs`}><Star size={11} />{r.stargazers_count}</span>
            <span className="inline-flex items-center gap-1 text-xs text-[#c678dd]"><GitFork size={11} />{r.forks_count}</span>
            {r.language && <span className={`text-xs ${DIM}`}>[{r.language}]</span>}
          </div>
          <div className={`text-xs ${DIM}`}>{r.description || 'No description.'}</div>
        </div>
      ))}
    </div>
  );
}

function WeatherWidget({ city }) {
  const [text, setText] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch(`https://wttr.in/${encodeURIComponent(city)}?0AT`)
      .then((r) => r.text())
      .then((t) => alive && setText(t))
      .catch(() => alive && setText('weather: could not reach wttr.in'));
    return () => { alive = false; };
  }, [city]);
  if (text === null) return <div className={`${DIM} animate-pulse`}>Contacting meteorological satellite ...</div>;
  return <pre className="text-xs leading-tight overflow-x-auto">{text}</pre>;
}

function Neofetch() {
  const up = Math.max(1, Math.round((Date.now() - BOOT_TIME) / 60000));
  const rows = [
    ['OS', `${CONFIG.osName} x86_64`],
    ['Host', 'Portfolio VM (React 19)'],
    ['Kernel', '6.12.38+kali-amd64'],
    ['Uptime', `${up} min${up > 1 ? 's' : ''}`],
    ['Packages', '2187 (dpkg)'],
    ['Shell', 'zsh 5.9'],
    ['Resolution', `${window.innerWidth}x${window.innerHeight}`],
    ['DE', 'Xfce 4.20'],
    ['WM', 'Xfwm4'],
    ['Theme', 'Kali-Dark [GTK3]'],
    ['Terminal', 'qterminal'],
    ['CPU', `${navigator.hardwareConcurrency || 4} cores (your browser)`],
    ['Memory', navigator.deviceMemory ? `${navigator.deviceMemory} GiB` : 'enough'],
  ];
  const colors = ['#1b1e26', '#ff6b6b', '#4fd16b', '#e5c07b', '#3b8eea', '#c678dd', '#56b6c2', '#e6e6e6'];
  return (
    <div className="flex gap-5 items-start py-1">
      <div className="hidden sm:block shrink-0 pt-1"><Logo size={110} /></div>
      <div>
        <div><span className={`${BLUE} font-bold`}>{CONFIG.user}</span>@<span className={`${BLUE} font-bold`}>{CONFIG.host}</span></div>
        <div>{'-'.repeat(CONFIG.user.length + CONFIG.host.length + 1)}</div>
        {rows.map(([k, v]) => (
          <div key={k}><span className={`${BLUE} font-bold`}>{k}</span>: {v}</div>
        ))}
        <div className="flex mt-2">
          {colors.map((c) => <span key={c} className="inline-block w-5 h-3.5" style={{ background: c }} />)}
        </div>
      </div>
    </div>
  );
}

const NMAP_PORTS = [
  ['22/tcp', 'python', 'Python / Bash scripting'],
  ['80/tcp', 'http', 'JavaScript / React'],
  ['443/tcp', 'https', 'HTML / Tailwind CSS'],
  ['1337/tcp', 'c-cpp', 'C / C++'],
  ['2375/tcp', 'docker', 'Docker / Kubernetes'],
  ['4444/tcp', 'metasploit', 'Metasploit / Burp Suite'],
  ['8443/tcp', 'crypto', 'AES-GCM / RSA-OAEP (SecureCrypt)'],
  ['9001/tcp', 'wireshark', 'Wireshark packet analysis'],
];

function nmapOutput(target) {
  const now = new Date();
  const stamp = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${now.toTimeString().slice(0, 5)}`;
  const known = ['anas', 'localhost', '127.0.0.1', CONFIG.host].includes(target);
  if (!known) {
    return `Starting Nmap 7.95 ( https://nmap.org ) at ${stamp} CET
Note: Host seems down. If it is really up, but blocking our ping probes, try -Pn
Nmap done: 1 IP address (0 hosts up) scanned in 3.04 seconds

(only "${CONFIG.host}" lives on this network. Try: nmap ${CONFIG.host})`;
  }
  const lines = NMAP_PORTS.map(([p, s, v]) => `${p.padEnd(9)}open  ${s.padEnd(11)}${v}`).join('\n');
  return `Starting Nmap 7.95 ( https://nmap.org ) at ${stamp} CET
Nmap scan report for ${CONFIG.host} (10.0.2.15)
Host is up (0.00042s latency).
Not shown: 992 closed tcp ports (reset)
PORT     STATE SERVICE    VERSION
${lines}
Service Info: Host: ${CONFIG.host}; OS: Linux; Role: ${CONFIG.title}

Nmap done: 1 IP address (1 host up) scanned in 0.42 seconds`;
}

const MSF = `
       =[ metasploit v6.4.71-dev                          ]
+ -- --=[ 3 exploits - 0 auxiliary - 0 payloads           ]
+ -- --=[ all written by ${CONFIG.fullName.padEnd(30)}]

msf6 > show exploits

Exploits
========

   #  Name                         Rank       Description
   -  ----                         ----       -----------
   0  exploit/web/securecrypt      excellent  E2E encryption (AES-GCM, RSA-OAEP)
   1  exploit/web/snooker_shootout great      Snooker tournament app (React)
   2  exploit/web/kali_portfolio   excellent  This Kali desktop (React)

msf6 > info 0   ->  cat ~/projects/SecureCrypt.txt
msf6 > info 1   ->  cat ~/projects/snooker-shootout.txt
msf6 > info 2   ->  cat ~/projects/kali-portfolio.txt
msf6 > exit`;

function tokenize(line) {
  return (line.match(/"[^"]*"|'[^']*'|\S+/g) || []).map((t) => t.replace(/^["']|["']$/g, ''));
}

function commonPrefix(words) {
  if (!words.length) return '';
  let p = words[0];
  for (const w of words) while (!w.startsWith(p)) p = p.slice(0, -1);
  return p;
}

// ------------------------------------------------------------------

export default function Terminal({ initialCommand, onExit, active = true, mobile = false }) {
  const os = useOS();
  const [cwd, setCwd] = useState(HOME);
  const cwdRef = useRef(HOME);
  const [entries, setEntries] = useState(() => (initialCommand ? [] : [{ id: 0, banner: true }]));
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const idRef = useRef(1);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const runRef = useRef(null);
  const fsRef = useRef(os.fs);
  fsRef.current = os.fs;

  const push = useCallback((entry) => setEntries((e) => [...e, { id: idRef.current++, ...entry }]), []);

  // -------------------------- command runner ----------------------
  const exec = (argv, cwdNow, raw) => {
    const fs = fsRef.current;
    const [cmd, ...args] = argv;
    const flags = args.filter((a) => a.startsWith('-') && a.length > 1).join('').replace(/-/g, '');
    const params = args.filter((a) => !(a.startsWith('-') && a.length > 1));
    const t = params[0];
    const onUrl = os.openUrl;
    const err = (msg) => ({ out: <div className={RED}>{msg}</div> });
    const txt = (msg) => ({ out: <Text onUrl={onUrl}>{msg}</Text> });

    switch (cmd) {
      case 'help': {
        const groups = [
          ['Files', ['ls', 'cd', 'cat', 'open', 'pwd', 'mkdir', 'touch', 'echo']],
          ['Portfolio', ['neofetch', 'nmap', 'msfconsole', 'resume', 'contact', 'github', 'weather']],
          ['Desktop apps', ['kali-vm', 'firefox', 'thunar', 'mousepad']],
          ['System', ['whoami', 'uname', 'ifconfig', 'date', 'history', 'clear', 'sudo', 'matrix', 'reboot', 'exit']],
        ];
        return {
          out: (
            <div className="space-y-2">
              <div className={DIM}>GNU zsh 5.9 (x86_64-pc-linux-gnu). Click any file name in an <b>ls</b> listing to open it. TAB completes, UP/DOWN browse history.</div>
              {groups.map(([title, cmds]) => (
                <div key={title}>
                  <div className={`${YELLOW} font-bold`}>{title}</div>
                  {cmds.map((c) => (
                    <div key={c} className="flex">
                      <button className={`${GREEN} w-28 shrink-0 text-left hover:underline`} onClick={() => runRef.current(c === 'nmap' ? `nmap ${CONFIG.host}` : c)}>{c}</button>
                      <span className="text-[#c8ccd4]">{COMMANDS[c]}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ),
        };
      }

      case 'ls':
      case 'll':
      case 'la': {
        const showAll = flags.includes('a') || cmd === 'la' || cmd === 'll';
        const long = flags.includes('l') || cmd === 'll';
        const path = t ? resolvePath(cwdNow, t) : cwdNow;
        const node = getNode(fs, path);
        if (!node) return err(`ls: cannot access '${t}': No such file or directory`);
        if (node.locked) return err(`ls: cannot open directory '${t}': Permission denied`);
        if (node.type !== 'dir') return txt(t);
        let items = listDir(node, showAll);
        if (showAll) items = [['.', node], ['..', node], ...items];
        const click = (name, n) => {
          if (name === '.' || name === '..') return runRef.current(`cd ${name} && ls`);
          const p = displayPath([...path, name]);
          if (n.type === 'dir') runRef.current(`cd ${p} && ls`);
          else if (n.type === 'pdf') runRef.current(`open ${p}`);
          else runRef.current(`cat ${p}`);
        };
        const cls = (name, n) => (n.type === 'dir' ? `${BLUE} font-bold` : n.type === 'pdf' ? 'text-[#ff8f6b]' : 'text-[#e6e6e6]');
        if (long) {
          const d = new Date();
          const date = `${d.toLocaleString('en', { month: 'short' })} ${String(d.getDate()).padStart(2)} 10:24`;
          return {
            out: (
              <div>
                <div>total {items.length * 4}</div>
                {items.map(([name, n]) => (
                  <div key={name} className="whitespace-pre">
                    {n.type === 'dir' ? 'drwxr-xr-x' : '-rw-r--r--'} {n.type === 'dir' ? 2 : 1} {CONFIG.user} {CONFIG.user} {String(nodeSize(n)).padStart(6)} {date}{' '}
                    <button className={`${cls(name, n)} hover:underline`} onClick={() => click(name, n)}>{name}</button>
                  </div>
                ))}
              </div>
            ),
          };
        }
        return {
          out: (
            <div className="flex flex-wrap gap-x-6 gap-y-0.5">
              {items.map(([name, n]) => (
                <button key={name} className={`${cls(name, n)} hover:underline`} onClick={() => click(name, n)}>
                  {name}
                </button>
              ))}
            </div>
          ),
        };
      }

      case 'cd': {
        if (t === '-') return { cwd: HOME };
        const path = resolvePath(cwdNow, t);
        const node = getNode(fs, path);
        if (!node) return err(`cd: no such file or directory: ${t}`);
        if (node.type !== 'dir') return err(`cd: not a directory: ${t}`);
        if (node.locked) return err(`cd: permission denied: ${t}`);
        return { cwd: path };
      }

      case 'pwd':
        return txt(absPath(cwdNow) || '/');

      case 'cat':
      case 'less':
      case 'more':
      case 'head': {
        if (!params.length) return txt(`Usage: ${cmd} <file>`);
        const outs = params.map((p, i) => {
          const node = getNode(fs, resolvePath(cwdNow, p));
          if (!node) return <div key={i} className={RED}>{cmd}: {p}: No such file or directory</div>;
          if (node.locked) return <div key={i} className={RED}>{cmd}: {p}: Permission denied</div>;
          if (node.type === 'dir') return <div key={i} className={RED}>{cmd}: {p}: Is a directory</div>;
          if (node.type === 'pdf') return (
            <div key={i}>
              <div className={DIM}>%PDF-1.7 %âãÏÓ ... (binary data)</div>
              <div>This is a PDF. Run <button className={`${GREEN} hover:underline`} onClick={() => runRef.current(`open ${p}`)}>open {p}</button> to read it.</div>
            </div>
          );
          return <Text key={i} onUrl={onUrl}>{node.content}</Text>;
        });
        return { out: <div>{outs}</div> };
      }

      case 'open':
      case 'xdg-open':
      case 'nano':
      case 'vim':
      case 'vi':
      case 'mousepad':
      case 'thunar':
      case 'evince': {
        if (!t) {
          if (cmd === 'thunar') { os.openApp('files', { path: cwdNow }); return {}; }
          if (cmd === 'mousepad') { os.openApp('editor', {}); return {}; }
          return txt(`Usage: ${cmd} <file>`);
        }
        if (/^https?:\/\//.test(t)) { os.openUrl(t); return {}; }
        const path = resolvePath(cwdNow, t);
        const node = getNode(fs, path);
        if (!node) return err(`${cmd}: ${t}: No such file or directory`);
        if (node.locked) return err(`${cmd}: ${t}: Permission denied`);
        const shown = os.openPath(path);
        if (shown === 'inline') {
          if (node.type === 'dir') return exec(['ls', t], cwdNow, `ls ${t}`);
          return { out: node.type === 'file' ? <Text onUrl={onUrl}>{node.content}</Text> : <div className={DIM}>Opening {displayPath(path)} in a new tab ...</div> };
        }
        return { out: <div className={DIM}>Opening {displayPath(path)} ...</div> };
      }

      case 'kali-vm':
      case 'ssh':
      case 'vm': {
        if (os.mobile) return txt('The real Kali VM needs a computer (it is too heavy for phones).');
        os.openApp('kalivm');
        return { out: <div className={DIM}>{cmd === 'ssh' ? 'Connecting to kali@kali ...' : 'Booting the real Kali VM ...'} (new window)</div> };
      }

      case 'firefox':
      case 'firefox-esr': {
        os.openUrl(t ? (/^https?:\/\//.test(t) ? t : `https://${t}`) : 'about:home');
        return {};
      }

      case 'clear':
        return { clear: true };

      case 'history':
        return txt(history.map((h, i) => `${String(i + 1).padStart(5)}  ${h}`).join('\n') || '');

      case 'whoami':
        return txt(CONFIG.user);

      case 'id':
        return txt(`uid=1000(${CONFIG.user}) gid=1000(${CONFIG.user}) groups=1000(${CONFIG.user}),20(dialout),24(cdrom),25(floppy),29(audio),44(video),46(plugdev),100(users),106(netdev)`);

      case 'hostname':
        return txt(CONFIG.host);

      case 'uname':
        return txt(flags.includes('a')
          ? `Linux ${CONFIG.host} 6.12.38+kali-amd64 #1 SMP PREEMPT_DYNAMIC Kali 6.12.38-1kali1 x86_64 GNU/Linux`
          : 'Linux');

      case 'ifconfig':
      case 'ip':
        return txt(`eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.0.2.15  netmask 255.255.255.0  broadcast 10.0.2.255
        ether 08:00:27:a7:a5:00  txqueuelen 1000  (Ethernet)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0`);

      case 'date':
        return txt(new Date().toString());

      case 'echo': {
        const gt = args.indexOf('>');
        const gtt = args.indexOf('>>');
        const idx = gt >= 0 ? gt : gtt;
        if (idx >= 0 && args[idx + 1]) {
          const text = args.slice(0, idx).join(' ') + '\n';
          const path = resolvePath(cwdNow, args[idx + 1]);
          const res = writeFile(path, text, gtt >= 0);
          return res ? err(res) : {};
        }
        return txt(raw.replace(/^\s*echo\s?/, '').replace(/^["']|["']$/g, ''));
      }

      case 'mkdir':
      case 'touch': {
        if (!t) return txt(`Usage: ${cmd} <name>`);
        const path = resolvePath(cwdNow, t);
        const parent = path.slice(0, -1);
        const name = path[path.length - 1];
        const parentNode = getNode(fs, parent);
        if (!parentNode || parentNode.type !== 'dir') return err(`${cmd}: cannot create '${t}': No such file or directory`);
        if (!isWritable(parent)) return err(`${cmd}: cannot create '${t}': Permission denied`);
        if (parentNode.children[name]) return cmd === 'mkdir' ? err(`mkdir: cannot create directory '${t}': File exists`) : {};
        os.updateFs(parent, (n) => ({
          ...n,
          children: { ...n.children, [name]: cmd === 'mkdir' ? { type: 'dir', children: {} } : { type: 'file', content: '' } },
        }));
        return {};
      }

      case 'rm':
      case 'rmdir': {
        if (flags.includes('r') && flags.includes('f') && (params.includes('/') || params.includes('/*'))) {
          os.crash();
          return { stop: true };
        }
        if (!t) return txt(`${cmd}: missing operand`);
        return err(`${cmd}: cannot remove '${t}': Operation not permitted (nice try)`);
      }

      case 'sudo':
      case 'su': {
        if (!t && cmd === 'sudo') return txt('usage: sudo -h | -K | -k | -V\nusage: sudo [-u user] command');
        return {
          out: (
            <div>
              <div>[sudo] password for {CONFIG.user}: </div>
              <div className={RED}>{CONFIG.user} is not in the sudoers file. This incident will be reported.</div>
            </div>
          ),
        };
      }

      case 'apt':
      case 'apt-get':
        return err('E: Could not open lock file /var/lib/dpkg/lock-frontend - open (13: Permission denied)\nE: Unable to acquire the dpkg frontend lock, are you root?');

      case 'neofetch':
      case 'fastfetch':
      case 'fetch':
        return { out: <Neofetch /> };

      case 'nmap':
        if (!t) return txt(`Nmap 7.95 ( https://nmap.org )\nUsage: nmap [Scan Type(s)] [Options] {target specification}\n\nTry: nmap ${CONFIG.host}`);
        return txt(nmapOutput(t));

      case 'msfconsole':
        return {
          out: (
            <div>
              <Text onUrl={onUrl}>{MSF}</Text>
              <div className="mt-1">
                <button className={`${GREEN} hover:underline`} onClick={() => runRef.current('cd ~/projects && ls')}>[ browse ~/projects ]</button>
              </div>
            </div>
          ),
        };

      case 'github':
        return { out: <GitHubWidget username={t || CONFIG.github} onUrl={onUrl} /> };

      case 'weather':
        if (!t) return txt('Usage: weather <city>   (e.g. weather Angers)');
        return { out: <WeatherWidget city={params.join(' ')} /> };

      case 'resume':
      case 'cv': {
        const a = document.createElement('a');
        a.href = CONFIG.resume;
        a.download = `${CONFIG.fullName.replace(/\s+/g, '_')}_Resume.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        os.openPath([...HOME, 'resume.pdf']);
        return { out: <div className={GREEN}>[+] Downloading resume.pdf ... done</div> };
      }

      case 'contact':
        return txt(getNode(fs, [...HOME, 'contact.info']).content);

      case 'matrix':
        os.matrix();
        return {};

      case 'reboot':
      case 'shutdown':
      case 'poweroff':
        os.power(cmd === 'reboot' ? 'reboot' : 'shutdown');
        return { stop: true };

      case 'exit':
      case 'logout':
        if (onExit) { onExit(); return { stop: true }; }
        return txt('logout');

      case 'man':
        return txt(t ? `No manual entry for ${t}\nTry: help` : 'What manual page do you want?\nFor example, try \'man man\'.');

      case 'python':
      case 'python3':
        return txt('Python 3.13.5 (main) [GCC 14.2.0] on linux\n>>> exit()\n(interactive Python is not available in this browser VM)');

      default:
        return {
          out: (
            <div>
              <span className={RED}>zsh: command not found: {cmd}</span>
              <span className={DIM}>   (type </span>
              <button className={`${GREEN} hover:underline`} onClick={() => runRef.current('help')}>help</button>
              <span className={DIM}>)</span>
            </div>
          ),
        };
    }
  };

  const isWritable = (path) => path.slice(0, HOME.length).join('/') === HOME.join('/') || path[0] === 'tmp';

  const writeFile = (path, text, append) => {
    const parent = path.slice(0, -1);
    const name = path[path.length - 1];
    const parentNode = getNode(fsRef.current, parent);
    if (!parentNode || parentNode.type !== 'dir') return `zsh: no such file or directory: ${displayPath(path)}`;
    if (!isWritable(parent)) return `zsh: permission denied: ${displayPath(path)}`;
    const old = parentNode.children[name];
    if (old && old.type !== 'file') return `zsh: is a directory: ${displayPath(path)}`;
    os.updateFs(parent, (n) => ({
      ...n,
      children: { ...n.children, [name]: { type: 'file', content: (append && old ? old.content : '') + text } },
    }));
    return null;
  };

  const run = (line) => {
    const promptPath = displayPath(cwdRef.current);
    const trimmed = line.trim();
    if (trimmed) setHistory((h) => [...h, trimmed]);
    setHistIdx(-1);
    if (!trimmed) {
      push({ path: promptPath, cmd: '' });
      return;
    }
    let cwdNow = cwdRef.current;
    const outs = [];
    let clear = false;
    for (const part of trimmed.split('&&')) {
      const argv = tokenize(part);
      if (!argv.length) continue;
      const res = exec(argv, cwdNow, part);
      if (res.cwd) cwdNow = res.cwd;
      if (res.clear) { clear = true; outs.length = 0; }
      if (res.out) outs.push(res.out);
      if (res.stop) break;
    }
    cwdRef.current = cwdNow;
    setCwd(cwdNow);
    const out = outs.length ? <div className="space-y-1">{outs.map((o, i) => <div key={i}>{o}</div>)}</div> : null;
    if (clear) {
      setEntries(out ? [{ id: idRef.current++, out }] : []);
      return;
    }
    push({ path: promptPath, cmd: line, out });
  };
  runRef.current = run;

  // ---------------------------- effects ---------------------------
  const started = useRef(false);
  useEffect(() => {
    if (initialCommand && !started.current) {
      started.current = true;
      runRef.current(initialCommand);
    }
  }, [initialCommand]);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [entries]);

  useEffect(() => {
    if (active && !mobile) inputRef.current?.focus({ preventScroll: true });
  }, [active, mobile]);

  // ------------------------ input handling ------------------------
  const complete = () => {
    const parts = input.split(' ');
    const last = parts[parts.length - 1];
    if (parts.length === 1) {
      const m = Object.keys(COMMANDS).filter((c) => c.startsWith(last));
      if (m.length === 1) setInput(m[0] + ' ');
      else if (m.length > 1) {
        const p = commonPrefix(m);
        if (p.length > last.length) setInput(p);
        else push({ path: displayPath(cwdRef.current), cmd: input, out: <div className="flex flex-wrap gap-x-6">{m.map((c) => <span key={c}>{c}</span>)}</div> });
      }
      return;
    }
    const slash = last.lastIndexOf('/');
    const dirPart = slash >= 0 ? last.slice(0, slash + 1) : '';
    const base = last.slice(slash + 1);
    const dirPath = dirPart ? resolvePath(cwdRef.current, dirPart) : cwdRef.current;
    const node = getNode(fsRef.current, dirPath);
    const m = listDir(node, base.startsWith('.')).filter(([n]) => n.startsWith(base));
    if (m.length === 1) {
      const [name, n] = m[0];
      parts[parts.length - 1] = dirPart + name + (n.type === 'dir' ? '/' : ' ');
      setInput(parts.join(' '));
    } else if (m.length > 1) {
      const p = commonPrefix(m.map(([n]) => n));
      if (p.length > base.length) {
        parts[parts.length - 1] = dirPart + p;
        setInput(parts.join(' '));
      } else {
        push({
          path: displayPath(cwdRef.current),
          cmd: input,
          out: <div className="flex flex-wrap gap-x-6">{m.map(([name, n]) => <span key={name} className={n.type === 'dir' ? `${BLUE} font-bold` : ''}>{name}{n.type === 'dir' ? '/' : ''}</span>)}</div>,
        });
      }
    }
  };

  const histNav = (dir) => {
    if (!history.length) return;
    if (dir === 'up') {
      const i = histIdx === -1 ? history.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(i);
      setInput(history[i]);
    } else {
      if (histIdx === -1) return;
      if (histIdx >= history.length - 1) {
        setHistIdx(-1);
        setInput('');
      } else {
        setHistIdx(histIdx + 1);
        setInput(history[histIdx + 1]);
      }
    }
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const v = input;
      setInput('');
      run(v);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      histNav('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      histNav('down');
    } else if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      setEntries([]);
    } else if (e.ctrlKey && e.key.toLowerCase() === 'c') {
      if (window.getSelection()?.toString()) return;
      e.preventDefault();
      push({ path: displayPath(cwdRef.current), cmd: input + '^C' });
      setInput('');
    }
  };

  const focusInput = () => {
    if (window.getSelection()?.toString()) return;
    inputRef.current?.focus({ preventScroll: true });
  };

  const promptPath = displayPath(cwd);

  return (
    <div className="h-full flex flex-col bg-[#14161d] text-[#e6e6e6] font-mono text-[13px] md:text-[14px] leading-[1.45]" onMouseUp={focusInput}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-2 kali-scroll">
        {entries.map((e) =>
          e.banner ? (
            <div key={e.id} className="mb-3">
              <pre className={`${BLUE} font-bold text-[9px] sm:text-[12px] leading-[1.25] mb-2`}>{BANNER}</pre>
              <div>Welcome to {CONFIG.osName}, <span className="font-bold">{CONFIG.user}</span>.</div>
              <div className={DIM}>
                Type <button className={`${GREEN} hover:underline`} onClick={() => runRef.current('help')}>help</button> for commands,{' '}
                <button className={`${GREEN} hover:underline`} onClick={() => runRef.current('ls')}>ls</button> to look around, or{' '}
                <button className={`${GREEN} hover:underline`} onClick={() => runRef.current('cat about.txt')}>cat about.txt</button>.
                {mobile ? ' Tap any file name in a listing to open it.' : ' You can also double-click the files on the desktop.'}
              </div>
              {!mobile && (
                <div className={DIM}>
                  This terminal is a fast simulation. For a <span className="text-white font-bold">real</span> Kali Linux running in your browser, type{' '}
                  <button className={`${GREEN} hover:underline`} onClick={() => runRef.current('kali-vm')}>kali-vm</button>.
                </div>
              )}
            </div>
          ) : (
            <div key={e.id} className="mb-1.5">
              {e.path !== undefined && (
                <>
                  <Prompt path={e.path} />
                  <div className="whitespace-pre-wrap break-all"><PromptTail />{e.cmd}</div>
                </>
              )}
              {e.out && <div className="mt-0.5">{e.out}</div>}
            </div>
          ),
        )}

        <Prompt path={promptPath} />
        <div className="flex items-center">
          <span className="whitespace-pre"><PromptTail /></span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            className="flex-1 min-w-0 bg-transparent outline-none border-0 p-0 text-white caret-[#e6e6e6] font-mono"
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            autoCorrect="off"
            aria-label="Terminal input"
          />
        </div>
        <div className="h-4" />
      </div>

      {mobile && (
        <div className="shrink-0 flex justify-around items-center gap-2 bg-[#1e2129] border-t border-[#2f3340] px-2 py-2">
          <button onClick={complete} className="px-4 py-2 rounded bg-[#2d313c] text-xs font-bold">TAB</button>
          <button onClick={() => histNav('up')} className="p-2 rounded bg-[#2d313c]"><ArrowUp size={16} /></button>
          <button onClick={() => histNav('down')} className="p-2 rounded bg-[#2d313c]"><ArrowDown size={16} /></button>
          <button onClick={() => run('ls')} className="px-3 py-2 rounded bg-[#2d313c] text-xs font-bold">ls</button>
          <button onClick={() => run('help')} className="px-3 py-2 rounded bg-[#2d313c] text-xs font-bold">help</button>
          <button onClick={() => setInput('')} className="px-3 py-2 rounded bg-[#5a2328] text-xs font-bold text-red-200">ESC</button>
        </div>
      )}
    </div>
  );
}
