// ==============================================
// public/electron.js - Fixed Electron Main Process
// ==============================================
const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// Try to import optional dependencies safely
let isDev = false;
let autoUpdater = null;

try {
  isDev = require('electron-is-dev');
} catch (err) {
  // Fallback to check NODE_ENV
  isDev = process.env.NODE_ENV === 'development';
}

try {
  if (!isDev) {
    autoUpdater = require('electron-updater').autoUpdater;
  }
} catch (err) {
  console.log('Auto-updater not available');
}

let mainWindow;
let splashWindow;

// Enable live reload for development
if (isDev) {
  try {
    require('electron-reload')(__dirname, {
      electron: path.join(__dirname, '..', 'node_modules', '.bin', 'electron'),
      hardResetMethod: 'exit'
    });
  } catch (err) {
    console.log('Electron-reload not available');
  }
}

function createSplashWindow() {
  splashWindow = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    alwaysOnTop: true,
    transparent: true,
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false
    }
  });

  const splashPath = path.join(__dirname, 'splash.html');
  
  // Check if splash.html exists, if not create a simple one
  if (fs.existsSync(splashPath)) {
    splashWindow.loadFile(splashPath);
  } else {
    splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            color: white;
            text-align: center;
          }
          .loading {
            animation: pulse 2s infinite;
          }
          @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.7; }
            100% { opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="loading">
          <h1>🏭 SS Mudyf</h1>
          <p>Loading Order Tracking System...</p>
        </div>
      </body>
      </html>
    `)}`);
  }
  
  splashWindow.once('ready-to-show', () => {
    splashWindow.show();
  });
  
  splashWindow.on('closed', () => {
    splashWindow = null;
  });
}

function createMainWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    show: false, // Don't show until ready
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      preload: path.join(__dirname, 'preload.js') // We'll create this if needed
    },
    icon: getIconPath(),
    title: 'SS Mudyf Order Tracking System',
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default'
  });

  // Load the app
  const startUrl = isDev 
    ? 'http://localhost:3000' 
    : `file://${path.join(__dirname, '../build/index.html')}`;
  
  mainWindow.loadURL(startUrl).catch(err => {
    console.error('Failed to load URL:', err);
    // Fallback URL in case of loading issues
    if (isDev) {
      setTimeout(() => {
        mainWindow.loadURL('http://localhost:3000');
      }, 2000);
    }
  });

  // Show window when ready
  mainWindow.once('ready-to-show', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
    }
    mainWindow.show();
    mainWindow.focus();
    
    // Open DevTools in development
    if (isDev) {
      mainWindow.webContents.openDevTools();
    }
  });

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Handle external links
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Create application menu
  createMenu();

  // Handle certificate errors (for development)
  if (isDev) {
    mainWindow.webContents.on('certificate-error', (event, url, error, certificate, callback) => {
      // In development, ignore certificate errors
      event.preventDefault();
      callback(true);
    });
  }
}

function getIconPath() {
  const iconPaths = {
    win32: ['icon.ico', 'assets/icon.ico', 'build/icon.ico'],
    darwin: ['icon.icns', 'assets/icon.icns', 'build/icon.icns'],
    linux: ['icon.png', 'assets/icon.png', 'build/icon.png']
  };

  const possiblePaths = iconPaths[process.platform] || iconPaths.linux;
  
  for (const iconPath of possiblePaths) {
    const fullPath = path.join(__dirname, iconPath);
    if (fs.existsSync(fullPath)) {
      return fullPath;
    }
  }
  
  // Return undefined if no icon found
  return undefined;
}

