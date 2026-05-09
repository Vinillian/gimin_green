// main.js

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();

    document.getElementById('newBatch1Btn').addEventListener('click', createContainer);
    document.getElementById('newBatch4Btn').addEventListener('click', create4Containers);
    document.getElementById('addWaterBtn').addEventListener('click', addWater);
    document.getElementById('addSolutionBtn').addEventListener('click', addSolution);

    document.getElementById('opSowBtn').addEventListener('click', sowSelected);
    document.getElementById('opSprayBtn').addEventListener('click', spraySelected);
    document.getElementById('opWaterBtn').addEventListener('click', waterSelected);
    document.getElementById('opLightBtn').addEventListener('click', moveToLight);
    document.getElementById('opHarvestBtn').addEventListener('click', harvestSelected);
    document.getElementById('opSelectAllBtn').addEventListener('click', selectAll);
    document.getElementById('opClearSelectBtn').addEventListener('click', clearSelection);

    document.getElementById('speed1Btn').addEventListener('click', () => {
        state.speed = 1;
        document.getElementById('currentSpeed').innerText = 'x1';
        saveToLocalStorage();
        addLog('⚡ Скорость: x1 (1 день = 1 минута)');
        render();
    });
    document.getElementById('speed2Btn').addEventListener('click', () => {
        state.speed = 2;
        document.getElementById('currentSpeed').innerText = 'x2';
        saveToLocalStorage();
        addLog('⚡ Скорость: x2 (1 день = 30 секунд)');
        render();
    });
    document.getElementById('speed5Btn').addEventListener('click', () => {
        state.speed = 5;
        document.getElementById('currentSpeed').innerText = 'x5';
        saveToLocalStorage();
        addLog('⚡ Скорость: x5 (1 день = 12 секунд)');
        render();
    });

    document.getElementById('forecastWeekBtn').addEventListener('click', () => {
        state.forecastDays = 7;
        document.querySelectorAll('.forecast-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('forecastWeekBtn').classList.add('active');
        saveToLocalStorage();
        render();
    });
    document.getElementById('forecast2WeeksBtn').addEventListener('click', () => {
        state.forecastDays = 14;
        document.querySelectorAll('.forecast-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('forecast2WeeksBtn').classList.add('active');
        saveToLocalStorage();
        render();
    });
    document.getElementById('forecastMonthBtn').addEventListener('click', () => {
        state.forecastDays = 30;
        document.querySelectorAll('.forecast-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('forecastMonthBtn').classList.add('active');
        saveToLocalStorage();
        render();
    });

    // Обработчик для кнопок на карточках
    document.getElementById('containerGrid').addEventListener('click', (e) => {
        const btn = e.target.closest('.btn');
        if (!btn) return;
        e.stopPropagation();
        
        const action = btn.dataset.action;
        const id = Number(btn.dataset.id);
        
        if (action && id) {
            state.selectedIds.clear();
            state.selectedIds.add(id);
            
            switch(action) {
                case 'spray': spraySelected(); break;
                case 'water': waterSelected(); break;
                case 'light': moveToLight(); break;
                case 'harvest': harvestSelected(); break;
            }
        }
    });

    document.getElementById('currentSpeed').innerText = `x${state.speed}`;

    if (state.forecastDays === 7) document.getElementById('forecastWeekBtn').classList.add('active');
    else if (state.forecastDays === 14) document.getElementById('forecast2WeeksBtn').classList.add('active');
    else if (state.forecastDays === 30) document.getElementById('forecastMonthBtn').classList.add('active');

    if (state.containers.length === 0) {
        createContainer();
        createContainer();
    } else {
        render();
    }

    // Запускаем обновление времени каждую секунду
    setInterval(() => {
        render();
    }, 1000);
});