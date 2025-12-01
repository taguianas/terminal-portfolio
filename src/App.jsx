import React, { useState, useEffect, useRef } from 'react';

// --- ICONS ---
const Icons = {
  Terminal: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>,
  Minus: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Square: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>,
  X: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>,
  Wifi: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.55a11 11 0 0 1 14.08 0"></path><path d="M1.42 9a16 16 0 0 1 21.16 0"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>,
  Battery: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="18" height="12" rx="2" ry="2"></rect><line x1="23" y1="13" x2="23" y2="11"></line></svg>,
  Volume2: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>,
  ArrowUp: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>,
  ArrowDown: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>,
  CornerDownLeft: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>,
  Star: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>,
  GitBranch: () => <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="3" x2="6" y2="15"></line><circle cx="18" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><path d="M18 9a9 9 0 0 1-9 9"></path></svg>
};

// --- THEMES ---
const THEMES = {
  kali: {
    text: "text-green-500",
    promptUser: "text-green-500",
    promptPath: "text-blue-500",
    selection: "selection:bg-green-900 selection:text-white",
    glow: "drop-shadow-[0_0_3px_rgba(34,197,94,0.5)]"
  },
  ubuntu: {
    text: "text-orange-500",
    promptUser: "text-orange-500",
    promptPath: "text-purple-500",
    selection: "selection:bg-orange-900 selection:text-white",
    glow: "drop-shadow-[0_0_3px_rgba(249,115,22,0.5)]"
  },
  cyber: {
    text: "text-cyan-400",
    promptUser: "text-pink-500",
    promptPath: "text-cyan-400",
    selection: "selection:bg-cyan-900 selection:text-white",
    glow: "drop-shadow-[0_0_3px_rgba(34,211,238,0.5)]"
  }
};

// --- BOOT SEQUENCE TEXT ---
const BOOT_LOGS = [
  "[  OK  ] Started GNOME Display Manager.",
  "[  OK  ] Started Regular Background Processing Daemon.",
  "[  OK  ] Started Power Profiles daemon.",
  "[  OK  ] Reached target Graphical Interface.",
  "         Mounting /home/visitor/portfolio...",
  "[  OK  ] Mounted /home/visitor/portfolio.",
  "         Starting Network Manager...",
  "[  OK  ] Connected to wlan0.",
  "         Loading kernel modules...",
  "Welcome to Kali GNU/Linux Rolling!"
];

