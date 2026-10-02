// ================================
// SANCTUARY — vocal.js
// Assistant vocal IA
// ================================

let reconnaissance = null;
let microActif = false;
let rdvEnAttente = null;

// ================================
// INITIALISATION RECONNAISSANCE VOCALE
// ================================
function initVocal() {
  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    const soustitre = document.querySelector('.vocal-sous-titre');
    if (soustitre) {
      soustitre.textContent =
        '⚠️ Non supporté sur Firefox — utilisez Chrome';
    }
    const btn = document.getElementById('btn-micro');
    if (btn) btn.style.opacity = '0.5';
    return;
  }

  reconnaissance = new SpeechRecognition();
  reconnaissance.lang = 'fr-FR';
  reconnaissance.continuous = false;
  reconnaissance.interimResults = true;

  reconnaissance.onstart = () => {
    document.getElementById('vocal-status').style.display = 'flex';
    document.getElementById('vocal-resultat').style.display = 'none';
    document.getElementById('vocal-texte').textContent =
      'En écoute... Parlez maintenant';
  };

  reconnaissance.onresult = (event) => {
    let texteIntermediaire = '';
    let texteFinal = '';

    for (let i = event.resultIndex; i < event.results.length; i++) {
      if (event.results[i].isFinal) {
        texteFinal += event.results[i][0].transcript;
      } else {
        texteIntermediaire += event.results[i][0].transcript;
      }
    }

    document.getElementById('vocal-texte').textContent =
      texteFinal || texteIntermediaire || 'En écoute...';

    if (texteFinal) {
      traiterCommande(texteFinal);
    }
  };

  reconnaissance.onerror = (event) => {
    stopMicro();
    if (event.error === 'not-allowed') {
      document.getElementById('vocal-texte').textContent =
        '⚠️ Autorisez le microphone dans votre navigateur';
    } else {
      document.getElementById('vocal-texte').textContent =
        'Erreur — réessayez';
    }
  };

  reconnaissance.onend = () => {
    if (microActif) stopMicro();
  };
}

// ================================
// TOGGLE MICRO
// ================================
function toggleMicro() {
  if (!reconnaissance) {
    alert('Reconnaissance vocale non disponible. Utilisez Chrome.');
    return;
  }
  if (microActif) {
    stopMicro();
  } else {
    startMicro();
  }
}

function startMicro() {
  microActif = true;
  document.getElementById('btn-micro').classList.add('actif');
  document.getElementById('btn-micro').textContent = '⏹';
  document.getElementById('vocal-status').style.display = 'flex';
  document.getElementById('vocal-resultat').style.display = 'none';

  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }

  reconnaissance.start();
}

function stopMicro() {
  microActif = false;
  const btn = document.getElementById('btn-micro');
  if (btn) {
    btn.classList.remove('actif');
    btn.textContent = '🎤';
  }
  try { reconnaissance.stop(); } catch(e) {}
}

// ================================
// TRAITEMENT COMMANDE IA
// ================================
async function traiterCommande(texte) {
  stopMicro();

  document.getElementById('vocal-status').style.display = 'none';
  document.getElementById('vocal-resultat').style.display = 'block';
  document.getElementById('vocal-transcription').textContent =
    '« ' + texte + ' »';
  document.getElementById('vocal-action').innerHTML =
    '<div class="vocal-action-titre">⏳ Analyse en cours...</div>';
  document.getElementById('btn-confirmer').style.display = 'none';

  try {
    const response = await fetch('/api/vocal-ia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texte })
    });

    const data = await response.json();

    if (data.action === 'ajouter_rdv') {
      rdvEnAttente = data;
      const dateFormatee = new Date(data.date + 'T' + data.heure)
        .toLocaleDateString('fr-FR', {
          weekday: 'long', day: 'numeric',
          month: 'long', year: 'numeric'
        });

      const importanceBadge = data.importance === 'urgent'
        ? '🔴 URGENT'
        : data.importance === 'important'
        ? '🟡 Important'
        : '🟢 Normal';

      document.getElementById('vocal-action').innerHTML = `
        <div class="vocal-action-titre">✓ RDV détecté</div>
        <div class="vocal-action-detail">
          <strong>${data.titre}</strong><br>
          📅 ${dateFormatee} à ${data.heure}<br>
          ${data.note ? '📝 ' + data.note + '<br>' : ''}
          ${importanceBadge}<br>
          ⏰ Rappel ${data.rappel_minutes} min avant
        </div>`;

      document.getElementById('btn-confirmer').style.display = 'block';

    } else if (data.action === 'incompris') {
      document.getElementById('vocal-action').innerHTML = `
        <div class="vocal-action-titre">❓ Non compris</div>
        <div class="vocal-action-detail">${data.message}<br><br>
        Essayez : "RDV dentiste le 5 juillet à 14h"</div>`;
    }

  } catch (err) {
    document.getElementById('vocal-action').innerHTML = `
      <div class="vocal-action-titre">❌ Erreur</div>
      <div class="vocal-action-detail">
        Vérifiez que le serveur est lancé.
      </div>`;
  }
}

