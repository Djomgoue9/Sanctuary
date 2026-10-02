// ================================
// SANCTUARY — agenda.js
// Synchronisé avec Supabase
// ================================

const COULEURS_RDV = [
  '#D4A373', '#B5838D', '#6B8CAE', '#7CAE7A',
  '#AE7CAE', '#AE9B7C', '#7CAEAE', '#AE7C7C',
  '#8CAE6B', '#AE6B8C', '#6B8CAE', '#AE8C6B'
];

let rdvs = [];
let dateAffichee = new Date();
let jourSelectionne = null;

// ================================
// CHARGEMENT DEPUIS SUPABASE
// ================================
async function chargerRdvs() {
  const user = JSON.parse(localStorage.getItem('sanctuary-user-actif'));
  if (!user) return;

  const { data, error } = await db
    .from('rendez_vous')
    .select('*')
    .eq('user_id', user.id)
    .order('date', { ascending: true });

  if (!error && data) {
    rdvs = data.map(r => ({
      id: r.id,
      titre: r.titre,
      date: r.date,
      note: r.note,
      couleur: r.couleur,
      importance: r.importance,
      rappel_minutes: r.rappel_minutes
    }));
    localStorage.setItem('sanctuary-rdvs', JSON.stringify(rdvs));
    afficherCalendrier();
    afficherListeRdv();
  }
}

