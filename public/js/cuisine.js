// ================================
// SANCTUARY — cuisine.js
// Synchronisé avec Supabase
// ================================

let recettes = [];
let filtreActif = 'tout';

// ================================
// CHARGEMENT DEPUIS SUPABASE
// ================================
async function chargerRecettes() {
  const user = JSON.parse(localStorage.getItem('sanctuary-user-actif'));
  if (!user) return;

  const { data, error } = await db
    .from('recettes')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (!error && data) {
    recettes = data.map(r => ({
      id: r.id,
      nom: r.nom,
      cat: r.cat,
      ingredients: r.ingredients,
      photo: r.photo,
      personnes: r.personnes || 4
    }));
    localStorage.setItem('sanctuary-recettes', JSON.stringify(recettes));
    afficherRecettes();
  }
}

// ================================
// APERÇU PHOTO
// ================================
function previewPhoto(input) {
  if (input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const preview = document.getElementById('photo-preview');
      const img = document.getElementById('photo-preview-img');
      img.src = e.target.result;
      preview.style.display = 'block';
      document.getElementById('photo-label-texte').textContent =
        '✓ Photo sélectionnée';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// ================================
// AJOUTER UNE RECETTE
// ================================
async function ajouterRecette() {
  const nom = document.getElementById('rec-nom').value.trim();
  const cat = document.getElementById('rec-cat').value;
  const ingredients = document.getElementById('rec-ingredients').value.trim();
  const photoInput = document.getElementById('rec-photo');

  if (!nom) return;

  const user = JSON.parse(localStorage.getItem('sanctuary-user-actif'));
  if (!user) return;

  const recette = { nom, cat, ingredients, photo: null, personnes: 4 };

  if (photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      recette.photo = e.target.result;
      await sauvegarderRecette(recette, user.id);
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    await sauvegarderRecette(recette, user.id);
  }
}

async function sauvegarderRecette(recette, userId) {
  const { data, error } = await db
    .from('recettes')
    .insert({
      user_id: userId,
      nom: recette.nom,
      cat: recette.cat,
      ingredients: recette.ingredients,
      photo: recette.photo,
      personnes: recette.personnes || 4
    })
    .select()
    .single();

  if (!error && data) {
    recettes.unshift({
      id: data.id,
      nom: data.nom,
      cat: data.cat,
      ingredients: data.ingredients,
      photo: data.photo,
      personnes: data.personnes
    });
    localStorage.setItem('sanctuary-recettes', JSON.stringify(recettes));
    afficherRecettes();
    reinitialiserFormulaire();
  }
}

function reinitialiserFormulaire() {
  document.getElementById('rec-nom').value = '';
  document.getElementById('rec-ingredients').value = '';
  document.getElementById('photo-label-texte').textContent =
    'Ajouter une photo de la recette';
  document.getElementById('photo-preview').style.display = 'none';
  document.getElementById('rec-photo').value = '';
}

// ================================
// FILTRER PAR CATÉGORIE
// ================================
function filtrer(cat) {
  filtreActif = cat;
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.classList.remove('actif');
  });
  event.target.classList.add('actif');
  afficherRecettes();
}

// ================================
// AFFICHER LES RECETTES
// ================================
function afficherRecettes() {
  const grille = document.getElementById('grille-recettes');
  const liste = filtreActif === 'tout'
    ? recettes
    : recettes.filter(r => r.cat === filtreActif);

  if (liste.length === 0) {
    grille.innerHTML = `
      <div class="illustration-vide">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="40" r="25" stroke="#D4A373" stroke-width="3"/>
          <path d="M30 65 Q50 85 70 65" stroke="#D4A373" stroke-width="3"
            fill="none" stroke-linecap="round"/>
          <circle cx="42" cy="35" r="3" fill="#D4A373"/>
          <circle cx="58" cy="35" r="3" fill="#D4A373"/>
        </svg>
        <p>Aucune recette encore 🌸</p>
        <p style="font-size:11px;margin-top:4px;">
          Ajoutez votre première recette ci-dessus !
        </p>
      </div>`;
    return;
  }

  const catLabels = {
    enfants: '👶 Enfants',
    poids: '🥗 Perte de poids',
    invites: '🌍 Invités',
    desserts: '🍰 Desserts',
    boissons: '🥤 Boissons',
    dejeuner: '☕ Petit-déj'
  };

  let html = '<div class="galerie-mixte">';

  liste.forEach((r, index) => {
    const photo = r.photo
      ? `<img src="${r.photo}" alt="${r.nom}">`
      : `<div style="height:100%;background:var(--creme2);
          display:flex;align-items:center;
          justify-content:center;font-size:30px;">🍽</div>`;

    if (index === 0) {
      html += `
        <div class="carte-grande" onclick="ouvrirRecette(${index})">
          <div class="carte-photo">${photo}</div>
          <div class="carte-overlay">
            <span class="carte-cat">${catLabels[r.cat] || r.cat}</span>
          </div>
          <div class="carte-info-grande">
            <div class="carte-nom">${r.nom}</div>
            <div class="carte-meta">
              <span>👥 ${r.personnes || 4} pers.</span>
              <span>📋 ${r.ingredients
                ? r.ingredients.split('\n').filter(i => i.trim()).length
                : 0} ingrédients</span>
            </div>
          </div>
        </div>`;
    } else {
      html += `
        <div class="carte-petite" onclick="ouvrirRecette(${index})">
          <div class="carte-photo-petite">${photo}</div>
          <div class="carte-info-petite">
            <div class="carte-nom-petite">${r.nom}</div>
            <div class="carte-cat-petite">${catLabels[r.cat] || r.cat}</div>
            <div class="carte-pers-petite">
              👥 ${r.personnes || 4} pers.
            </div>
          </div>
        </div>`;
    }
  });

  html += '</div>';
  grille.innerHTML = html;
}

// ================================
// OUVRIR UNE RECETTE
// ================================
function ouvrirRecette(index) {
  const liste = filtreActif === 'tout'
    ? recettes
    : recettes.filter(r => r.cat === filtreActif);

  localStorage.setItem('recette-active', JSON.stringify(liste[index]));
  localStorage.setItem('recette-index', index);
  window.location.href = '/recette-detail.html';
}

// ================================
// IA CUISINE
// ================================
async function demanderIA() {
  const question = document.getElementById('ia-question').value.trim();
  if (!question) return;

  const reponseDiv = document.getElementById('ia-reponse');
  const texteDiv = document.getElementById('ia-reponse-texte');
  reponseDiv.style.display = 'block';
  texteDiv.textContent = '✦ Je réfléchis...';

  try {
    const response = await fetch('/api/cuisine-ia', {
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
  chargerRecettes();
});