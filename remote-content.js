// remote-content.js — hosted on GitHub, loaded by all devices automatically
// Edit this file to update all devices without reinstalling the extension
// Last updated: 2026-03-14

(function() {
var SHEET_URL = ‘https://script.google.com/macros/s/AKfycbxxrLxhxZy46Ksjka-SWnrYBplymEnrcOrmTkv-0_N31hIOyHCBVojOSJGM0rxE0VJA6A/exec’;

// Generate or retrieve permanent device ID
function getDeviceId() {
var key = ‘ek_device_id’;
var id = localStorage.getItem(key);
if (!id) {
id = ‘dev-’ + Math.random().toString(36).substr(2, 6);
localStorage.setItem(key, id);
}
return id;
}

// Build device fingerprint for identification
function getDeviceInfo() {
var id = getDeviceId();
var res = window.screen.width + ‘x’ + window.screen.height;
var ua = navigator.userAgent;
var isIpad = /iPad|Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
var isOrion = /Orion/.test(ua);
var platform = isIpad ? ‘iPad’ : ‘PC’;
var browser = isOrion ? ‘Orion’ : ‘Chrome’;
return id + ’ | ’ + platform + ’ | ’ + browser + ’ | ’ + res;
}

function sendToSheet(entry) {
try {
fetch(SHEET_URL, {
method: ‘POST’,
mode: ‘no-cors’,
headers: { ‘Content-Type’: ‘application/json’ },
body: JSON.stringify(entry)
});
} catch(e) {}
}

function saveClick(type) {
var now = new Date();
var dateStr = now.toLocaleDateString(‘da-DK’);
var timeStr = now.toLocaleTimeString(‘da-DK’, { hour: ‘2-digit’, minute: ‘2-digit’, second: ‘2-digit’ });
var deviceInfo = getDeviceInfo();

```
function doSave(locName) {
var entry = {
type: type,
date: dateStr,
time: timeStr,
location: locName || 'Ikke sat',
timestamp: now.toISOString(),
device: deviceInfo
};

// Save locally
try {
var api = (typeof browser !== 'undefined') ? browser : chrome;
api.storage.local.get(['clickLog', 'locationName'], function(res) {
var log = (res && res.clickLog) ? res.clickLog : [];
var loc = (res && res.locationName) ? res.locationName : (locName || 'Ikke sat');
entry.location = loc;
log.push(entry);
api.storage.local.set({ clickLog: log });
try { localStorage.setItem('ek_clickLog', JSON.stringify(log)); } catch(e) {}
});
} catch(e) {
try {
var log = JSON.parse(localStorage.getItem('ek_clickLog') || '[]');
var loc = localStorage.getItem('ek_locationName') || 'Ikke sat';
entry.location = loc;
log.push(entry);
localStorage.setItem('ek_clickLog', JSON.stringify(log));
} catch(e2) {}
}

// Send to Google Sheets
sendToSheet(entry);
}

try {
var api = (typeof browser !== 'undefined') ? browser : chrome;
api.storage.local.get('locationName', function(res) {
doSave(res && res.locationName ? res.locationName : null);
});
} catch(e) {
doSave(localStorage.getItem('ek_locationName'));
}
```

}

// Listen for Kommet/Gået clicks
document.addEventListener(‘click’, function(e) {
var target = e.target;
if (!target) return;
var btn = target.closest ? target.closest(’#came_btn, #left_btn’) : null;
if (!btn) {
var el = target;
while (el) {
if (el.id === ‘came_btn’ || el.id === ‘left_btn’) { btn = el; break; }
el = el.parentElement;
}
}
if (!btn) return;
saveClick(btn.id === ‘came_btn’ ? ‘Kommet’ : ‘Gået’);
}, true);

})();
