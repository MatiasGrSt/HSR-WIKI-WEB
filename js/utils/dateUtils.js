import { REGION_OFFSETS, TIMEZONE_OFFSET_EU, RESET_HOUR, EVENT_STATUS } from './constants.js';

let currentRegion = null;

export function setCurrentRegion(region) {
    currentRegion = region;
}

export function getCurrentRegion() {
    return currentRegion;
}

export function getRegionOffset() {
    return REGION_OFFSETS[currentRegion] || REGION_OFFSETS.eu;
}

export function parseServerDate(dateStr, isGlobal = false) {
    if (!dateStr) return null;

    const cleanStr = dateStr.replace(' ', 'T');
    const euDate = new Date(`${cleanStr}+0${TIMEZONE_OFFSET_EU}:00`);

    if (isNaN(euDate.getTime())) {
        return new Date(cleanStr);
    }

    if (isGlobal) {
        return euDate;
    }

    return new Date(euDate.getTime() + getRegionOffset());
}

export function calculateStatus(event, finVersionDate) {
    const isGlobal = event.is_global == 1 || event.is_global == true;
    const start = parseServerDate(event.start_time, isGlobal);
    const end = parseServerDate(event.end_time, isGlobal);
    const fin = parseServerDate(finVersionDate, true);
    const now = new Date();

    if (isNaN(start) || isNaN(end)) {
        return EVENT_STATUS.FINISHED;
    }

    if (now > end) {
        return EVENT_STATUS.FINISHED;
    }

    if (start <= now && end >= now) {
        return EVENT_STATUS.ACTIVE;
    }

    if (!fin || isNaN(fin.getTime())) {
        return EVENT_STATUS.UPCOMING;
    }

    if (start > now && start <= fin) {
        return EVENT_STATUS.UPCOMING;
    }

    if (start > fin) {
        return EVENT_STATUS.ANNOUNCED;
    }

    return EVENT_STATUS.FINISHED;
}

export function getDailyResetDiff() {
    const now = new Date();
    const utcMs = now.getTime();

    let serverOffsetHours = TIMEZONE_OFFSET_EU;
    if (currentRegion === 'as') serverOffsetHours = 8;
    if (currentRegion === 'am') serverOffsetHours = -5;

    const serverTime = new Date(utcMs + serverOffsetHours * 3600000);

    const resetTime = new Date(serverTime.getTime());
    resetTime.setUTCHours(RESET_HOUR, 0, 0, 0);

    if (serverTime.getUTCHours() >= RESET_HOUR) {
        resetTime.setUTCDate(resetTime.getUTCDate() + 1);
    }

    return resetTime.getTime() - serverTime.getTime();
}

export function formatTimeDisplay(diff, showDays = true) {
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / 1000 / 60) % 60);

    if (showDays && d > 0) {
        return `${d}d ${h}h`;
    }

    const mStr = m.toString().padStart(2, '0');
    return `${h}h ${mStr}m`;
}
