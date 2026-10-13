import { Minus, Square, Copy, X } from 'lucide-react';

export const PANEL_H = 30;

// One application window: drag by the title bar, resize from the
// right edge, bottom edge or corner, double-click title to maximize.
export default function Window({ win, active, Icon, onFocus, onClose, onMinimize, onToggleMax, onChange, children }) {
  const style = win.maximized
    ? { left: 0, top: PANEL_H, width: '100%', height: `calc(100% - ${PANEL_H}px)`, zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  const track = (e, onMove) => {
    e.preventDefault();
    const sx = e.clientX;
    const sy = e.clientY;
    document.body.classList.add('wm-dragging');
    const move = (ev) => onMove(ev.clientX - sx, ev.clientY - sy);
    const up = () => {
      document.body.classList.remove('wm-dragging');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };

  const startDrag = (e) => {
    if (e.button !== 0 || win.maximized || e.target.closest('button')) return;
    onFocus();
    const { x, y, w } = win;
    track(e, (dx, dy) =>
      onChange({
        x: Math.min(Math.max(x + dx, 100 - w), window.innerWidth - 100),
        y: Math.min(Math.max(y + dy, PANEL_H), window.innerHeight - 40),
      }),
    );
  };

  const startResize = (dir) => (e) => {
    if (e.button !== 0 || win.maximized) return;
    e.stopPropagation();
    onFocus();
    const { w, h } = win;
    track(e, (dx, dy) =>
      onChange({
        ...(dir.includes('e') ? { w: Math.max(340, w + dx) } : {}),
        ...(dir.includes('s') ? { h: Math.max(220, h + dy) } : {}),
      }),
    );
  };

  return (
    <div
      className={`absolute flex flex-col overflow-hidden wm-open ${win.maximized ? '' : 'rounded-md'} border ${
        active ? 'border-[#3d4250] shadow-[0_18px_50px_rgba(0,0,0,0.65)]' : 'border-[#2a2d36] shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
      }`}
      style={{ ...style, display: win.minimized ? 'none' : 'flex' }}
      onPointerDownCapture={onFocus}
    >
      <div
        className={`h-[30px] shrink-0 flex items-center px-2 select-none ${active ? 'bg-[#2a2d37] text-[#e8eaee]' : 'bg-[#21232b] text-[#8b93a3]'}`}
        onPointerDown={startDrag}
        onDoubleClick={(e) => !e.target.closest('button') && onToggleMax()}
      >
        <div className="w-5 flex items-center">{Icon && <Icon size={16} />}</div>
        <div className="flex-1 text-center text-[12.5px] font-semibold truncate px-2">{win.title}</div>
        <div className="flex items-center gap-1">
          <TitleBtn onClick={onMinimize} label="Minimize"><Minus size={13} /></TitleBtn>
          <TitleBtn onClick={onToggleMax} label="Maximize">{win.maximized ? <Copy size={11} /> : <Square size={11} />}</TitleBtn>
          <TitleBtn onClick={onClose} label="Close" danger><X size={14} /></TitleBtn>
        </div>
      </div>
      <div className="flex-1 min-h-0 relative">{children}</div>

      {!win.maximized && (
        <>
          <div className="absolute top-[30px] right-0 w-1.5 bottom-3 cursor-e-resize" onPointerDown={startResize('e')} />
          <div className="absolute left-0 right-3 bottom-0 h-1.5 cursor-s-resize" onPointerDown={startResize('s')} />
          <div className="absolute right-0 bottom-0 w-3.5 h-3.5 cursor-se-resize" onPointerDown={startResize('es')} />
        </>
      )}
    </div>
  );
}

function TitleBtn({ children, onClick, label, danger }) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`w-[22px] h-[22px] rounded-full flex items-center justify-center text-[#c4c9d3] ${danger ? 'hover:bg-[#e5484d] hover:text-white' : 'hover:bg-white/15'}`}
    >
      {children}
    </button>
  );
}
