/**
 * bottom-sheet.js — Native-feel bottom sheet engine
 * painai.online / click_travel_new
 */
;(function (global) {
  'use strict';

  // ─── Scroll Lock (iOS Safari compatible) ──────────────────────────────────
  const ScrollLock = {
    _locked: false,
    _y: 0,
    lock() {
      if (this._locked) return;
      this._locked = true;
      this._y = window.scrollY;
      Object.assign(document.body.style, {
        overflow: 'hidden',
        position: 'fixed',
        top: `-${this._y}px`,
        left: '0',
        right: '0',
      });
    },
    unlock() {
      if (!this._locked) return;
      this._locked = false;
      const y = this._y;
      Object.assign(document.body.style, {
        overflow: '',
        position: '',
        top: '',
        left: '',
        right: '',
      });
      window.scrollTo(0, y);
    },
  };

  // ─── Shared Overlay ───────────────────────────────────────────────────────
  const Overlay = {
    el: null,
    _sheet: null,

    setup() {
      if (this.el) return;
      const el = document.createElement('div');
      Object.assign(el.style, {
        position:         'fixed',
        inset:            '0',
        zIndex:           '199',
        background:       'rgba(0,0,0,0.72)',
        opacity:          '0',
        pointerEvents:    'none',
        transition:       'opacity 300ms ease',
        backdropFilter:   'blur(3px)',
        WebkitBackdropFilter: 'blur(3px)',
      });
      el.addEventListener('click', () => {
        if (this._sheet) this._sheet.close();
      });
      document.body.appendChild(el);
      this.el = el;
    },

    show(sheet) {
      this._sheet = sheet;
      this.el.style.pointerEvents = 'auto';
      // force reflow so transition fires
      this.el.getBoundingClientRect();
      this.el.style.opacity = '1';
    },

    hide() {
      this._sheet = null;
      this.el.style.opacity = '0';
      this.el.style.pointerEvents = 'none';
    },

    setAlpha(v) {
      this.el.style.opacity = String(Math.max(0, Math.min(1, v)));
    },
  };

  // ─── BottomSheet ──────────────────────────────────────────────────────────
  /**
   * @param {object} opts
   * @param {HTMLElement} opts.el        – root sheet element
   * @param {HTMLElement} [opts.scrollEl] – scrollable child (drag-conflict guard)
   * @param {function}   [opts.onOpen]
   * @param {function}   [opts.onClose]
   */
  class BottomSheet {
    constructor(opts) {
      this.el       = opts.el;
      this.scrollEl = opts.scrollEl || opts.el.querySelector('.sheet-scroll');
      this.onOpen   = opts.onOpen  || (() => {});
      this.onClose  = opts.onClose || (() => {});

      this._open     = false;
      this._dragging = false;
      this._startY   = 0;
      this._dragY    = 0;
      this._velY     = 0;
      this._lastY    = 0;
      this._lastT    = 0;

      // Initial hidden state
      this.el.style.transform  = 'translateY(100%)';
      this.el.style.willChange = 'transform';
      this.el.style.display    = 'none';

      // Bind handlers
      this._pd = this._pointerDown.bind(this);
      this._pm = this._pointerMove.bind(this);
      this._pu = this._pointerUp.bind(this);
      this._kd = this._keyDown.bind(this);

      this.el.addEventListener('pointerdown', this._pd);
    }

    get isOpen() { return this._open; }

    open() {
      if (this._open) return;
      this._open = true;

      this.el.style.display = 'flex';
      this.el.getBoundingClientRect(); // force reflow

      requestAnimationFrame(() => {
        this._tr('open');
        this.el.style.transform = 'translateY(0)';
      });

      Overlay.show(this);
      ScrollLock.lock();
      document.addEventListener('keydown', this._kd);

      // Auto-focus first text input after animation
      setTimeout(() => {
        const inp = this.el.querySelector('input[type="text"], input:not([type])');
        if (inp) inp.focus({ preventScroll: true });
      }, 320);

      this.onOpen();
    }

    close() {
      if (!this._open) return;
      this._open = false;

      this._tr('close');
      this.el.style.transform = 'translateY(100%)';

      Overlay.hide();
      ScrollLock.unlock();
      document.removeEventListener('keydown', this._kd);

      setTimeout(() => { if (!this._open) this.el.style.display = 'none'; }, 280);

      this.onClose();
    }

    // ── Transitions ────────────────────────────────────────────────────────
    _tr(type) {
      const map = {
        open:   'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
        close:  'transform 260ms cubic-bezier(0.4, 0, 1, 1)',
        spring: 'transform 420ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        none:   'none',
      };
      this.el.style.transition = map[type] || 'none';
    }

    // ── Drag to close ──────────────────────────────────────────────────────
    _pointerDown(e) {
      if (e.button && e.button !== 0) return;

      const handle     = this.el.querySelector('.sheet-handle');
      const fromHandle = handle && (e.target === handle || handle.contains(e.target));
      const atTop      = !this.scrollEl || this.scrollEl.scrollTop <= 2;

      if (!fromHandle && !atTop) return;

      // Don't initiate drag on interactive elements (buttons, inputs, labels, [onclick])
      const interactive = e.target.closest('button, input, select, textarea, label, [onclick], a');
      if (interactive && !fromHandle) return;

      this._dragging = true;
      this._startY   = e.clientY;
      this._dragY    = 0;
      this._lastY    = e.clientY;
      this._lastT    = Date.now();
      this._velY     = 0;

      this.el.setPointerCapture(e.pointerId);
      this._tr('none');

      document.addEventListener('pointermove', this._pm, { passive: true });
      document.addEventListener('pointerup',     this._pu);
      document.addEventListener('pointercancel', this._pu);
    }

    _pointerMove(e) {
      if (!this._dragging) return;
      const now = Date.now();
      const dt  = Math.max(1, now - this._lastT);
      this._velY  = (e.clientY - this._lastY) / dt * 16; // px/frame @ 60fps
      this._lastY = e.clientY;
      this._lastT = now;

      this._dragY = Math.max(0, e.clientY - this._startY);
      this.el.style.transform = `translateY(${this._dragY}px)`;
      Overlay.setAlpha(1 - (this._dragY / 300) * 0.85);
    }

    _pointerUp() {
      if (!this._dragging) return;
      this._dragging = false;

      document.removeEventListener('pointermove', this._pm);
      document.removeEventListener('pointerup',     this._pu);
      document.removeEventListener('pointercancel', this._pu);

      const snap = this.el.offsetHeight * 0.35;
      if (this._dragY > snap || this._velY > 12) {
        this.close();
      } else {
        // Spring back with bounce
        this._tr('spring');
        this.el.style.transform = 'translateY(0)';
        Overlay.setAlpha(1);
      }
    }

    _keyDown(e) {
      if (e.key === 'Escape') this.close();
    }
  }

  // ─── Public ───────────────────────────────────────────────────────────────
  function initSheets() {
    Overlay.setup();
  }

  global.BottomSheet  = BottomSheet;
  global.SheetOverlay = Overlay;
  global.initSheets   = initSheets;

})(window);