function createMenu() {
  const isMac = process.platform === 'darwin';
  
  const template = [
    // macOS app menu
    ...(isMac ? [{
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    
    // File menu
    {
      label: 'File',
      submenu: [
        {
          label: 'New Order',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('menu-new-order');
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Export Data',
          accelerator: 'CmdOrCtrl+E',
          click: exportData
        },
        {
          label: 'Import Data',
          accelerator: 'CmdOrCtrl+I',
          click: importData
        },
        { type: 'separator' },
        {
          label: 'Backup Data',
          accelerator: 'CmdOrCtrl+B',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('backup-data');
            }
          }
        },
        { type: 'separator' },
        ...(!isMac ? [
          {
            label: 'Exit',
            accelerator: 'Ctrl+Q',
            click: () => app.quit()
          }
        ] : [])
      ]
    },
    
    // Edit menu
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        ...(isMac ? [
          { role: 'pasteAndMatchStyle' },
          { role: 'delete' },
          { role: 'selectAll' },
          { type: 'separator' },
          {
            label: 'Speech',
            submenu: [
              { role: 'startspeaking' },
              { role: 'stopspeaking' }
            ]
          }
        ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
      ]
    },
    
    // View menu
    {
      label: 'View',
      submenu: [
        {
          label: 'Dashboard',
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'dashboard');
            }
          }
        },
        {
          label: 'Orders',
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'orders');
            }
          }
        },
        {
          label: 'Customers',
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'customers');
            }
          }
        },
        {
          label: 'Inventory',
          accelerator: 'CmdOrCtrl+4',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'inventory');
            }
          }
        },
        {
          label: 'Production',
          accelerator: 'CmdOrCtrl+5',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'production');
            }
          }
        },
        {
          label: 'Reports',
          accelerator: 'CmdOrCtrl+6',
          click: () => {
            if (mainWindow) {
              mainWindow.webContents.send('navigate-to', 'reports');
            }
          }
        },
        { type: 'separator' },
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    
    // Window menu
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'close' },
        ...(isMac ? [
          { type: 'separator' },
          { role: 'front' },
          { type: 'separator' },
          { role: 'window' }
        ] : [])
      ]
    },
    
    // Help menu
    {
      role: 'help',
      submenu: [
        {
          label: 'About SS Mudyf Order Tracker',
          click: showAbout
        },
        {
          label: 'User Guide',
          click: () => {
            shell.openExternal('https://github.com/ssmudyf/order-tracker/wiki');
          }
        },
        {
          label: 'Keyboard Shortcuts',
          accelerator: 'F1',
          click: showKeyboardShortcuts
        },
        { type: 'separator' },
        {
          label: 'Check for Updates',
          click: () => {
            if (autoUpdater) {
              autoUpdater.checkForUpdatesAndNotify();
            } else {
              dialog.showMessageBox(mainWindow, {
                type: 'info',
                title: 'Updates',
                message: 'Auto-updater not available in development mode'
              });
            }
          }
        },
        {
          label: 'Report Issue',
          click: () => {
            shell.openExternal('https://github.com/ssmudyf/order-tracker/issues');
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

// Menu functions
async function exportData() {
  if (!mainWindow) return;
  
  try {
    const result = await dialog.showSaveDialog(mainWindow, {
      title: 'Export SS Mudyf Data',
      defaultPath: `ss-mudyf-backup-${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    });

    if (!result.canceled && result.filePath) {
      mainWindow.webContents.send('export-data', result.filePath);
    }
  } catch (error) {
    console.error('Export dialog error:', error);
  }
}

async function importData() {
  if (!mainWindow) return;
  
  try {
    const result = await dialog.showOpenDialog(mainWindow, {
      title: 'Import SS Mudyf Data',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      mainWindow.webContents.send('import-data', result.filePaths[0]);
    }
  } catch (error) {
    console.error('Import dialog error:', error);
  }
}

function showAbout() {
  if (!mainWindow) return;
  
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'About SS Mudyf Order Tracker',
    message: 'SS Mudyf Order Tracking System',
    detail: `Version: ${app.getVersion()}\nBuilt for: SS Mudyf Textile CMT Factory\nLocation: Eswatini\n\nA comprehensive order tracking and production management system designed specifically for textile manufacturing operations.\n\n© 2025 SS Mudyf. All rights reserved.`,
    buttons: ['OK']
  });
}

function showKeyboardShortcuts() {
  if (!mainWindow) return;
  
  dialog.showMessageBox(mainWindow, {
    type: 'info',
    title: 'Keyboard Shortcuts',
    message: 'SS Mudyf Order Tracker - Keyboard Shortcuts',
    detail: `Navigation:
Ctrl+1 - Dashboard
Ctrl+2 - Orders
Ctrl+3 - Customers
Ctrl+4 - Inventory
Ctrl+5 - Production
Ctrl+6 - Reports

Actions:
Ctrl+N - New Order
Ctrl+E - Export Data
Ctrl+I - Import Data
Ctrl+B - Backup Data

System:
F1 - Help (Keyboard Shortcuts)
F11 - Toggle Fullscreen
F12 - Developer Tools (Dev Mode)
Ctrl+R - Reload
Ctrl+Q - Exit Application`,
    buttons: ['OK']
  });
}

// IPC handlers
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  if (!mainWindow) return { canceled: true };
  return await dialog.showSaveDialog(mainWindow, options);
});

ipcMain.handle('show-open-dialog', async (event, options) => {
  if (!mainWindow) return { canceled: true };
  return await dialog.showOpenDialog(mainWindow, options);
});

ipcMain.handle('show-message-box', async (event, options) => {
  if (!mainWindow) return { response: 0 };
  return await dialog.showMessageBox(mainWindow, options);
});

ipcMain.handle('show-error-box', (event, title, content) => {
  dialog.showErrorBox(title, content);
});

// App event handlers
app.whenReady().then(async () => {
  // Set app user model ID for Windows notifications
  if (process.platform === 'win32') {
    app.setAppUserModelId('com.ssmudyf.ordertracker');
  }
  
  createSplashWindow();
  
  // Show splash for 2-3 seconds before showing main window
  setTimeout(() => {
    createMainWindow();
  }, isDev ? 1000 : 2500);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });

  // Initialize auto updater
  if (autoUpdater && !isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (navigationEvent, navigationUrl) => {
    navigationEvent.preventDefault();
    shell.openExternal(navigationUrl);
  });
  
  // Prevent navigation to external URLs
  contents.on('will-navigate', (navigationEvent, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    const currentUrl = contents.getURL();
    
    if (parsedUrl.origin !== new URL(currentUrl).origin) {
      navigationEvent.preventDefault();
      shell.openExternal(navigationUrl);
    }
  });
});

// Handle certificate errors in development
app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
  if (isDev) {
    event.preventDefault();
    callback(true);
  } else {
    callback(false);
  }
});

// Auto-updater events (if available)
if (autoUpdater && !isDev) {
  autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Update available.');
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: 'A new version is available. It will be downloaded in the background.',
        buttons: ['OK']
      });
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available.');
  });

  autoUpdater.on('error', (err) => {
    console.log('Error in auto-updater:', err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    let logMessage = `Download speed: ${progressObj.bytesPerSecond}`;
    logMessage = `${logMessage} - Downloaded ${progressObj.percent}%`;
    logMessage = `${logMessage} (${progressObj.transferred}/${progressObj.total})`;
    console.log(logMessage);
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded');
    if (mainWindow) {
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. Application will restart to apply the update.',
        buttons: ['Restart Now', 'Restart Later']
      }).then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
    }
  });
}

// Handle unhandled errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});