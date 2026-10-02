// ================================
// SANCTUARY — recette-detail.js
// Synchronisé avec Supabase
// ================================

let recette = JSON.parse(localStorage.getItem('recette-active'));
let nbPersonnes = recette?.personnes || 4;
let etatIngredients = {};

// ================================
// INITIALISATION
// ================================
document.addEventListener('DOMContentLoaded', () => {
  if (!recette) {
    window.location.href = '/cuisine.html';
    return;
  }

  // Photo
  if (recette.photo) {
    document.getElementById('detail-photo').innerHTML =
      `<img src="${recette.photo}" alt="${recette.nom}">`;
  }

  // Nom et catégorie
  document.getElementById('detail-nom').textContent = recette.nom;
  const catLabels = {
    enfants: '👶 Enfants',
    poids: '🥗 Perte de poids',
    invites: '🌍 Invités',
    desserts: '🍰 Desserts',
    boissons: '🥤 Boissons',
    dejeuner: '☕ Petit-déjeuner'
  };
  document.getElementById('detail-cat').textContent =
    catLabels[recette.cat] || recette.cat;

  // Nombre de personnes
  document.getElementById('nb-personnes').textContent = nbPersonnes;

  // Ingrédients
  afficherIngredients();
});

// ================================
// INGRÉDIENTS COCHABLES
// ================================
function afficherIngredients() {
  const ingredients = recette.ingredients
    ? recette.ingredients.split('\n').filter(i => i.trim())
    : [];

  const liste = document.getElementById('detail-ingredients');

  if (ingredients.length === 0) {
    liste.innerHTML = `
      <p style="color:var(--texte-doux);font-size:13px;">
        Aucun ingrédient enregistré
      </p>`;
    return;
  }

  liste.innerHTML = ingredients.map((ing, i) => `
    <div class="ingredient-item ${etatIngredients[i] ? 'coche' : ''}"
      onclick="cocherIngredient(${i})">
      <div class="ingredient-check">
        ${etatIngredients[i] ? '✓' : ''}
      </div>
      <span class="ingredient-texte">${ing.trim()}</span>
    </div>
  `).join('');
}

function cocherIngredient(i) {
  etatIngredients[i] = !etatIngredients[i];
  afficherIngredients();
}

function toutDecocher() {
  etatIngredients = {};
  afficherIngredients();
}

// ================================
// NOMBRE DE PERSONNES
// ================================
function changerPersonnes(delta) {
  nbPersonnes = Math.max(1, Math.min(20, nbPersonnes + delta));
  document.getElementById('nb-personnes').textContent = nbPersonnes;
}

// ================================
// MODIFICATION
// ================================
function activerModification() {
  document.getElementById('form-modification').style.display = 'block';
  document.getElementById('edit-nom').value = recette.nom;
  document.getElementById('edit-personnes').value = nbPersonnes;
  document.getElementById('edit-ingredients').value =
    recette.ingredients || '';
  document.querySelector('.btn-modifier').style.display = 'none';
}

function annulerModification() {
  document.getElementById('form-modification').style.display = 'none';
  document.querySelector('.btn-modifier').style.display = 'block';
}

function previewEditPhoto(input) {
  if (input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      document.getElementById('edit-photo-label').textContent =
        '✓ Photo sélectionnée';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

async function sauvegarderModification() {
  recette.nom = document.getElementById('edit-nom').value.trim();
  recette.ingredients =
    document.getElementById('edit-ingredients').value.trim();
  recette.personnes =
    parseInt(document.getElementById('edit-personnes').value) || 4;

  const photoInput = document.getElementById('edit-photo');
  if (photoInput.files[0]) {
    const reader = new FileReader();
    reader.onload = async function(e) {
      recette.photo = e.target.result;
      await finaliserSauvegarde();
    };
    reader.readAsDataURL(photoInput.files[0]);
  } else {
    await finaliserSauvegarde();
  }
}

async function finaliserSauvegarde() {
  try {
    // Mettre à jour dans Supabase
    await db.from('recettes')
      .update({
        nom: recette.nom,
        ingredients: recette.ingredients,
        personnes: recette.personnes,
        photo: recette.photo
      })
      .eq('id', recette.id);

    // Mettre à jour localStorage
    const toutesRecettes = JSON.parse(
      localStorage.getItem('sanctuary-recettes') || '[]');
    const idx = toutesRecettes.findIndex(r => r.id === recette.id);
    if (idx !== -1) toutesRecettes[idx] = recette;
    localStorage.setItem('sanctuary-recettes',
      JSON.stringify(toutesRecettes));
    localStorage.setItem('recette-active', JSON.stringify(recette));

    window.location.reload();
  } catch (err) {
    console.error('Erreur sauvegarde:', err);
  }
}