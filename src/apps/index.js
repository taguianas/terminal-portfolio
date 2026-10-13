import Terminal from './Terminal';
import FileManager from './FileManager';
import TextEditor from './TextEditor';
import PdfViewer from './PdfViewer';
import Browser from './Browser';
import { TerminalAppIcon, FolderIcon, EditorAppIcon, DocIcon, BrowserAppIcon } from '../components/Icons';

const PdfIcon = (p) => DocIcon({ ...p, ext: 'pdf' });

export const APPS = {
  terminal: { title: 'Terminal', Icon: TerminalAppIcon, Component: Terminal, size: [780, 480] },
  files: { title: 'File Manager', Icon: FolderIcon, Component: FileManager, size: [820, 520] },
  editor: { title: 'Mousepad', Icon: EditorAppIcon, Component: TextEditor, size: [700, 520] },
  pdf: { title: 'Document Viewer', Icon: PdfIcon, Component: PdfViewer, size: [780, 660] },
  browser: { title: 'Firefox ESR', Icon: BrowserAppIcon, Component: Browser, size: [1000, 640] },
};
