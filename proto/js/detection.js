/**
 * IPMI带外检测器 - 网络检测脚本
 * 处理网络检测页面的功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 初始化步骤导航
    initStepsNavigation();
    
    // 步骤1：选择网络设备
    initNetworkDeviceSelection();
    
    // 步骤2：连接服务器复制MAC
    initServerConnectionAndMAC();
    
    // 步骤3：连接交换机获取地址
    initSwitchConnectionAndDHCP();
    
    // 初始化MAC地址点击复制功能
    initMacCopy();
});

/**
 * 初始化步骤导航系统
 */
function initStepsNavigation() {
    const steps = document.querySelectorAll('.step');
    const panels = document.querySelectorAll('.panel');
    
    // 下一步按钮事件
    const nextButtons = document.querySelectorAll('[id^="next-step"]');
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStepId = this.id.replace('next-', '');
            const currentStepNum = parseInt(currentStepId.replace('step', ''));
            const nextStepNum = currentStepNum + 1;
            
            // 标记当前步骤为已完成
            document.getElementById(`step${currentStepNum}`).classList.remove('active');
            document.getElementById(`step${currentStepNum}`).classList.add('completed');
            
            // 激活下一步
            document.getElementById(`step${nextStepNum}`).classList.add('active');
            
            // 隐藏当前面板，显示下一个面板
            document.getElementById(`panel${currentStepNum}`).classList.remove('active');
            document.getElementById(`panel${nextStepNum}`).classList.add('active');
            
            // 如果有需要，可以触发下一步的初始化事件
            if (nextStepNum === 2) {
                // 连接服务器复制MAC步骤的特殊初始化
                updateStatusWithSelectedDevice();
            } else if (nextStepNum === 3) {
                // 连接交换机获取地址步骤的特殊初始化
                // 将上一步获取的MAC地址显示在DHCP请求步骤中
                const macAddress = document.getElementById('server-mac').textContent;
                document.getElementById('mac-for-dhcp').textContent = macAddress;
            }
        });
    });
    
    // 上一步按钮事件
    const prevButtons = document.querySelectorAll('[id^="previous-step"]');
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStepId = this.id.replace('previous-', '');
            const currentStepNum = parseInt(currentStepId.replace('step', ''));
            const prevStepNum = currentStepNum - 1;
            
            // 更新步骤状态
            document.getElementById(`step${currentStepNum}`).classList.remove('active');
            document.getElementById(`step${prevStepNum}`).classList.remove('completed');
            document.getElementById(`step${prevStepNum}`).classList.add('active');
            
            // 切换面板
            document.getElementById(`panel${currentStepNum}`).classList.remove('active');
            document.getElementById(`panel${prevStepNum}`).classList.add('active');
        });
    });
}

/**
 * 获取当前选择的网络设备名称
 */
function getSelectedDevice() {
    let deviceName = "以太网";
    
    if (document.getElementById('device1').checked) {
        deviceName = "以太网";
    } else if (document.getElementById('device2').checked) {
        deviceName = "Wi-Fi";
    } else if (document.getElementById('device3').checked) {
        deviceName = "USB 以太网适配器";
    }
    
    return deviceName;
}

/**
 * 更新顶部状态卡片中的信息
 */
function updateStatusWithSelectedDevice() {
    const deviceName = getSelectedDevice();
    const interfaceStatus = document.getElementById('interface-status');
    
    if (interfaceStatus) {
        interfaceStatus.textContent = deviceName + " 已选择";
    }
}

/**
 * 初始化网络设备选择步骤
 */
function initNetworkDeviceSelection() {
    // 网络设备选择事件
    const deviceRadios = document.querySelectorAll('input[name="network-device"]');
    deviceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const deviceName = getSelectedDevice();
            document.getElementById('selected-interface').textContent = deviceName;
        });
    });
    
    // 检测按钮事件
    const checkDeviceBtn = document.getElementById('check-device');
    if (!checkDeviceBtn) return;
    
    checkDeviceBtn.addEventListener('click', function() {
        // 显示加载状态
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 检测中...';
        
        // 获取选中的设备
        const deviceName = getSelectedDevice();
        
        // 模拟检测网络接口的过程
        setTimeout(() => {
            // 更新界面信息
            document.getElementById('selected-interface').textContent = deviceName;
            document.getElementById('device-status').textContent = '已就绪';
            document.getElementById('device-status').style.color = 'var(--success-color)';
            
            // 更新顶部状态卡片信息
            const interfaceStatus = document.getElementById('interface-status');
            if (interfaceStatus) {
                interfaceStatus.textContent = deviceName + " 已选择";
                interfaceStatus.classList.add('status-connected');
            }
            
            // 恢复按钮状态
            this.disabled = false;
            this.innerHTML = '<i class="fas fa-sync-alt"></i> 检测连接';
            
            // 启用下一步按钮
            document.getElementById('next-step1').disabled = false;
            
            // 显示成功通知
            if (window.AppUtils) {
                window.AppUtils.showNotification(`已选择 ${deviceName} 网络接口`, 'success');
            }
        }, 1500);
    });
}