// ================================
// CALENDRIER MENSUEL
// ================================
function afficherCalendrier() {
  const annee = dateAffichee.getFullYear();
  const mois = dateAffichee.getMonth();

  const moisNoms = ['Janvier','Février','Mars','Avril','Mai','Juin',
    'Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  document.getElementById('cal-titre').textContent =
    moisNoms[mois] + ' ' + annee;

  const premierJour = new Date(annee, mois, 1);
  let jourDebut = premierJour.getDay();
  if (jourDebut === 0) jourDebut = 7;

  const dernierJour = new Date(annee, mois + 1, 0).getDate();
  const dernierJourPrecedent = new Date(annee, mois, 0).getDate();
  const aujourd = new Date();
  const grille = document.getElementById('cal-grille');
  grille.innerHTML = '';

  const rdvMois = rdvs.filter(r => {
    const d = new Date(r.date);
    return d.getFullYear() === annee && d.getMonth() === mois;
  });

  const rdvParJour = {};
  rdvMois.forEach(r => {
    const jour = new Date(r.date).getDate();
    if (!rdvParJour[jour]) rdvParJour[jour] = [];
    rdvParJour[jour].push(r);
  });

  // Jours mois précédent
  for (let i = jourDebut - 1; i > 0; i--) {
    const div = document.createElement('div');
    div.className = 'cal-jour vide autre-mois';
    div.innerHTML = `<div class="cal-num">${dernierJourPrecedent - i + 1}</div>`;
    grille.appendChild(div);
  }

  // Jours du mois
  for (let jour = 1; jour <= dernierJour; jour++) {
    const div = document.createElement('div');
    const estAujourdhui = jour === aujourd.getDate() &&
      mois === aujourd.getMonth() &&
      annee === aujourd.getFullYear();
    const estSelectionne = jourSelectionne &&
      jourSelectionne.jour === jour &&
      jourSelectionne.mois === mois &&
      jourSelectionne.annee === annee;

    div.className = 'cal-jour' +
      (estAujourdhui ? ' aujourd-hui' : '') +
      (estSelectionne ? ' selectionne' : '');

    let bullesHTML = '';
    if (rdvParJour[jour]) {
      bullesHTML = '<div class="cal-rdv-bulles">';
      rdvParJour[jour].slice(0, 3).forEach(r => {
        bullesHTML += `<div class="cal-rdv-bulle"
          style="background:${r.couleur || '#D4A373'};"></div>`;
      });
      bullesHTML += '</div>';
      const premierRdv = rdvParJour[jour][0];
      bullesHTML += `<div class="cal-rdv-texte"
        style="background:${premierRdv.couleur || '#D4A373'};">
        ${premierRdv.titre.substring(0, 8)}
        ${premierRdv.titre.length > 8 ? '...' : ''}
      </div>`;
    }

    div.innerHTML = `<div class="cal-num">${jour}</div>${bullesHTML}`;
    div.onclick = () => ouvrirVueJour(jour, mois, annee, rdvParJour[jour] || []);
    grille.appendChild(div);
  }

  // Jours mois suivant
  const cellulesFaites = (jourDebut - 1) + dernierJour;
  const cellulesRestantes = Math.ceil(cellulesFaites / 7) * 7 - cellulesFaites;
  for (let i = 1; i <= cellulesRestantes; i++) {
    const div = document.createElement('div');
    div.className = 'cal-jour vide autre-mois';
    div.innerHTML = `<div class="cal-num">${i}</div>`;
    grille.appendChild(div);
  }
}

// Navigation mois
function moisPrecedent() {
  dateAffichee.setMonth(dateAffichee.getMonth() - 1);
  jourSelectionne = null;
  afficherCalendrier();
  fermerVueJour();
}

function moisSuivant() {
  dateAffichee.setMonth(dateAffichee.getMonth() + 1);
  jourSelectionne = null;
  afficherCalendrier();
  fermerVueJour();
}

// ================================
// VUE JOUR DÉTAILLÉE
// ================================
function ouvrirVueJour(jour, mois, annee, rdvsDuJour) {
  jourSelectionne = { jour, mois, annee };
  afficherCalendrier();

  const moisNoms = ['Jan','Fév','Mar','Avr','Mai','Jun',
    'Jul','Aoû','Sep','Oct','Nov','Déc'];
  const joursNoms = ['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  const date = new Date(annee, mois, jour);

  document.getElementById('vue-jour-titre').textContent =
    joursNoms[date.getDay()] + ' ' + jour + ' ' +
    moisNoms[mois] + ' ' + annee;

  const zone = document.getElementById('vue-jour-rdv');

  if (rdvsDuJour.length === 0) {
    zone.innerHTML = `
      <div class="vide-rdv">
        <div style="font-size:30px;margin-bottom:8px;">📅</div>
        <p>Aucun rendez-vous ce jour</p>
        <p style="font-size:11px;margin-top:4px;">
          Ajoutez un RDV ci-dessous
        </p>
      </div>`;
  } else {
    const rdvTries = [...rdvsDuJour]
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    zone.innerHTML = rdvTries.map(r => {
      const heure = new Date(r.date).toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
      });
      return `
        <div class="slot-horaire">
          <div class="slot-heure">${heure}</div>
          <div class="slot-rdv" style="background:${r.couleur || '#D4A373'};">
            <div class="slot-rdv-titre">${r.titre}</div>
            ${r.note ? `<div class="slot-rdv-note">${r.note}</div>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  document.getElementById('vue-jour').style.display = 'block';

  const dateStr = new Date(annee, mois, jour, 9, 0)
    .toISOString().slice(0, 16);
  document.getElementById('rdv-date').value = dateStr;

  document.getElementById('vue-jour')
    .scrollIntoView({ behavior: 'smooth' });
}

function fermerVueJour() {
  document.getElementById('vue-jour').style.display = 'none';
  jourSelectionne = null;
  afficherCalendrier();
}

// ================================
// AJOUTER UN RDV
// ================================
async function ajouterRdv() {
  const titre = document.getElementById('rdv-titre').value.trim();
  const date = document.getElementById('rdv-date').value;
  const note = document.getElementById('rdv-note').value.trim();

  if (!titre || !date) return;

  const user = JSON.parse(localStorage.getItem('sanctuary-user-actif'));
  if (!user) return;

  const couleur = COULEURS_RDV[rdvs.length % COULEURS_RDV.length];

  const { data, error } = await db
    .from('rendez_vous')
    .insert({
      user_id: user.id,
      titre,
      date,
      note,
      couleur,
      importance: 'normal',
      rappel_minutes: 60
    })
    .select()
    .single();

  if (!error && data) {
    rdvs.push({
      id: data.id,
      titre,
      date,
      note,
      couleur,
      importance: 'normal',
      rappel_minutes: 60
    });

    localStorage.setItem('sanctuary-rdvs', JSON.stringify(rdvs));

    document.getElementById('rdv-titre').value = '';
    document.getElementById('rdv-date').value = '';
    document.getElementById('rdv-note').value = '';

    afficherCalendrier();
    afficherListeRdv();

    if (jourSelectionne) {
      const rdvJour = rdvs.filter(r => {
        const d = new Date(r.date);
        return d.getDate() === jourSelectionne.jour &&
               d.getMonth() === jourSelectionne.mois &&
               d.getFullYear() === jourSelectionne.annee;
      });
      ouvrirVueJour(
        jourSelectionne.jour,
        jourSelectionne.mois,
        jourSelectionne.annee,
        rdvJour
      );
    }

    if (typeof programmerNotificationsRdv === 'function') {
      programmerNotificationsRdv();
    }
  }
}

// ================================
// SUPPRIMER UN RDV
// ================================
async function supprimerRdv(id) {
  await db.from('rendez_vous').delete().eq('id', id);
  rdvs = rdvs.filter(r => r.id !== id);
  localStorage.setItem('sanctuary-rdvs', JSON.stringify(rdvs));
  afficherCalendrier();
  afficherListeRdv();
}

async function garderRdv(id) {
  const rdv = rdvs.find(r => r.id === id);
  if (rdv) {
    await db.from('rendez_vous')
      .update({ note: (rdv.note || '') + ' [Gardé]' })
      .eq('id', id);
    afficherListeRdv();
  }
}

// ================================
// LISTE RDV
// ================================
function afficherListeRdv() {
  const liste = document.getElementById('liste-rdv');
  const maintenant = new Date();

  const rdvAvenir = rdvs
    .filter(r => new Date(r.date) >= maintenant)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const rdvPassés = rdvs
    .filter(r => new Date(r.date) < maintenant)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let html = '';

  if (rdvPassés.length > 0) {
    html += `<div class="rdv-section-titre">📋 RDV passés</div>`;
    html += rdvPassés.map(r => {
      const date = new Date(r.date);
      const dateStr = date.toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric',
        month: 'long', hour: '2-digit', minute: '2-digit'
      });
      return `
        <div class="rdv-item passe">
          <div class="rdv-couleur" style="background:${r.couleur};"></div>
          <div class="rdv-info">
            <div class="rdv-titre">${r.titre}</div>
            <div class="rdv-date">📅 ${dateStr}</div>
            ${r.note ? `<div class="rdv-note">${r.note}</div>` : ''}
            <div class="rdv-actions-passe">
              <button onclick="supprimerRdv(${r.id})"
                class="btn-suppr-rdv">🗑 Supprimer</button>
              <button onclick="garderRdv(${r.id})"
                class="btn-garder-rdv">📌 Garder</button>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  if (rdvAvenir.length > 0) {
    html += `<div class="rdv-section-titre">📅 À venir</div>`;
    html += rdvAvenir.map(r => {
      const date = new Date(r.date);
      const dateStr = date.toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric',
        month: 'long', hour: '2-digit', minute: '2-digit'
      });
      return `
        <div class="rdv-item">
          <div class="rdv-couleur" style="background:${r.couleur};"></div>
          <div class="rdv-info">
            <div class="rdv-titre">${r.titre}</div>
            <div class="rdv-date">📅 ${dateStr}</div>
            ${r.note ? `<div class="rdv-note">${r.note}</div>` : ''}
          </div>
          <button class="rdv-suppr"
            onclick="supprimerRdv(${r.id})">×</button>
        </div>`;
    }).join('');
  }

  if (rdvAvenir.length === 0 && rdvPassés.length === 0) {
    html = `
      <div class="vide-rdv">
        <div style="font-size:30px;margin-bottom:8px;">🗓</div>
        <p>Aucun rendez-vous</p>
      </div>`;
  }

  liste.innerHTML = html;
}

// ================================
// INITIALISATION
// ================================
document.addEventListener('DOMContentLoaded', () => {
  chargerRdvs();
});