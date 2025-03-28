const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');

// 优化的应用程序配置
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('enable-accelerated-video-decode');
app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');

let mainWindow = null;
let floatingWindow = null;
let isDragging = false;
let settingsWindow = null;
let scheduleWindow = null;

function createMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    return;
  }

  // 获取悬浮窗的位置和大小
  const floatingBounds = floatingWindow.getBounds();
  // 获取屏幕尺寸
  const display = screen.getPrimaryDisplay();
  const screenBounds = display.workArea;

  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    frame: false,
    x: Math.min(floatingBounds.x + floatingBounds.width + 10, screenBounds.width - 400),
    y: Math.min(floatingBounds.y, screenBounds.height - 600),
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false,
      backgroundThrottling: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 添加动画效果
  mainWindow.setOpacity(0);
  setTimeout(() => {
    mainWindow.setOpacity(1);
  }, 100);

  // 监听窗口关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createFloatingWindow() {
  floatingWindow = new BrowserWindow({
    width: 120,
    height: 120,
    frame: false,
    transparent: true,
    resizable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    movable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      backgroundThrottling: false
    }
  });

  // 设置初始位置在屏幕右下角
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  floatingWindow.setPosition(width - 140, height - 140);

  floatingWindow.loadFile(path.join(__dirname, 'floating.html'));
  floatingWindow.setAlwaysOnTop(true, 'floating');

  // 监听窗口移动事件，更新主窗口位置
  floatingWindow.on('move', () => {
    if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
      const floatingBounds = floatingWindow.getBounds();
      const screenBounds = screen.getPrimaryDisplay().workArea;
      mainWindow.setBounds({
        x: Math.min(floatingBounds.x + floatingBounds.width + 10, screenBounds.width - 400),
        y: Math.min(floatingBounds.y, screenBounds.height - 600),
        width: 400,
        height: 600
      });
    }
  });

  // 监听窗口关闭事件
  floatingWindow.on('closed', () => {
    floatingWindow = null;
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });

  // 处理拖动事件
  ipcMain.on('start-dragging', () => {
    isDragging = true;
  });

  ipcMain.on('window-dragging', (event, { deltaX, deltaY }) => {
    if (isDragging && floatingWindow) {
      const [x, y] = floatingWindow.getPosition();
      floatingWindow.setPosition(x + deltaX, y + deltaY);

      // 如果主窗口打开，同步移动主窗口
      if (mainWindow && !mainWindow.isDestroyed() && mainWindow.isVisible()) {
        const floatingBounds = floatingWindow.getBounds();
        const screenBounds = screen.getPrimaryDisplay().workArea;
        mainWindow.setBounds({
          x: Math.min(floatingBounds.x + floatingBounds.width + 10, screenBounds.width - 400),
          y: Math.min(floatingBounds.y, screenBounds.height - 600),
          width: 400,
          height: 600
        });
      }
    }
  });

  ipcMain.on('stop-dragging', () => {
    isDragging = false;
  });
}

function createSettingsWindow() {
    settingsWindow = new BrowserWindow({
        width: 400,
        height: 500,
        frame: false,
        transparent: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    settingsWindow.loadFile('src/settings.html');
}

function createScheduleWindow() {
    if (scheduleWindow && !scheduleWindow.isDestroyed()) {
        scheduleWindow.show();
        return;
    }

    scheduleWindow = new BrowserWindow({
        width: 500,
        height: 600,
        frame: false,
        transparent: true,
        resizable: false,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        }
    });

    scheduleWindow.loadFile('src/schedule.html');

    // 添加动画效果
    scheduleWindow.setOpacity(0);
    setTimeout(() => {
        scheduleWindow.setOpacity(1);
    }, 100);

    scheduleWindow.on('closed', () => {
        scheduleWindow = null;
    });
}

// 监听显示主窗口的事件
ipcMain.on('show-main-window', () => {
  console.log('Received show-main-window event');
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
    mainWindow.show();
  } else if (!mainWindow.isVisible()) {
    mainWindow.show();
    mainWindow.setOpacity(0);
    setTimeout(() => {
      mainWindow.setOpacity(1);
    }, 100);
  } else {
    mainWindow.hide();
  }
});

// 监听隐藏主窗口的事件
ipcMain.on('hide-main-window', () => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.hide();
  }
});

// 监听退出应用事件
ipcMain.on('quit-app', () => {
    console.log('Received quit request');
    try {
        // 关闭所有窗口
        BrowserWindow.getAllWindows().forEach(window => {
            console.log('Closing window:', window.getTitle());
            window.destroy();
        });
        
        // 强制退出应用
        console.log('Force quitting application');
        app.exit(0);
    } catch (error) {
        console.error('Error during quit:', error);
        // 确保应用退出
        process.exit(0);
    }
});

// 监听显示设置窗口的事件
ipcMain.on('show-settings', () => {
    if (!settingsWindow) {
        createSettingsWindow();
    } else {
        settingsWindow.show();
    }
});

// 监听显示日程窗口的事件
ipcMain.on('show-schedule', () => {
    createScheduleWindow();
});

// 监听隐藏日程窗口的事件
ipcMain.on('hide-schedule-window', () => {
    if (scheduleWindow && !scheduleWindow.isDestroyed()) {
        scheduleWindow.hide();
    }
});

// 确保应用程序准备就绪后再创建窗口
app.whenReady().then(() => {
  createFloatingWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createFloatingWindow();
  }
}); 