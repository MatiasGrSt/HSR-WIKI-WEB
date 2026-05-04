import { getDailyResetDiff, formatTimeDisplay } from './dateUtils.js';
import { DOM_SELECTORS, DAILY_UPDATE_INTERVAL } from './constants.js';

let countdownUpdateInterval = null;

export function updateCountdowns() {
    const timeDisplays = document.querySelectorAll(DOM_SELECTORS.timeCountdown);
    const now = new Date();

    timeDisplays.forEach(display => {
        const endTimeStr = display.getAttribute('data-endtime');
        const labelStr = display.getAttribute('data-label') || 'Termina en:';

        if (!endTimeStr) return;

        let endTime = new Date(endTimeStr);

        if (isNaN(endTime.getTime())) {
            display.innerText = `${labelStr} ${endTimeStr}`;
            return;
        }

        const diff = endTime - now;

        if (diff <= 0) {
            display.innerText = `${labelStr} Finalizado`;
            return;
        }

        display.innerText = `${labelStr} ${formatTimeDisplay(diff, true)}`;
    });
}

export function updateDailyReset() {
    const display = document.querySelector(DOM_SELECTORS.dailyCountdown);

    if (!display) return;

    const diff = getDailyResetDiff();
    const timeStr = formatTimeDisplay(diff, false);

    display.innerText = timeStr;
}

export function startCountdownUpdates() {
    if (countdownUpdateInterval) {
        clearInterval(countdownUpdateInterval);
    }

    updateDailyReset();
    countdownUpdateInterval = setInterval(() => {
        updateDailyReset();
    }, DAILY_UPDATE_INTERVAL);
}

export function stopCountdownUpdates() {
    if (countdownUpdateInterval) {
        clearInterval(countdownUpdateInterval);
        countdownUpdateInterval = null;
    }
}
