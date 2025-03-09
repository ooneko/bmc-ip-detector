/**
 * IPMI带外检测器 - 主脚本
 * 处理所有页面共享的功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 检测并显示系统类型
    detectSystemType();
    
    // 初始化通用UI事件监听器
    initCommonUIListeners();
});

/**
 * 检测用户操作系统类型并显示在界面上
 */
function detectSystemType() {
    const systemTypeElement = document.getElementById('system-type');
    if (!systemTypeElement) return;
    
    let osName = "未知系统";
    let osIcon = "fa-desktop";
    
    // 简单的操作系统检测
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.indexOf("win") !== -1) {
        osName = "Windows";
        osIcon = "fa-windows";
    } else if (userAgent.indexOf("mac") !== -1) {
        osName = "macOS";
        osIcon = "fa-apple";
    } else if (userAgent.indexOf("linux") !== -1) {
        osName = "Linux";
        osIcon = "fa-linux";
    } else if (userAgent.indexOf("android") !== -1) {
        osName = "Android";
        osIcon = "fa-android";
    } else if (userAgent.indexOf("ios") !== -1 || userAgent.indexOf("iphone") !== -1 || userAgent.indexOf("ipad") !== -1) {
        osName = "iOS";
        osIcon = "fa-apple";
    }
    
    systemTypeElement.innerHTML = `<i class="fab ${osIcon}"></i> ${osName}`;
}

/**
 * 初始化所有页面共享的UI事件监听器
 */
function initCommonUIListeners() {
    // 侧边栏响应式切换
    const sidebarToggle = document.querySelector('.sidebar-toggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.querySelector('.sidebar').classList.toggle('collapsed');
            document.querySelector('.main-content').classList.toggle('expanded');
        });
    }
    
    // 通知图标点击事件
    const notificationIcon = document.querySelector('.notification');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', function() {
            // 显示通知面板 (将在后续开发中实现)
            console.log('通知图标被点击');
        });
    }
    
    // 用户图标点击事件
    const userIcon = document.querySelector('.user');
    if (userIcon) {
        userIcon.addEventListener('click', function() {
            // 显示用户菜单 (将在后续开发中实现)
            console.log('用户图标被点击');
        });
    }
}

/**
 * 显示通知消息
 * @param {string} message - 通知消息内容
 * @param {string} type - 通知类型 (success, error, warning, info)
 * @param {number} duration - 显示时长(毫秒)
 */
function showNotification(message, type = 'info', duration = 3000) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification-toast ${type}`;
    
    // 创建图标
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'times-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    // 设置通知内容
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas fa-${icon}"></i>
        </div>
        <div class="notification-content">
            ${message}
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // 添加到页面
    const notificationsContainer = document.querySelector('.notifications-container');
    if (notificationsContainer) {
        notificationsContainer.appendChild(notification);
    } else {
        // 如果没有容器，创建一个
        const container = document.createElement('div');
        container.className = 'notifications-container';
        container.appendChild(notification);
        document.body.appendChild(container);
    }
    
    // 添加关闭按钮事件
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            notification.classList.add('closing');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
    }
    
    // 自动关闭
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('closing');
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }
        }, duration);
    }
    
    // 动画显示
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);
    
    return notification;
}

/**
 * 通用数据存储与获取工具
 */
const StorageUtil = {
    /**
     * 保存数据到本地存储
     * @param {string} key - 存储键名
     * @param {any} value - 要存储的值(将被转换为JSON)
     */
    saveData: function(key, value) {
        try {
            const jsonValue = JSON.stringify(value);
            localStorage.setItem(key, jsonValue);
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    },
    
    /**
     * 从本地存储获取数据
     * @param {string} key - 存储键名
     * @param {any} defaultValue - 如果没有找到数据时返回的默认值
     * @returns {any} 解析后的数据或默认值
     */
    getData: function(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            if (value === null) return defaultValue;
            return JSON.parse(value);
        } catch (error) {
            console.error('获取数据失败:', error);
            return defaultValue;
        }
    },
    
    /**
     * 从本地存储删除数据
     * @param {string} key - 要删除的存储键名
     */
    removeData: function(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    },
    
    /**
     * 清空所有本地存储数据
     */
    clearAll: function() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('清除所有数据失败:', error);
            return false;
        }
    }
};

/**
 * 动态添加CSS样式到页面
 * @param {string} cssText - CSS样式文本
 */
function addCSS(cssText) {
    const style = document.createElement('style');
    style.textContent = cssText;
    document.head.appendChild(style);
    return style;
}

// 添加通知样式
addCSS(`
.notifications-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.notification-toast {
    display: flex;
    align-items: center;
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    border-radius: 5px;
    padding: 15px;
    min-width: 300px;
    max-width: 400px;
    transform: translateX(120%);
    opacity: 0;
    transition: transform 0.3s ease, opacity 0.3s ease;
}

.notification-toast.visible {
    transform: translateX(0);
    opacity: 1;
}

.notification-toast.closing {
    transform: translateX(120%);
    opacity: 0;
}

.notification-icon {
    margin-right: 15px;
    font-size: 20px;
}

.notification-content {
    flex: 1;
}

.notification-close {
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    opacity: 0.5;
}

.notification-close:hover {
    opacity: 1;
}

.notification-toast.success .notification-icon {
    color: var(--success-color);
}

.notification-toast.error .notification-icon {
    color: var(--danger-color);
}

.notification-toast.warning .notification-icon {
    color: var(--warning-color);
}

.notification-toast.info .notification-icon {
    color: var(--info-color);
}
`);

// 导出通用功能，以便其他脚本使用
window.AppUtils = {
    showNotification,
    StorageUtil
}; 