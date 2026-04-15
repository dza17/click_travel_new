/**
 * sheets.js — Direction, Calendar, Passengers sheet implementations
 * painai.online / click_travel_new
 */
;(function () {
  'use strict';

  // ─── App State ────────────────────────────────────────────────────────────
  const state = {
    from:    { name: 'Москва', code: 'SVO' },
    to:      null,
    depDate: null,
    retDate: null,
    pax:     { adults: 1, children: 0, infants: 0 },
    cls:     'economy',
    // internal
    _dirField: 'to',       // 'from' | 'to'
    _calField: 'departure', // 'departure' | 'return'
  };

  // ─── Main UI Update ───────────────────────────────────────────────────────
  function updateMainUI() {
    const q = (id) => document.getElementById(id);

    // From field
    const fromEl = q('main-from-value');
    if (fromEl) fromEl.textContent = state.from ? state.from.name : 'Откуда?';

    // To field
    const toEl = q('main-to-value');
    if (toEl) {
      toEl.textContent  = state.to ? state.to.name : 'Куда летим?';
      toEl.style.color  = state.to ? 'white' : '';
    }

    // Date field
    const dateEl = q('main-date-value');
    const dateSubEl = q('main-date-sub');
    if (dateEl) {
      if (state.depDate && state.retDate) {
        dateEl.textContent    = `${fmtShort(state.depDate)} — ${fmtShort(state.retDate)}`;
        if (dateSubEl) dateSubEl.textContent = 'туда-обратно';
      } else if (state.depDate) {
        dateEl.textContent    = fmtShort(state.depDate);
        if (dateSubEl) dateSubEl.textContent = 'в одну сторону';
      } else {
        dateEl.textContent    = 'Выбрать';
        if (dateSubEl) dateSubEl.textContent = '';
      }
    }

    // Passengers field
    const paxEl    = q('main-pax-value');
    const paxClsEl = q('main-pax-class');
    if (paxEl) {
      const total = state.pax.adults + state.pax.children + state.pax.infants;
      paxEl.textContent = total === 1 ? '1 пассажир'
        : total < 5    ? `${total} пассажира`
        :                `${total} пассажиров`;
    }
    if (paxClsEl) {
      paxClsEl.textContent = state.cls === 'business' ? 'бизнес' : 'эконом';
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // A. DIRECTION SHEET
  // ─────────────────────────────────────────────────────────────────────────
  let dirSheet;

  // Popular cities (IATA codes) shown when query is empty
  const POPULAR_CODES = ['TAS','MOW','IST','DXB','ALA','HKT','BKK','ICN','SKD','DPS','LON','PAR','AUH','KUL','BHK','UGC'];

  // ── Data format (airports.js) ──────────────────────────────────────────────
  // [city_iata, name_ru, name_en, country_ru, [[airport_iata, airport_name_ru], ...]]
  const IDX = { CODE: 0, RU: 1, EN: 2, COUNTRY: 3, AIRPORTS: 4 };

  // Build lookup map lazily: city_iata → record
  let _dbMap = null;
  function getDbMap() {
    if (_dbMap) return _dbMap;
    _dbMap = Object.create(null);
    const db = window.AIRPORTS_DATA || [];
    for (let i = 0; i < db.length; i++) _dbMap[db[i][IDX.CODE]] = db[i];
    return _dbMap;
  }

  function searchAirports(query, limit) {
    limit = limit || 30;
    const db = window.AIRPORTS_DATA;
    if (!db || !db.length) return [];

    const q = query.toLowerCase();
    const p1=[],p2=[],p3=[],p4=[],p5=[],p6=[],p7=[];

    for (let i = 0; i < db.length; i++) {
      const r        = db[i];
      const code     = r[IDX.CODE].toLowerCase();
      const nameRu   = r[IDX.RU].toLowerCase();
      const nameEn   = r[IDX.EN].toLowerCase();
      const country  = r[IDX.COUNTRY].toLowerCase();
      const airports = r[IDX.AIRPORTS]; // [[iata, name], ...]

      if (code === q || code.startsWith(q))                                { p1.push(r); continue; }
      if (airports.some(a => a[0].toLowerCase().startsWith(q)))           { p2.push(r); continue; }
      if (nameRu.startsWith(q))                                            { p3.push(r); continue; }
      if (nameEn.startsWith(q))                                            { p4.push(r); continue; }
      if (nameRu.includes(q))                                              { p5.push(r); continue; }
      if (nameEn.includes(q))                                              { p6.push(r); continue; }
      if (country.startsWith(q))                                           { p7.push(r); }
    }

    return [...p1,...p2,...p3,...p4,...p5,...p6,...p7].slice(0, limit);
  }

  function initDirectionSheet() {
    const el = document.getElementById('sheet-direction');
    if (!el) return;

    dirSheet = new BottomSheet({
      el,
      scrollEl: el.querySelector('.sheet-scroll'),
      onClose: updateMainUI,
    });

    const input = el.querySelector('#dir-search-input');
    if (input) input.addEventListener('input', () => renderDirList(input.value.trim()));

    el.querySelectorAll('[data-dir-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        state._dirField = btn.dataset.dirTab;
        renderDirTabs();
        if (input) { input.value = ''; input.focus(); }
        renderDirList('');
      });
    });

    el.querySelector('#dir-close-btn')?.addEventListener('click', () => dirSheet.close());
  }

  window.openDirectionSheet = function (field) {
    state._dirField = field || 'to';
    renderDirTabs();
    const input = document.getElementById('dir-search-input');
    if (input) input.value = '';
    renderDirList('');
    if (dirSheet) dirSheet.open();
  };

  function renderDirTabs() {
    document.querySelectorAll('#sheet-direction [data-dir-tab]').forEach(btn => {
      const active = btn.dataset.dirTab === state._dirField;
      btn.style.background = active ? '#3B82F6'    : 'transparent';
      btn.style.color      = active ? '#ffffff'    : '#9CA3AF';
    });
  }

  let _dirSearchTimer = null;

  function renderDirList(query) {
    const list     = document.getElementById('dir-list');
    const labelEl  = document.getElementById('dir-list-label');
    if (!list) return;

    if (!query || query.length < 2) {
      if (labelEl) labelEl.textContent = 'Популярные направления';
      const map = getDbMap();
      const rows = POPULAR_CODES
        .map(c => map[c])
        .filter(Boolean)
        .map(r => cityGroupHTML(r))
        .join('');
      list.innerHTML = rows;
      return;
    }

    clearTimeout(_dirSearchTimer);
    _dirSearchTimer = setTimeout(() => {
      if (labelEl) labelEl.textContent = 'Результаты поиска';
      const results = searchAirports(query, 30);
      list.innerHTML = results.length
        ? results.map(r => cityGroupHTML(r)).join('')
        : `<div style="padding:40px 0;text-align:center;color:#4B5563;
                       font-size:14px;font-family:Manrope,sans-serif;">Нет совпадений</div>`;
    }, 80);
  }

  // Renders a city row + optional airport rows below (like Payme Avia style)
  function cityGroupHTML(r) {
    const cityCode  = r[IDX.CODE];
    const nameRu    = r[IDX.RU];
    const country   = r[IDX.COUNTRY];
    const airports  = r[IDX.AIRPORTS]; // [[iata, name], ...]
    const nameSafe  = nameRu.replace(/'/g, '&#39;');
    const multiAirport = airports.length > 1;

    // City row
    let html = `
      <div onclick="selectDestination('${cityCode}','${nameSafe}')"
           style="display:flex;align-items:center;padding:12px 4px 8px;
                  cursor:pointer;-webkit-tap-highlight-color:transparent;"
           onpointerdown="this.style.opacity='0.65'"
           onpointerup="this.style.opacity='1'"
           onpointercancel="this.style.opacity='1'">
        <div style="flex:1;min-width:0;">
          <div style="font-size:16px;font-weight:700;color:#fff;display:flex;align-items:baseline;gap:6px;">
            ${nameRu}
            <span style="color:#4B5563;font-size:13px;font-weight:600;">${cityCode}</span>
          </div>
          <div style="font-size:12px;color:#6B7280;margin-top:1px;">${country}</div>
        </div>
      </div>`;

    // Airport rows (only if multiple airports)
    if (multiAirport) {
      airports.forEach(([aCode, aName]) => {
        const aNameSafe = aName.replace(/'/g, '&#39;');
        html += `
          <div onclick="selectDestination('${aCode}','${aNameSafe}')"
               style="display:flex;align-items:center;padding:10px 4px 10px 16px;
                      cursor:pointer;-webkit-tap-highlight-color:transparent;
                      border-top:1px solid rgba(255,255,255,0.04);"
               onpointerdown="this.style.opacity='0.65'"
               onpointerup="this.style.opacity='1'"
               onpointercancel="this.style.opacity='1'">
            <span class="material-symbols-outlined"
                  style="font-size:18px;color:#374151;margin-right:12px;flex-shrink:0;
                         font-variation-settings:'FILL' 0,'wght' 300;">flight_takeoff</span>
            <div style="flex:1;min-width:0;">
              <div style="font-size:14px;font-weight:600;color:#e2e8f0;
                          display:flex;align-items:baseline;gap:6px;">
                ${aName}
                <span style="color:#4B5563;font-size:12px;font-weight:600;">${aCode}</span>
              </div>
              <div style="font-size:11px;color:#4B5563;margin-top:1px;">${nameRu}, ${country}</div>
            </div>
          </div>`;
      });
    }

    return `<div style="background:#0d1120;border-radius:14px;margin-bottom:8px;
                         padding:0 12px;overflow:hidden;">${html}</div>`;
  }

  window.selectDestination = function (code, name) {
    if (state._dirField === 'from') {
      state.from = { name, code };
      state._dirField = 'to';
      renderDirTabs();
      const input = document.getElementById('dir-search-input');
      if (input) { input.value = ''; input.focus(); }
      renderDirList('');
    } else {
      state.to = { name, code };
      updateMainUI();
      if (dirSheet) dirSheet.close();
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // B. CALENDAR SHEET
  // ─────────────────────────────────────────────────────────────────────────
  const MONTH_NAMES = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
  const MONTH_SHORT = ['ЯНВ','ФЕВ','МАР','АПР','МАЙ','ИЮН','ИЮЛ','АВГ','СЕН','ОКТ','НОЯ','ДЕК'];
  const MONTH_GEN   = ['Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'];
  const DAY_NAMES   = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
  const TODAY       = (() => { const d = new Date(); d.setHours(0,0,0,0); return d; })();

  function pad(n)      { return String(n).padStart(2, '0'); }
  function toKey(d)    { return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`; }
  function fromKey(k)  { const [y,m,d] = k.split('-').map(Number); return new Date(y, m-1, d); }
  function sameDay(a,b){ return a.getTime() === b.getTime() || (a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()); }
  function isAfterEq(a,b){ return a >= b; }
  function isBetween(d,s,e){ return d > s && d < e; }
  function isPast(d)   { return d < TODAY && !sameDay(d, TODAY); }
  function fmtShort(d) { return d ? `${d.getDate()} ${MONTH_SHORT[d.getMonth()]}` : '—'; }
  function fmtGen(d)   { return d ? `${d.getDate()} ${MONTH_GEN[d.getMonth()]}` : '—'; }

  function getPrice(date) {
    const dow  = date.getDay();
    const mid  = dow >= 2 && dow <= 4;
    const seed = (date.getDate() * 7 + date.getMonth() * 13) % 25;
    const val  = +(( mid ? 0.80 : 1.15 ) + seed / 100).toFixed(2);
    return { label: `${val}м`, low: val < 1.0 };
  }

  let calSheet;

  function initCalendarSheet() {
    const el = document.getElementById('sheet-calendar');
    if (!el) return;

    calSheet = new BottomSheet({
      el,
      scrollEl: el.querySelector('.sheet-scroll'),
    });

    el.querySelectorAll('[data-cal-tab]').forEach(btn => {
      btn.addEventListener('click', () => {
        state._calField = btn.dataset.calTab;
        renderCalTabs();
      });
    });

    el.querySelector('#cal-close-btn')?.addEventListener('click', () => calSheet.close());

    el.querySelector('#cal-cta-btn')?.addEventListener('click', () => {
      if (state.depDate) {
        updateMainUI();
        calSheet.close();
      }
    });

    el.querySelector('[data-tip-close]')?.addEventListener('click', () => {
      const tip = el.querySelector('.cal-tip');
      if (tip) tip.style.display = 'none';
    });
  }

  // Chip tap: set destination + open calendar immediately
  window.swapDirections = function () {
    const tmp = state.from;
    state.from = state.to;
    state.to   = tmp;
    updateMainUI();
  };

  window.selectChip = function (code, name) {
    state.to = { name, code };
    updateMainUI();
    state._calField = state.depDate ? 'return' : 'departure';
    renderCal();
    if (calSheet) calSheet.open();
  };

  window.openCalendarSheet = function () {
    state._calField = state.depDate ? 'return' : 'departure';
    renderCal();
    if (calSheet) calSheet.open();
  };

  window.handleCalTap = function (key) {
    const tapped = fromKey(key);
    if (isPast(tapped)) return;

    const dep = state.depDate;
    const ret = state.retDate;
    const f   = state._calField;

    if (f === 'departure') {
      state.depDate = tapped;
      if (ret && !isAfterEq(ret, tapped)) state.retDate = null;
      state._calField = 'return';
    } else {
      if (!dep) {
        state.depDate = tapped;
        state._calField = 'return';
      } else if (ret) {
        // Both set → start new selection
        state.depDate = tapped;
        state.retDate = null;
        state._calField = 'return';
      } else {
        if (isAfterEq(tapped, dep)) {
          if (sameDay(tapped, dep)) {
            // Tap on same day — treat as one-way
            state.retDate = null;
          } else {
            state.retDate = tapped;
          }
        } else {
          // Tapped before departure — reset departure
          state.depDate = tapped;
          state.retDate = null;
          state._calField = 'return';
        }
      }
    }

    renderCal();
  };

  function renderCal() {
    renderCalTabs();
    renderCalCTA();
    renderCalGrid();
    updateCalRoute();
  }

  function updateCalRoute() {
    const fromEl = document.getElementById('cal-route-from');
    const toEl   = document.getElementById('cal-route-to');
    if (fromEl) fromEl.textContent = state.from ? state.from.name : 'Откуда';
    if (toEl)   toEl.textContent   = state.to   ? state.to.name   : 'Куда';
  }

  function renderCalTabs() {
    document.querySelectorAll('#sheet-calendar [data-cal-tab]').forEach(btn => {
      const active = btn.dataset.calTab === state._calField;
      btn.style.background = active ? '#3B82F6'  : 'transparent';
      btn.style.color      = active ? '#ffffff'  : '#9CA3AF';
    });
    const depEl = document.getElementById('cal-dep-text');
    const retEl = document.getElementById('cal-ret-text');
    if (depEl) depEl.textContent = state.depDate ? `Туда: ${fmtGen(state.depDate)}` : 'Туда';
    if (retEl) retEl.textContent = state.retDate ? `Обратно: ${fmtGen(state.retDate)}` : 'Обратно';
  }

  function renderCalCTA() {
    const btn = document.getElementById('cal-cta-btn');
    if (!btn) return;
    const dep = state.depDate;
    const ret = state.retDate;
    if (!dep) {
      btn.style.background = '#1F2937';
      btn.style.boxShadow  = 'none';
      btn.textContent      = 'Выберите дату вылета';
    } else if (!ret) {
      btn.style.background = '#3B82F6';
      btn.style.boxShadow  = '0 4px 20px rgba(59,130,246,0.35)';
      btn.textContent      = `Туда: ${fmtShort(dep)} · укажите обратно`;
    } else {
      btn.style.background = '#3B82F6';
      btn.style.boxShadow  = '0 4px 20px rgba(59,130,246,0.35)';
      btn.textContent      = `${fmtShort(dep)} — ${fmtShort(ret)}`;
    }
  }

  function renderCalGrid() {
    const wrap = document.getElementById('cal-grid-wrap');
    if (!wrap) return;
    wrap.innerHTML = '';

    const base = new Date(TODAY.getFullYear(), TODAY.getMonth(), 1);
    for (let i = 0; i < 4; i++) {
      const mo = new Date(base.getFullYear(), base.getMonth() + i, 1);
      const yr = mo.getFullYear();
      const mn = mo.getMonth();

      const sect = document.createElement('div');
      sect.style.marginBottom = '28px';

      // Sticky month title
      const title = document.createElement('div');
      title.style.cssText = 'font-size:20px;font-weight:700;color:#fff;padding:4px 4px 16px;position:sticky;top:0;background:#0b101e;z-index:1;';
      title.textContent = `${MONTH_NAMES[mn]} ${yr}`;
      sect.appendChild(title);

      // Weekday row
      const wrow = document.createElement('div');
      wrow.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:2px;';
      DAY_NAMES.forEach(d => {
        const c = document.createElement('div');
        c.style.cssText = 'text-align:center;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#9CA3AF;opacity:0.4;padding:6px 0;';
        c.textContent = d;
        wrow.appendChild(c);
      });
      sect.appendChild(wrow);

      // Days grid
      const grid = document.createElement('div');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(7,1fr);';
      const offset = (new Date(yr, mn, 1).getDay() + 6) % 7;
      const days   = new Date(yr, mn + 1, 0).getDate();
      for (let k = 0; k < offset; k++) {
        const e = document.createElement('div');
        e.style.height = '52px';
        grid.appendChild(e);
      }
      for (let day = 1; day <= days; day++) {
        grid.appendChild(buildCalCell(yr, mn, day));
      }
      sect.appendChild(grid);
      wrap.appendChild(sect);
    }
  }

  function buildCalCell(year, month, day) {
    const date = new Date(year, month, day);
    const key  = toKey(date);
    const past = isPast(date);
    const dep  = state.depDate;
    const ret  = state.retDate;

    let ds;
    if (past)                                             ds = 'past';
    else if (dep && sameDay(date, dep))                   ds = 'departure';
    else if (ret && sameDay(date, ret))                   ds = 'return';
    else if (dep && ret && isBetween(date, dep, ret))     ds = 'range';
    else                                                  ds = 'default';

    const info  = getPrice(date);
    const outer = document.createElement('div');
    outer.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;height:52px;user-select:none;-webkit-tap-highlight-color:transparent;';
    if (!past) {
      outer.style.cursor = 'pointer';
      outer.setAttribute('onclick', `handleCalTap('${key}')`);
    }

    if (ds === 'departure' || ds === 'return') {
      outer.innerHTML = `
        <div style="width:42px;height:42px;background:#3B82F6;border-radius:50%;
                    display:flex;flex-direction:column;align-items:center;justify-content:center;
                    box-shadow:0 0 16px rgba(59,130,246,0.5);">
          <span style="font-size:15px;font-weight:700;color:#fff;line-height:1.1;">${day}</span>
          <span style="font-size:8px;color:rgba(255,255,255,0.8);text-transform:uppercase;">${info.label}</span>
        </div>`;

    } else if (ds === 'range') {
      outer.innerHTML = `
        <div style="width:100%;height:40px;background:rgba(59,130,246,0.18);border-radius:8px;
                    display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <span style="font-size:14px;font-weight:500;color:#fff;line-height:1.1;">${day}</span>
          <span style="font-size:8px;color:${info.low?'#22C55E':'#9CA3AF'};${info.low?'font-weight:600;':''}">${info.label}</span>
        </div>`;

    } else if (ds === 'past') {
      outer.style.cursor = 'default';
      outer.innerHTML = `
        <span style="font-size:14px;font-weight:400;color:rgba(255,255,255,0.18);">${day}</span>
        <span style="font-size:8px;color:rgba(156,163,175,0.2);">${info.label}</span>`;

    } else {
      if (info.low) {
        outer.innerHTML = `
          <div style="width:38px;height:38px;background:rgba(34,197,94,0.08);border-radius:50%;
                      display:flex;flex-direction:column;align-items:center;justify-content:center;">
            <span style="font-size:14px;font-weight:500;color:#fff;line-height:1.1;">${day}</span>
            <span style="font-size:8px;color:#22C55E;font-weight:600;">${info.label}</span>
          </div>`;
      } else {
        outer.innerHTML = `
          <span style="font-size:14px;font-weight:500;color:#fff;">${day}</span>
          <span style="font-size:8px;color:#6B7280;">${info.label}</span>`;
      }
    }
    return outer;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // C. PASSENGERS SHEET
  // ─────────────────────────────────────────────────────────────────────────
  const PAX_MAX = 9;
  let paxSheet;

  function initPassengersSheet() {
    const el = document.getElementById('sheet-passengers');
    if (!el) return;

    paxSheet = new BottomSheet({ el });

    el.querySelector('#pax-close-btn')?.addEventListener('click', () => paxSheet.close());

    el.querySelector('#pax-done-btn')?.addEventListener('click', () => {
      updateMainUI();
      paxSheet.close();
    });

    el.querySelectorAll('[data-pax-btn]').forEach(btn => {
      btn.addEventListener('click', () => {
        const [cat, op] = btn.dataset.paxBtn.split('-');
        changePax(cat, op === 'inc' ? 1 : -1);
      });
    });

    el.querySelectorAll('[data-pax-class]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.cls = btn.dataset.paxClass;
        renderPaxUI();
      });
    });
  }

  window.openPassengersSheet = function () {
    renderPaxUI();
    if (paxSheet) paxSheet.open();
  };

  function changePax(cat, delta) {
    const p = state.pax;
    const total = p.adults + p.children + p.infants;

    if (cat === 'adults') {
      const next = p.adults + delta;
      if (next < 1 || next > PAX_MAX) return;
      if (p.infants > next) p.infants = next; // infants can't exceed adults
      p.adults = next;
    } else if (cat === 'children') {
      const next = p.children + delta;
      if (next < 0 || total + delta > PAX_MAX) return;
      p.children = next;
    } else if (cat === 'infants') {
      const next = p.infants + delta;
      if (next < 0 || next > p.adults || total + delta > PAX_MAX) return;
      p.infants = next;
    }
    renderPaxUI();
  }

  function renderPaxUI() {
    const p = state.pax;
    const total = p.adults + p.children + p.infants;
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set('pax-adults-val',   p.adults);
    set('pax-children-val', p.children);
    set('pax-infants-val',  p.infants);

    setBtnEnabled('pax-adults-dec',   p.adults > 1);
    setBtnEnabled('pax-adults-inc',   total < PAX_MAX);
    setBtnEnabled('pax-children-dec', p.children > 0);
    setBtnEnabled('pax-children-inc', total < PAX_MAX);
    setBtnEnabled('pax-infants-dec',  p.infants > 0);
    setBtnEnabled('pax-infants-inc',  p.infants < p.adults && total < PAX_MAX);

    document.querySelectorAll('#sheet-passengers [data-pax-class]').forEach(btn => {
      const active = btn.dataset.paxClass === state.cls;
      btn.style.background  = active ? 'rgba(59,130,246,0.15)' : 'transparent';
      btn.style.color       = active ? '#ffffff'               : '#9CA3AF';
      btn.style.borderColor = active ? '#3B82F6'               : 'transparent';
    });
  }

  function setBtnEnabled(id, enabled) {
    const el = document.getElementById(id);
    if (!el) return;
    el.style.opacity       = enabled ? '1'    : '0.3';
    el.style.pointerEvents = enabled ? 'auto' : 'none';
  }

  // ─── Init ─────────────────────────────────────────────────────────────────
  function init() {
    initSheets(); // bottom-sheet.js
    initDirectionSheet();
    initCalendarSheet();
    initPassengersSheet();
    updateMainUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
