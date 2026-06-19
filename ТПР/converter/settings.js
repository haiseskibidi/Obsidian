// Persistence layer: save/load UI settings via localStorage
const SETTINGS_KEY = 'pisec_settings';

// все контролы, которые сохраняются
const RANGE_IDS = ['font-size', 'line-height', 'margin-top', 'margin-left', 'margin-bottom', 'content-width', 'font-diversity'];
const CHECK_IDS = ['jitter-incline', 'jitter-size', 'jitter-margin', 'jitter-baseline', 'photo-lighting', 'photo-ghosting', 'photo-curves'];
const SELECT_IDS = ['font-select', 'paper-select'];

function saveSettings() {
  const data = {};
  RANGE_IDS.forEach(id => { const el = document.getElementById(id); if (el) data[id] = el.value; });
  CHECK_IDS.forEach(id => { const el = document.getElementById(id); if (el) data[id] = el.checked; });
  SELECT_IDS.forEach(id => { const el = document.getElementById(id); if (el) data[id] = el.value; });
  data['ink-color'] = window.activeColor || '#4260bb';
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(data)); } catch (_) { /* ponytail: quota exceeded — молча игнорируем */ }
}

function loadSettings() {
  let data;
  try { data = JSON.parse(localStorage.getItem(SETTINGS_KEY)); } catch (_) { return false; }
  if (!data) return false;

  RANGE_IDS.forEach(id => {
    const el = document.getElementById(id), val = document.getElementById(id + '-val');
    if (el && data[id] != null) {
      el.value = data[id];
      if (val) {
        val.textContent = id === 'font-diversity' ? `${Math.round(data[id] * 100)}%` : `${data[id]}px`;
      }
    }
  });
  CHECK_IDS.forEach(id => { const el = document.getElementById(id); if (el && data[id] != null) el.checked = data[id]; });
  SELECT_IDS.forEach(id => { const el = document.getElementById(id); if (el && data[id] != null) el.value = data[id]; });

  if (data['ink-color']) {
    window.activeColor = data['ink-color'];
    const picker = document.getElementById('ink-color-picker');
    if (picker) picker.value = data['ink-color'];
    // подсветить нужный swatch или custom
    const swatches = document.querySelectorAll('.color-swatch:not(.custom-color)');
    const customSwatch = document.querySelector('.color-swatch.custom-color');
    let matched = false;
    swatches.forEach(s => {
      s.classList.remove('active');
      if (s.getAttribute('data-color') === data['ink-color']) { s.classList.add('active'); matched = true; }
    });
    if (!matched && customSwatch) customSwatch.classList.add('active');
  }
  return true;
}

// подключаем автосохранение ко всем контролам после загрузки DOM
function initSettingsPersistence() {
  RANGE_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.addEventListener('input', saveSettings); el.addEventListener('change', saveSettings); }
  });
  CHECK_IDS.forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', saveSettings); });
  SELECT_IDS.forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('change', saveSettings); });
}

window.saveSettings = saveSettings;
window.loadSettings = loadSettings;
window.initSettingsPersistence = initSettingsPersistence;
