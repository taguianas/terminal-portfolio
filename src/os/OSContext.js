import { createContext, useContext } from 'react';

// Shared "kernel" API used by every app:
//   fs, updateFs(path, fn)          virtual file system
//   openApp(app, props)             open a window
//   openPath(pathArray)             open a file/folder with the right app
//   openUrl(url)                    open a link in Firefox
//   crash(), matrix(), power(action) system effects
//   mobile                          true on the phone layout
export const OSContext = createContext(null);
export const useOS = () => useContext(OSContext);
