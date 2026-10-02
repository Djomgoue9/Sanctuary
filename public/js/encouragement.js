// ================================
// SANCTUARY — encouragement.js
// ================================

// Messages par défaut
const messagesMatin = [
  "Bonjour ! Que cette journée soit bénie et productive. 🌸",
  "L'Éternel renouvelle vos forces chaque matin. Courage ! ✨",
  "Une tâche à la fois, vous gérez tout avec grâce. 🙏"
];

const messagesFin = [
  "Bravo ! Vous avez tout accompli aujourd'hui. Que Dieu vous bénisse ! 🎉",
  "Toutes vos tâches sont terminées — vous êtes extraordinaire ! 🌸",
  "Mission accomplie ! Reposez-vous bien, vous l'avez mérité. ✨"
];

const messagesEncouragement = [
  "Excellent ! Une tâche de moins, continuez ainsi ! 💪",
  "Bien joué ! Chaque petite victoire compte. 🌸",
  "Parfait ! Vous avancez avec grâce et efficacité. ✨",
  "Bravo ! L'Éternel voit vos efforts. Continuez ! 🙏"
];

// ================================
// TÂCHES PARTAGÉES
// ================================
function getTachesPartagees() {
  try {
    return JSON.parse(localStorage.getItem('sanctuary-taches') || '[]');
  } catch(e) {
    return [];
  }
}

function saveTachesPartagees(taches) {
  localStorage.setItem('sanctuary-taches', JSON.stringify(taches));
}

// ================================
// PROGRESSION
// ================================
function getProgression(taches) {
  if (taches.length === 0) return { total: 0, faites: 0, pct: 0 };
  const faites = taches.filter(t => t.done).length;
  return {
    total: taches.length,
    faites,
    pct: Math.round((faites / taches.length) * 100)
  };
}

// ================================
// MESSAGE IA
// ================================
async function getMessageIA(situation) {
  try {
    const response = await fetch('/api/encouragement-ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ situation })
    });
    const data = await response.json();
    return data.message;
  } catch(err) {
    return null;
  }
}

// ================================
// TOAST ENCOURAGEMENT
// ================================
function showEncouragementToast(message, type = 'success') {
  const existing = document.querySelector('.encouragement-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'encouragement-toast';
  toast.innerHTML = `
    <div class="toast-icon">${type === 'celebration' ? '🎉' : '✨'}</div>
    <div class="toast-texte">${message}</div>
    <button onclick="this.parentElement.remove()"
      class="toast-close">✕</button>
  `;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add('visible'), 100);

  setTimeout(() => {
    toast.classList.remove('visible');
    setTimeout(() => toast.remove(), 400);
  }, 5000);
}