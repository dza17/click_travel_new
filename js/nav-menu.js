(function () {
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
        '<span class="material-symbols-outlined" style="font-size:22px;color:#3B82F6;">' +
        item.icon + '</span>' + item.label;
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
