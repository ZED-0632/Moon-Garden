// 全局变量
let currentMood = null;
let plantsData = {
    currentWeek: {
        startDate: getStartOfWeek(),
        days: []
    },
    history: []
};

// DOM元素
const moodBtns = document.querySelectorAll('.mood-btn');
const moodForm = document.getElementById('mood-form');
const noteInput = document.getElementById('note');
const submitBtn = document.getElementById('submit-btn');
const currentPlant = document.getElementById('current-plant');
const growthProgress = document.getElementById('growth-progress');
const daysRecorded = document.getElementById('days-recorded');
const plantsHistory = document.getElementById('plants-history');

// 初始化
function init() {
    loadData();
    updatePlantStatus();
    renderHistory();
    checkTodayRecord();
}

// 获取本周开始日期
function getStartOfWeek() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek.toISOString();
}

// 检查是否为新的一周
function checkNewWeek() {
    const currentStartOfWeek = getStartOfWeek();
    if (plantsData.currentWeek.startDate !== currentStartOfWeek) {
        // 保存上周数据到历史记录
        if (plantsData.currentWeek.days.length > 0) {
            plantsData.history.push({
                startDate: plantsData.currentWeek.startDate,
                days: plantsData.currentWeek.days,
                complete: plantsData.currentWeek.days.length === 7
            });
        }
        // 初始化新的一周
        plantsData.currentWeek = {
            startDate: currentStartOfWeek,
            days: []
        };
        saveData();
    }
}

// 加载数据
function loadData() {
    const savedData = localStorage.getItem('plantsData');
    if (savedData) {
        plantsData = JSON.parse(savedData);
        checkNewWeek();
    } else {
        saveData();
    }
}

// 保存数据
function saveData() {
    localStorage.setItem('plantsData', JSON.stringify(plantsData));
}

// 检查今天是否已经记录
function checkTodayRecord() {
    const today = new Date().toDateString();
    const hasRecorded = plantsData.currentWeek.days.some(day => {
        const dayDate = new Date(day.date).toDateString();
        return dayDate === today;
    });
    
    if (hasRecorded) {
        submitBtn.disabled = true;
        submitBtn.textContent = '今日已记录';
    } else {
        submitBtn.disabled = false;
        submitBtn.textContent = '记录心情';
    }
}

// 更新植物状态
function updatePlantStatus() {
    const days = plantsData.currentWeek.days.length;
    const progress = Math.round((days / 7) * 100);
    
    growthProgress.textContent = `${progress}%`;
    daysRecorded.textContent = days;
    
    // 更新植物阶段
    currentPlant.className = `plant stage-${days}`;
}

// 渲染历史植物
function renderHistory() {
    plantsHistory.innerHTML = '';
    
    plantsData.history.forEach(week => {
        const plantItem = document.createElement('div');
        plantItem.className = 'plant-item';
        
        const plant = document.createElement('div');
        plant.className = `plant stage-${week.days.length}`;
        plant.innerHTML = `
            <div class="plant-stem"></div>
            <div class="plant-leaves"></div>
            <div class="plant-flower"></div>
        `;
        
        const date = document.createElement('div');
        date.className = 'plant-date';
        const startDate = new Date(week.startDate);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        date.textContent = `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`;
        
        plantItem.appendChild(plant);
        plantItem.appendChild(date);
        plantsHistory.appendChild(plantItem);
    });
}

// 事件监听器：心情选择
moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        moodBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentMood = btn.dataset.mood;
    });
});

// 事件监听器：表单提交
moodForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!currentMood) {
        showMessage('请选择心情', 'error');
        return;
    }
    
    const today = new Date().toISOString();
    const note = noteInput.value.trim();
    
    // 添加今天的记录
    plantsData.currentWeek.days.push({
        date: today,
        mood: currentMood,
        note: note
    });
    
    saveData();
    updatePlantStatus();
    checkTodayRecord();
    
    showMessage('心情记录成功！', 'success');
    
    // 清空表单
    moodBtns.forEach(b => b.classList.remove('active'));
    noteInput.value = '';
    currentMood = null;
});

// 显示消息
function showMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    const recordSection = document.querySelector('.record-section');
    recordSection.insertBefore(message, recordSection.firstChild);
    
    setTimeout(() => {
        message.remove();
    }, 3000);
}

// 初始化应用
init();