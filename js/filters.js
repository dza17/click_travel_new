/**
 * filters.js — Unified filters + airlines sheet
 * Used by results.html and all_results.html
 *
 * Usage:
 *   const fs = new FiltersSheet({
 *     airlines: AIRLINES,          // array of {name, code, color}
 *     onApply:  (state) => { ... } // called with snapshot of filter state
 *   });
 *   window.openFilters = () => fs.open();
 */
;(function(global) {
  'use strict';

  // ── HTML templates ──────────────────────────────────────────────────────────

  function buildHTML() {
    return `
<!-- FILTERS SHEET -->
<div id="sheet-filters"
     style="position:fixed;bottom:0;left:0;right:0;z-index:300;
            display:none;flex-direction:column;
            background:#0d1120;border-radius:24px 24px 0 0;
            box-shadow:0 -12px 48px rgba(0,0,0,0.75);
            max-height:90dvh;overflow:hidden;will-change:transform;">

  <div class="sheet-handle" style="display:flex;justify-content:center;padding:12px 0 0;cursor:grab;flex-shrink:0;">
    <div style="width:40px;height:4px;background:rgba(255,255,255,0.12);border-radius:999px;"></div>
  </div>
  <header style="display:flex;align-items:center;justify-content:space-between;padding:10px 20px 14px;flex-shrink:0;">
    <h2 style="font-family:Manrope,sans-serif;font-size:20px;font-weight:800;color:#fff;margin:0;">Фильтры</h2>
    <button id="filters-close-btn"
            style="width:36px;height:36px;background:rgba(255,255,255,0.08);border:none;
                   border-radius:50%;cursor:pointer;display:flex;align-items:center;
                   justify-content:center;-webkit-tap-highlight-color:transparent;">
      <span class="material-symbols-outlined" style="color:#9CA3AF;font-size:20px;">close</span>
    </button>
  </header>

  <div id="filters-body" class="no-scrollbar sheet-scroll"
       style="flex:1;overflow-y:auto;padding:0 16px 8px;">

    <!-- Сортировка -->
    <div style="margin-bottom:24px;">
      <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#374151;margin:0 0 10px;">Сортировка</p>
      <div style="display:flex;flex-direction:column;gap:6px;" id="sort-group">
        <label data-sort="recommended"
               style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;
                      background:#121826;border-radius:14px;cursor:pointer;
                      border:1px solid rgba(255,255,255,0.05);-webkit-tap-highlight-color:transparent;">
          <span style="font-size:14px;font-weight:600;color:#fff;font-family:Manrope,sans-serif;">Рекомендуемые</span>
          <div class="sort-radio" style="width:22px;height:22px;border-radius:50%;border:2px solid #3B82F6;
               display:flex;align-items:center;justify-content:center;flex-shrink:0;">
            <div style="width:10px;height:10px;border-radius:50%;background:#3B82F6;"></div>
          </div>
        </label>
        <label data-sort="cheapest"
               style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;
                      background:#121826;border-radius:14px;cursor:pointer;
                      border:1px solid rgba(255,255,255,0.05);-webkit-tap-highlight-color:transparent;">
          <span style="font-size:14px;font-weight:600;color:#9CA3AF;font-family:Manrope,sans-serif;">Сначала дешёвые</span>
          <div class="sort-radio" style="width:22px;height:22px;border-radius:50%;border:2px solid #424754;
               display:flex;align-items:center;justify-content:center;flex-shrink:0;"></div>
        </label>
        <label data-sort="fastest"
               style="display:flex;align-items:center;justify-content:space-between;padding:14px 16px;
                      background:#121826;border-radius:14px;cursor:pointer;
                      border:1px solid rgba(255,255,255,0.05);-webkit-tap-highlight-color:transparent;">
          <span style="font-size:14px;font-weight:600;color:#9CA3AF;font-family:Manrope,sans-serif;">По времени в пути</span>
          <div class="sort-radio" style="width:22px;height:22px;border-radius:50%;border:2px solid #424754;
               display:flex;align-items:center;justify-content:center;flex-shrink:0;"></div>
        </label>
      </div>
    </div>

    <!-- Пересадки -->
    <div style="margin-bottom:24px;">
      <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#374151;margin:0 0 10px;">Пересадки</p>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button data-stops="direct"  style="padding:10px 18px;border-radius:999px;border:1px solid rgba(255,255,255,0.06);cursor:pointer;font-family:Manrope,sans-serif;font-size:13px;font-weight:700;-webkit-tap-highlight-color:transparent;transition:all 0.15s;background:#121826;color:#9CA3AF;">Прямой</button>
        <button data-stops="1stop"   style="padding:10px 18px;border-radius:999px;border:1px solid rgba(255,255,255,0.06);cursor:pointer;font-family:Manrope,sans-serif;font-size:13px;font-weight:700;-webkit-tap-highlight-color:transparent;transition:all 0.15s;background:#121826;color:#9CA3AF;">1 пересадка</button>
        <button data-stops="2plus"   style="padding:10px 18px;border-radius:999px;border:1px solid rgba(255,255,255,0.06);cursor:pointer;font-family:Manrope,sans-serif;font-size:13px;font-weight:700;-webkit-tap-highlight-color:transparent;transition:all 0.15s;background:#121826;color:#9CA3AF;">2+ пересадки</button>
      </div>
    </div>

    <!-- Время вылета -->
    <div style="margin-bottom:24px;">
      <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#374151;margin:0 0 10px;">Время вылета</p>
      <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;">
        <button data-dep="00-06" style="flex-shrink:0;padding:9px 16px;border-radius:999px;border:1px solid rgba(255,255,255,0.06);cursor:pointer;font-family:Manrope,sans-serif;font-size:12px;font-weight:700;white-space:nowrap;-webkit-tap-highlight-color:transparent;transition:all 0.15s;background:#121826;color:#9CA3AF;">🌙 00–06</button>
        <button data-dep="06-12" style="flex-shrink:0;padding:9px 16px;border-radius:999px;border:1px solid rgba(255,255,255,0.06);cursor:pointer;font-family:Manrope,sans-serif;font-size:12px;font-weight:700;white-space:nowrap;-webkit-tap-highlight-color:transparent;transition:all 0.15s;background:#121826;color:#9CA3AF;">🌅 06–12</button>
        <button data-dep="12-18" style="flex-shrink:0;padding:9px 16px;border-radius:999px;border:1px solid rgba(255,255,255,0.06);cursor:pointer;font-family:Manrope,sans-serif;font-size:12px;font-weight:700;white-space:nowrap;-webkit-tap-highlight-color:transparent;transition:all 0.15s;background:#121826;color:#9CA3AF;">☀️ 12–18</button>
        <button data-dep="18-24" style="flex-shrink:0;padding:9px 16px;border-radius:999px;border:1px solid rgba(255,255,255,0.06);cursor:pointer;font-family:Manrope,sans-serif;font-size:12px;font-weight:700;white-space:nowrap;-webkit-tap-highlight-color:transparent;transition:all 0.15s;background:#121826;color:#9CA3AF;">🌆 18–24</button>
      </div>
    </div>

    <!-- Время прилёта -->
    <div style="margin-bottom:24px;">
      <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#374151;margin:0 0 10px;">Время прилёта</p>
      <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:4px;scrollbar-width:none;">
        <button data-arr="00-06" style="flex-shrink:0;padding:9px 16px;border-radius:999px;border:1px solid rgba(255,255,255,0.06);cursor:pointer;font-family:Manrope,sans-serif;font-size:12px;font-weight:700;white-space:nowrap;-webkit-tap-highlight-color:transparent;transition:all 0.15s;background:#121826;color:#9CA3AF;">🌙 00–06</button>
        <button data-arr="06-12" style="flex-shrink:0;padding:9px 16px;border-radius:999px;border:1px solid rgba(255,255,255,0.06);cursor:pointer;font-family:Manrope,sans-serif;font-size:12px;font-weight:700;white-space:nowrap;-webkit-tap-highlight-color:transparent;transition:all 0.15s;background:#121826;color:#9CA3AF;">🌅 06–12</button>
        <button data-arr="12-18" style="flex-shrink:0;padding:9px 16px;border-radius:999px;border:1px solid rgba(255,255,255,0.06);cursor:pointer;font-family:Manrope,sans-serif;font-size:12px;font-weight:700;white-space:nowrap;-webkit-tap-highlight-color:transparent;transition:all 0.15s;background:#121826;color:#9CA3AF;">☀️ 12–18</button>
        <button data-arr="18-24" style="flex-shrink:0;padding:9px 16px;border-radius:999px;border:1px solid rgba(255,255,255,0.06);cursor:pointer;font-family:Manrope,sans-serif;font-size:12px;font-weight:700;white-space:nowrap;-webkit-tap-highlight-color:transparent;transition:all 0.15s;background:#121826;color:#9CA3AF;">🌆 18–24</button>
      </div>
    </div>

    <!-- Багаж включён -->
    <div style="display:flex;align-items:center;justify-content:space-between;
                padding:16px;background:#121826;border-radius:14px;margin-bottom:24px;
                border:1px solid rgba(255,255,255,0.05);">
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="material-symbols-outlined" style="color:#3B82F6;font-size:22px;">luggage</span>
        <span style="font-size:14px;font-weight:600;color:#fff;font-family:Manrope,sans-serif;">Багаж включён</span>
      </div>
      <div id="baggage-toggle" onclick="window._filtersSheet.toggleBaggage()"
           style="width:48px;height:28px;border-radius:999px;background:#2e3547;
                  position:relative;cursor:pointer;transition:background 0.2s;flex-shrink:0;">
        <div id="baggage-thumb"
             style="width:22px;height:22px;border-radius:50%;background:#fff;
                    position:absolute;top:3px;left:3px;transition:transform 0.2s;"></div>
      </div>
    </div>

    <!-- Авиакомпании -->
    <div onclick="window._filtersSheet.openAirlines()"
         style="display:flex;align-items:center;justify-content:space-between;
                padding:16px;background:#121826;border-radius:14px;margin-bottom:8px;
                border:1px solid rgba(255,255,255,0.05);cursor:pointer;
                -webkit-tap-highlight-color:transparent;"
         onpointerdown="this.style.background='#1a2035'"
         onpointerup="this.style.background='#121826'"
         onpointercancel="this.style.background='#121826'">
      <div style="display:flex;align-items:center;gap:12px;">
        <span class="material-symbols-outlined" style="color:#6B7280;font-size:22px;">flight_takeoff</span>
        <span style="font-size:14px;font-weight:600;color:#fff;font-family:Manrope,sans-serif;">Авиакомпании</span>
      </div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span id="airlines-label"
              style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#6B7280;">Все</span>
        <span class="material-symbols-outlined" style="color:#6B7280;font-size:20px;">chevron_right</span>
      </div>
    </div>

  </div><!-- /filters-body -->

  <div style="padding:12px 16px max(20px,env(safe-area-inset-bottom));flex-shrink:0;
              background:#0d1120;border-top:1px solid rgba(255,255,255,0.05);">
    <div style="display:flex;align-items:center;gap:12px;">
      <button id="filters-reset-btn"
              style="display:flex;align-items:center;gap:6px;padding:0 20px;height:52px;
                     background:transparent;border:none;cursor:pointer;flex-shrink:0;
                     font-family:Manrope,sans-serif;font-size:13px;font-weight:700;
                     color:#6B7280;-webkit-tap-highlight-color:transparent;transition:color 0.15s;">
        <span class="material-symbols-outlined" style="font-size:18px;">restart_alt</span>
        Сбросить
      </button>
      <button id="filters-apply-btn"
              style="flex:1;height:52px;background:#3B82F6;border:none;border-radius:999px;
                     font-family:Manrope,sans-serif;font-size:16px;font-weight:800;color:#fff;
                     cursor:pointer;box-shadow:0 4px 20px rgba(59,130,246,0.3);
                     -webkit-tap-highlight-color:transparent;transition:transform 0.1s;"
              onpointerdown="this.style.transform='scale(0.98)'"
              onpointerup="this.style.transform='scale(1)'"
              onpointercancel="this.style.transform='scale(1)'">
        Применить фильтры
      </button>
    </div>
  </div>
</div><!-- /sheet-filters -->

<!-- AIRLINES SHEET -->
<div id="sheet-airlines"
     style="position:fixed;bottom:0;left:0;right:0;z-index:400;
            display:none;flex-direction:column;
            background:#0d1120;border-radius:24px 24px 0 0;
            box-shadow:0 -12px 48px rgba(0,0,0,0.75);
            max-height:90dvh;overflow:hidden;will-change:transform;">

  <div class="sheet-handle" style="display:flex;justify-content:center;padding:12px 0 0;cursor:grab;flex-shrink:0;">
    <div style="width:40px;height:4px;background:rgba(255,255,255,0.12);border-radius:999px;"></div>
  </div>
  <header style="display:flex;align-items:center;gap:4px;padding:10px 20px 14px;flex-shrink:0;">
    <button id="airlines-back-btn"
            style="width:36px;height:36px;background:rgba(255,255,255,0.08);border:none;
                   border-radius:50%;cursor:pointer;display:flex;align-items:center;
                   justify-content:center;-webkit-tap-highlight-color:transparent;flex-shrink:0;">
      <span class="material-symbols-outlined" style="color:#9CA3AF;font-size:20px;">arrow_back</span>
    </button>
    <h2 style="font-family:Manrope,sans-serif;font-size:20px;font-weight:800;color:#fff;margin:0;flex:1;padding-left:8px;">
      Авиакомпании
    </h2>
    <button id="airlines-all-btn"
            style="padding:0 14px;height:34px;border:none;border-radius:999px;cursor:pointer;
                   font-family:Manrope,sans-serif;font-size:12px;font-weight:700;
                   -webkit-tap-highlight-color:transparent;transition:all 0.15s;
                   background:rgba(255,255,255,0.07);color:#9CA3AF;">Все</button>
  </header>

  <div id="airlines-list"
       style="flex:1;overflow-y:auto;padding:0 16px 8px;scrollbar-width:none;-ms-overflow-style:none;"></div>

  <div style="padding:12px 16px max(20px,env(safe-area-inset-bottom));flex-shrink:0;
              background:#0d1120;border-top:1px solid rgba(255,255,255,0.05);">
    <button id="airlines-apply-btn"
            style="width:100%;height:52px;background:#3B82F6;border:none;border-radius:999px;
                   font-family:Manrope,sans-serif;font-size:16px;font-weight:800;color:#fff;
                   cursor:pointer;box-shadow:0 4px 20px rgba(59,130,246,0.3);
                   -webkit-tap-highlight-color:transparent;transition:transform 0.1s;"
            onpointerdown="this.style.transform='scale(0.98)'"
            onpointerup="this.style.transform='scale(1)'"
            onpointercancel="this.style.transform='scale(1)'">
      Применить
    </button>
  </div>
</div><!-- /sheet-airlines -->`;
  }

  // ── FiltersSheet class ──────────────────────────────────────────────────────

  class FiltersSheet {
    constructor(opts) {
      this.airlines = opts.airlines || [];
      this.onApply  = opts.onApply  || function() {};

      this._fs = {
        sort:     'recommended',
        depTime:  new Set(),
        arrTime:  new Set(),
        stops:    new Set(),
        baggage:  false,
        airlines: new Set(),
      };
      this._airlinesTemp = new Set();

      // Inject HTML
      document.body.insertAdjacentHTML('beforeend', buildHTML());

      // BottomSheet instances (bottom-sheet.js must be loaded first)
      this._sheet = new BottomSheet({
        el:       document.getElementById('sheet-filters'),
        scrollEl: document.getElementById('filters-body'),
      });
      this._airlineSheet = new BottomSheet({
        el:       document.getElementById('sheet-airlines'),
        scrollEl: document.getElementById('airlines-list'),
      });

      // Expose on window for inline onclick handlers
      global._filtersSheet = this;

      this._bind();
      this._restoreFromStorage();
    }

    // ── Public API ────────────────────────────────────────────────────────────

    open()  { this._sheet.open(); }
    close() { this._sheet.close(); }

    isActive() {
      const f = this._fs;
      return f.sort !== 'recommended' || f.depTime.size > 0 || f.arrTime.size > 0 ||
             f.stops.size > 0 || f.baggage || f.airlines.size > 0;
    }

    getState() {
      const f = this._fs;
      return {
        sort:     f.sort,
        depTime:  new Set(f.depTime),
        arrTime:  new Set(f.arrTime),
        stops:    new Set(f.stops),
        baggage:  f.baggage,
        airlines: new Set(f.airlines),
      };
    }

    toggleBaggage() {
      this._fs.baggage = !this._fs.baggage;
      document.getElementById('baggage-toggle').style.background = this._fs.baggage ? '#3B82F6' : '#2e3547';
      document.getElementById('baggage-thumb').style.transform   = this._fs.baggage ? 'translateX(20px)' : 'translateX(0)';
    }

    openAirlines() {
      this._airlinesTemp = new Set(this._fs.airlines);
      this._renderAirlines(this._airlinesTemp);
      this._syncAllBtn(this._airlinesTemp);
      this._airlineSheet.open();
    }

    updateFilterBtn() {
      const btn  = document.getElementById('filter-btn');
      const icon = document.getElementById('filter-icon');
      if (!btn) return;
      const active = this.isActive();
      btn.style.background = active ? '#3B82F6' : '#1a2035';
      if (icon) icon.style.color = active ? '#fff' : '#9CA3AF';
    }

    // ── Private ───────────────────────────────────────────────────────────────

    _bind() {
      const fs   = this._fs;
      const self = this;

      document.getElementById('filters-close-btn').addEventListener('click', () => this._sheet.close());
      document.getElementById('airlines-back-btn').addEventListener('click', () => this._airlineSheet.close());

      // Sort radios
      document.getElementById('sort-group').addEventListener('click', e => {
        const lbl = e.target.closest('[data-sort]');
        if (!lbl) return;
        fs.sort = lbl.dataset.sort;
        document.querySelectorAll('#sort-group [data-sort]').forEach(l => {
          const on   = l.dataset.sort === fs.sort;
          const radio = l.querySelector('.sort-radio');
          const text  = l.querySelector('span');
          radio.style.borderColor = on ? '#3B82F6' : '#424754';
          radio.innerHTML = on ? '<div style="width:10px;height:10px;border-radius:50%;background:#3B82F6;"></div>' : '';
          if (text) text.style.color = on ? '#fff' : '#9CA3AF';
        });
      });

      // Chip toggles
      const chipToggle = (btn, set, key) => {
        if (set.has(key)) {
          set.delete(key);
          btn.style.cssText += ';background:#121826;color:#9CA3AF;border:1px solid rgba(255,255,255,0.06);';
        } else {
          set.add(key);
          btn.style.cssText += ';background:#3B82F6;color:#fff;border:1px solid transparent;';
        }
      };
      document.querySelectorAll('[data-stops]').forEach(b => b.addEventListener('click', () => chipToggle(b, fs.stops,   b.dataset.stops)));
      document.querySelectorAll('[data-dep]').forEach(b =>   b.addEventListener('click', () => chipToggle(b, fs.depTime, b.dataset.dep)));
      document.querySelectorAll('[data-arr]').forEach(b =>   b.addEventListener('click', () => chipToggle(b, fs.arrTime, b.dataset.arr)));

      // Reset
      document.getElementById('filters-reset-btn').addEventListener('click', () => {
        fs.sort = 'recommended'; fs.depTime.clear(); fs.arrTime.clear();
        fs.stops.clear(); fs.baggage = false; fs.airlines.clear();

        document.querySelectorAll('#sort-group [data-sort]').forEach(l => {
          const on    = l.dataset.sort === 'recommended';
          const radio = l.querySelector('.sort-radio');
          const text  = l.querySelector('span');
          radio.style.borderColor = on ? '#3B82F6' : '#424754';
          radio.innerHTML = on ? '<div style="width:10px;height:10px;border-radius:50%;background:#3B82F6;"></div>' : '';
          if (text) text.style.color = on ? '#fff' : '#9CA3AF';
        });
        document.querySelectorAll('[data-stops],[data-dep],[data-arr]').forEach(b => {
          b.style.background = '#121826'; b.style.color = '#9CA3AF';
          b.style.border = '1px solid rgba(255,255,255,0.06)';
        });
        document.getElementById('baggage-toggle').style.background = '#2e3547';
        document.getElementById('baggage-thumb').style.transform   = 'translateX(0)';
        this._updateAirlinesLabel();
        this.updateFilterBtn();
      });

      // Apply filters
      document.getElementById('filters-apply-btn').addEventListener('click', () => {
        this.updateFilterBtn();
        this._sheet.close();
        this.onApply(this.getState());
      });

      // Airlines: select/deselect all
      document.getElementById('airlines-all-btn').addEventListener('click', () => {
        if (this._airlinesTemp.size === this.airlines.length) {
          this._airlinesTemp.clear();
        } else {
          this.airlines.forEach(a => this._airlinesTemp.add(a.code));
        }
        this._renderAirlines(this._airlinesTemp);
        this._syncAllBtn(this._airlinesTemp);
      });

      // Airlines: apply
      document.getElementById('airlines-apply-btn').addEventListener('click', () => {
        if (this._airlinesTemp.size === this.airlines.length) this._airlinesTemp.clear();
        fs.airlines = new Set(this._airlinesTemp);
        this._updateAirlinesLabel();
        this.updateFilterBtn();
        this._airlineSheet.close();
      });
    }

    _updateAirlinesLabel() {
      const lbl = document.getElementById('airlines-label');
      if (!lbl) return;
      if (this._fs.airlines.size === 0) {
        lbl.textContent = 'Все'; lbl.style.color = '#6B7280';
      } else {
        lbl.textContent = `${this._fs.airlines.size} из ${this.airlines.length}`;
        lbl.style.color = '#3B82F6';
      }
    }

    _renderAirlines(selected) {
      const list = document.getElementById('airlines-list');
      list.innerHTML = '';
      this.airlines.forEach(a => {
        const on  = selected.has(a.code);
        const row = document.createElement('div');
        row.style.cssText = 'display:flex;align-items:center;gap:14px;padding:14px 16px;background:#121826;border-radius:14px;margin-bottom:8px;cursor:pointer;border:1px solid rgba(255,255,255,0.05);-webkit-tap-highlight-color:transparent;transition:background 0.15s;';
        row.innerHTML = `
          <div style="width:36px;height:36px;border-radius:50%;background:${a.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;pointer-events:none;">
            <span style="font-size:10px;font-weight:800;color:#fff;pointer-events:none;">${a.code}</span>
          </div>
          <span style="flex:1;font-family:Manrope,sans-serif;font-size:15px;font-weight:600;color:#fff;pointer-events:none;">${a.name}</span>
          <div style="width:24px;height:24px;border-radius:50%;flex-shrink:0;pointer-events:none;
                      border:2px solid ${on?'#3B82F6':'#374151'};background:${on?'#3B82F6':'transparent'};
                      display:flex;align-items:center;justify-content:center;transition:all 0.15s;">
            ${on?'<span class="material-symbols-outlined" style="font-size:14px;color:#fff;font-variation-settings:\'FILL\' 1;pointer-events:none;">check</span>':''}
          </div>`;
        row.addEventListener('click', () => {
          if (selected.has(a.code)) selected.delete(a.code); else selected.add(a.code);
          this._renderAirlines(selected);
          this._syncAllBtn(selected);
        });
        row.addEventListener('pointerdown',   () => { row.style.background = '#1a2035'; });
        row.addEventListener('pointerup',     () => { row.style.background = '#121826'; });
        row.addEventListener('pointercancel', () => { row.style.background = '#121826'; });
        list.appendChild(row);
      });
    }

    _syncAllBtn(selected) {
      const btn = document.getElementById('airlines-all-btn');
      if (!btn) return;
      const all = selected.size === this.airlines.length;
      btn.textContent      = all ? 'Сбросить' : 'Все';
      btn.style.background = selected.size > 0 && !all ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.07)';
      btn.style.color      = selected.size > 0 && !all ? '#3B82F6' : '#9CA3AF';
    }

    // Apply filter state saved by results.html before redirecting here
    _restoreFromStorage() {
      const raw = sessionStorage.getItem('ct_filters');
      if (!raw) return;
      sessionStorage.removeItem('ct_filters');
      let d;
      try { d = JSON.parse(raw); } catch(e) { return; }

      const fs = this._fs;
      if (d.sort && d.sort !== 'recommended') {
        fs.sort = d.sort;
        document.querySelectorAll('#sort-group [data-sort]').forEach(l => {
          const on    = l.dataset.sort === fs.sort;
          const radio = l.querySelector('.sort-radio');
          const text  = l.querySelector('span');
          radio.style.borderColor = on ? '#3B82F6' : '#424754';
          radio.innerHTML = on ? '<div style="width:10px;height:10px;border-radius:50%;background:#3B82F6;"></div>' : '';
          if (text) text.style.color = on ? '#fff' : '#9CA3AF';
        });
      }
      const activateChip = sel => {
        const b = document.querySelector(sel);
        if (b) { b.style.background = '#3B82F6'; b.style.color = '#fff'; b.style.border = '1px solid transparent'; }
      };
      (d.depTime || []).forEach(k => { fs.depTime.add(k); activateChip(`[data-dep="${k}"]`); });
      (d.arrTime || []).forEach(k => { fs.arrTime.add(k); activateChip(`[data-arr="${k}"]`); });
      (d.stops   || []).forEach(k => { fs.stops.add(k);   activateChip(`[data-stops="${k}"]`); });
      if (d.baggage) {
        fs.baggage = true;
        document.getElementById('baggage-toggle').style.background = '#3B82F6';
        document.getElementById('baggage-thumb').style.transform   = 'translateX(20px)';
      }
      this.updateFilterBtn();
    }
  }

  global.FiltersSheet = FiltersSheet;

})(window);
