import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Home, HardDrive, Trash2, Monitor, Eye, EyeOff, Folder, ChevronRight } from 'lucide-react';
import { useOS } from '../os/OSContext';
import { HOME, getNode, listDir, absPath, nodeSize } from '../data/fs';
import { NodeIcon } from '../components/Icons';

const PLACES = [
  { label: 'Home', icon: Home, path: HOME },
  { label: 'Desktop', icon: Monitor, path: HOME },
  { label: 'File System', icon: HardDrive, path: [] },
  { label: 'Trash', icon: Trash2, path: [...HOME, '.Trash'] },
];

function human(n) {
  if (n < 1024) return `${n} bytes`;
  return `${(n / 1024).toFixed(1)} KiB`;
}

export default function FileManager({ path: initialPath = HOME, setTitle }) {
  const os = useOS();
  const [path, setPath] = useState(initialPath);
  const [back, setBack] = useState([]);
  const [fwd, setFwd] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [error, setError] = useState(null);

  const node = getNode(os.fs, path);
  const items = listDir(node, hidden);
  const name = path.length ? path[path.length - 1] : 'File System';
  const label = name === '.Trash' ? 'Trash' : name;

  useEffect(() => { setTitle?.(`${label} - File Manager`); }, [label, setTitle]);

  const go = (p) => {
    const n = getNode(os.fs, p);
    if (!n) return;
    if (n.locked) {
      setError(`The folder "${p[p.length - 1]}" cannot be opened: Permission denied.`);
      return;
    }
    setError(null);
    setBack((b) => [...b, path]);
    setFwd([]);
    setPath(p);
    setSelected(null);
  };

  const open = (itemName, n) => {
    const p = [...path, itemName];
    if (n.type === 'dir') go(p);
    else os.openPath(p);
  };

  const sel = selected && node?.children?.[selected];

  return (
    <div className="h-full flex flex-col bg-[#1f2129] text-[#dfe3ea] text-[13px] select-none">
      {/* menubar */}
      <div className="flex gap-4 px-3 h-7 items-center text-[12.5px] text-[#c4c9d3] border-b border-[#2b2e38]">
        {['File', 'Edit', 'View', 'Go', 'Bookmarks', 'Help'].map((m) => <span key={m} className="hover:text-white cursor-default">{m}</span>)}
      </div>
      {/* toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[#2b2e38]">
        <ToolBtn disabled={!back.length} onClick={() => { const b = back[back.length - 1]; setBack(back.slice(0, -1)); setFwd([path, ...fwd]); setPath(b); setSelected(null); }}><ArrowLeft size={16} /></ToolBtn>
        <ToolBtn disabled={!fwd.length} onClick={() => { const f = fwd[0]; setFwd(fwd.slice(1)); setBack([...back, path]); setPath(f); setSelected(null); }}><ArrowRight size={16} /></ToolBtn>
        <ToolBtn disabled={!path.length} onClick={() => go(path.slice(0, -1))}><ArrowUp size={16} /></ToolBtn>
        <ToolBtn onClick={() => go(HOME)}><Home size={16} /></ToolBtn>
        <div className="flex-1 flex items-center gap-0.5 h-7 px-2 mx-1 rounded bg-[#15171d] border border-[#343846] overflow-hidden whitespace-nowrap">
          <button className="hover:text-white text-[#9aa3b2]" onClick={() => go([])}>/</button>
          {path.map((seg, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && <ChevronRight size={12} className="text-[#6b7383]" />}
              <button className="px-1 hover:text-white" onClick={() => go(path.slice(0, i + 1))}>{seg}</button>
            </span>
          ))}
        </div>
        <ToolBtn onClick={() => setHidden((h) => !h)} title={hidden ? 'Hide hidden files' : 'Show hidden files (Ctrl+H)'}>
          {hidden ? <Eye size={16} /> : <EyeOff size={16} />}
        </ToolBtn>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* sidebar */}
        <div className="w-40 shrink-0 border-r border-[#2b2e38] py-2 overflow-y-auto hidden sm:block">
          <div className="px-3 pb-1 text-[11px] uppercase tracking-wide text-[#7b8494]">Places</div>
          {PLACES.map(({ label: l, icon: Icon, path: p }) => {
            const on = absPath(p) === absPath(path) && l !== 'Desktop';
            return (
              <button key={l} onClick={() => go(p)} className={`w-full flex items-center gap-2 px-3 py-1 text-left ${on ? 'bg-[#367bf0] text-white' : 'hover:bg-[#2a2d37]'}`}>
                <Icon size={15} /> {l}
              </button>
            );
          })}
          <div className="px-3 pt-3 pb-1 text-[11px] uppercase tracking-wide text-[#7b8494]">Bookmarks</div>
          <button onClick={() => go([...HOME, 'projects'])} className="w-full flex items-center gap-2 px-3 py-1 text-left hover:bg-[#2a2d37]">
            <Folder size={15} /> projects
          </button>
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto p-3 kali-scroll" onClick={() => setSelected(null)}>
          {error && <div className="mb-3 px-3 py-2 rounded bg-[#4a1f24] text-[#ffb4b4] border border-[#7a2b33]">{error}</div>}
          {items.length === 0 && !error && <div className="text-[#7b8494] p-6 text-center">This folder is empty.</div>}
          <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(108px, 1fr))' }}>
            {items.map(([n, nd]) => (
              <button
                key={n}
                onClick={(e) => { e.stopPropagation(); setSelected(n); }}
                onDoubleClick={() => open(n, nd)}
                onKeyDown={(e) => e.key === 'Enter' && open(n, nd)}
                className={`flex flex-col items-center gap-1 p-2 rounded border ${selected === n ? 'bg-[#367bf0]/30 border-[#367bf0]/70' : 'border-transparent hover:bg-white/5'}`}
              >
                <NodeIcon name={n} node={nd} size={48} />
                <span className={`text-[12px] text-center [overflow-wrap:anywhere] leading-tight ${n.startsWith('.') ? 'opacity-60' : ''}`}>{n}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* status bar */}
      <div className="h-6 px-3 flex items-center text-[11.5px] text-[#9aa3b2] border-t border-[#2b2e38]">
        {sel ? `"${selected}" ${sel.type === 'dir' ? 'folder' : human(nodeSize(sel))}  |  double-click to open` : `${items.length} item${items.length === 1 ? '' : 's'}`}
      </div>
    </div>
  );
}

function ToolBtn({ children, disabled, ...rest }) {
  return (
    <button disabled={disabled} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent" {...rest}>
      {children}
    </button>
  );
}
