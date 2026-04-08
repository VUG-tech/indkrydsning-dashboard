// remote-content.js — hosted on GitHub, loaded by all devices automatically
// Last updated: 2026-04-09

(function() {
  var SHEET_URL = 'https://script.google.com/macros/s/AKfycbxxrLxhxZy46Ksjka-SWnrYBplymEnrcOrmTkv-0_N31hIOyHCBVojOSJGM0rxE0VJA6A/exec';

  function getDeviceId() {
    var key = 'ek_device_id';
    try {
      var id = localStorage.getItem(key);
      if (!id) {
        id = 'dev-' + Math.random().toString(36).substr(2, 6);
        localStorage.setItem(key, id);
      }
      return id;
    } catch(e) { return 'dev-unknown'; }
  }

  function getDeviceInfo() {
    var id = getDeviceId();
    var res = window.screen.width + 'x' + window.screen.height;
    var ua = navigator.userAgent;
    var isIpad = /iPad|Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
    var isOrion = /Orion/.test(ua);
    return id + ' | ' + (isIpad ? 'iPad' : 'PC') + ' | ' + (isOrion ? 'Orion' : 'Chrome') + ' | ' + res;
  }

  // Get the best available storage API
  function getAPI() {
    try {
      if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) return browser;
    } catch(e) {}
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) return chrome;
    } catch(e) {}
    return null;
  }

  function getLocation(callback) {
    // Try hardcoded location first (set by loader.js)
    var hardcoded = null;
    try { hardcoded = window._EK_LOCATION; } catch(e) {}
    if (hardcoded) { callback(hardcoded); return; }

    // Try localStorage
    var lsLoc = null;
    try { lsLoc = localStorage.getItem('ek_locationName'); } catch(e) {}

    // Try storage API
    var api = getAPI();
    if (api) {
      try {
        api.storage.local.get('locationName', function(res) {
          var loc = (res && res.locationName) ? res.locationName : lsLoc;
          callback(loc || 'Ikke sat');
        });
        return;
      } catch(e) {}
    }
    callback(lsLoc || 'Ikke sat');
  }

  function saveLog(entry) {
    // Save to localStorage
    try {
      var log = JSON.parse(localStorage.getItem('ek_clickLog') || '[]');
      log.push(entry);
      localStorage.setItem('ek_clickLog', JSON.stringify(log));
    } catch(e) {}

    // Save to storage API
    var api = getAPI();
    if (api) {
      try {
        api.storage.local.get('clickLog', function(res) {
          var log = (res && res.clickLog) ? res.clickLog : [];
          log.push(entry);
          api.storage.local.set({ clickLog: log });
        });
      } catch(e) {}
    }
  }

  function sendToSheet(entry) {
    try {
      fetch(SHEET_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch(e) {}
  }

  function saveClick(type) {
    var now = new Date();
    var dateStr = now.toLocaleDateString('da-DK');
    var timeStr = now.toLocaleTimeString('da-DK', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    var deviceInfo = getDeviceInfo();

    getLocation(function(locName) {
      var entry = {
        type: type,
        date: dateStr,
        time: timeStr,
        location: locName,
        timestamp: now.toISOString(),
        device: deviceInfo
      };
      saveLog(entry);
      sendToSheet(entry);
    });
  }

  document.addEventListener('click', function(e) {
    var target = e.target;
    if (!target) return;
    var btn = target.closest ? target.closest('#came_btn, #left_btn') : null;
    if (!btn) {
      var el = target;
      while (el) {
        if (el.id === 'came_btn' || el.id === 'left_btn') { btn = el; break; }
        el = el.parentElement;
      }
    }
    if (!btn) return;
    saveClick(btn.id === 'came_btn' ? 'Kommet' : 'Gået');
  }, true);

  try { localStorage.setItem('ek_script_ok', '1'); } catch(e) {}

})();
