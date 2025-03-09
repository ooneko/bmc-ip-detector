/**
 * IPMI带外检测器 - 历史记录脚本
 * 处理历史记录页面的功能
 */

document.addEventListener('DOMContentLoaded', function() {
    // 加载历史记录数据
    loadHistoryData();
    
    // 初始化筛选器和搜索功能
    initFiltersAndSearch();
    
    // 初始化导出功能
    initExportFunction();
    
    // 初始化清空功能
    initClearFunction();
    
    // 初始化记录操作(查看/删除)
    initRecordOperations();
    
    // 初始化分页
    initPagination();
});

// 当前页码和每页显示数量
let currentPage = 1;
const itemsPerPage = 20;
// 筛选后的记录
let filteredRecords = [];

/**
 * 加载历史记录数据
 */
function loadHistoryData() {
    if (!window.AppUtils || !window.AppUtils.StorageUtil) {
        showNoDataMessage();
        return;
    }
    
    // 从本地存储获取历史记录
    const historyData = window.AppUtils.StorageUtil.getData('detection_history', []);
    
    if (historyData.length === 0) {
        showNoDataMessage();
        return;
    }
    
    // 保存筛选后的记录(初始为所有记录)
    filteredRecords = [...historyData];
    
    // 显示记录
    displayRecords(filteredRecords, currentPage);
    
    // 更新分页
    updatePagination(filteredRecords.length);
}

/**
 * 显示无数据消息
 */
function showNoDataMessage() {
    const tableBody = document.querySelector('.records-table tbody');
    if (tableBody) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 30px;">
                    <i class="fas fa-info-circle" style="font-size: 24px; color: #95a5a6; margin-bottom: 10px;"></i>
                    <p>暂无历史记录数据</p>
                </td>
            </tr>
        `;
    }
    
    // 隐藏分页
    const pagination = document.querySelector('.pagination');
    if (pagination) {
        pagination.style.display = 'none';
    }
}

/**
 * 显示记录数据
 * @param {Array} records - 记录数据数组
 * @param {number} page - 当前页码
 */
function displayRecords(records, page) {
    const tableBody = document.querySelector('.records-table tbody');
    if (!tableBody) return;
    
    // 清空表格
    tableBody.innerHTML = '';
    
    // 计算显示范围
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, records.length);
    
    // 如果没有记录
    if (records.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" style="text-align: center; padding: 30px;">
                    <i class="fas fa-search" style="font-size: 24px; color: #95a5a6; margin-bottom: 10px;"></i>
                    <p>没有找到匹配的记录</p>
                </td>
            </tr>
        `;
        return;
    }
    
    // 添加记录行
    for (let i = startIndex; i < endIndex; i++) {
        const record = records[i];
        const date = new Date(record.timestamp);
        
        // 格式化日期
        const formattedDate = `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
        
        // 创建行
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${formattedDate}</td>
            <td class="mac-address">${record.macAddress || '--'}</td>
            <td>${record.ipAddress || '--'}</td>
            <td>${record.subnetMask || '--'}</td>
            <td>${record.manufacturer || '未知'}</td>
            <td><span class="status ${record.status === 'success' ? 'success' : 'error'}">${record.status === 'success' ? '成功' : '失败'}</span></td>
            <td class="actions">
                <button class="action-btn view" title="查看详情" data-index="${i}">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn delete" title="删除" data-index="${i}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        
        tableBody.appendChild(row);
    }
    
    // 添加事件监听器
    addRecordActionListeners();
}

/**
 * 为记录行添加操作事件监听器
 */
function addRecordActionListeners() {
    // 查看详情按钮
    const viewButtons = document.querySelectorAll('.action-btn.view');
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            showRecordDetails(filteredRecords[index]);
        });
    });
    
    // 删除按钮
    const deleteButtons = document.querySelectorAll('.action-btn.delete');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const index = parseInt(this.getAttribute('data-index'));
            deleteRecord(index);
        });
    });
}

/**
 * 显示记录详情
 * @param {Object} record - 记录数据
 */
function showRecordDetails(record) {
    // 获取模态框元素
    const modal = document.getElementById('details-modal');
    if (!modal) return;
    
    // 填充详情数据
    const date = new Date(record.timestamp);
    const formattedDate = `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
    
    // 基本信息
    document.querySelector('#details-modal .detail-section:nth-child(1) .detail-row:nth-child(1) .detail-value').textContent = formattedDate;
    const statusElement = document.querySelector('#details-modal .detail-section:nth-child(1) .detail-row:nth-child(2) .detail-value');
    statusElement.innerHTML = `<span class="status ${record.status === 'success' ? 'success' : 'error'}">${record.status === 'success' ? '成功' : '失败'}</span>`;
    
    // 服务器信息
    document.querySelector('#details-modal .detail-section:nth-child(2) .detail-row:nth-child(1) .detail-value').textContent = record.macAddress || '--';
    document.querySelector('#details-modal .detail-section:nth-child(2) .detail-row:nth-child(2) .detail-value').textContent = record.manufacturer || '未知';
    
    // DHCP信息
    document.querySelector('#details-modal .detail-section:nth-child(3) .detail-row:nth-child(1) .detail-value').textContent = record.ipAddress || '--';
    document.querySelector('#details-modal .detail-section:nth-child(3) .detail-row:nth-child(2) .detail-value').textContent = record.subnetMask || '--';
    document.querySelector('#details-modal .detail-section:nth-child(3) .detail-row:nth-child(3) .detail-value').textContent = record.gateway || '--';
    document.querySelector('#details-modal .detail-section:nth-child(3) .detail-row:nth-child(4) .detail-value').textContent = record.dhcpServer || '--';
    
    // 系统环境
    document.querySelector('#details-modal .detail-section:nth-child(4) .detail-row:nth-child(1) .detail-value').textContent = record.osType || '未知';
    document.querySelector('#details-modal .detail-section:nth-child(4) .detail-row:nth-child(2) .detail-value').textContent = record.networkInterface || '未知';
    
    // 显示模态框
    modal.style.display = 'flex';
    
    // 为导出按钮添加事件
    const exportButton = modal.querySelector('.modal-footer .btn.secondary');
    if (exportButton) {
        exportButton.onclick = function() {
            exportSingleRecord(record);
        };
    }
    
    // 为关闭按钮添加事件
    const closeButtons = modal.querySelectorAll('.close-btn, .close-modal');
    closeButtons.forEach(button => {
        button.onclick = function() {
            modal.style.display = 'none';
        };
    });
    
    // 点击模态框外部关闭
    modal.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}

