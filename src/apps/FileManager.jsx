import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Home, HardDrive, Trash2, Monitor, Eye, EyeOff, Folder, ChevronRight, LayoutGrid, List, FilePlus, FolderPlus, Pencil, RotateCcw, FolderOpen } from 'lucide-react';
import { useOS } from '../os/OSContext';
import { HOME, getNode, listDir, nodeSize } from '../data/fs';
import { NodeIcon } from '../components/Icons';

const TRASH = [...HOME, '.Trash'];

const PLACES = [
  { label: 'Home', icon: Home, path: HOME },
  { label: 'Desktop', icon: Monitor, path: HOME },
  { label: 'File System', icon: HardDrive, path: [] },
  { label: 'Trash', icon: Trash2, path: TRASH },
];

const BOOKMARKS = [
  { label: 'projects', path: [...HOME, 'projects'] },
  { label: 'labs', path: [...HOME, 'labs'] },
];

function human(n) {
  if (n < 1024) return `${n} bytes`;
  return `${(n / 1024).toFixed(1)} KiB`;
}

const sameStart = (a, b) => b.every((s, i) => a[i] === s);
const isWritable = (p) => sameStart(p, HOME);

export default function FileManager({ path: initialPath = HOME, setTitle }) {
  const os = useOS();
  const [path, setPath] = useState(initialPath);
  const [back, setBack] = useState([]);
  const [fwd, setFwd] = useState([]);
  const [selected, setSelected] = useState(null);
  const [hidden, setHidden] = useState(false);
  const [view, setView] = useState('icons');
  const [error, setError] = useState(null);
  const [menu, setMenu] = useState(null); // { x, y, target? }
  const [editing, setEditing] = useState(null); // { name, value, isNew, isDir }
  const rootRef = useRef(null);
  const editRef = useRef(null);

  const node = getNode(os.fs, path);
  const items = listDir(node, hidden);
  const name = path.length ? path[path.length - 1] : 'File System';
  const label = name === '.Trash' ? 'Trash' : name;
  const writable = isWritable(path);
  const inTrash = sameStart(path, TRASH);
  const sel = selected && node?.children?.[selected];

  useEffect(() => { setTitle?.(`${label} - File Manager`); }, [label, setTitle]);
  useEffect(() => { if (editing) editRef.current?.focus(); }, [editing]);

  // close context menu on outside click / Escape
  useEffect(() => {
    if (!menu) return;
    const close = (e) => { if (!e.target.closest('[data-fm-menu]')) setMenu(null); };
    const esc = (e) => e.key === 'Escape' && setMenu(null);
    window.addEventListener('pointerdown', close);
    window.addEventListener('keydown', esc);
    return () => { window.removeEventListener('pointerdown', close); window.removeEventListener('keydown', esc); };
  }, [menu]);

  const flash = (msg) => { setError(msg); setTimeout(() => setError((e) => (e === msg ? null : e)), 3500); };

  // ----------------------------- navigation -----------------------
  const go = (p) => {
    const n = getNode(os.fs, p);
    if (!n || n.type !== 'dir') return;
    if (n.locked) { flash(`The folder "${p[p.length - 1]}" cannot be opened: Permission denied.`); return; }
    setBack((b) => [...b, path]);
    setFwd([]);
    setPath(p);
    setSelected(null);
    setEditing(null);
  };
  const goBack = () => { if (!back.length) return; const b = back[back.length - 1]; setBack(back.slice(0, -1)); setFwd([path, ...fwd]); setPath(b); setSelected(null); };
  const goFwd = () => { if (!fwd.length) return; const f = fwd[0]; setFwd(fwd.slice(1)); setBack([...back, path]); setPath(f); setSelected(null); };
  const goUp = () => path.length && go(path.slice(0, -1));

  const open = (itemName, n) => {
    if (n.type === 'dir') go([...path, itemName]);
    else os.openPath([...path, itemName]);
  };

  // ----------------------------- fs mutations ---------------------
  const mutateDir = (dirPath, fn) => os.updateFs(dirPath, (d) => ({ ...d, children: fn({ ...d.children }) }));
  const uniqueName = (children, base) => {
    if (!children[base]) return base;
    const dot = base.lastIndexOf('.');
    const stem = dot > 0 ? base.slice(0, dot) : base;
    const ext = dot > 0 ? base.slice(dot) : '';
    let i = 1;
    while (children[`${stem} (${i})${ext}`]) i += 1;
    return `${stem} (${i})${ext}`;
  };

  const startNew = (isDir) => {
    if (!writable) { flash('This folder is read-only.'); return; }
    setMenu(null);
    setEditing({ name: null, value: isDir ? 'New Folder' : 'New File.txt', isNew: true, isDir });
  };
  const startRename = (itemName) => {
    if (!writable) { flash('This folder is read-only.'); return; }
    setMenu(null);
    setEditing({ name: itemName, value: itemName, isNew: false });
  };
  const commitEdit = () => {
    if (!editing) return;
    const value = editing.value.trim();
    if (!value || value.includes('/')) { setEditing(null); return; }
    if (editing.isNew) {
      mutateDir(path, (ch) => {
        const final = uniqueName(ch, value);
        ch[final] = editing.isDir ? { type: 'dir', children: {} } : { type: 'file', content: '' };
        return ch;
      });
    } else if (value !== editing.name) {
      mutateDir(path, (ch) => {
        if (ch[value]) { flash(`"${value}" already exists.`); return ch; }
        const v = ch[editing.name];
        delete ch[editing.name];
        ch[value] = v;
        return ch;
      });
    }
    setEditing(null);
  };

  const remove = (itemName) => {
    const n = node.children[itemName];
    if (!n) return;
    setMenu(null);
    setSelected(null);
    if (inTrash) {
      mutateDir(path, (ch) => { delete ch[itemName]; return ch; });
      return;
    }
    // move to Trash
    mutateDir(path, (ch) => { delete ch[itemName]; return ch; });
    mutateDir(TRASH, (ch) => { ch[uniqueName(ch, itemName)] = n; return ch; });
    flash(`"${itemName}" moved to Trash.`);
  };

  const restore = (itemName) => {
    const n = node.children[itemName];
    if (!n) return;
    setMenu(null);
    mutateDir(TRASH, (ch) => { delete ch[itemName]; return ch; });
    mutateDir(HOME, (ch) => { ch[uniqueName(ch, itemName)] = n; return ch; });
    flash(`"${itemName}" restored to Home.`);
  };

  const emptyTrash = () => {
    setMenu(null);
    os.updateFs(TRASH, (d) => ({ ...d, children: {} }));
  };

  // ----------------------------- context menus --------------------
  const openCtx = (e, target) => {
    e.preventDefault();
    e.stopPropagation();
    if (target) setSelected(target);
    const r = rootRef.current.getBoundingClientRect();
    setMenu({ x: e.clientX - r.left, y: e.clientY - r.top, target });
  };

  return (
    <div
      ref={rootRef}
      className="h-full flex flex-col bg-[#1f2129] text-[#dfe3ea] text-[13px] select-none relative"
      onContextMenu={(e) => { if (!e.target.closest('[data-fm-item]')) openCtx(e, null); }}
    >
      {/* menubar */}
      <div className="flex gap-4 px-3 h-7 items-center text-[12.5px] text-[#c4c9d3] border-b border-[#2b2e38]">
        {['File', 'Edit', 'View', 'Go', 'Bookmarks', 'Help'].map((m) => <span key={m} className="hover:text-white cursor-default">{m}</span>)}
      </div>

      {/* toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-[#2b2e38]">
        <ToolBtn disabled={!back.length} onClick={goBack} title="Back"><ArrowLeft size={16} /></ToolBtn>
        <ToolBtn disabled={!fwd.length} onClick={goFwd} title="Forward"><ArrowRight size={16} /></ToolBtn>
        <ToolBtn disabled={!path.length} onClick={goUp} title="Up"><ArrowUp size={16} /></ToolBtn>
        <ToolBtn onClick={() => go(HOME)} title="Home"><Home size={16} /></ToolBtn>
        <div className="flex-1 flex items-center gap-0.5 h-7 px-2 mx-1 rounded bg-[#15171d] border border-[#343846] overflow-x-auto whitespace-nowrap">
          <button className="hover:text-white text-[#9aa3b2]" onClick={() => go([])}>/</button>
          {path.map((seg, i) => (
            <span key={i} className="flex items-center">
              {i > 0 && <ChevronRight size={12} className="text-[#6b7383]" />}
              <button className="px-1 hover:text-white" onClick={() => go(path.slice(0, i + 1))}>{seg === '.Trash' ? 'Trash' : seg}</button>
            </span>
          ))}
        </div>
        <ToolBtn onClick={() => setView((v) => (v === 'icons' ? 'list' : 'icons'))} title={view === 'icons' ? 'List view' : 'Icon view'}>
          {view === 'icons' ? <List size={16} /> : <LayoutGrid size={16} />}
        </ToolBtn>
        <ToolBtn onClick={() => setHidden((h) => !h)} title={hidden ? 'Hide hidden files' : 'Show hidden files'}>
          {hidden ? <Eye size={16} /> : <EyeOff size={16} />}
        </ToolBtn>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* sidebar */}
        <div className="w-40 shrink-0 border-r border-[#2b2e38] py-2 overflow-y-auto hidden sm:block">
          <div className="px-3 pb-1 text-[11px] uppercase tracking-wide text-[#7b8494]">Places</div>
          {PLACES.map(({ label: l, icon: Icon, path: p }) => {
            const on = p.join('/') === path.join('/') && l !== 'Desktop';
            return (
              <button key={l} onClick={() => go(p)} className={`w-full flex items-center gap-2 px-3 py-1 text-left ${on ? 'bg-[#367bf0] text-white' : 'hover:bg-[#2a2d37]'}`}>
                <Icon size={15} /> {l}
              </button>
            );
          })}
          <div className="px-3 pt-3 pb-1 text-[11px] uppercase tracking-wide text-[#7b8494]">Bookmarks</div>
          {BOOKMARKS.map((b) => (
            <button key={b.label} onClick={() => go(b.path)} className="w-full flex items-center gap-2 px-3 py-1 text-left hover:bg-[#2a2d37]">
              <Folder size={15} /> {b.label}
            </button>
          ))}
        </div>

        {/* content */}
        <div className="flex-1 overflow-y-auto p-3 kali-scroll" onClick={() => { setSelected(null); setEditing(null); }}>
          {error && <div className="mb-3 px-3 py-2 rounded bg-[#4a1f24] text-[#ffb4b4] border border-[#7a2b33]">{error}</div>}
          {inTrash && items.length > 0 && (
            <div className="mb-3 flex items-center justify-between px-3 py-2 rounded bg-[#2a2d37] text-[#c4c9d3]">
              <span>Items in the Trash</span>
              <button onClick={emptyTrash} className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#5a2328] hover:bg-[#6e2b31] text-[#ffb4b4]"><Trash2 size={13} /> Empty Trash</button>
            </div>
          )}
          {items.length === 0 && !error && <div className="text-[#7b8494] p-6 text-center">This folder is empty.</div>}

          {view === 'icons' ? (
            <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(108px, 1fr))' }}>
              {items.map(([n, nd]) => (
                <button
                  key={n}
                  data-fm-item
                  onClick={(e) => { e.stopPropagation(); setSelected(n); }}
                  onDoubleClick={() => open(n, nd)}
                  onContextMenu={(e) => openCtx(e, n)}
                  className={`flex flex-col items-center gap-1 p-2 rounded border ${selected === n ? 'bg-[#367bf0]/30 border-[#367bf0]/70' : 'border-transparent hover:bg-white/5'}`}
                >
                  <NodeIcon name={n} node={nd} size={48} />
                  {editing && !editing.isNew && editing.name === n
                    ? <EditInput editRef={editRef} editing={editing} setEditing={setEditing} commit={commitEdit} />
                    : <span className={`text-[12px] text-center [overflow-wrap:anywhere] leading-tight ${n.startsWith('.') ? 'opacity-60' : ''}`}>{n}</span>}
                </button>
              ))}
              {editing?.isNew && (
                <div className="flex flex-col items-center gap-1 p-2 rounded border border-[#367bf0]/70 bg-[#367bf0]/20">
                  <NodeIcon name={editing.isDir ? 'x' : 'x.txt'} node={editing.isDir ? { type: 'dir' } : { type: 'file' }} size={48} />
                  <EditInput editRef={editRef} editing={editing} setEditing={setEditing} commit={commitEdit} />
                </div>
              )}
            </div>
          ) : (
            <div>
              {items.map(([n, nd]) => (
                <div
                  key={n}
                  data-fm-item
                  onClick={(e) => { e.stopPropagation(); setSelected(n); }}
                  onDoubleClick={() => open(n, nd)}
                  onContextMenu={(e) => openCtx(e, n)}
                  className={`flex items-center gap-2 px-2 py-1 rounded ${selected === n ? 'bg-[#367bf0] text-white' : 'hover:bg-white/5'}`}
                >
                  <NodeIcon name={n} node={nd} size={18} />
                  {editing && !editing.isNew && editing.name === n
                    ? <EditInput editRef={editRef} editing={editing} setEditing={setEditing} commit={commitEdit} inline />
                    : <span className={`flex-1 truncate ${n.startsWith('.') ? 'opacity-60' : ''}`}>{n}</span>}
                  <span className="text-[11.5px] text-[#9aa3b2] tabular-nums">{nd.type === 'dir' ? '' : human(nodeSize(nd))}</span>
                </div>
              ))}
              {editing?.isNew && (
                <div className="flex items-center gap-2 px-2 py-1 rounded bg-[#367bf0]/20">
                  <NodeIcon name={editing.isDir ? 'x' : 'x.txt'} node={editing.isDir ? { type: 'dir' } : { type: 'file' }} size={18} />
                  <EditInput editRef={editRef} editing={editing} setEditing={setEditing} commit={commitEdit} inline />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* status bar */}
      <div className="h-6 px-3 flex items-center text-[11.5px] text-[#9aa3b2] border-t border-[#2b2e38]">
        {sel ? `"${selected}" ${sel.type === 'dir' ? 'folder' : human(nodeSize(sel))}` : `${items.length} item${items.length === 1 ? '' : 's'}`}
        {!writable && <span className="ml-auto">read-only</span>}
      </div>

      {/* context menu */}
      {menu && (
        <div data-fm-menu className="absolute w-52 py-1 rounded-md bg-[#22242c] border border-[#363a46] shadow-2xl text-[13px]" style={{ left: menu.x, top: menu.y, zIndex: 50 }}>
          {menu.target ? (
            <>
              <CtxItem icon={FolderOpen} onClick={() => { const n = node.children[menu.target]; setMenu(null); open(menu.target, n); }}>Open</CtxItem>
              {inTrash ? (
                <CtxItem icon={RotateCcw} onClick={() => restore(menu.target)}>Restore</CtxItem>
              ) : (
                <CtxItem icon={Pencil} disabled={!writable} onClick={() => startRename(menu.target)}>Rename…</CtxItem>
              )}
              <CtxItem icon={Trash2} danger disabled={!writable && !inTrash} onClick={() => remove(menu.target)}>{inTrash ? 'Delete permanently' : 'Move to Trash'}</CtxItem>
            </>
          ) : (
            <>
              <CtxItem icon={FolderPlus} disabled={!writable} onClick={() => startNew(true)}>New Folder</CtxItem>
              <CtxItem icon={FilePlus} disabled={!writable} onClick={() => startNew(false)}>New File</CtxItem>
              <CtxItem icon={hidden ? EyeOff : Eye} onClick={() => { setMenu(null); setHidden((h) => !h); }}>{hidden ? 'Hide hidden files' : 'Show hidden files'}</CtxItem>
              {inTrash && items.length > 0 && <CtxItem icon={Trash2} danger onClick={emptyTrash}>Empty Trash</CtxItem>}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EditInput({ editRef, editing, setEditing, commit, inline }) {
  return (
    <input
      ref={editRef}
      value={editing.value}
      onChange={(e) => setEditing({ ...editing, value: e.target.value })}
      onKeyDown={(e) => { e.stopPropagation(); if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(null); }}
      onBlur={commit}
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => e.target.select()}
      className={`${inline ? 'flex-1' : 'w-full text-center'} bg-[#14161d] border border-[#367bf0] rounded px-1 text-[12px] outline-none`}
      spellCheck={false}
    />
  );
}

function CtxItem({ children, icon: Icon, onClick, danger, disabled }) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-left disabled:opacity-40 disabled:cursor-default ${danger ? 'text-[#ff8f8f] hover:bg-[#5a2328] hover:text-white' : 'text-[#dfe3ea] hover:bg-[#367bf0] hover:text-white'} disabled:hover:bg-transparent`}
    >
      <Icon size={14} /> {children}
    </button>
  );
}

function ToolBtn({ children, disabled, ...rest }) {
  return (
    <button disabled={disabled} className="p-1.5 rounded hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent" {...rest}>
      {children}
    </button>
  );
}