// --- FILE SYSTEM ---
const INITIAL_FILE_SYSTEM = {
  name: "root",
  type: "dir",
  children: {
    home: {
      type: "dir",
      children: {
        visitor: {
          type: "dir",
          children: {
            "about.txt": { 
              type: "file", 
              content: (
                <div className="space-y-2">
                  <p>Hello, friend. Welcome to the shadows.</p>
                  <p>I am <span className="font-bold">Anas Tagui</span>, a <span className="font-bold">Cyber Security Specialist</span> and <span className="font-bold">Full Stack Developer</span>.</p>
                    <p>Currently in my fourth year of engineering studies, I am actively seeking a work-study program. With a deep interest in technical challenges in cybersecurity and networks, I am determined to contribute to the security of your projects.</p>
                </div>
              )
            },
            "skills.md": {
              type: "file",
              content: (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-bold underline mb-2 opacity-80">LANGUAGES</h3>
                    <ul className="list-disc list-inside">
                      <li>Python / Bash</li>
                      <li>JavaScript / React</li>
                      <li>C / C++</li>
                      <li>HTML / Tailwind CSS</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-bold underline mb-2 opacity-80">TOOLS</h3>
                    <ul className="list-disc list-inside">
                      <li>Metasploit / Burp Suite</li>
                      <li>Docker / K8s</li>
                      <li>Wireshark</li>
                    </ul>
                  </div>
                </div>
              )
            },
            // --- ADDED EDUCATION ---
            "education.txt": {
              type: "file",
              content: (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-yellow-400">ESAIP, Angers, France</h3>
                    <div className="text-sm text-gray-400">Computer Engineering Program • 2024 - 2027 (ongoing)</div>
                    <p className="text-sm mt-1">Specialization in Cybersecurity and Networks.</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-yellow-400">Politechnika Warszawska, Warsaw, Poland</h3>
                    <div className="text-sm text-gray-400">University Exchange • February 2025 - July 2025</div>
                    <p className="text-sm mt-1">Focus on Software Engineering, Cryptography, Databases, Computer Networks, and Operating Systems.</p>
                  </div>
                </div>
              )
            },
            // --- ADDED VOLUNTEERING ---
            "volunteering.txt": {
              type: "file",
              content: (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-bold text-green-400">Snooker Shoot-Out App</h3>
                    <div className="text-sm text-gray-400">Web Application - Snooker Shoot-Out</div>
                    <p className="text-sm mt-1">Development of a web application in React.js for a snooker club (affiliated with FFB)</p>
                    <p className="text-sm mt-1">to manage "Shoot-Out" tournaments. The tool manages the match timer and shot clock, score, </p>
                    <p className="text-sm mt-1">and fouls in real-time with a dynamic interface.</p>
                    <a href="https://shootoutangers.netlify.app/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline block mt-2 w-fit">[View the application]</a>
                  </div>
                  <div>
                    <h3 className="font-bold text-green-400">Cop1 Angers</h3>
                    <div className="text-sm text-gray-400">Food Distribution Volunteer • September 2024 - Present</div>
                    <p className="text-sm mt-1">Active participation in food distribution operations for the association Cop1 - Student Solidarity in Angers.</p>
                    <p className="text-sm mt-1">Assistance with logistics, welcoming, and distributing food supplies to students.</p>
                  </div>
                </div>
              )
            },
            "contact.info": {
              type: "file",
              content: (
                 <div className="space-y-2">
                    <p>Secure Comm Channels:</p>
                    <p>Email: <a href="mailto:atagui.ir2027@esaip.org" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline cursor-pointer hover:opacity-80">atagui.ir2027@esaip.org</a></p>
                    <p>Linkedin: <a href="https://www.linkedin.com/in/anas-tagui-7b0599241/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline cursor-pointer hover:opacity-80">MyLinkedin</a></p>
                    <p>Github: <a href="https://www.https://github.com/taguianas" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline cursor-pointer hover:opacity-80">MyGithub</a></p>
                    <p>PGP: <span className="opacity-50">0x4D3F...A219</span></p>
                 </div>
              )
            },
            projects: {
              type: "dir",
              children: {
                "SecureCrypt.txt": {
                  type: "file",
                  content: (
                    <div className="border-l-2 border-current pl-4 opacity-90">
                      <h3 className="font-bold">SecureCrypt - End-to-End Encryption Platform</h3>
                      <p className="text-sm opacity-70">MERN Stack (MongoDB, Express, React, Node.js), Tailwind CSS, Native Crypto Module</p>
                      <p>A full-stack web application enabling secure text encryption, decryption, and digital signing directly from the browser. It implements industry-standard cryptographic algorithms (AES-GCM & RSA-OAEP) to demonstrate secure data handling and authenticity verification.</p>
                      <a href="https://github.com/taguianas/encryption-app" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline block mt-2 w-fit">[GitHub Repo]</a>
                    </div>
                  )
                },
                "portfolio.jsx": {
                  type: "file",
                  content: (
                    <div className="border-l-2 border-current pl-4 opacity-90">
                       <h3 className="font-bold">Terminal Portfolio (This Site)</h3>
                       <p className="text-sm opacity-70">React, Tailwind, Vite</p>
                       <p className="mb-2">A fully interactive terminal simulator built with modern web technologies. Features a virtual file system, command parser, and themes.</p>
                       <a href="https://github.com/taguianas/terminal-portfolio" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline block mt-2 w-fit">[GitHub Repo]</a>
                    </div>
                  )
                }
              }
            }
          }
        }
      }
    }
  }
};

