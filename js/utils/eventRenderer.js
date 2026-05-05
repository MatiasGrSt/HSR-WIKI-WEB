import { calculateStatus, parseServerDate } from './dateUtils.js';
import { EVENT_STATUS, DOM_SELECTORS } from './constants.js';

export function renderEventHTML(eventData, finVersionDate) {
    const status = calculateStatus(eventData, finVersionDate);

    if (status === EVENT_STATUS.FINISHED) {
        return '';
    }

    let statusClass = '';
    let statusText = '';
    let timeLabel = '';
    let rawTargetTime = null;

    const isGlobal = eventData.is_global == 1 || eventData.is_global == true;

    switch (status) {
        case EVENT_STATUS.ACTIVE:
            statusClass = 'status-active';
            statusText = 'Activo';
            timeLabel = 'Termina en:';
            rawTargetTime = parseServerDate(eventData.end_time, isGlobal);
            break;
        case EVENT_STATUS.UPCOMING:
            statusClass = 'status-upcoming';
            statusText = 'Próximamente';
            timeLabel = 'Empieza en:';
            rawTargetTime = parseServerDate(eventData.start_time, isGlobal);
            break;
        case EVENT_STATUS.ANNOUNCED:
            statusClass = 'status-announced';
            statusText = 'Anunciado';
            timeLabel = 'Empieza en:';
            rawTargetTime = parseServerDate(eventData.start_time, isGlobal);
            break;
    }

    const targetIso = rawTargetTime ? rawTargetTime.toISOString() : '';
    const globalBadge = isGlobal
        ? `<span class="status-label" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); margin-right: 8px;">Global</span>`
        : '';

    return `
        <div class="event-card" style="background-image: url('${eventData.icon_url}');">
            <div class="event-overlay">
                <div class="event-info">
                    <h3>${eventData.title}</h3>
                    <div style="display: flex; justify-content: flex-end; align-items: center; margin-top: 5px;">
                        ${globalBadge}
                        <span class="status-label ${statusClass}">${statusText}</span>
                    </div>
                </div>
                <p class="time-display time-countdown" data-endtime="${targetIso}" data-label="${timeLabel}">${timeLabel} Calculando...</p>
                <button class="expand-btn" onclick="toggleEvent(this)">▼</button>
            </div>
            <div class="event-details" style="display: none;">
                <div class="time-info">
                    <span class="start">Inicio: ${eventData.start_time}</span>
                    <span class="separator">|</span>
                    <span class="end">Fin: ${eventData.end_time}</span>
                </div>

                <div class="event-description">
                    <p>${eventData.description || 'No hay detalles adicionales.'}</p>
                </div>
                
                ${eventData.event_type === 'web' && eventData.web_url ? `
                <div class="event-action">
                    <a href="${eventData.web_url}" target="_blank" class="event-web-link">Ir al evento Web</a>
                </div>` : ''}
            </div>
        </div>
    `;
}

export function renderAllEvents(events, finVersionDate) {
    const activeContainer = document.querySelector(DOM_SELECTORS.eventsActive);
    const upcomingContainer = document.querySelector(DOM_SELECTORS.eventsUpcoming);

    if (!activeContainer || !upcomingContainer) {
        console.warn('Contenedores de eventos no encontrados');
        return;
    }

    let activeHTML = '';
    let upcomingHTML = '';

    events.sort((a, b) => {
        const aGlobal = a.is_global == 1 || a.is_global == true;
        const bGlobal = b.is_global == 1 || b.is_global == true;
        return parseServerDate(a.start_time, aGlobal) - parseServerDate(b.start_time, bGlobal);
    });

    events.forEach(evento => {
        const html = renderEventHTML(evento, finVersionDate);
        if (!html) return;

        const status = calculateStatus(evento, finVersionDate);
        if (status === EVENT_STATUS.ACTIVE) {
            activeHTML += html;
        } else {
            upcomingHTML += html;
        }
    });

    activeContainer.innerHTML = activeHTML;
    upcomingContainer.innerHTML = upcomingHTML;
}

export function toggleEventExpand(btn) {
    const card = btn.closest('.event-card');
    const details = card.querySelector('.event-details');

    card.classList.toggle('expanded');

    if (card.classList.contains('expanded')) {
        btn.innerText = '▲';
        if (details) details.style.display = 'block';
    } else {
        btn.innerText = '▼';
        if (details) details.style.display = 'none';
    }
}

export function renderCodesHTML(codes) {
    if (!codes || codes.length === 0) {
        return '<p style="text-align: center; color: rgba(255,255,255,0.5);">No hay códigos disponibles</p>';
    }

    let codesHTML = '';
    codes.forEach(codigo => {
        const codeValue = codigo.values || '';
        const expiresDate = codigo.expires;
        const redemptionUrl = `https://hsr.hoyoverse.com/gift?code=${codeValue}`;
        const expiresSection = expiresDate ? `<span class="code-expires">Hasta el: ${expiresDate}</span>` : '';

        codesHTML += `
            <div class="code-item" onclick="window.open('${redemptionUrl}', '_blank')">
                <span class="code-value">${codeValue}</span>
                ${expiresSection}
            </div>
        `;
    });

    return codesHTML;
}
