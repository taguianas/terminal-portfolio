import { useEffect } from 'react';
import { useOS } from '../os/OSContext';
import { getNode, displayPath } from '../data/fs';
import Linkify from '../components/Linkify';

export default function TextEditor({ path, setTitle }) {
  const os = useOS();
  const node = path ? getNode(os.fs, path) : null;
  const name = path ? path[path.length - 1] : 'Untitled 1';
  const content = node?.type === 'file' ? node.content : '';
  const lines = content.split('\n');
  if (lines.length > 1 && lines[lines.length - 1] === '') lines.pop();

  useEffect(() => { setTitle?.(`${name} - Mousepad`); }, [name, setTitle]);

  const ext = name.includes('.') ? name.split('.').pop() : '';
  const filetype = { md: 'Markdown', txt: 'Plain Text', info: 'Plain Text' }[ext] || 'None';

  return (
    <div className="h-full flex flex-col bg-[#1f2129] text-[#dfe3ea] text-[13px]">
      <div className="flex gap-4 px-3 h-7 items-center text-[12.5px] text-[#c4c9d3] border-b border-[#2b2e38] select-none">
        {['File', 'Edit', 'Search', 'View', 'Document', 'Help'].map((m) => <span key={m} className="hover:text-white cursor-default">{m}</span>)}
      </div>
      <div className="flex items-center h-8 px-2 border-b border-[#2b2e38] bg-[#1a1c23] select-none">
        <div className="px-3 h-full flex items-center bg-[#14161d] border-x border-t border-[#2b2e38] rounded-t text-[12px]">{name}</div>
        {path && <div className="ml-auto text-[11px] text-[#7b8494] pr-1">{displayPath(path)}  [read only]</div>}
      </div>
      <div className="flex-1 overflow-auto bg-[#14161d] font-mono text-[13px] leading-[1.55] kali-scroll">
        <div className="flex min-h-full">
          <div className="shrink-0 text-right pr-3 pl-3 py-2 text-[#5b6170] bg-[#181a21] border-r border-[#2b2e38] select-none">
            {lines.map((_, i) => <div key={i}>{i + 1}</div>)}
          </div>
          <div className="flex-1 py-2 px-3 whitespace-pre-wrap break-words">
            {lines.map((l, i) => (
              <div key={i} className={ext === 'md' && l.startsWith('#') ? 'text-[#5aa2ff] font-bold' : ''}>
                {l ? <Linkify text={l} onUrl={os.openUrl} /> : ' '}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="h-6 px-3 flex items-center gap-6 text-[11.5px] text-[#9aa3b2] border-t border-[#2b2e38] select-none">
        <span>Filetype: {filetype}</span>
        <span className="ml-auto">Line: 1 Column: 0</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