/**
 * 删除单条记录
 * @param {number} index - 记录索引
 */
function deleteRecord(index) {
    if (!window.AppUtils || !window.AppUtils.StorageUtil) return;
    
    // 确认删除
    if (!confirm('确定要删除这条记录吗？')) return;
    
    // 获取记录
    const record = filteredRecords[index];
    
    // 从本地存储获取完整历史记录
    let historyData = window.AppUtils.StorageUtil.getData('detection_history', []);
    
    // 找到要删除的记录在完整数据中的索引
    const originalIndex = historyData.findIndex(item => 
        item.timestamp === record.timestamp && 
        item.macAddress === record.macAddress &&
        item.ipAddress === record.ipAddress
    );
    
    if (originalIndex !== -1) {
        // 从完整数据中删除
        historyData.splice(originalIndex, 1);
        
        // 保存更新后的历史记录
        window.AppUtils.StorageUtil.saveData('detection_history', historyData);
        
        // 从筛选后的记录中删除
        filteredRecords.splice(index, 1);
        
        // 重新显示记录
        displayRecords(filteredRecords, currentPage);
        
        // 更新分页
        updatePagination(filteredRecords.length);
        
        // 显示通知
        if (window.AppUtils.showNotification) {
            window.AppUtils.showNotification('记录已删除', 'success');
        }
    }
}

/**
 * 初始化筛选器和搜索功能
 */
function initFiltersAndSearch() {
    // 搜索框事件
    const searchBox = document.querySelector('.search-box input');
    const searchButton = document.querySelector('.search-box button');
    
    if (searchBox && searchButton) {
        // 搜索按钮点击事件
        searchButton.addEventListener('click', function() {
            applyFilters();
        });
        
        // 回车键搜索
        searchBox.addEventListener('keyup', function(event) {
            if (event.key === 'Enter') {
                applyFilters();
            }
        });
    }
    
    // 下拉筛选器事件
    const filterSelects = document.querySelectorAll('.filter select');
    filterSelects.forEach(select => {
        select.addEventListener('change', function() {
            applyFilters();
        });
    });
}

/**
 * 应用筛选器
 */