/**
 * 初始化连接服务器和MAC地址获取步骤
 */
function initServerConnectionAndMAC() {
    const startScanBtn = document.getElementById('check-server-connection');
    if (!startScanBtn) return;
    
    // 复制MAC地址按钮事件
    const copyMacBtn = document.getElementById('copy-mac');
    if (copyMacBtn) {
        copyMacBtn.addEventListener('click', function() {
            const macAddress = document.getElementById('server-mac').textContent;
            navigator.clipboard.writeText(macAddress)
                .then(() => {
                    if (window.AppUtils) {
                        window.AppUtils.showNotification('MAC地址已复制到剪贴板', 'success');
                    }
                })
                .catch(err => {
                    console.error('无法复制MAC地址:', err);
                });
        });
    }
    
    startScanBtn.addEventListener('click', function() {
        // 显示加载状态
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 检测中...';
        
        // 更新扫描状态
        document.getElementById('scan-status').textContent = '正在检测网络连接...';
        
        // 开始进度条动画
        const progressBar = document.getElementById('mac-progress');
        progressBar.style.width = '0%';
        
        // 模拟扫描进度
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 5;
            progressBar.style.width = `${progress}%`;
            
            // 更新扫描状态文本
            if (progress === 30) {
                document.getElementById('scan-status').textContent = '检测网络接口...';
            } else if (progress === 60) {
                document.getElementById('scan-status').textContent = '识别连接设备...';
            } else if (progress === 85) {
                document.getElementById('scan-status').textContent = '获取MAC地址...';
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                completeMACScan();
            }
        }, 100);
    });
    
    // MAC扫描完成处理函数
    function completeMACScan() {
        // 生成随机MAC地址(仅用于演示)
        const macBytes = [];
        for (let i = 0; i < 6; i++) {
            let byte = Math.floor(Math.random() * 256).toString(16).toUpperCase();
            if (byte.length === 1) byte = '0' + byte;
            macBytes.push(byte);
        }
        const macAddress = macBytes.join(':');
        
        // 确定制造商
        let manufacturer = '未知';
        if (macBytes[0] === '00' && macBytes[1] === '14' && macBytes[2] === '22') {
            manufacturer = 'Dell Inc.';
        } else if (macBytes[0] === '00' && macBytes[1] === '25' && macBytes[2] === '90') {
            manufacturer = 'Super Micro Computer';
        } else if (macBytes[0] === '00' && macBytes[1] === '1B' && macBytes[2] === '21') {
            manufacturer = 'Intel Corporate';
        } else if (macBytes[0] === '00' && macBytes[1] === 'A0' && macBytes[2] === 'C9') {
            manufacturer = 'HP Enterprise';
        }
        
        // 更新服务器连接状态
        document.getElementById('server-connection-status').innerHTML = '<i class="fas fa-check-circle"></i><span>已连接</span>';
        document.getElementById('server-connection-status').className = 'status-badge success';
        document.getElementById('server-connection-text').textContent = '已连接';
        
        // 更新扫描结果界面
        document.getElementById('server-mac').textContent = macAddress;
        document.getElementById('manufacturer').textContent = manufacturer;
        document.getElementById('scan-status').textContent = '检测完成';
        
        // 更新顶部状态卡片的MAC地址
        const currentMacElement = document.getElementById('current-mac');
        if (currentMacElement) {
            currentMacElement.textContent = macAddress;
        }
        
        // 恢复按钮状态
        startScanBtn.disabled = false;
        startScanBtn.innerHTML = '<i class="fas fa-plug"></i> 检测连接';
        
        // 启用下一步按钮
        document.getElementById('next-step2').disabled = false;
        
        // 显示成功通知
        if (window.AppUtils) {
            window.AppUtils.showNotification('成功获取服务器MAC地址', 'success');
        }
        
        // 将MAC地址保存到临时存储中，以便下一步使用
        if (window.AppUtils && window.AppUtils.StorageUtil) {
            window.AppUtils.StorageUtil.saveData('temp_mac_address', macAddress);
        }
    }
}

