(function () {
  function iconSvg(name) {
    var map = {
      search: '<path d="M10.5 10.5m-5.5 0a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0 -11 0"></path><path d="M15 15l4.5 4.5"></path>',
      confirmation_number: '<path d="M5 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4V8z"></path><path d="M9 9h.01M9 15h.01"></path>',
      person: '<path d="M12 12a4 4 0 1 0 0-8a4 4 0 0 0 0 8z"></path><path d="M4.5 20a7.5 7.5 0 0 1 15 0"></path>',
      settings: '<path d="M12 8.5a3.5 3.5 0 1 0 0 7a3.5 3.5 0 0 0 0-7z"></path><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34a1.7 1.7 0 0 0-1 1.55V22a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1-1.55a1.7 1.7 0 0 0-1.87.34l-.06.06A2 2 0 1 1 4.32 17l.06-.06a1.7 1.7 0 0 0 .34-1.87a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09a1.7 1.7 0 0 0 1.55-1a1.7 1.7 0 0 0-.34-1.87l-.06-.06A2 2 0 1 1 7.07 4.3l.06.06a1.7 1.7 0 0 0 1.87.34h.01A1.7 1.7 0 0 0 10 3.16V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.55a1.7 1.7 0 0 0 1.87-.34l.06-.06A2 2 0 1 1 19.76 7l-.06.06a1.7 1.7 0 0 0-.34 1.87v.01a1.7 1.7 0 0 0 1.55 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.55 1z"></path>',
      support_agent: '<path d="M4 12a8 8 0 0 1 16 0v4"></path><path d="M4 16h3v3H4zM17 16h3v3h-3z"></path><path d="M9 18a3 3 0 0 0 6 0"></path>',
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true" style="width:22px;height:22px;display:inline-block;vertical-align:middle;flex-shrink:0;color:#3B82F6;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;">' + (map[name] || '') + '</svg>';
  }

  var ITEMS = [
    { icon: 'search',              label: 'Новый поиск',    href: 'index.html' },
    { icon: 'confirmation_number', label: 'Мои брони',      href: '#' },
    { icon: 'person',              label: 'Профиль',        href: '#' },
    { icon: 'settings',            label: 'Настройки',      href: '#' },
    { icon: 'support_agent',       label: '24/7 Поддержка', href: '#' },
  ];

  function inject() {
    var overlay = document.createElement('div');
    overlay.id = 'nav-menu-overlay';
    overlay.setAttribute('style', [
      'position:fixed;inset:0;z-index:9000;',
      'display:none;align-items:flex-end;justify-content:center;',
    ].join(''));

    var backdrop = document.createElement('div');
    backdrop.setAttribute('style',
      'position:absolute;inset:0;background:rgba(0,0,0,0.55);' +
      'backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px);');
    backdrop.onclick = closeNavMenu;

    var sheet = document.createElement('div');
    sheet.id = 'nav-menu-sheet';
    sheet.setAttribute('style', [
      'position:relative;width:100%;max-width:640px;',
      'background:#0d1120;border-radius:24px 24px 0 0;',
      'border-top:1px solid rgba(255,255,255,0.06);',
      'padding-bottom:max(24px,env(safe-area-inset-bottom));',
      'transform:translateY(100%);',
      'transition:transform 0.32s cubic-bezier(0.32,0.72,0,1);',
    ].join(''));

    var handle = document.createElement('div');
    handle.setAttribute('style', 'display:flex;justify-content:center;padding:12px 0 4px;');
    handle.innerHTML = '<div style="width:36px;height:4px;background:rgba(255,255,255,0.12);border-radius:9999px;"></div>';

    var list = document.createElement('div');
    list.setAttribute('style', 'padding:4px 0 8px;');

    ITEMS.forEach(function (item) {
      var row = document.createElement('a');
      row.href = item.href;
      row.setAttribute('style', [
        'display:flex;align-items:center;gap:16px;',
        'padding:15px 24px;text-decoration:none;',
        'color:#dfe2f2;-webkit-tap-highlight-color:transparent;',
        'font-family:Manrope,sans-serif;font-size:16px;font-weight:600;',
        'transition:background 0.12s;',
      ].join(''));
      row.onpointerdown = function () { this.style.background = 'rgba(255,255,255,0.05)'; };
      row.onpointerup   = function () { this.style.background = ''; };
      row.onpointercancel = function () { this.style.background = ''; };
      row.innerHTML =
        iconSvg(item.icon) + item.label;
      list.appendChild(row);
    });

    sheet.appendChild(handle);
    sheet.appendChild(list);
    overlay.appendChild(backdrop);
    overlay.appendChild(sheet);
    document.body.appendChild(overlay);
  }

  window.openNavMenu = function () {
    var overlay = document.getElementById('nav-menu-overlay');
    overlay.style.display = 'flex';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.getElementById('nav-menu-sheet').style.transform = 'translateY(0)';
      });
    });
  };

  window.closeNavMenu = function () {
    var sheet = document.getElementById('nav-menu-sheet');
    sheet.style.transform = 'translateY(100%)';
    sheet.addEventListener('transitionend', function () {
      document.getElementById('nav-menu-overlay').style.display = 'none';
    }, { once: true });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else {
    inject();
  }
})();
