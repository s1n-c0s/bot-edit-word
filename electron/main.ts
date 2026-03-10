import { app, BrowserWindow, ipcMain, screen } from 'electron';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const isDev = process.env.NODE_ENV === 'development';

let mainWindow: BrowserWindow | null = null;

function log(...args: unknown[]): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}]`, ...args);
}

function createWindow(): void {
  log('Creating window...');

  const defaultWidth = 400;
  const defaultHeight = 600;

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const x = Math.max(0, Math.min(screenWidth - defaultWidth - 20, screenWidth - defaultWidth));
  const y = Math.max(0, Math.min(20, screenHeight - defaultHeight));

  log(`Screen size: ${screenWidth}x${screenHeight}, Window pos: ${x},${y}`);

  mainWindow = new BrowserWindow({
    width: defaultWidth,
    height: defaultHeight,
    x,
    y,
    frame: false,
    transparent: false,
    alwaysOnTop: true,
    resizable: true,
    skipTaskbar: false,
    show: false,
    backgroundColor: '#1e1e1e',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    log('Window ready to show');
    mainWindow?.show();
    mainWindow?.focus();
  });

  if (isDev) {
    log('Loading dev server at http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173').catch((err) => {
      log('Failed to load dev URL:', err);
    });
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    log('Loading production file:', indexPath);
    mainWindow.loadFile(indexPath).catch((err) => {
      log('Failed to load file:', err);
    });
  }

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    log(`Failed to load: ${errorCode} - ${errorDescription}`);
  });

  mainWindow.on('closed', () => {
    log('Window closed');
    mainWindow = null;
  });

  log('Window created successfully');
}

async function detectWordWindows(): Promise<Array<{ title: string; path: string; pid: number }>> {
  const platform = process.platform;

  if (platform === 'win32') {
    try {
      const { stdout } = await execAsync(
        `powershell -Command "Get-Process | Where-Object {$_.MainWindowTitle -ne '' -and ($_.ProcessName -eq 'WINWORD' -or $_.ProcessName -eq 'Word')} | Select-Object MainWindowTitle, Id | ConvertTo-Json"`,
        { encoding: 'utf8' }
      );

      if (!stdout.trim()) return [];

      const processes = JSON.parse(stdout);
      const list = Array.isArray(processes) ? processes : [processes];

      return list.map((p: { MainWindowTitle: string; Id: number }) => ({
        title: p.MainWindowTitle,
        path: '',
        pid: p.Id,
      }));
    } catch {
      return [];
    }
  }

  if (platform === 'darwin') {
    try {
      const script = `
        tell application "Microsoft Word"
          set windowList to windows
          set result to {}
          repeat with w in windowList
            set end of result to (name of w as string)
          end repeat
          return result
        end tell
      `;
      const { stdout } = await execAsync(`osascript -e '${script}'`);
      const titles = stdout.trim().split(', ').filter(Boolean);

      return titles.map((title: string, idx: number) => ({
        title,
        path: '',
        pid: idx,
      }));
    } catch {
      return [];
    }
  }

  return [];
}

async function getWordSelection(): Promise<string> {
  const platform = process.platform;

  if (platform === 'win32') {
    try {
      const script = `
        Add-Type -AssemblyName Microsoft.Office.Interop.Word
        $word = New-Object -ComObject Word.Application
        $word.Visible = $false
        $doc = $word.ActiveDocument
        $selection = $word.Selection
        $text = $selection.Text
        $word.Quit($false)
        $text
      `;
      const { stdout } = await execAsync(`powershell -Command "${script.replace(/"/g, '\\"')}"`);
      return stdout.trim();
    } catch {
      return '';
    }
  }

  return '';
}

process.on('uncaughtException', (error) => {
  log('Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
  log('Unhandled rejection:', reason);
});

app.whenReady().then(() => {
  log('App ready, creating window');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  log('All windows closed');
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('app:version', () => app.getVersion());

ipcMain.handle('window:minimize', () => {
  mainWindow?.minimize();
});

ipcMain.handle('window:maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow?.maximize();
  }
});

ipcMain.handle('window:close', () => {
  mainWindow?.close();
});

ipcMain.handle('window:isMaximized', () => {
  return mainWindow?.isMaximized() ?? false;
});

ipcMain.handle('word:detectWindows', async () => {
  return detectWordWindows();
});

ipcMain.handle('word:getSelection', async () => {
  return getWordSelection();
});

ipcMain.handle('word:setSelection', async (_event, text: string) => {
  const platform = process.platform;

  if (platform === 'win32') {
    try {
      const script = `
        Add-Type -AssemblyName Microsoft.Office.Interop.Word
        $word = New-Object -ComObject Word.Application
        $word.Visible = $false
        $word.Selection.Text = "${text.replace(/"/g, '\\"')}"
        $word.Quit($false)
      `;
      await execAsync(`powershell -Command "${script}"`);
      return true;
    } catch {
      return false;
    }
  }

  return false;
});
