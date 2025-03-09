import { app, BrowserWindow, dialog } from 'electron';
import * as path from 'path';
import * as isDev from 'electron-is-dev';
import Store from 'electron-store';
import './ipc-handlers/network-handlers'; // 导入网络处理模块
import './ipc-handlers/history-handlers'; // 导入历史记录处理模块
import { checkRootPermission, requestRootPermission, installPcapDependency } from './utils/permission-utils';

// 初始化存储
const store = new Store<{
  'detection-history': any[]
}>();

// 全局变量，用于标记是否已获取root权限
export let rootPermissionGranted = false;

// 声明主窗口
let mainWindow: BrowserWindow | null = null;

// 创建主窗口函数
function createWindow() {
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, '../preload.js'),
    },
  });

  // 加载应用的主页面
  if (isDev) {
    // 开发环境下加载本地文件
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    // 打开开发者工具
    mainWindow.webContents.openDevTools();
  } else {
    // 生产环境下加载本地文件
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }

  // 窗口关闭时发生的事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Electron初始化完成后调用创建窗口
app.whenReady().then(async () => {
  createWindow();

  // 应用启动时尝试获取root权限
  try {
    const hasPermission = await checkRootPermission();
    if (!hasPermission) {
      // 显示权限请求对话框
      const { response } = await dialog.showMessageBox({
        type: 'info',
        title: '权限请求',
        message: '检测DHCP需要管理员权限',
        detail: '应用程序需要管理员权限才能捕获网络数据包。请在接下来的权限请求窗口中授予权限。',
        buttons: ['确定', '取消'],
        defaultId: 0,
        cancelId: 1
      });
      
      if (response === 0) {
        // 请求管理员权限
        rootPermissionGranted = await requestRootPermission();
        if (rootPermissionGranted) {
          // 安装pcap依赖
          await installPcapDependency();
        }
      }
    } else {
      rootPermissionGranted = true;
    }
  } catch (error) {
    console.error('获取权限时出错:', error);
  }

  app.on('activate', () => {
    // 在macOS上，当点击dock图标且没有其他窗口打开时，
    // 通常会在应用程序中重新创建一个窗口
    if (mainWindow === null) createWindow();
  });
});

// 关闭所有窗口时退出应用，除非在macOS上
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});