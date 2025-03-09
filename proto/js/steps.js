/**
 * IPMI带外检测器 - 步骤导航脚本
 * 处理步骤导航的显示和交互
 */

document.addEventListener('DOMContentLoaded', function() {
    initStepsNavigation();
});

/**
 * 初始化步骤导航系统
 */
function initStepsNavigation() {
    // 获取所有步骤元素
    const steps = document.querySelectorAll('.step');
    
    // 设置步骤数量
    const totalSteps = 3;
    
    // 更新步骤进度条
    updateStepsProgress(1, totalSteps);
    
    // 为每个步骤添加点击事件（如果允许直接跳转）
    steps.forEach((step, index) => {
        step.addEventListener('click', function() {
            // 只有已完成的步骤才能点击跳转
            if (this.classList.contains('completed')) {
                // 获取当前活动步骤
                const activeStep = document.querySelector('.step.active');
                const activeStepNum = parseInt(activeStep.getAttribute('data-step'));
                
                // 获取目标步骤
                const targetStepNum = index + 1;
                
                // 如果点击的是已完成的步骤，则跳转到该步骤
                if (targetStepNum < activeStepNum) {
                    // 更新步骤状态
                    document.getElementById(`step${activeStepNum}`).classList.remove('active');
                    document.getElementById(`step${targetStepNum}`).classList.remove('completed');
                    document.getElementById(`step${targetStepNum}`).classList.add('active');
                    
                    // 更新面板显示
                    document.getElementById(`panel${activeStepNum}`).classList.remove('active');
                    document.getElementById(`panel${targetStepNum}`).classList.add('active');
                    
                    // 更新进度条
                    updateStepsProgress(targetStepNum, totalSteps);
                }
            }
        });
    });
}

/**
 * 更新步骤进度条
 * @param {number} currentStep - 当前步骤（从1开始）
 * @param {number} totalSteps - 总步骤数
 */
function updateStepsProgress(currentStep, totalSteps) {
    // 计算进度百分比
    const progressPercent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    
    // 更新进度条宽度
    const progressBar = document.querySelector('.steps-progress-bar');
    if (progressBar) {
        progressBar.style.width = `${progressPercent}%`;
    }
    
    // 更新步骤计数器
    const stepCounter = document.querySelector('.step-counter');
    if (stepCounter) {
        stepCounter.textContent = `${currentStep}/${totalSteps}`;
    }
}

/**
 * 前进到下一步
 * @param {number} currentStep - 当前步骤（从1开始）
 * @param {number} totalSteps - 总步骤数
 */
function goToNextStep(currentStep, totalSteps) {
    if (currentStep < totalSteps) {
        const nextStep = currentStep + 1;
        
        // 更新步骤状态
        document.getElementById(`step${currentStep}`).classList.remove('active');
        document.getElementById(`step${currentStep}`).classList.add('completed');
        document.getElementById(`step${nextStep}`).classList.add('active');
        
        // 更新面板显示
        document.getElementById(`panel${currentStep}`).classList.remove('active');
        document.getElementById(`panel${nextStep}`).classList.add('active');
        
        // 更新进度条
        updateStepsProgress(nextStep, totalSteps);
        
        return nextStep;
    }
    return currentStep;
}

/**
 * 返回上一步
 * @param {number} currentStep - 当前步骤（从1开始）
 * @param {number} totalSteps - 总步骤数
 */
function goToPreviousStep(currentStep, totalSteps) {
    if (currentStep > 1) {
        const prevStep = currentStep - 1;
        
        // 更新步骤状态
        document.getElementById(`step${currentStep}`).classList.remove('active');
        document.getElementById(`step${prevStep}`).classList.remove('completed');
        document.getElementById(`step${prevStep}`).classList.add('active');
        
        // 更新面板显示
        document.getElementById(`panel${currentStep}`).classList.remove('active');
        document.getElementById(`panel${prevStep}`).classList.add('active');
        
        // 更新进度条
        updateStepsProgress(prevStep, totalSteps);
        
        return prevStep;
    }
    return currentStep;
}