function applyFilters() {
    if (!window.AppUtils || !window.AppUtils.StorageUtil) return;
    
    // 获取所有历史记录
    const historyData = window.AppUtils.StorageUtil.getData('detection_history', []);
    
    // 获取搜索关键字
    const searchTerm = document.querySelector('.search-box input')?.value.toLowerCase() || '';
    
    // 获取日期范围筛选器
    const dateRangeFilter = document.querySelector('.filter:nth-child(1) select')?.value || '全部时间';
    
    // 获取状态筛选器
    const statusFilter = document.querySelector('.filter:nth-child(2) select')?.value || '全部';
    
    // 应用筛选器
    filteredRecords = historyData.filter(record => {
        // 搜索筛选
        const matchesSearch = searchTerm === '' || 
            (record.macAddress && record.macAddress.toLowerCase().includes(searchTerm)) || 
            (record.ipAddress && record.ipAddress.toLowerCase().includes(searchTerm));
        
        // 日期范围筛选
        let matchesDateRange = true;
        if (dateRangeFilter !== '全部时间') {
            const recordDate = new Date(record.timestamp);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (dateRangeFilter === '今天') {
                const todayEnd = new Date(today);
                todayEnd.setHours(23, 59, 59, 999);
                matchesDateRange = recordDate >= today && recordDate <= todayEnd;
            } else if (dateRangeFilter === '最近7天') {
                const weekAgo = new Date(today);
                weekAgo.setDate(today.getDate() - 7);
                matchesDateRange = recordDate >= weekAgo;
            } else if (dateRangeFilter === '最近30天') {
                const monthAgo = new Date(today);
                monthAgo.setDate(today.getDate() - 30);
                matchesDateRange = recordDate >= monthAgo;
            }
        }
        
        // 状态筛选
        let matchesStatus = true;
        if (statusFilter !== '全部') {
            matchesStatus = statusFilter === '成功' ? 
                record.status === 'success' : 
                record.status !== 'success';
        }
        
        return matchesSearch && matchesDateRange && matchesStatus;
    });
    
    // 重置页码
    currentPage = 1;
    
    // 显示筛选后的记录
    displayRecords(filteredRecords, currentPage);
    
    // 更新分页
    updatePagination(filteredRecords.length);
}

/**
 * 初始化导出功能
 */
function initExportFunction() {
    const exportButton = document.querySelector('.filters .btn.secondary');
    if (!exportButton) return;
    
    exportButton.addEventListener('click', function() {
        if (filteredRecords.length === 0) {
            alert('没有可导出的记录');
            return;
        }
        
        // 导出为CSV
        exportToCSV(filteredRecords);
    });
}

/**
 * 导出记录为CSV文件
 * @param {Array} records - 要导出的记录数组
 */
