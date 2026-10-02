// ================================
// SANCTUARY — taches.js
// Synchronisé avec Supabase
// ================================

let taches = [];
let nextId = 1;

// ================================
// CHARGEMENT DEPUIS SUPABASE
// ================================
async function chargerTaches() {
  const user = JSON.parse(localStorage.getItem('sanctuary-user-actif'));
  if (!user) return;

  const { data, error } = await db
    .from('taches')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (!error && data) {
    taches = data.map(t => ({
      id: t.id,
      nom: t.nom,
      duree: t.duree,
      done: t.done
    }));
    saveTachesPartagees(taches);
    afficherTaches();
  }
}

// ================================
// AFFICHER LES TÂCHES
// ================================
function afficherTaches() {
  const liste = document.getElementById('liste-taches');
  const prog = getProgression(taches);

  afficherMessageProgression(prog);

  if (taches.length === 0) {
    liste.innerHTML = `
      <div class="taches-vides">
        <div style="font-size:40px;margin-bottom:10px;">🌸</div>
        <p>Aucune tâche — ajoutez vos tâches du jour !</p>
      </div>`;
    return;
  }

  liste.innerHTML = taches.map(t => `
    <li class="${t.done ? 'done' : ''}" onclick="cocherTache(${t.id})">
      <div class="tache-check ${t.done ? 'checked' : ''}">
        ${t.done ? '✓' : ''}
      </div>
      <div class="tache-info">
        <span class="tache-nom">${t.nom}</span>
        <span class="tache-duree">${t.duree} min</span>
      </div>
      <div style="display:flex;gap:6px;">
        <button class="btn-lancer-tache"
          onclick="event.stopPropagation();lancerTache('${t.nom}', ${t.duree})">
          ▶
        </button>
        <button class="btn-supprimer"
          onclick="event.stopPropagation();supprimerTache(${t.id})">
          ×
        </button>
      </div>
    </li>
  `).join('');
}

// ================================
// MESSAGE DE PROGRESSION
// ================================
async function afficherMessageProgression(prog) {
  const zone = document.getElementById('message-progression');
  if (!zone) return;

  if (prog.total === 0) {
    zone.innerHTML = `
      <div class="message-progression vide">
        <span>🌅</span>
        <p>Ajoutez vos tâches du jour pour commencer !</p>
      </div>`;
    return;
  }

  if (prog.pct === 0) {
    zone.innerHTML = `
      <div class="message-progression matin">
        <span>☀️</span>
        <p>Votre journée commence — vous pouvez tout accomplir !</p>
      </div>`;
    const msg = await getMessageIA(
      'Donne un message de motivation du matin pour une femme chretienne. 2 phrases max.'
    );
    if (msg) zone.querySelector('p').textContent = msg;
    return;
  }

  if (prog.pct === 100) {
    zone.innerHTML = `
      <div class="message-progression fini">
        <span>🎉</span>
        <p>Toutes vos tâches sont accomplies !</p>
      </div>`;
    const msg = await getMessageIA(
      'Felicite une femme chretienne qui a termine toutes ses taches. 2 phrases max.'
    );
    if (msg) zone.querySelector('p').textContent = msg;
    return;
  }

  zone.innerHTML = `
    <div class="message-progression encours">
      <div class="prog-bar-bg">
        <div class="prog-bar-fill" style="width:${prog.pct}%"></div>
      </div>
      <p>${prog.faites} / ${prog.total} tâches — ${prog.pct}% accompli 💪</p>
    </div>`;
}

// ================================
// AJOUTER UNE TÂCHE
// ================================
async function ajouterTache() {
  const nom = document.getElementById('nouvelle-tache').value.trim();
  const duree = parseInt(document.getElementById('duree-tache').value);
  if (!nom || !duree) return;

  const user = JSON.parse(localStorage.getItem('sanctuary-user-actif'));
  if (!user) return;

  const { data, error } = await db
    .from('taches')
    .insert({ user_id: user.id, nom, duree, done: false })
    .select()
    .single();

  if (!error && data) {
    taches.push({ id: data.id, nom, duree, done: false });
    saveTachesPartagees(taches);
    afficherTaches();
    document.getElementById('nouvelle-tache').value = '';
    document.getElementById('duree-tache').value = '';
    if (typeof showEncouragementToast === 'function') {
      showEncouragementToast('Nouvelle tâche ajoutée ! 🌸');
    }
  }
}

// ================================
// COCHER UNE TÂCHE
// ================================
async function cocherTache(id) {
  const tache = taches.find(t => t.id === id);
  if (!tache) return;

  tache.done = !tache.done;

  await db
    .from('taches')
    .update({ done: tache.done })
    .eq('id', id);

  saveTachesPartagees(taches);
  afficherTaches();

  if (tache.done) {
    const prog = getProgression(taches);
    if (prog.pct === 100) {
      const msg = await getMessageIA(
        'Felicite une femme chretienne qui a termine TOUTES ses taches. 2 phrases max.'
      );
      if (typeof showEncouragementToast === 'function') {
        showEncouragementToast(
          msg || '🎉 Toutes les tâches accomplies !', 'celebration'
        );
      }
    } else {
      const msg = await getMessageIA(
        `Encourage une femme chretienne qui vient de terminer: ${tache.nom}. 1 phrase max.`
      );
      if (typeof showEncouragementToast === 'function') {
        showEncouragementToast(msg || '✨ Bien joué !');
      }
    }
  }
}

