/* ==========================================================================
   CAMPUS PSICOPATOLOGÍA I
   icons.js — Set de iconos dibujados, un solo grosor de trazo (1.75)
   ==========================================================================
   Uso: ICONS.svg('arrowRight', 20)
   No usar emoji en lugar de estos iconos: rompen la coherencia del trazo
   y no se pueden teñir con currentColor.
   ========================================================================== */

window.ICONS = (function () {
  'use strict';

  const PATHS = {
    arrowLeft:  '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    arrowRight: '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>',
    arrowUpRight: '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>',
    moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
    sun:  '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
    list: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    x:    '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    clock: '<circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v18H6.5A2.5 2.5 0 0 0 4 22z"/><line x1="9" y1="7" x2="16" y2="7"/><line x1="9" y1="11" x2="14" y2="11"/>',
    file: '<path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z"/><polyline points="14 2 14 7 19 7"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
    alert: '<path d="M12 3.5 2.7 19a1.4 1.4 0 0 0 1.2 2.1h16.2A1.4 1.4 0 0 0 21.3 19z"/><line x1="12" y1="9" x2="12" y2="14"/><line x1="12" y1="17.5" x2="12.01" y2="17.5"/>',
    info: '<circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="0.6" fill="currentColor"/>',
    pen: '<path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    layers: '<polygon points="12 2 22 8.5 12 15 2 8.5 12 2"/><polyline points="2 15.5 12 22 22 15.5"/>',
    scan: '<path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><line x1="7" y1="12" x2="17" y2="12"/>'
  };

  function svg(name, size) {
    const body = PATHS[name];
    if (!body) return '';
    const s = size || 20;
    return `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="1.75" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  }

  /** Reemplaza todo <span data-icon="nombre" data-size="20"> por su SVG. */
  function hydrate(root) {
    (root || document).querySelectorAll('[data-icon]').forEach((el) => {
      el.innerHTML = svg(el.dataset.icon, Number(el.dataset.size) || 20);
    });
  }

  return { svg, hydrate, PATHS };
})();