const COMMANDS = {
  help: "Show available commands",
  ls: "List directory contents",
  cd: "Change directory (usage: cd <folder>)",
  cat: "Read file (usage: cat <file>)",
  pwd: "Print working directory",
  clear: "Clear the terminal screen",
  mkdir: "Create a directory",
  touch: "Create a file",
  theme: "Change color (usage: theme <kali|ubuntu|cyber>)",
  fetch: "Display system information",
  github: "Fetch live GitHub repos (usage: github <username>)",
  weather: "Fetch live weather (usage: weather <city>)",
  resume: "Download resume",
  matrix: "Enter the Matrix",
  whoami: "Display current user"
};

// --- WIDGETS ---

const GitHubWidget = ({ username }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=5`);
        if (!response.ok) throw new Error('User not found or API limit reached');
        const repos = await response.json();
        setData(repos);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRepos();
  }, [username]);

  if (loading) return <div className="animate-pulse">Connecting to GitHub API... [====================]</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col space-y-2 text-sm">
      <div className="text-gray-400 mb-2">Top 5 Recently Updated Repositories for <span className="text-white font-bold">{username}</span>:</div>
      {data.map(repo => (
        <div key={repo.id} className="border-b border-gray-800 pb-1 mb-1">
          <div className="flex items-center justify-between">
            <a href={repo.html_url} target="_blank" rel="noreferrer" className="font-bold hover:underline text-blue-400">
              {repo.name}
            </a>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center text-yellow-400"><Icons.Star /> {repo.stargazers_count}</span>
              <span className="flex items-center text-purple-400"><Icons.GitBranch /> {repo.forks_count}</span>
            </div>
          </div>
          <div className="text-gray-500 text-xs">{repo.description || "No description available."}</div>
          <div className="text-gray-600 text-xs mt-1">{repo.language && <span className="border border-gray-700 px-1 rounded">{repo.language}</span>}</div>
        </div>
      ))}
    </div>
  );
};

const WeatherWidget = ({ city }) => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`https://wttr.in/${city}?0AT`)
      .then(res => res.text())
      .then(text => {
        setWeather(text);
        setLoading(false);
      })
      .catch(() => {
        setWeather("Error fetching weather.");
        setLoading(false);
      });
  }, [city]);

  if (loading) return <div className="animate-pulse">Accessing meteorological satellite...</div>;

  return (
    <pre className="text-xs leading-tight opacity-90 overflow-x-auto">
      {weather}
    </pre>
  );
};

// --- EFFECTS ---
const MatrixEffect = ({ onExit }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブヅプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
    const latin = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const nums = '0123456789';
    const alphabet = katakana + latin + nums;

    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0F0';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975)
          drops[i] = 0;
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 cursor-pointer" onClick={onExit}>
      <canvas ref={canvasRef} className="block w-full h-full bg-black" />
      <div className="absolute top-4 right-4 text-green-500 font-bold bg-black/50 p-2 rounded">
        Press any key to exit
      </div>
    </div>
  );
};

const CrashScreen = () => (
  <div className="fixed inset-0 bg-black text-red-600 font-mono p-4 z-[100] overflow-hidden select-none">
    <div className="animate-pulse">
      <h1 className="text-4xl font-bold mb-4 bg-red-600 text-black inline-block px-2">KERNEL PANIC</h1>
      <p className="mb-2">CRITICAL SYSTEM ERROR: root filesystem missing or corrupted.</p>
      <p>init[1]: segfault at 000000000000 ip 000000000000 sp 000000000000 error 4</p>
      <p>Kernel offset: disabled</p>
      <p>Rebooting in 5 seconds...</p>
      <div className="mt-8 text-sm opacity-50">
        {Array(20).fill(0).map((_, i) => (
          <div key={i}>0x{Math.random().toString(16).substring(2, 14).toUpperCase()}  0x{Math.random().toString(16).substring(2, 14).toUpperCase()} ...</div>
        ))}
      </div>
    </div>
  </div>
);

