import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { TerminalSquare, FolderOpen, FilePlus, Info } from 'lucide-react';
import { OSContext } from './OSContext';
import Window, { PANEL_H } from './Window';
import Panel from './Panel';
import AppMenu, { buildMenu } from './AppMenu';
import { APPS } from '../apps';
import { HOME, getNode, listDir } from '../data/fs';
import { NodeIcon, DriveIcon, HomeIcon, TrashIcon, TerminalAppIcon, KaliVMIcon } from '../components/Icons';
import { wallpaperStyle } from './wallpaper';

export default function Desktop({ base }) {
  const [wins, setWins] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [workspace, setWorkspaceState] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [ctxMenu, setCtxMenu] = useState(null);
  const zRef = useRef(10);
  const idRef = useRef(1);
  const wsRef = useRef(1);
  const fsRef = useRef(base.fs);
  fsRef.current = base.fs;
  const titleSetters = useRef({});

  // ------------------------- window manager -------------------------
  const winsRef = useRef([]);
  winsRef.current = wins;

  const openApp = useCallback((app, props = {}, geom = {}) => {
    const def = APPS[app];
    if (def.single) {
      const existing = winsRef.current.find((w) => w.app === app);
      if (existing) {
        const z = ++zRef.current;
        setWins((ws) => ws.map((w) => (w.id === existing.id ? { ...w, z, minimized: false, ws: wsRef.current } : w)));
        setActiveId(existing.id);
        return existing.id;
      }
    }
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const w = Math.min(geom.w ?? def.size[0], vw - 24);
    const h = Math.min(geom.h ?? def.size[1], vh - PANEL_H - 24);
    const id = idRef.current++;
    const n = (id % 6) - 3;
    const x = geom.x ?? Math.max(8, Math.round((vw - w) / 2) + n * 28);
    const y = geom.y ?? Math.max(PANEL_H + 8, Math.round((vh - PANEL_H - h) / 2) + PANEL_H + n * 22);
    const z = ++zRef.current;
    setWins((ws) => [...ws, { id, app, props, title: def.title, x, y, w, h, z, minimized: false, maximized: false, ws: wsRef.current }]);
    setActiveId(id);
    return id;
  }, []);

  const openUrl = useCallback((url) => openApp('browser', { url }), [openApp]);

  const openPath = useCallback(
    (path) => {
      const node = getNode(fsRef.current, path);
      if (!node) return;
      const name = path[path.length - 1];
      if (node.type === 'dir') openApp('files', { path });
      else if (node.type === 'pdf') openApp('pdf', { src: node.src, name });
      else if (node.type === 'link') openUrl(node.url);
      else openApp('editor', { path });
    },
    [openApp, openUrl],
  );

  const focus = useCallback((id) => {
    setWins((ws) => {
      const w = ws.find((x) => x.id === id);
      if (!w || (w.z === zRef.current && !w.minimized)) return ws;
      const z = ++zRef.current;
      return ws.map((x) => (x.id === id ? { ...x, z, minimized: false } : x));
    });
    setActiveId(id);
  }, []);

  const close = useCallback((id) => {
    setWins((ws) => {
      const rest = ws.filter((w) => w.id !== id);
      const top = rest.filter((w) => !w.minimized && w.ws === wsRef.current).sort((a, b) => b.z - a.z)[0];
      setActiveId(top ? top.id : null);
      return rest;
    });
    delete titleSetters.current[id];
  }, []);

  const update = useCallback((id, patch) => setWins((ws) => ws.map((w) => (w.id === id ? { ...w, ...patch } : w))), []);

  const minimize = (id) => {
    update(id, { minimized: true });
    setActiveId(null);
  };

  const titleSetter = (id) => {
    if (!titleSetters.current[id]) {
      titleSetters.current[id] = (t) => setWins((ws) => ws.map((w) => (w.id === id && w.title !== t ? { ...w, title: t } : w)));
    }
    return titleSetters.current[id];
  };

  const setWorkspace = (n) => {
    wsRef.current = n;
    setWorkspaceState(n);
    setActiveId(null);
  };

  const onTask = (id) => {
    const w = wins.find((x) => x.id === id);
    if (w && id === activeId && !w.minimized) minimize(id);
    else focus(id);
  };

  // -------------------------- OS API for apps ------------------------
  const os = useMemo(() => ({ ...base, openApp, openPath, openUrl, mobile: false }), [base, openApp, openPath, openUrl]);

  const menu = useMemo(
    () =>
      buildMenu({
        app: (a) => openApp(a),
        file: (rel) => openPath([...HOME, ...rel.split('/')]),
        folder: (rel) => openPath([...HOME, rel]),
        url: (u) => openUrl(u),
        cmd: (c) => openApp('terminal', { initialCommand: c }),
      }),
    [openApp, openPath, openUrl],
  );

  // First login: open the README and a terminal.
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (vw >= 1100) {
      const rw = Math.min(620, Math.round(vw * 0.4));
      const rx = vw - rw - 40;
      openApp('editor', { path: [...HOME, 'README.txt'] }, { x: rx, y: PANEL_H + 70, w: rw, h: Math.min(540, vh - 140) });
      openApp('terminal', {}, { x: 200, y: PANEL_H + 40, w: Math.min(780, rx - 224), h: Math.min(480, vh - 120) });
    } else {
      openApp('editor', { path: [...HOME, 'README.txt'] });
    }
  }, [openApp]);

  // Ctrl+Alt+T opens a terminal, like on Kali.
  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 't') {
        e.preventDefault();
        openApp('terminal');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openApp]);

  // --------------------------- desktop icons ------------------------
  const home = getNode(base.fs, HOME);
  const icons = [
    { key: 'fs', label: 'File System', Icon: DriveIcon, open: () => openApp('files', { path: [] }) },
    { key: 'home', label: 'Home', Icon: HomeIcon, open: () => openApp('files', { path: HOME }) },
    { key: 'trash', label: 'Trash', Icon: TrashIcon, open: () => openApp('files', { path: [...HOME, '.Trash'] }) },
    ...listDir(home).map(([name, node]) => ({
      key: name,
      label: name,
      Icon: (p) => <NodeIcon name={name} node={node} {...p} />,
      open: () => openPath([...HOME, name]),
    })),
    { key: 'term', label: 'Terminal', Icon: TerminalAppIcon, open: () => openApp('terminal') },
    { key: 'kalivm', label: 'Kali Linux (real VM)', Icon: KaliVMIcon, open: () => openApp('kalivm') },
  ];

  const visible = wins.filter((w) => w.ws === workspace);

  return (
    <OSContext.Provider value={os}>
      <div
        className="fixed inset-0 overflow-hidden font-ui select-none"
        style={wallpaperStyle}
        onPointerDown={() => { setSelected(null); setCtxMenu(null); }}
        onContextMenu={(e) => {
          if (e.target.closest('[data-window]')) return;
          e.preventDefault();
          setCtxMenu({ x: Math.min(e.clientX, window.innerWidth - 220), y: Math.min(e.clientY, window.innerHeight - 180) });
        }}
      >
        {/* desktop icons */}
        <div
          className="absolute left-2 bottom-2 grid gap-y-1 gap-x-2 content-start"
          style={{ top: PANEL_H + 10, gridAutoFlow: 'column', gridTemplateRows: 'repeat(auto-fill, 92px)', gridAutoColumns: '86px' }}
        >
          {icons.map(({ key, label, Icon, open }) => (
            <button
              key={key}
              onPointerDown={(e) => { e.stopPropagation(); setCtxMenu(null); setSelected(key); }}
              onDoubleClick={open}
              onKeyDown={(e) => e.key === 'Enter' && open()}
              className="w-[86px] h-[90px] flex flex-col items-center gap-1 pt-1.5 rounded outline-none focus-visible:ring-1 focus-visible:ring-[#367bf0]"
              title={`Double-click to open ${label}`}
            >
              <div className={`p-0.5 rounded ${selected === key ? 'bg-[#367bf0]/35' : ''}`}><Icon size={46} /></div>
              <span
                className={`text-[12px] leading-tight text-center text-white px-1 rounded-sm break-all line-clamp-2 ${selected === key ? 'bg-[#367bf0]' : ''}`}
                style={{ textShadow: selected === key ? 'none' : '0 1px 3px rgba(0,0,0,0.95)' }}
              >
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* windows */}
        {visible.map((w) => {
          const def = APPS[w.app];
          const C = def.Component;
          const active = w.id === activeId && !w.minimized;
          return (
            <div key={w.id} data-window onPointerDown={(e) => e.stopPropagation()} onContextMenu={(e) => e.stopPropagation()}>
              <Window
                win={w}
                active={active}
                Icon={def.Icon}
                onFocus={() => focus(w.id)}
                onClose={() => close(w.id)}
                onMinimize={() => minimize(w.id)}
                onToggleMax={() => update(w.id, { maximized: !w.maximized })}
                onChange={(patch) => update(w.id, patch)}
              >
                <C {...w.props} active={active} setTitle={titleSetter(w.id)} onExit={() => close(w.id)} />
              </Window>
            </div>
          );
        })}

        {/* right-click menu */}
        {ctxMenu && (
          <div
            className="absolute w-52 py-1 rounded-md bg-[#22242c] border border-[#363a46] shadow-2xl text-[13px] text-[#dfe3ea]"
            style={{ left: ctxMenu.x, top: ctxMenu.y, zIndex: 100002 }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {[
              [TerminalSquare, 'Open Terminal Here', () => openApp('terminal')],
              [FolderOpen, 'Open in File Manager', () => openApp('files', { path: HOME })],
              [FilePlus, 'Create Document...', () => openApp('terminal', { initialCommand: 'touch new_file.txt && ls' })],
              [Info, 'About this machine', () => openApp('terminal', { initialCommand: 'neofetch' })],
            ].map(([I, l, fn]) => (
              <button key={l} onClick={() => { setCtxMenu(null); fn(); }} className="w-full flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#367bf0] hover:text-white text-left">
                <I size={14} /> {l}
              </button>
            ))}
          </div>
        )}

        <Panel
          windows={wins}
          activeId={activeId}
          workspace={workspace}
          setWorkspace={setWorkspace}
          menuOpen={menuOpen}
          onMenu={() => setMenuOpen((o) => !o)}
          onLaunch={(a) => (a === 'browser' ? openUrl('about:home') : openApp(a))}
          onTask={onTask}
          onPower={base.power}
        />
        {menuOpen && <AppMenu menu={menu} onClose={() => setMenuOpen(false)} onPower={base.power} />}
      </div>
    </OSContext.Provider>
  );
}
