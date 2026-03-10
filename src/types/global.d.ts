export interface WordWindow {
  title: string;
  path: string;
  pid: number;
}

export interface ElectronAPI {
  getVersion: () => Promise<string>;
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
  };
  word: {
    detectWindows: () => Promise<WordWindow[]>;
    getSelection: () => Promise<string>;
    setSelection: (text: string) => Promise<boolean>;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
