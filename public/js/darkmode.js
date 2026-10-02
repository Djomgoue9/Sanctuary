// ================================
// SANCTUARY — darkmode.js
// ================================

function initDarkMode() {
  const mode = localStorage.getItem('sanctuary-mode') || 'clair';
  appliquerMode(mode);
}

function toggleMode() {
  const modeActuel = localStorage.getItem('sanctuary-mode') || 'clair';
  const nouveauMode = modeActuel === 'clair' ? 'sombre' : 'clair';
  localStorage.setItem('sanctuary-mode', nouveauMode);
  appliquerMode(nouveauMode);
}

function appliquerMode(mode) {
  const body = document.body;
  const btn = document.getElementById('btn-mode');

  if (mode === 'sombre') {
    body.classList.add('dark');
    if (btn) btn.textContent = '☀️';
  } else {
    body.classList.remove('dark');
    if (btn) btn.textContent = '🌙';
  }
}

// Initialiser au chargement
initDarkMode();