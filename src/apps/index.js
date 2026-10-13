import Terminal from './Terminal';
import FileManager from './FileManager';
import TextEditor from './TextEditor';
import PdfViewer from './PdfViewer';
import Browser from './Browser';
import KaliVM from './KaliVM';
import Mail from './Mail';
import Settings from './Settings';
import SystemMonitor from './SystemMonitor';
import { TerminalAppIcon, FolderIcon, EditorAppIcon, DocIcon, BrowserAppIcon, KaliVMIcon, MailIcon, SettingsAppIcon, MonitorAppIcon } from '../components/Icons';

const PdfIcon = (p) => DocIcon({ ...p, ext: 'pdf' });

export const APPS = {
  terminal: { title: 'Terminal', Icon: TerminalAppIcon, Component: Terminal, size: [780, 480] },
  files: { title: 'File Manager', Icon: FolderIcon, Component: FileManager, size: [820, 520] },
  editor: { title: 'Mousepad', Icon: EditorAppIcon, Component: TextEditor, size: [700, 520] },
  pdf: { title: 'Document Viewer', Icon: PdfIcon, Component: PdfViewer, size: [780, 660] },
  kalivm: { title: 'Kali Linux (real VM)', Icon: KaliVMIcon, Component: KaliVM, size: [860, 540], single: true },
  settings: { title: 'Settings', Icon: SettingsAppIcon, Component: Settings, size: [640, 460], single: true },
  sysmon: { title: 'System Monitor', Icon: MonitorAppIcon, Component: SystemMonitor, size: [720, 520], single: true },
  mail: { title: 'Mail', Icon: MailIcon, Component: Mail, size: [640, 560], single: true },
  browser: { title: 'Firefox ESR', Icon: BrowserAppIcon, Component: Browser, size: [1000, 640] },
};
