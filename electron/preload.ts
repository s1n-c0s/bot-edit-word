import { contextBridge, ipcRenderer } from 'electron';

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

contextBridge.exposeInMainWorld('electronAPI', {
  getVersion: () => ipcRenderer.invoke('app:version'),
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },
  word: {
    detectWindows: () => ipcRenderer.invoke('word:detectWindows'),
    getSelection: () => ipcRenderer.invoke('word:getSelection'),
    setSelection: (text: string) => ipcRenderer.invoke('word:setSelection', text),
  },
});