function exportToCSV(records) {
    // 创建CSV标题行
    let csvContent = "序号,时间,MAC地址,IP地址,子网掩码,制造商,状态\n";
    
    // 添加记录行
    records.forEach((record, index) => {
        const date = new Date(record.timestamp);
        const formattedDate = `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
        
        csvContent += `${index + 1},`;
        csvContent += `"${formattedDate}",`;
        csvContent += `"${record.macAddress || '--'}",`;
        csvContent += `"${record.ipAddress || '--'}",`;
        csvContent += `"${record.subnetMask || '--'}",`;
        csvContent += `"${record.manufacturer || '未知'}",`;
        csvContent += `"${record.status === 'success' ? '成功' : '失败'}"\n`;
    });
    
    // 创建并触发下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ipmi_history_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 显示通知
    if (window.AppUtils && window.AppUtils.showNotification) {
        window.AppUtils.showNotification('记录已导出为CSV文件', 'success');
    }
}

/**
 * 导出单条记录
 * @param {Object} record - 要导出的记录
 */
function exportSingleRecord(record) {
    // 创建CSV内容
    let csvContent = "数据,值\n";
    
    const date = new Date(record.timestamp);
    const formattedDate = `${date.getFullYear()}-${padZero(date.getMonth() + 1)}-${padZero(date.getDate())} ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}`;
    
    csvContent += `时间,"${formattedDate}"\n`;
    csvContent += `MAC地址,"${record.macAddress || '--'}"\n`;
    csvContent += `IP地址,"${record.ipAddress || '--'}"\n`;
    csvContent += `子网掩码,"${record.subnetMask || '--'}"\n`;
    csvContent += `默认网关,"${record.gateway || '--'}"\n`;
    csvContent += `DHCP服务器,"${record.dhcpServer || '--'}"\n`;
    csvContent += `制造商,"${record.manufacturer || '未知'}"\n`;
    csvContent += `状态,"${record.status === 'success' ? '成功' : '失败'}"\n`;
    
    // 创建并触发下载
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ipmi_record_${new Date().getTime()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 显示通知
    if (window.AppUtils && window.AppUtils.showNotification) {
        window.AppUtils.showNotification('记录已导出', 'success');
    }
    
    // 关闭模态框
    const modal = document.getElementById('details-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * 初始化清空功能
 */
function initClearFunction() {
    const clearButton = document.querySelector('.filters .btn.danger');
    if (!clearButton) return;
    
    clearButton.addEventListener('click', function() {
        if (filteredRecords.length === 0) {
            alert('没有可清空的记录');
            return;
        }
        
        // 确认清空
        if (!confirm('确定要清空所有历史记录吗？此操作无法撤销。')) return;
        
        if (window.AppUtils && window.AppUtils.StorageUtil) {
            // 清空历史记录
            window.AppUtils.StorageUtil.saveData('detection_history', []);
            
            // 更新显示
            filteredRecords = [];
            displayRecords(filteredRecords, 1);
            updatePagination(0);
            
            // 显示通知
            if (window.AppUtils.showNotification) {
                window.AppUtils.showNotification('所有历史记录已清空', 'success');
            }
        }
    });
}

/**
 * 初始化记录操作
 */
function initRecordOperations() {
    // 这部分在displayRecords中已经处理
}

/**
 * 初始化分页
 */
function initPagination() {
    // 获取分页按钮
    const prevButton = document.querySelector('.page-btn.prev');
    const nextButton = document.querySelector('.page-btn.next');
    
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                displayRecords(filteredRecords, currentPage);
                updatePagination(filteredRecords.length);
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                displayRecords(filteredRecords, currentPage);
                updatePagination(filteredRecords.length);
            }
        });
    }
    
    // 页码按钮事件(除了前进后退)会在updatePagination中动态添加
}

/**
 * 更新分页显示
 * @param {number} totalItems - 总记录数
 */
function updatePagination(totalItems) {
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;
    
    // 显示分页容器
    pagination.style.display = totalItems > 0 ? 'flex' : 'none';
    
    if (totalItems === 0) return;
    
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    // 清空现有页码按钮(保留前进后退按钮)
    const pageButtons = pagination.querySelectorAll('.page-btn:not(.prev):not(.next)');
    pageButtons.forEach(button => button.remove());
    
    // 移除现有省略号
    const ellipsis = pagination.querySelector('.page-ellipsis');
    if (ellipsis) ellipsis.remove();
    
    // 更新前进后退按钮状态
    const prevButton = pagination.querySelector('.page-btn.prev');
    const nextButton = pagination.querySelector('.page-btn.next');
    
    if (prevButton) {
        prevButton.classList.toggle('disabled', currentPage === 1);
    }
    
    if (nextButton) {
        nextButton.classList.toggle('disabled', currentPage === totalPages);
    }
    
    // 为页码按钮添加点击事件的函数
    function addPageButtonClickEvent(button, pageNum) {
        button.addEventListener('click', function() {
            currentPage = pageNum;
            displayRecords(filteredRecords, currentPage);
            updatePagination(totalItems);
        });
    }
    
    // 根据页数动态创建页码按钮
    if (totalPages <= 7) {
        // 少于7页时显示所有页码
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `page-btn${i === currentPage ? ' active' : ''}`;
            pageButton.textContent = i;
            
            // 在最后一个按钮前插入
            pagination.insertBefore(pageButton, nextButton);
            
            // 添加点击事件
            addPageButtonClickEvent(pageButton, i);
        }
    } else {
        // 超过7页时使用省略号
        let pagesToShow = [];
        
        // 始终显示第一页
        pagesToShow.push(1);
        
        // 当前页附近的页码
        if (currentPage > 3) pagesToShow.push('ellipsis1');
        
        if (currentPage > 2) pagesToShow.push(currentPage - 1);
        if (currentPage > 1 && currentPage < totalPages) pagesToShow.push(currentPage);
        if (currentPage < totalPages - 1) pagesToShow.push(currentPage + 1);
        
        // 当前页与最后一页之间有间隔时显示省略号
        if (currentPage < totalPages - 2) pagesToShow.push('ellipsis2');
        
        // 始终显示最后一页
        if (totalPages > 1) pagesToShow.push(totalPages);
        
        // 创建页码按钮
        for (const page of pagesToShow) {
            if (page === 'ellipsis1' || page === 'ellipsis2') {
                const ellipsis = document.createElement('span');
                ellipsis.className = 'page-ellipsis';
                ellipsis.textContent = '...';
                pagination.insertBefore(ellipsis, nextButton);
            } else {
                const pageButton = document.createElement('button');
                pageButton.className = `page-btn${page === currentPage ? ' active' : ''}`;
                pageButton.textContent = page;
                pagination.insertBefore(pageButton, nextButton);
                
                // 添加点击事件
                addPageButtonClickEvent(pageButton, page);
            }
        }
    }
}

/**
 * 格式化数字为两位数
 * @param {number} num - 要格式化的数字
 * @returns {string} 格式化后的字符串
 */
function padZero(num) {
    return num.toString().padStart(2, '0');
} 