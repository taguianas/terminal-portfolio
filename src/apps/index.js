import { lazy } from 'react';
import Terminal from './Terminal';
import { TerminalAppIcon, FolderIcon, EditorAppIcon, DocIcon, BrowserAppIcon, KaliVMIcon, MailIcon, SettingsAppIcon, MonitorAppIcon } from '../components/Icons';

// Terminal is eager (it is the first window at boot). Every other app is
// code-split and loaded the first time it is opened, so the initial
// bundle (boot, login, desktop) stays small and paints fast.
const FileManager = lazy(() => import('./FileManager'));
const TextEditor = lazy(() => import('./TextEditor'));
const PdfViewer = lazy(() => import('./PdfViewer'));
const Browser = lazy(() => import('./Browser'));
const KaliVM = lazy(() => import('./KaliVM'));
const Mail = lazy(() => import('./Mail'));
const Settings = lazy(() => import('./Settings'));
const SystemMonitor = lazy(() => import('./SystemMonitor'));

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