// ================================
// SUPPRIMER UNE TÂCHE
// ================================
async function supprimerTache(id) {
  await db.from('taches').delete().eq('id', id);
  taches = taches.filter(t => t.id !== id);
  saveTachesPartagees(taches);
  afficherTaches();
}

// ================================
// CHRONOMÈTRE
// ================================
let secondes = 0;
let intervalId = null;
let dureeMax = 0;

function lancerTache(nom, dureeMinutes) {
  dureeMax = dureeMinutes * 60;
  secondes = 0;

  document.getElementById('chrono-zone').style.display = 'block';
  document.getElementById('chrono-nom').textContent = 'En cours : ' + nom;

  clearInterval(intervalId);
  intervalId = setInterval(function() {
    secondes++;
    afficherTemps();
    if (secondes >= dureeMax) {
      clearInterval(intervalId);
      if (typeof showEncouragementToast === 'function') {
        showEncouragementToast('⏰ ' + nom + ' — temps écoulé ! 🌸');
      }
    }
  }, 1000);
}

function afficherTemps() {
  const mm = String(Math.floor(secondes / 60)).padStart(2, '0');
  const ss = String(secondes % 60).padStart(2, '0');
  document.getElementById('chrono-temps').textContent = mm + ':' + ss;
}

function stopperTache() {
  clearInterval(intervalId);
  document.getElementById('chrono-zone').style.display = 'none';
  secondes = 0;
}

// ================================
// GÉNÉRATEUR DE PLANNING
// ================================
async function genererPlanning() {
  const heureDebut = document.getElementById('heure-debut').value;
  const tempsLibre = parseInt(document.getElementById('temps-libre').value);
  const rdvJour = document.getElementById('rdv-jour').value.trim();
  if (!heureDebut || !tempsLibre) return;

  const resultat = document.getElementById('planning-resultat');
  resultat.style.display = 'block';

  const tachesDisponibles = taches.filter(t => !t.done);
  let tempsRestant = tempsLibre;
  const tachesPlanifiees = [];
  const tachesReportees = [];

  const tachesMelangees = [...tachesDisponibles].sort(() => Math.random() - 0.5);
  tachesMelangees.forEach(t => {
    if (tempsRestant >= t.duree) {
      tachesPlanifiees.push(t);
      tempsRestant -= t.duree;
    } else {
      tachesReportees.push(t);
    }
  });

  const [heures, minutes] = heureDebut.split(':').map(Number);
  let minutesTotal = heures * 60 + minutes;

  const planningHTML = tachesPlanifiees.map(t => {
    const h = Math.floor(minutesTotal / 60).toString().padStart(2, '0');
    const m = (minutesTotal % 60).toString().padStart(2, '0');
    minutesTotal += t.duree;
    return `
      <div class="planning-slot">
        <span class="planning-slot-heure">${h}:${m}</span>
        <span class="planning-slot-nom">${t.nom}</span>
        <span class="planning-slot-duree">${t.duree} min</span>
      </div>`;
  }).join('');

  document.getElementById('planning-taches').innerHTML = planningHTML;

  const reporteDiv = document.getElementById('planning-reporte');
  if (tachesReportees.length > 0) {
    reporteDiv.style.display = 'block';
    document.getElementById('planning-reporte-liste').innerHTML =
      tachesReportees.map(t =>
        `<div class="reporte-item">⏭ ${t.nom} — ${t.duree} min</div>`
      ).join('');
  } else {
    reporteDiv.style.display = 'none';
  }

  document.getElementById('planning-ia-texte').textContent =
    '✦ Je prépare votre planning...';

  try {
    const response = await fetch('/api/planning-ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        taches: tachesPlanifiees,
        tempsLibre,
        rdvDuJour: rdvJour,
        heureDebut
      })
    });
    const data = await response.json();
    const texte = data.planning.replace(/\*\*/g, '').replace(/\*/g, '');
    const lignes = texte.split('\n').filter(l => l.trim() !== '');
    let html = '';
    lignes.forEach(ligne => {
      if (ligne.match(/^(MATIN|APRES|RDV|REPORTEE|ENCOURAGEMENT|VERSET|PLANNING)/i)) {
        html += `<div style="color:#D4A373;font-size:10px;letter-spacing:0.12em;
          text-transform:uppercase;margin:12px 0 6px;font-weight:600;
          border-top:1px solid rgba(44,24,16,0.1);padding-top:10px;">
          ${ligne}</div>`;
      } else if (ligne.match(/^\d{2}:\d{2}/)) {
        const parties = ligne.split(' - ');
        html += `<div style="display:flex;gap:8px;padding:6px 0;
          border-bottom:1px solid rgba(44,24,16,0.06);">
          <span style="color:#D4A373;font-weight:600;min-width:48px;
            font-size:12px;">${parties[0]}</span>
          <span style="color:var(--texte);font-size:13px;">
            ${parties.slice(1).join(' - ')}</span>
        </div>`;
      } else {
        html += `<div style="color:var(--texte-doux);font-size:13px;
          padding:4px 0;line-height:1.6;">${ligne}</div>`;
      }
    });
    document.getElementById('planning-ia-texte').innerHTML = html;
  } catch (err) {
    document.getElementById('planning-ia-texte').textContent =
      'Vérifie que le serveur est lancé.';
  }
}

function fermerPlanning() {
  document.getElementById('planning-resultat').style.display = 'none';
}

// ================================
// INITIALISATION
// ================================
document.addEventListener('DOMContentLoaded', () => {
  chargerTaches();
});