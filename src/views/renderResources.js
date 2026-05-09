import { store } from '../store/index.js';

let timeInterval = null;

export function renderResources() {
    // Ресурсы
    const waterEl = document.getElementById('waterCount');
    const solutionEl = document.getElementById('solutionCount');
    const seedsEl = document.getElementById('seedCount');
    const containersEl = document.getElementById('totalContainers');

    if (waterEl) waterEl.innerText = (store.resources.water || 0).toFixed(1);
    if (solutionEl) solutionEl.innerText = (store.resources.solution || 0).toFixed(1);
    if (seedsEl) seedsEl.innerText = (store.resources.seeds || 0).toFixed(1);
    if (containersEl) containersEl.innerText = store.containers.length;

    // Функция обновления даты и времени
    const updateDateTime = () => {
        const dateEl = document.getElementById('currentDate');
        const timeEl = document.getElementById('currentTime');
        if (dateEl && timeEl) {
            const now = new Date();
            dateEl.innerText = now.toLocaleDateString();   // например "14.04.2026"
            timeEl.innerText = now.toLocaleTimeString();   // "15:30:45"
        }
    };

    // Если интервал ещё не запущен, запускаем его (один раз)
    if (!timeInterval) {
        updateDateTime(); // сразу показать
        timeInterval = setInterval(updateDateTime, 1000); // каждую секунду
    } else {
        // Если интервал уже есть, просто обновим один раз
        updateDateTime();
    }
}

// Опционально: остановка интервала при выгрузке страницы (чистка)
window.addEventListener('beforeunload', () => {
    if (timeInterval) clearInterval(timeInterval);
});