/**
 * 初始化连接交换机和DHCP请求步骤
 */
function initSwitchConnectionAndDHCP() {
    const requestDhcpBtn = document.getElementById('detect-dhcp');
    if (!requestDhcpBtn) return;
    
    // 当进入此步骤时，从临时存储获取MAC地址
    if (window.AppUtils && window.AppUtils.StorageUtil) {
        const savedMac = window.AppUtils.StorageUtil.getData('temp_mac_address');
        if (savedMac) {
            document.getElementById('mac-for-dhcp').textContent = savedMac;
        }
    }
    
    requestDhcpBtn.addEventListener('click', function() {
        // 显示加载状态
        this.disabled = true;
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 检测中...';
        
        // 更新请求状态
        document.getElementById('dhcp-status').textContent = '正在检测DHCP...';
        
        // 开始进度条动画
        const progressBar = document.getElementById('dhcp-progress');
        progressBar.style.width = '0%';
        
        // 模拟DHCP请求进度
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += 4;
            progressBar.style.width = `${progress}%`;
            
            // 更新请求状态文本
            if (progress === 20) {
                document.getElementById('dhcp-status').textContent = '发送DHCP发现包...';
            } else if (progress === 40) {
                document.getElementById('dhcp-status').textContent = '接收DHCP提供包...';
            } else if (progress === 60) {
                document.getElementById('dhcp-status').textContent = '发送DHCP请求包...';
            } else if (progress === 80) {
                document.getElementById('dhcp-status').textContent = '接收DHCP确认包...';
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                completeDHCPRequest();
            }
        }, 100);
    });
    
    // 保存结果按钮事件
    const saveResultBtn = document.getElementById('save-result');
    if (saveResultBtn) {
        saveResultBtn.addEventListener('click', function() {
            // 准备导出数据
            const exportData = {
                timestamp: new Date().toLocaleString(),
                deviceName: getSelectedDevice(),
                macAddress: document.getElementById('mac-for-dhcp').textContent,
                ipAddress: document.getElementById('ip-address').textContent,
                subnetMask: document.getElementById('subnet-mask').textContent,
                gateway: document.getElementById('default-gateway').textContent,
                dhcpServer: document.getElementById('dhcp-server').textContent
            };
            
            // 创建CSV内容
            let csvContent = "数据,值\n";
            csvContent += `时间,${exportData.timestamp}\n`;
            csvContent += `网络接口,${exportData.deviceName}\n`;
            csvContent += `MAC地址,${exportData.macAddress}\n`;
            csvContent += `IP地址,${exportData.ipAddress}\n`;
            csvContent += `子网掩码,${exportData.subnetMask}\n`;
            csvContent += `默认网关,${exportData.gateway}\n`;
            csvContent += `DHCP服务器,${exportData.dhcpServer}\n`;
            
            // 创建下载链接
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', url);
            link.setAttribute('download', `ipmi_detection_${new Date().getTime()}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // 显示通知
            if (window.AppUtils) {
                window.AppUtils.showNotification('结果已保存到文件', 'success');
            }
        });
    }
}

/**
 * DHCP请求完成处理函数
 */
function completeDHCPRequest() {
    // 生成随机IP地址(仅用于演示)
    const ip1 = 192;
    const ip2 = 168;
    const ip3 = 1;
    const ip4 = Math.floor(Math.random() * 100) + 100; // 100-199范围内
    const ipAddress = `${ip1}.${ip2}.${ip3}.${ip4}`;
    
    // 更新DHCP结果界面
    document.getElementById('ip-address').textContent = ipAddress;
    document.getElementById('subnet-mask').textContent = '255.255.255.0';
    document.getElementById('default-gateway').textContent = `${ip1}.${ip2}.${ip3}.1`;
    document.getElementById('dhcp-server').textContent = `${ip1}.${ip2}.${ip3}.254`;
    document.getElementById('dhcp-status').textContent = 'DHCP请求成功';
    
    // 更新顶部状态卡片的IP地址
    const currentIpElement = document.getElementById('current-ip');
    if (currentIpElement) {
        currentIpElement.textContent = ipAddress;
    }
    
    // 显示结果容器
    document.getElementById('dhcp-result-container').style.display = 'block';
    
    // 恢复按钮状态
    const requestDhcpBtn = document.getElementById('detect-dhcp');
    if (requestDhcpBtn) {
        requestDhcpBtn.disabled = false;
        requestDhcpBtn.innerHTML = '<i class="fas fa-search"></i> 手动检测';
    }
    
    // 更新交换机连接状态
    document.getElementById('switch-connection-status').innerHTML = '<i class="fas fa-check-circle"></i><span>已连接</span>';
    document.getElementById('switch-connection-status').className = 'status-badge success';
    document.getElementById('dhcp-detect-status').textContent = '已获取IP地址';
    
    // 启用保存结果按钮
    document.getElementById('save-result').disabled = false;
    
    // 显示成功通知
    if (window.AppUtils) {
        window.AppUtils.showNotification('成功获取DHCP地址', 'success');
    }
    
    // 将结果保存到历史记录
    saveToHistory({
        timestamp: new Date().toISOString(),
        deviceName: getSelectedDevice(),
        macAddress: document.getElementById('mac-for-dhcp').textContent,
        ipAddress: ipAddress,
        subnetMask: '255.255.255.0',
        gateway: `${ip1}.${ip2}.${ip3}.1`,
        dhcpServer: `${ip1}.${ip2}.${ip3}.254`,
        manufacturer: getManufacturerFromMac(document.getElementById('mac-for-dhcp').textContent),
        status: 'success'
    });
}

/**
 * 初始化MAC地址点击复制功能
 */
function initMacCopy() {
    const currentMacElement = document.getElementById('current-mac');
    if (currentMacElement) {
        currentMacElement.addEventListener('click', function() {
            // 如果MAC地址是有效的，则复制
            if (this.textContent !== '--:--:--:--:--:--') {
                navigator.clipboard.writeText(this.textContent)
                    .then(() => {
                        // 更新复制提示文本
                        const copyHint = document.getElementById('mac-copy-hint');
                        if (copyHint) {
                            copyHint.textContent = '已复制到剪贴板!';
                            setTimeout(() => {
                                copyHint.textContent = '点击复制';
                            }, 2000);
                        }
                        
                        // 显示复制成功通知
                        if (window.AppUtils) {
                            window.AppUtils.showNotification('MAC地址已复制到剪贴板', 'success');
                        }
                    })
                    .catch(err => {
                        console.error('无法复制MAC地址:', err);
                        if (window.AppUtils) {
                            window.AppUtils.showNotification('复制失败，请手动复制', 'error');
                        }
                    });
            }
        });
    }
}

/**
 * 根据MAC地址获取制造商信息
 * @param {string} macAddress - MAC地址
 * @returns {string} 制造商名称
 */
function getManufacturerFromMac(macAddress) {
    if (!macAddress) return '未知';
    
    // 简化的厂商判断(仅用于演示)
    const macPrefix = macAddress.substring(0, 8).toUpperCase();
    
    const manufacturers = {
        '00:14:22': 'Dell Inc.',
        '00:25:90': 'Super Micro Computer',
        '00:1B:21': 'Intel Corporate',
        '00:A0:C9': 'HP Enterprise',
        '00:1A:A0': 'Dell Inc.',
        '00:15:C5': 'Dell Inc.',
        '00:1E:C9': 'Dell Inc.',
        '00:21:9B': 'Dell Inc.',
        '00:1E:4F': 'Dell Inc.',
        '44:A8:42': 'Dell Inc.',
        'B8:2A:72': 'HP Enterprise',
        '00:0F:1F': 'Dell Inc.',
        '00:18:8B': 'Dell Inc.',
        '00:22:19': 'Dell Inc.',
        '00:24:E8': 'Dell Inc.',
        '00:26:B9': 'Dell Inc.',
        'F0:4D:A2': 'Dell Inc.',
        '00:1C:C4': 'HP Enterprise'
    };
    
    for (const prefix in manufacturers) {
        if (macAddress.toUpperCase().startsWith(prefix)) {
            return manufacturers[prefix];
        }
    }
    
    return '未知';
}

/**
 * 保存检测结果到历史记录
 * @param {Object} data - 检测结果数据
 */
function saveToHistory(data) {
    if (!window.AppUtils || !window.AppUtils.StorageUtil) return;
    
    // 获取现有历史记录
    const history = window.AppUtils.StorageUtil.getData('detection_history', []);
    
    // 添加新记录
    history.unshift(data); // 添加到开头
    
    // 最多保存100条记录
    if (history.length > 100) {
        history.pop(); // 移除最老的记录
    }
    
    // 保存更新后的历史记录
    window.AppUtils.StorageUtil.saveData('detection_history', history);
} 