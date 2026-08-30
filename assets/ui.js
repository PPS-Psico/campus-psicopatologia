/* ==========================================================================
   CAMPUS PSICOPATOLOGÍA I · Cromado reutilizable
   ui.js — Tema, nav, sincronización de altura con Moodle, fechas, recortes
   ==========================================================================
   Requiere: icons.js y data.js cargados ANTES que este archivo.
   ========================================================================== */

(function () {
  'use strict';

  const DATA = window.CAMPUS_DATA || {};

  /* ========================================================================
     1. TEMA
     ======================================================================== */
  const Theme = {
    KEY: 'psicopato-campus-theme',

    init() {
      const saved = localStorage.getItem(this.KEY);
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.apply(saved || (prefersDark ? 'dark' : 'light'));

      if (!saved) {
        window.matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', (e) => this.apply(e.matches ? 'dark' : 'light'));
      }
    },

    apply(theme) { document.documentElement.setAttribute('data-theme', theme); },

    current() { return document.documentElement.getAttribute('data-theme') || 'light'; },

    toggle() {
      const next = this.current() === 'dark' ? 'light' : 'dark';
      this.apply(next);
      localStorage.setItem(this.KEY, next);
      return next;
    }
  };

  /* ========================================================================
     2. EMBED · autoajuste de altura dentro del iframe de Moodle
     Mantiene el mismo contrato que la portada ya publicada.
     ======================================================================== */
  const Embed = {
    SOURCE: 'campus-psicopatologia-i',
    lastHeight: 0,
    pending: null,

    height() {
      const b = document.body, h = document.documentElement;
      return Math.max(b.scrollHeight, b.offsetHeight, h.clientHeight, h.scrollHeight);
    },

    post(payload) {
      if (!window.parent || window.parent === window) return;
      let target = '*';
      try { if (document.referrer) target = new URL(document.referrer).origin; }
      catch { target = '*'; }
      try { window.parent.postMessage(payload, target); } catch { /* Moodle bloqueado */ }
    },

    send(reason, force) {
      if (this.pending) cancelAnimationFrame(this.pending);
      this.pending = requestAnimationFrame(() => {
        const height = this.height();
        if (!force && Math.abs(height - this.lastHeight) < 4) return;
        this.lastHeight = height;
        this.post({ type: 'campusHeight', source: this.SOURCE, height, reason });
        this.post({ height });
      });
    },

    init() {
      if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
      const start = () => {
        this.send('init', true);
        if ('ResizeObserver' in window) {
          new ResizeObserver(() => this.send('resize', false)).observe(document.body);
        }
      };
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
      } else { start(); }

      window.addEventListener('load', () => this.send('load', true));
      window.addEventListener('resize', () => this.send('window-resize', true));
      window.addEventListener('pageshow', () => this.send('pageshow', true));
    }
  };

  /* ========================================================================
     3. FECHAS
     ======================================================================== */
  const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const MONTHS_ABBR = ['ene', 'feb', 'mar', 'abr', 'may', 'jun',
                       'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

  const Dates = {
    MONTHS, MONTHS_ABBR,

    toDate(f) { return new Date(f.año, f.mes - 1, f.dia); },

    iso(f) {
      return `${f.año}-${String(f.mes).padStart(2, '0')}-${String(f.dia).padStart(2, '0')}`;
    },

    long(f) { return `${f.dia} de ${MONTHS[f.mes - 1]} de ${f.año}`; },

    /** Sin año: dentro de la cursada el año es siempre el mismo y sólo estorba. */
    short(f) { return `${f.dia} de ${MONTHS[f.mes - 1]}`; },

    /** Días desde hoy: negativo si ya pasó, 0 si es hoy. */
    daysUntil(f) {
      const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
      return Math.round((this.toDate(f) - hoy) / 86400000);
    },

    /** Rango "22 al 24 de septiembre". */
    range(desde, hasta) {
      if (!hasta) return this.short(desde);
      if (desde.mes === hasta.mes) {
        return `${desde.dia} al ${hasta.dia} de ${MONTHS[desde.mes - 1]}`;
      }
      return `${desde.dia} de ${MONTHS[desde.mes - 1]} al ${hasta.dia} de ${MONTHS[hasta.mes - 1]}`;
    },

    /** Próxima entrada del cronograma que todavía no pasó. */
    proxima(programa) {
      return (programa || DATA.PROGRAMA || [])
        .filter((e) => this.daysUntil(e.fechaFin || e.fecha) >= 0)
        .sort((a, b) => this.toDate(a.fecha) - this.toDate(b.fecha))[0] || null;
    }
  };

  /* ========================================================================
     4. NAV
     Marcado: <div data-ui="nav" data-active="clases" data-depth="../"></div>
     ======================================================================== */
  const Nav = {
    render() {
      const mount = document.querySelector('[data-ui="nav"]');
      if (!mount) return;
      const active = mount.dataset.active || '';
      const depth = mount.dataset.depth || '';

      const links = [
        { key: 'inicio', label: 'Inicio', href: `${depth}index.html` },
        { key: 'clases', label: 'Clases', href: `${depth}index.html#unidades` },
        { key: 'cronograma', label: 'Cronograma', href: `${depth}index.html#cronograma` },
        { key: 'parcial', label: 'Parcial', href: `${depth}parcial.html` }
      ];

      const renderLinks = (mobile) => links.map((l) => `
        <a class="${mobile ? 'nav__mobile-link' : 'nav__link'}${active === l.key ? ' is-active' : ''}"
           href="${l.href}"${active === l.key ? ' aria-current="page"' : ''}>${l.label}</a>
      `).join('');

      mount.innerHTML = `
        <nav class="nav" aria-label="Navegación principal">
          <div class="nav__inner">
            <a class="nav__brand" href="${depth}index.html">
              <span class="nav__brand-dot" aria-hidden="true"></span>
              Psicopatología I
            </a>
            <div class="nav__links">${renderLinks(false)}</div>
            <div class="nav__actions">
              <button class="icon-btn" type="button" id="theme-toggle"
                      aria-label="Cambiar a tema oscuro">${ICONS.svg('moon', 18)}</button>
              <button class="icon-btn nav__menu-toggle" type="button" id="nav-menu-toggle"
                      aria-label="Abrir menú" aria-expanded="false"
                      aria-controls="nav-mobile">${ICONS.svg('list', 18)}</button>
            </div>
          </div>
          <div class="nav__mobile" id="nav-mobile" hidden>${renderLinks(true)}</div>
        </nav>`;

      this.refreshThemeButton();

      document.getElementById('theme-toggle')?.addEventListener('click', () => {
        Theme.toggle();
        this.refreshThemeButton();
      });

      const menuBtn = document.getElementById('nav-menu-toggle');
      const menu = document.getElementById('nav-mobile');
      const setOpen = (open) => {
        if (!menuBtn || !menu) return;
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
        menuBtn.innerHTML = ICONS.svg(open ? 'x' : 'list', 18);
        menu.hidden = !open;
        Embed.send('menu', true);
      };
      menuBtn?.addEventListener('click', () => {
        setOpen(menuBtn.getAttribute('aria-expanded') !== 'true');
      });
      menu?.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    },

    refreshThemeButton() {
      const btn = document.getElementById('theme-toggle');
      if (!btn) return;
      const dark = Theme.current() === 'dark';
      btn.innerHTML = ICONS.svg(dark ? 'sun' : 'moon', 18);
      btn.setAttribute('aria-label', dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro');
    }
  };

  /* ========================================================================
     5. RECORTES · el resaltado barre el pasaje cuando entra en pantalla
     Es el único movimiento con intención de todo el campus.
     ======================================================================== */
  const Excerpts = {
    init() {
      const nodes = document.querySelectorAll('.excerpt');
      if (!nodes.length) return;

      if (!('IntersectionObserver' in window)) {
        nodes.forEach((n) => n.classList.add('is-lit'));
        return;
      }

      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-lit');
          io.unobserve(entry.target);
        });
      }, { threshold: 0.35 });

      nodes.forEach((n) => io.observe(n));
    }
  };

  /* ========================================================================
     6. API PÚBLICA
     ======================================================================== */
  window.CampusUI = {
    Theme, Embed, Dates, Nav, Excerpts,

    /** data.js guarda rutas desde la raíz ("units/clase-01.html").
        Si la página vive dentro de /units/, el vínculo es hermano. */
    path(href) {
      if (!href) return null;
      return location.pathname.includes('/units/') ? href.replace(/^units\//, '') : href;
    },

    init() {
      Theme.init();
      Embed.init();
      Nav.render();
      if (window.ICONS) ICONS.hydrate(document);
      Excerpts.init();
      const y = document.getElementById('year');
      if (y) y.textContent = String(new Date().getFullYear());
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => CampusUI.init(), { once: true });
  } else {
    CampusUI.init();
  }
})();
