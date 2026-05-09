// main.js

document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();

    // Привязка кнопок
    document.getElementById('newBatch1Btn').addEventListener('click', createContainer);
    document.getElementById('newBatch4Btn').addEventListener('click', create4Containers);
    
    document.getElementById('stageSoakBtn').addEventListener('click', () => setStageForSelected('soak'));
    document.getElementById('stageAirBtn').addEventListener('click', () => setStageForSelected('air'));
    document.getElementById('stagePressBtn').addEventListener('click', () => setStageForSelected('press'));
    document.getElementById('stageLightBtn').addEventListener('click', () => setStageForSelected('light'));
    document.getElementById('resetStageBtn').addEventListener('click', resetSelectedStage);
    
    document.getElementById('selectAllBtn').addEventListener('click', selectAll);
    document.getElementById('clearSelectionBtn').addEventListener('click', clearSelection);
    
    document.getElementById('harvestSelectedBtn').addEventListener('click', harvestSelected);
    document.getElementById('deleteSelectedBtn').addEventListener('click', deleteSelected);
    
    document.getElementById('addWaterBtn').addEventListener('click', addWater);
    document.getElementById('addSolutionBtn').addEventListener('click', addSolution);
    document.getElementById('addSeedsBtn').addEventListener('click', addSeeds);

    // Начальная отрисовка
    render();
    
    // Для теста добавим контейнеры в оба поддона
    if (state.containers.length === 0) {
        // Добавляем 5 контейнеров - они заполнят первый поддон
        for (let i = 0; i < 5; i++) {
            createContainer();
        }
        
        // Добавляем еще 5 - они пойдут во второй поддон (номера 11-15)
        setTimeout(() => {
            for (let i = 0; i < 5; i++) {
                createContainer();
            }
        }, 100);
    }
});