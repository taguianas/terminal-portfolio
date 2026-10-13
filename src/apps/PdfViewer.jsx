import { useEffect } from 'react';
import { Download, ExternalLink } from 'lucide-react';

export default function PdfViewer({ src, name = 'resume.pdf', setTitle }) {
  useEffect(() => { setTitle?.(`${name} - Document Viewer`); }, [name, setTitle]);
  return (
    <div className="h-full flex flex-col bg-[#1f2129] text-[#dfe3ea] text-[13px]">
      <div className="flex items-center gap-2 h-9 px-3 border-b border-[#2b2e38] select-none">
        <span className="font-semibold truncate">{name}</span>
        <div className="ml-auto flex gap-1">
          <a href={src} download className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#367bf0] hover:bg-[#4a8bff] text-white text-[12px]">
            <Download size={14} /> Download
          </a>
          <a href={src} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-white/10 text-[12px]">
            <ExternalLink size={14} /> New tab
          </a>
        </div>
      </div>
      <iframe title={name} src={`${src}#view=FitH`} className="flex-1 w-full bg-[#3a3d46] border-0" />
    </div>
  );
}
