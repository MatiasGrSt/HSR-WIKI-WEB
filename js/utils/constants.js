export const REGION_OFFSETS = {
    as: -7 * 60 * 60 * 1000,
    am: 6 * 60 * 60 * 1000,
    eu: 0,
};

export const REGIONS = {
    ASIA: 'as',
    AMERICA: 'am',
    EUROPE: 'eu',
};

export const DEFAULT_REGION = 'eu';

export const RESET_HOUR = 4;

export const DAILY_UPDATE_INTERVAL = 60000;

export const EVENT_STATUS = {
    ACTIVE: 'activo',
    UPCOMING: 'proximamente',
    ANNOUNCED: 'anunciado',
    FINISHED: 'finalizado',
};

export const TIMEZONE_OFFSET_EU = 1;

export const DOM_SELECTORS = {
    codesList: '#codes-list',
    eventsActive: '#events-active',
    eventsUpcoming: '#events-upcoming',
    dailyCountdown: '#daily-countdown',
    regionBtn: '.region-btn',
    expandBtn: '.expand-btn',
    timeCountdown: '.time-countdown',
};

export const STORAGE_KEYS = {
    region: 'hsr_region',
};
