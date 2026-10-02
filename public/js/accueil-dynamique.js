// ================================
// SANCTUARY — accueil-dynamique.js
// Contenu dynamique de l'accueil
// ================================

// ================================
// 1. PHRASES ENCOURAGEANTES
// ================================
const phrases = [
  { texte: "Respirez.\nVous gérez tout.", auteur: null },
  { texte: "Chaque matin est\nune nouvelle chance.", auteur: null },
  { texte: "Vous êtes plus forte\nque vous ne le pensez.", auteur: null },
  { texte: "La grâce suffit\npour aujourd'hui.", auteur: null },
  { texte: "Un pas à la fois,\nvous y arrivez.", auteur: null },
  { texte: "Votre maison reflète\nvotre amour.", auteur: null },
  { texte: "Prenez soin de vous\npour mieux prendre soin des autres.", auteur: null },
  { texte: "Aujourd'hui sera\nune belle journée.", auteur: null },
  { texte: "Vous êtes capable\nde grandes choses.", auteur: null },
  { texte: "La paix commence\nchez vous.", auteur: null },
  { texte: "Chaque tâche accomplie\nest une victoire.", auteur: null },
  { texte: "Votre famille a\nde la chance de vous avoir.", auteur: null },
  { texte: "Soyez douce\navec vous-même.", auteur: null },
  { texte: "L'ordre dans la maison\napporte la paix dans l'esprit.", auteur: null },
  { texte: "Vous brillez\nmême les jours difficiles.", auteur: null },
  { texte: "Prenez une pause.\nVous le méritez.", auteur: null },
  { texte: "Votre amour\nrend tout possible.", auteur: null },
  { texte: "Avancez avec\ncourages et grâce.", auteur: null },
  { texte: "Aujourd'hui,\nvous faites de votre mieux.", auteur: null },
  { texte: "La femme forte\nc'est vous.", auteur: null },
  // Bibliques
  { texte: "Je puis tout\npar celui qui me fortifie.", auteur: "Phil. 4:13" },
  { texte: "Ne crains rien,\ncar je suis avec toi.", auteur: "Ésaïe 41:10" },
  { texte: "L'Éternel est\nma lumière et mon salut.", auteur: "Ps. 27:1" },
  { texte: "Que tout ce que tu fais\nsoit fait avec amour.", auteur: "1 Cor. 16:14" },
  { texte: "La femme forte,\nqui la trouvera ?", auteur: "Prov. 31:10" },
  // Célèbres
  { texte: "La vie c'est comme\nune bicyclette — pédalez !", auteur: "Einstein" },
  { texte: "Commencez là\noù vous êtes.", auteur: "Arthur Ashe" },
  { texte: "Le secret du succès\nest la constance.", auteur: "Disraeli" },
  { texte: "Croyez en vous\net tout devient possible.", auteur: null },
  { texte: "Chaque jour est\nun cadeau précieux.", auteur: null }
];

// Phrase du jour
function getPhraseduJour() {
  const today = new Date();
  const index = (today.getDate() + today.getMonth() * 31) % phrases.length;
  return phrases[index];
}

// ================================
// 2. IMAGES DE FOND DYNAMIQUES
// ================================

// Images par défaut (Unsplash — libres de droits)
const imagesDefaut = [
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600&q=80',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&q=80',
  'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80',
  'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=600&q=80'
];

function getImageEtRepasduJour() {
  const today = new Date();
  const seed = today.getDate() + today.getMonth() * 31;

  // Récupérer les recettes de l'utilisatrice
  const recettes = JSON.parse(localStorage.getItem('sanctuary-recettes') || '[]');
  const recettesAvecPhoto = recettes.filter(r => r.photo);

  if (recettesAvecPhoto.length > 0) {
    // Utiliser une recette de l'utilisatrice
    const index = seed % recettesAvecPhoto.length;
    const recette = recettesAvecPhoto[index];
    return {
      image: recette.photo,
      repas: recette.nom,
      source: 'mes-recettes'
    };
  } else {
    // Image par défaut
    const index = seed % imagesDefaut.length;
    return {
      image: imagesDefaut[index],
      repas: 'Repas du jour',
      source: 'defaut'
    };
  }
}

