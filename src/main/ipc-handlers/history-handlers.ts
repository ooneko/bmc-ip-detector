import { ipcMain } from 'electron';
import Store from 'electron-store';

// 初始化存储
const store = new Store<{
  'detection-history': any[]
}>();

// 保存检测结果到历史记录
ipcMain.handle('save-detection-result', (_, data) => {
  try {
    // 获取现有的历史记录
    const history = store.get('detection-history', []) as any[];
    
    // 添加新记录，包括时间戳
    const newRecord = {
      ...data,
      timestamp: new Date().toISOString(),
      id: `detection-${Date.now()}`
    };
    
    // 更新存储
    store.set('detection-history', [newRecord, ...history]);
    
    return { success: true, id: newRecord.id };
  } catch (error) {
    console.error('保存检测结果失败:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 获取历史记录
ipcMain.handle('get-detection-history', () => {
  return store.get('detection-history', []);
});

// 删除历史记录条目
ipcMain.handle('delete-history-item', (_, id) => {
  try {
    const history = store.get('detection-history', []) as any[];
    const updatedHistory = history.filter(item => item.id !== id);
    store.set('detection-history', updatedHistory);
    return { success: true };
  } catch (error) {
    console.error('删除历史记录失败:', error);
    return { success: false, error: (error as Error).message };
  }
});

// 清空历史记录
ipcMain.handle('clear-detection-history', () => {
  try {
    store.set('detection-history', []);
    return { success: true };
  } catch (error) {
    console.error('清空历史记录失败:', error);
    return { success: false, error: (error as Error).message };
  }
}); 