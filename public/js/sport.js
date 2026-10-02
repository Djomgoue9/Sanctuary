// ================================
// SANCTUARY — sport.js
// ================================

const exercices = [
  { nom: 'Marche rapide', cat: 'cardio', duree: 20, icone: '🏃' },
  { nom: 'Sauts sur place', cat: 'cardio', duree: 10, icone: '⬆' },
  { nom: 'Yoga du matin', cat: 'yoga', duree: 15, icone: '🧘' },
  { nom: 'Respiration profonde', cat: 'yoga', duree: 10, icone: '🌬' },
  { nom: 'Squats', cat: 'muscu', duree: 10, icone: '💪' },
  { nom: 'Pompes douces', cat: 'muscu', duree: 10, icone: '🤜' },
  { nom: 'Étirements dos', cat: 'etirements', duree: 10, icone: '🤸' },
  { nom: 'Étirements jambes', cat: 'etirements', duree: 10, icone: '🦵' },
];

const messages = {
  'Pleine d\'énergie ⚡': 'Super ! On commence par du cardio pour brûler cette énergie 🔥',
  'Fatiguée 😴': 'Pas de souci — le yoga doux ou les étirements sont parfaits 🌿',
  'Calme 🌿': 'Une séance de yoga sera idéale pour vous aujourd\'hui ✨',
  'Stressée 😤': 'La respiration profonde va vous détendre rapidement 💆'
};

let chronoSport = null;
let secondesSport = 0;
let dureeSport = 0;

// ================================
// AFFICHER LES EXERCICES
// ================================
function afficherExercices(cat) {
  const liste = cat === 'tout'
    ? exercices
    : exercices.filter(e => e.cat === cat);

  document.getElementById('liste-exercices').innerHTML = liste.map(e => `
    <li>
      <span>${e.icone} ${e.nom}</span>
      <div style="display:flex;gap:8px;align-items:center;">
        <span class="duree-badge">${e.duree} min</span>
        <button class="lancer-sport"
          onclick="lancerSport('${e.nom}', ${e.duree})">
          Lancer
        </button>
      </div>
    </li>
  `).join('');
}

// ================================
// FILTRER PAR CATÉGORIE
// ================================
function filtrerSport(btn, cat) {
  document.querySelectorAll('.cat-sport')
    .forEach(b => b.classList.remove('actif'));
  btn.classList.add('actif');
  afficherExercices(cat);
}

// ================================
// ÉNERGIE DU JOUR
// ================================
function setEnergie(btn, niveau) {
  document.querySelectorAll('.energie-btn')
    .forEach(b => b.classList.remove('actif'));
  btn.classList.add('actif');
  const msg = document.getElementById('energie-message');
  msg.textContent = messages[niveau] || 'Bonne séance ! 🌸';
  msg.style.display = 'block';
}

// ================================
// LANCER UN EXERCICE
// ================================
function lancerSport(nom, dureeMin) {
  if (chronoSport) clearInterval(chronoSport);
  secondesSport = 0;
  dureeSport = dureeMin * 60;

  document.getElementById('chrono-sport-zone').style.display = 'block';
  document.getElementById('chrono-sport-nom').textContent = nom;
  document.getElementById('sport-progress-fill').style.width = '0%';

  chronoSport = setInterval(() => {
    secondesSport++;
    const mm = String(Math.floor(secondesSport / 60)).padStart(2, '0');
    const ss = String(secondesSport % 60).padStart(2, '0');
    document.getElementById('chrono-sport-temps').textContent =
      mm + ':' + ss;

    const pct = Math.min(100,
      Math.round((secondesSport / dureeSport) * 100));
    document.getElementById('sport-progress-fill').style.width = pct + '%';

    if (secondesSport >= dureeSport) {
      clearInterval(chronoSport);
      if (typeof showEncouragementToast === 'function') {
        showEncouragementToast('💪 Exercice terminé ! Bravo 🌸');
      }
      stopSport();
    }
  }, 1000);
}

// ================================
// ARRÊTER L'EXERCICE
// ================================
function stopSport() {
  clearInterval(chronoSport);
  document.getElementById('chrono-sport-zone').style.display = 'none';
  secondesSport = 0;
}

// ================================
// SUIVI POIDS
// ================================
function calculerPoids() {
  const actuel = parseFloat(
    document.getElementById('input-poids').value);
  const objectif = parseFloat(
    document.getElementById('input-objectif').value);

  if (isNaN(actuel) || isNaN(objectif)) return;

  document.getElementById('poids-actuel').textContent = actuel + ' kg';
  document.getElementById('poids-objectif').textContent = objectif + ' kg';

  const reste = Math.abs(actuel - objectif).toFixed(1);
  document.getElementById('poids-reste').textContent = reste + ' kg';

  // Sauvegarder dans localStorage
  localStorage.setItem('sanctuary-poids', JSON.stringify({
    actuel, objectif
  }));
}

function chargerPoids() {
  const poids = JSON.parse(
    localStorage.getItem('sanctuary-poids') || 'null');
  if (poids) {
    document.getElementById('input-poids').value = poids.actuel;
    document.getElementById('input-objectif').value = poids.objectif;
    calculerPoids();
  }
}

// ================================
// IA SPORT
// ================================
async function demanderIASport() {
  const question = document.getElementById('ia-sport-question').value.trim();
  if (!question) return;

  const reponseDiv = document.getElementById('ia-sport-reponse');
  const texteDiv = document.getElementById('ia-sport-reponse-texte');
  reponseDiv.style.display = 'block';
  texteDiv.textContent = '✦ Votre coach réfléchit...';

  try {
    const response = await fetch('/api/sport-ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question })
    });
    const data = await response.json();
    texteDiv.textContent = data.reponse;
  } catch (err) {
    texteDiv.textContent = 'Vérifie que le serveur est lancé.';
  }
}

function fermerIA(id) {
  document.getElementById(id).style.display = 'none';
}

// ================================
// INITIALISATION
// ================================
document.addEventListener('DOMContentLoaded', () => {
  afficherExercices('tout');
  chargerPoids();
});