const BootScreen = ({ onComplete }) => {
  const [lines, setLines] = useState([]);
  useEffect(() => {
    let delay = 0;
    BOOT_LOGS.forEach((log, index) => {
      delay += Math.random() * 300 + 100;
      setTimeout(() => {
        setLines(prev => [...prev, log]);
        window.scrollTo(0, document.body.scrollHeight);
        if (index === BOOT_LOGS.length - 1) {
          setTimeout(onComplete, 800);
        }
      }, delay);
    });
  }, [onComplete]);

  return (
    <div className="h-screen w-full bg-black text-gray-400 font-mono p-4 text-sm md:text-base overflow-hidden">
      {lines.map((line, i) => (
        <div key={i}>
          {line.includes("[  OK  ]") ? (
            <span>[ <span className="text-green-500 font-bold"> OK </span> ] {line.replace("[  OK  ] ", "")}</span>
          ) : line}
        </div>
      ))}
      <div className="animate-pulse">_</div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [booting, setBooting] = useState(!sessionStorage.getItem('hasBooted'));
  const [theme, setTheme] = useState('kali');
  const [matrixMode, setMatrixMode] = useState(false);
  const [crashed, setCrashed] = useState(false);
  
  const [history, setHistory] = useState([
    {
      command: 'welcome',
      path: '~/',
      output: (
        <div className="mb-4">
           <pre className="text-[10px] md:text-sm font-mono font-bold leading-none mb-4 opacity-80 whitespace-pre-wrap">
{`
    _    _   _    _    ____ 
   / \\  | \\ | |  / \\  / ___|
  / _ \\ |  \\| | / _ \\ \\___ \\
 / ___ \\| |\\  |/ ___ \\ ___) |
/_/   \\_\\_| \\_/_/   \\_\\____/
 _____    _    ____ _   _ ___
|_   _|  / \\  / ___| | | |_ _|
  | |   / _ \\ | |  _| | | || |
  | |  / ___ \\| |_| | |_| || |
  |_| /_/   \\_\\____|\\___/|___|
`}
          </pre>
          <div className="opacity-70">System online. File system mounted.</div>
          <div className="opacity-70">Type <span className="font-bold underline cursor-pointer hover:text-white" onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', {'key':'h'}))}>'help'</span> or click TAB to see commands.</div>
        </div>
      )
    }
  ]);
  
  const [fileSystem, setFileSystem] = useState(INITIAL_FILE_SYSTEM);
  const [cwd, setCwd] = useState(['home', 'visitor']);
  const [input, setInput] = useState('');
  const [cursorPos, setCursorPos] = useState(0);
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  const inputRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, booting]);

  const handleTerminalClick = () => inputRef.current?.focus();

  const getNodeAtPath = (pathArray, fs = fileSystem) => {
    let current = fs;
    for (const segment of pathArray) {
      if (current.children && current.children[segment]) {
        current = current.children[segment];
      } else {
        return null;
      }
    }
    return current;
  };

  const resolvePath = (targetPath) => {
    if (!targetPath) return cwd;
    let pathParts = targetPath.split('/').filter(p => p !== '');
    let newPath = [...cwd];
    if (targetPath.startsWith('/')) newPath = [];
    else if (targetPath.startsWith('~')) {
      newPath = ['home', 'visitor'];
      pathParts = pathParts.slice(1);
    }
    for (const part of pathParts) {
      if (part === '.') continue;
      if (part === '..') {
        if (newPath.length > 0) newPath.pop();
      } else {
        newPath.push(part);
      }
    }
    return newPath;
  };

  const updateFileSystem = (fs, path, action) => {
    if (path.length === 0) return action(fs);
    const [head, ...tail] = path;
    const child = fs.children?.[head];
    if (!child) return fs;
    return { ...fs, children: { ...fs.children, [head]: updateFileSystem(child, tail, action) } };
  };

  const executeCommand = (cmdStr) => {
    const trimmed = cmdStr.trim();
    const currentPath = `~/${cwd.slice(2).join('/')}`;

    if (matrixMode) setMatrixMode(false);

    if (!trimmed) {
      setHistory(prev => [...prev, { command: '', path: currentPath, output: null }]);
      return;
    }

    const args = trimmed.split(/\s+/);
    const cmd = args[0].toLowerCase();
    const target = args[1];

    if (cmd === 'rm' && args.includes('-rf') && (args.includes('/') || args.includes('/*'))) {
        setCrashed(true);
        setTimeout(() => window.location.reload(), 5000);
        return;
    }

    let output = null;

    switch (cmd) {
      case 'help':
        output = (
          <div className="text-sm opacity-90 space-y-4">
            <div>
              <div className="font-bold text-yellow-400 mb-2">Usage Instructions:</div>
              <ul className="list-disc list-inside text-gray-300">
                <li>Type a command and press <span className="text-white font-bold">ENTER</span>.</li>
                <li>Click on any <span className="text-blue-400 font-bold">directory</span> to navigate or <span className="text-green-400">file</span> to view it.</li>
                <li>Use <span className="text-white font-bold">TAB</span> for autocomplete.</li>
                <li>Use <span className="text-white font-bold">UP/DOWN</span> arrows for command history.</li>
              </ul>
            </div>

            <div>
              <div className="font-bold text-blue-400 mb-1">--- Essential Commands ---</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex"><span className="font-bold w-20">ls</span><span>- List directory contents</span></div>
                <div className="flex"><span className="font-bold w-20">cd</span><span>- Change directory (cd projects)</span></div>
                <div className="flex"><span className="font-bold w-20">cat</span><span>- Read file (cat about.txt)</span></div>
                <div className="flex"><span className="font-bold w-20">help</span><span>- Show this help message</span></div>
              </div>
            </div>

            <div>
              <div className="font-bold text-purple-400 mb-1">--- Integrations & Fun ---</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="flex"><span className="font-bold w-20">resume</span><span>- Download resume</span></div>
                <div className="flex"><span className="font-bold w-20">github</span><span>- Fetch GitHub repos</span></div>
                <div className="flex"><span className="font-bold w-20">fetch</span><span>- System info</span></div>
                <div className="flex"><span className="font-bold w-20">weather</span><span>- Fetch weather data</span></div>
                <div className="flex"><span className="font-bold w-20">theme</span><span>- Change theme</span></div>
                <div className="flex"><span className="font-bold w-20">matrix</span><span>- Enter the Matrix</span></div>
              </div>
            </div>

            <div>
              <div className="font-bold text-gray-500 mb-1">--- System ---</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-gray-400">
                <div className="flex"><span className="font-bold w-20">pwd</span><span>- Print working directory</span></div>
                <div className="flex"><span className="font-bold w-20">whoami</span><span>- Current user</span></div>
                <div className="flex"><span className="font-bold w-20">clear</span><span>- Clear screen</span></div>
                <div className="flex"><span className="font-bold w-20">mkdir</span><span>- Create directory</span></div>
                <div className="flex"><span className="font-bold w-20">touch</span><span>- Create file</span></div>
              </div>
            </div>
          </div>
        );
        break;
      case 'ls': {
        const targetNode = target ? getNodeAtPath(resolvePath(target)) : getNodeAtPath(cwd);
        if (!targetNode || targetNode.type !== 'dir') output = <span className="text-red-400">ls: cannot access '{target || ''}': No such file or directory</span>;
        else {
          output = (
            <div className="flex flex-wrap gap-4">
              {Object.entries(targetNode.children).map(([name, node]) => (
                <span 
                  key={name} 
                  onClick={() => {
                    // CLICKABLE LS LOGIC
                    if (node.type === 'dir') {
                      // Trigger cd command manually
                      if(node.type === 'dir') {
                         executeCommand(`cd ${name}`);
                      } 
                    } else {
                         executeCommand(`cat ${name}`);
                    }
                  }}
                  className={`${node.type === 'dir' ? 'font-bold text-blue-400' : 'text-green-400'} cursor-pointer hover:underline`}
                >
                  {name}{node.type === 'dir' ? '/' : ''}
                </span>
              ))}
            </div>
          );
        }
        break;
      }
      case 'cd': {
        if (!target) setCwd(['home', 'visitor']);
        else {
            const newPath = resolvePath(target);
            const targetNode = getNodeAtPath(newPath);
            if (targetNode && targetNode.type === 'dir') setCwd(newPath);
            else output = <span className="text-red-400">cd: {target}: No such file or directory</span>;
        }
        break;
      }
      case 'pwd':
        output = '/' + cwd.join('/');
        break;
      case 'cat': {
        if (!target) output = "Usage: cat <filename>";
        else {
            const filePath = resolvePath(target);
            const fileNode = getNodeAtPath(filePath);
            if (fileNode && fileNode.type === 'file') output = fileNode.content;
            else if (fileNode && fileNode.type === 'dir') output = <span className="text-red-400">cat: {target}: Is a directory</span>;
            else output = <span className="text-red-400">cat: {target}: No such file or directory</span>;
        }
        break;
      }
      case 'mkdir': {
        if (!target) output = "Usage: mkdir <directory_name>";
        else {
            const parentNode = getNodeAtPath(cwd);
            if (parentNode.children[target]) output = <span className="text-red-400">mkdir: cannot create directory '{target}': File exists</span>;
            else {
                setFileSystem(prev => updateFileSystem(prev, cwd, (node) => ({ ...node, children: { ...node.children, [target]: { type: 'dir', children: {} } } })));
                output = <span className="opacity-50">Directory '{target}' created.</span>;
            }
        }
        break;
      }
      case 'touch': {
        if (!target) output = "Usage: touch <filename>";
        else {
             setFileSystem(prev => updateFileSystem(prev, cwd, (node) => ({ ...node, children: { ...node.children, [target]: { type: 'file', content: "Empty file." } } })));
             output = <span className="opacity-50">File '{target}' created.</span>;
        }
        break;
      }
      case 'theme':
        if (THEMES[target]) {
            setTheme(target);
            output = `Theme changed to ${target}.`;
        } else output = <div><div>Usage: theme &lt;name&gt;</div><div>Available themes: {Object.keys(THEMES).join(', ')}</div></div>;
        break;
      case 'fetch':
        output = (
            <div className="flex gap-4">
                <pre className="text-xs md:text-sm font-bold leading-none hidden sm:block opacity-80">
{`
      ___
     (.. \\ 
     (<> |
    //  \\ \\
   ( |  | /|
  _/\\ __)/_)
  \\/-____\\/
`}
                </pre>
                <div className="text-sm">
                    <div><span className="font-bold text-blue-400">OS:</span> Kali Anas'Portfolio v1.0</div>
                    <div><span className="font-bold text-blue-400">Host:</span> React-Shell</div>
                    <div><span className="font-bold text-blue-400">Kernel:</span> Web 5.0</div>
                    <div><span className="font-bold text-blue-400">Uptime:</span> Forever</div>
                    <div><span className="font-bold text-blue-400">Shell:</span> ZSH (Simulated)</div>
                    <div><span className="font-bold text-blue-400">Theme:</span> {theme}</div>
                </div>
            </div>
        );
        break;
      case 'resume': {
        output = <span className="text-green-400">Downloading resume.pdf...</span>;
        // Check if resume exists in public folder by trying to fetch it
        // If not found, use the fallback text file approach
        const downloadResume = async () => {
            const link = document.createElement('a');
            link.href = '/resume.pdf';
            link.download = 'Anas_Tagui_Resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };
        downloadResume();
        break;
      }
      case 'matrix':
        setMatrixMode(true);
        break;
      case 'whoami':
        output = "visitor";
        break;
      case 'sudo':
      case 'su':
        if (target === 'root') output = <span className="text-red-500 font-bold">Permission denied: You are not authorized to be root. Nice try though.</span>;
        else if (!target) output = "Usage: sudo <command> | su <user>";
        else output = <span className="text-red-500">visitor is not in the sudoers file. This incident will be reported.</span>;
        break;
      case 'github':
        if (!target) output = "Usage: github <username>";
        else output = <GitHubWidget username={target} />;
        break;
      case 'weather':
        if (!target) output = "Usage: weather <city>";
        else output = <WeatherWidget city={target} />;
        break;
      case 'clear':
        setHistory([]);
        return; 
      default:
        output = <span className="text-red-400">Command not found: {cmd}. Type 'help' for available commands.</span>;
    }

    setHistory(prev => [...prev, { command: cmdStr, path: currentPath, output }]);
  };

  const handleAutocomplete = () => {
    if (!input.includes(' ')) {
        const cmdMatch = Object.keys(COMMANDS).find(c => c.startsWith(input.trim().toLowerCase()));
        if (cmdMatch) {
            setInput(cmdMatch + ' ');
            setCursorPos(cmdMatch.length + 1);
        }
        return;
    }
    const parts = input.split(' ');
    const lastPart = parts[parts.length - 1];
    const currentDirNode = getNodeAtPath(cwd);
    if (currentDirNode && currentDirNode.children) {
        const fileMatch = Object.keys(currentDirNode.children).find(f => f.startsWith(lastPart));
        if (fileMatch) {
           parts[parts.length - 1] = fileMatch;
           const newInput = parts.join(' ');
           setInput(newInput);
           setCursorPos(newInput.length);
        }
    }
  };

  const handleHistoryNav = (direction) => {
    if (direction === 'up') {
        if (commandHistory.length > 0) {
            const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
            setHistoryIndex(newIndex);
            const historyCmd = commandHistory[newIndex];
            setInput(historyCmd);
            setCursorPos(historyCmd.length);
        }
    } else {
        if (historyIndex !== -1) {
            const newIndex = Math.min(commandHistory.length - 1, historyIndex + 1);
            if (historyIndex === commandHistory.length - 1) {
                setHistoryIndex(-1);
                setInput('');
                setCursorPos(0);
            } else {
                setHistoryIndex(newIndex);
                const historyCmd = commandHistory[newIndex];
                setInput(historyCmd);
                setCursorPos(historyCmd.length);
            }
        }
    }
  };

  const handleKeyDown = (e) => {
    if (matrixMode) {
        setMatrixMode(false);
        e.preventDefault();
        return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      setCommandHistory(prev => [...prev, input]);
      setHistoryIndex(-1);
      executeCommand(input);
      setInput('');
      setCursorPos(0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      handleHistoryNav('up');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      handleHistoryNav('down');
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleAutocomplete();
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    setCursorPos(e.target.selectionStart);
  };

  const handleInputSelect = (e) => setCursorPos(e.target.selectionStart);

  useEffect(() => { inputRef.current?.focus(); }, [booting, matrixMode, crashed]);

  if (crashed) return <CrashScreen />;
  
  if (booting) {
    return <BootScreen onComplete={() => {
        setBooting(false);
        sessionStorage.setItem('hasBooted', 'true');
    }} />;
  }

  const currentTheme = THEMES[theme];

  return (
    <div 
      className={`h-[100dvh] bg-gray-900 ${currentTheme.text} font-mono overflow-hidden relative ${currentTheme.selection}`} 
      onClick={handleTerminalClick}
    >
      <div 
        className="absolute inset-0 z-0 opacity-20 pointer-events-none"
        style={{
            backgroundImage: `url('https://www.transparenttextures.com/patterns/carbon-fibre.png')`,
            backgroundColor: '#0d1117'
        }}
      />
      <div className="fixed inset-0 pointer-events-none z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] pointer-events-none" />

      {matrixMode && <MatrixEffect onExit={() => setMatrixMode(false)} />}

      <div className={`w-full h-full bg-black/90 flex flex-col relative z-10 overflow-hidden backdrop-blur-sm ${currentTheme.glow}`}>
        
        <div className="h-8 bg-gray-800 flex items-center justify-between px-3 border-b border-gray-700 select-none">
          <div className="flex items-center space-x-2 text-gray-400">
            <Icons.Terminal />
            <span className="text-xs font-bold text-gray-200">visitor@anas:~/{cwd.slice(2).join('/')}</span>
          </div>
          <div className="flex items-center space-x-3">
             <div className="hidden sm:flex space-x-3 mr-4 text-gray-500">
                <Icons.Volume2 />
                <Icons.Wifi />
                <Icons.Battery />
                <span className="text-xs">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
             </div>
             <div className="flex space-x-2">
                <Icons.Minus />
                <Icons.Square />
                <div className="hover:text-red-500 cursor-pointer"><Icons.X /></div>
             </div>
          </div>
        </div>

        <div 
          className="flex-1 p-2 md:p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent text-sm md:text-base mb-12 md:mb-0"
          ref={scrollRef}
        >
          {history.map((entry, index) => (
            <div key={index} className="mb-2 break-words">
              {entry.command && (
                 <div className="flex flex-wrap items-center gap-x-2">
                    <div className="flex whitespace-nowrap">
                        <span className={currentTheme.promptPath}>┌──(</span>
                        <span className={`${currentTheme.promptUser} font-bold`}>visitor㉿anas</span>
                        <span className={currentTheme.promptPath}>)-[</span>
                        <span className="text-white">{entry.path || `~/${cwd.slice(2).join('/')}`}</span>
                        <span className={currentTheme.promptPath}>]</span>
                    </div>
                    <div className="flex w-full sm:w-auto">
                         <span className={`${currentTheme.promptPath} mr-2`}>└─$</span>
                         <span className="text-white">{entry.command}</span>
                    </div>
                 </div>
              )}
              {entry.output && (
                <div className="mt-1 ml-2 opacity-90">
                  {entry.output}
                </div>
              )}
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-x-2 mt-2 relative">
            <div className="flex whitespace-nowrap">
                <span className={currentTheme.promptPath}>┌──(</span>
                <span className={`${currentTheme.promptUser} font-bold`}>visitor㉿anas</span>
                <span className={currentTheme.promptPath}>)-[</span>
                <span className="text-white">{`~/${cwd.slice(2).join('/')}`}</span>
                <span className={currentTheme.promptPath}>]</span>
            </div>
            <div className="flex flex-1 items-center min-w-[100px] relative">
                <span className={`${currentTheme.promptPath} mr-2`}>└─$</span>
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onSelect={handleInputSelect}
                    className="absolute inset-0 opacity-0 cursor-none z-20 w-full"
                    autoFocus
                    autoComplete="off"
                    spellCheck="false"
                />
                <div className="flex whitespace-pre z-10 font-mono text-white">
                    <span>{input.slice(0, cursorPos)}</span>
                    <span className="bg-gray-200 text-black animate-pulse -ml-[0.5px]">{input[cursorPos] || '\u00A0'}</span>
                    <span>{input.slice(cursorPos + 1)}</span>
                </div>
            </div>
          </div>
          <div className="h-8" />
        </div>

        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 p-2 flex justify-around items-center z-50">
           <button onClick={handleAutocomplete} className="px-4 py-2 bg-gray-700 rounded text-xs font-bold active:bg-gray-600 text-gray-200">TAB</button>
           <button onClick={() => handleHistoryNav('up')} className="p-2 bg-gray-700 rounded active:bg-gray-600 text-gray-200"><Icons.ArrowUp /></button>
           <button onClick={() => handleHistoryNav('down')} className="p-2 bg-gray-700 rounded active:bg-gray-600 text-gray-200"><Icons.ArrowDown /></button>
           <button onClick={() => setInput('')} className="px-4 py-2 bg-red-900/50 rounded text-xs font-bold active:bg-red-900 text-red-200">ESC</button>
        </div>
      </div>
    </div>
  );
}