// ================================
// CONFIRMER LE RDV
// ================================
async function confirmerRdv() {
  if (!rdvEnAttente) return;

  const COULEURS = [
    '#D4A373', '#B5838D', '#6B8CAE',
    '#7CAE7A', '#AE7CAE', '#AE9B7C'
  ];

  const user = JSON.parse(localStorage.getItem('sanctuary-user-actif'));
  if (!user) return;

  const rdvs = JSON.parse(
    localStorage.getItem('sanctuary-rdvs') || '[]');
  const couleur = COULEURS[rdvs.length % COULEURS.length];

  const rdv = {
    user_id: user.id,
    titre: rdvEnAttente.titre,
    date: rdvEnAttente.date + 'T' + rdvEnAttente.heure,
    note: rdvEnAttente.note || '',
    importance: rdvEnAttente.importance || 'normal',
    rappel_minutes: rdvEnAttente.rappel_minutes || 60,
    couleur
  };

  try {
    // Sauvegarder dans Supabase
    const { data, error } = await db
      .from('rendez_vous')
      .insert(rdv)
      .select()
      .single();

    if (!error && data) {
      // Mettre à jour localStorage
      rdvs.push({ ...rdv, id: data.id });
      localStorage.setItem('sanctuary-rdvs', JSON.stringify(rdvs));

      // Programmer le rappel
      programmerRappel({ ...rdv, id: data.id });

      // Feedback vocal
      parler('Rendez-vous ajouté ! ' + rdv.titre + ' le ' +
        new Date(rdv.date).toLocaleDateString('fr-FR', {
          day: 'numeric', month: 'long'
        }) + ' à ' + rdvEnAttente.heure);

      annulerVocal();
      afficherRappels();

      if (typeof showEncouragementToast === 'function') {
        showEncouragementToast('✅ RDV ajouté au calendrier !');
      }
    }
  } catch (err) {
    console.error('Erreur ajout RDV:', err);
  }
}

// ================================
// ANNULER
// ================================
function annulerVocal() {
  rdvEnAttente = null;
  document.getElementById('vocal-resultat').style.display = 'none';
  document.getElementById('vocal-status').style.display = 'none';
  document.getElementById('btn-confirmer').style.display = 'none';
}

// ================================
// EXEMPLES
// ================================
function testerCommande(texte) {
  document.getElementById('vocal-transcription').textContent =
    '« ' + texte + ' »';
  traiterCommande(texte);
}

function effacerExemples() {
  if (confirm('Effacer tous les rendez-vous de test ?')) {
    localStorage.removeItem('sanctuary-rdvs');
    afficherRappels();
    if (typeof showEncouragementToast === 'function') {
      showEncouragementToast('🗑 Données effacées !');
    }
  }
}

// ================================
// SYNTHÈSE VOCALE
// ================================
function parler(texte) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(texte);
    utterance.lang = 'fr-FR';
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  }
}

// ================================
// RAPPELS
// ================================
function programmerRappel(rdv) {
  const dateRdv = new Date(rdv.date);
  const maintenant = new Date();
  const msAvantRappel = dateRdv.getTime() -
    (rdv.rappel_minutes * 60 * 1000) - maintenant.getTime();

  if (msAvantRappel > 0) {
    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('🔔 Sanctuary — Rappel', {
          body: rdv.titre + ' dans ' + rdv.rappel_minutes + ' minutes !',
          icon: '/icon-192.png'
        });
      }
      parler('Rappel ! ' + rdv.titre + ' dans ' +
        rdv.rappel_minutes + ' minutes');
      if (typeof showEncouragementToast === 'function') {
        showEncouragementToast(
          '⏰ Rappel : ' + rdv.titre + ' dans ' +
          rdv.rappel_minutes + ' min !'
        );
      }
    }, msAvantRappel);
  }
}

function afficherRappels() {
  const liste = document.getElementById('rappels-liste');
  const dateEl = document.getElementById('rappels-date');
  if (!liste) return;

  const maintenant = new Date();
  const demain = new Date();
  demain.setDate(demain.getDate() + 1);
  demain.setHours(23, 59, 59);

  if (dateEl) {
    dateEl.textContent = maintenant.toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long'
    });
  }

  const rdvs = JSON.parse(
    localStorage.getItem('sanctuary-rdvs') || '[]');

  const rdvProches = rdvs
    .filter(r => {
      const d = new Date(r.date);
      return d >= maintenant && d <= demain;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (rdvProches.length === 0) {
    liste.innerHTML = `
      <div class="rappels-vide">
        Aucun RDV aujourd'hui ni demain 🌸
      </div>`;
    return;
  }

  liste.innerHTML = rdvProches.map(r => {
    const dateRdv = new Date(r.date);
    const estAujourdhui =
      dateRdv.toDateString() === maintenant.toDateString();
    const heure = dateRdv.toLocaleTimeString('fr-FR', {
      hour: '2-digit', minute: '2-digit'
    });
    const importance = r.importance || 'normal';

    return `
      <div class="rappel-item ${importance}">
        <div class="rappel-dot"
          style="background:${r.couleur || '#D4A373'};"></div>
        <div class="rappel-info">
          <div class="rappel-nom">${r.titre}</div>
          <div class="rappel-heure">
            ${estAujourdhui ? 'Aujourd\'hui' : 'Demain'} à ${heure}
          </div>
        </div>
        ${importance !== 'normal'
          ? `<span class="rappel-badge">
              ${importance === 'urgent' ? '🔴' : '⭐'}
            </span>`
          : ''}
      </div>`;
  }).join('');

  // Programmer les rappels
  rdvs.forEach(r => programmerRappel(r));
}

// ================================
// INITIALISATION
// ================================
document.addEventListener('DOMContentLoaded', () => {
  initVocal();
  afficherRappels();

  if (Notification.permission === 'default') {
    Notification.requestPermission();
  }
});