// ================================
// 3. MISE À JOUR DU HERO
// ================================
function mettreAJourHero() {
  // Phrase du jour
  const phrase = getPhraseduJour();
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle) {
    const lignes = phrase.texte.split('\n');
    heroTitle.innerHTML = lignes[0] + '<br><em>' + lignes[1] + '</em>';
  }

  // Image et repas du jour
  const infos = getImageEtRepasduJour();
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    if (infos.source === 'mes-recettes') {
      heroBg.style.backgroundImage = `url('${infos.image}')`;
      heroBg.style.backgroundSize = 'cover';
      heroBg.style.backgroundPosition = 'center';
    } else {
      heroBg.style.backgroundImage = `url('${infos.image}')`;
    }
  }

  // Nom du repas
  const heroRepasName = document.querySelector('.hero-recette-name');
  if (heroRepasName) {
    heroRepasName.textContent = infos.repas;
  }

  // Tâches synchronisées
  mettreAJourHeroTaches();
}

// ================================
// 4. SYNCHRONISATION TÂCHES DANS HERO
// ================================
function mettreAJourHeroTaches() {
  const taches = JSON.parse(localStorage.getItem('sanctuary-taches') || '[]');
  const total = taches.length;
  const faites = taches.filter(t => t.done).length;
  const heroSub = document.getElementById('hero-sub');

  if (heroSub) {
    if (total === 0) {
      heroSub.textContent = 'Aucune tâche — ajoutez vos tâches du jour';
    } else if (faites === total) {
      heroSub.textContent = '🎉 Toutes les tâches accomplies !';
    } else {
      heroSub.textContent = `${total} tâches · ${faites} accomplie${faites > 1 ? 's' : ''}`;
    }
  }
}

// ================================
// 5. IA SUGGESTION REPAS DU JOUR
// ================================
async function suggererRepasIA() {
  const recettes = JSON.parse(localStorage.getItem('sanctuary-recettes') || '[]');
  if (recettes.length === 0) return;

  try {
    const nomsRecettes = recettes.map(r => r.nom).join(', ');
    const response = await fetch(`${window.location.origin}/cuisine-ia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: `Parmi ces recettes : ${nomsRecettes}, 
        laquelle recommanderais-tu pour aujourd'hui ? 
        Réponds juste avec le nom de la recette, rien d'autre.`
      })
    });

    const data = await response.json();
    const repasIA = data.reponse?.trim();

    if (repasIA) {
      // Chercher la recette correspondante
      const recetteIA = recettes.find(r =>
        r.nom.toLowerCase().includes(repasIA.toLowerCase()) ||
        repasIA.toLowerCase().includes(r.nom.toLowerCase())
      );

      if (recetteIA && recetteIA.photo) {
        const heroBg = document.querySelector('.hero-bg');
        const heroRepasName = document.querySelector('.hero-recette-name');

        if (heroBg) {
          heroBg.style.backgroundImage = `url('${recetteIA.photo}')`;
        }
        if (heroRepasName) {
          heroRepasName.textContent = recetteIA.nom;
        }
      } else if (heroRepasName) {
        document.querySelector('.hero-recette-name').textContent = repasIA;
      }
    }
  } catch (err) {
    console.log('IA repas non disponible');
  }
}

// ================================
// 6. INITIALISATION
// ================================
document.addEventListener('DOMContentLoaded', () => {
  mettreAJourHero();

  // Synchroniser quand on revient sur la page
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      mettreAJourHeroTaches();
    }
  });

  window.addEventListener('focus', () => {
    mettreAJourHeroTaches();
  });

  // Suggestion IA après 2 secondes
  setTimeout(suggererRepasIA, 2000);
});