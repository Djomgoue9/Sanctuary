// ================================
// SANCTUARY — login.js
// Authentification Supabase
// ================================

let photoBase64 = null;

// Aperçu photo profil
function previewPhotoProfil(input) {
  if (input.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      photoBase64 = e.target.result;
      document.getElementById('photo-placeholder').style.display = 'none';
      const img = document.getElementById('photo-img');
      img.src = photoBase64;
      img.style.display = 'block';
    };
    reader.readAsDataURL(input.files[0]);
  }
}

// Changer d'onglet
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('actif'));
  document.querySelectorAll('.tab-content').forEach(c => c.style.display = 'none');

  if (tab === 'connexion') {
    document.querySelectorAll('.tab-btn')[0].classList.add('actif');
    document.getElementById('tab-connexion').style.display = 'block';
  } else {
    document.querySelectorAll('.tab-btn')[1].classList.add('actif');
    document.getElementById('tab-inscription').style.display = 'block';
  }
}

// ================================
// INSCRIPTION
// ================================
async function sInscrire() {
  const prenom = document.getElementById('inscr-prenom').value.trim();
  const mdp = document.getElementById('inscr-mdp').value;
  const mdp2 = document.getElementById('inscr-mdp2').value;
  const erreur = document.getElementById('inscr-erreur');

  erreur.style.display = 'none';

  if (!prenom) {
    erreur.textContent = 'Veuillez entrer votre prénom.';
    erreur.style.display = 'block';
    return;
  }

  if (mdp.length < 6) {
    erreur.textContent = 'Le mot de passe doit contenir au moins 6 caractères.';
    erreur.style.display = 'block';
    return;
  }

  if (mdp !== mdp2) {
    erreur.textContent = 'Les mots de passe ne correspondent pas.';
    erreur.style.display = 'block';
    return;
  }

  try {
    // Email fictif basé sur le prénom
    const email = prenom.toLowerCase()
      .replace(/\s/g, '')
      .replace(/[^a-z0-9]/g, '') + '@sanctuary.app';

    const { data, error } = await db.auth.signUp({
      email,
      password: mdp,
      options: {
        data: { prenom, photo: photoBase64 }
      }
    });

    if (error) throw error;

    // Mettre à jour le profil
    await db.from('profils').upsert({
      id: data.user.id,
      prenom,
      photo: photoBase64
    });

    // Sauvegarder localement
    localStorage.setItem('sanctuary-user-actif', JSON.stringify({
      id: data.user.id,
      prenom,
      photo: photoBase64
    }));

    window.location.href = '/index.html';

  } catch (err) {
    erreur.textContent = err.message || 'Erreur lors de la création du compte.';
    erreur.style.display = 'block';
  }
}

// ================================
// CONNEXION
// ================================
async function seConnecter() {
  const prenom = document.getElementById('login-prenom').value.trim();
  const mdp = document.getElementById('login-mdp').value;
  const erreur = document.getElementById('login-erreur');

  erreur.style.display = 'none';

  if (!prenom || !mdp) {
    erreur.textContent = 'Veuillez remplir tous les champs.';
    erreur.style.display = 'block';
    return;
  }

  try {
    const email = prenom.toLowerCase()
      .replace(/\s/g, '')
      .replace(/[^a-z0-9]/g, '') + '@sanctuary.app';

    const { data, error } = await db.auth.signInWithPassword({
      email,
      password: mdp
    });

    if (error) throw error;

    // Récupérer le profil
    const { data: profil } = await db
      .from('profils')
      .select('*')
      .eq('id', data.user.id)
      .single();

    localStorage.setItem('sanctuary-user-actif', JSON.stringify({
      id: data.user.id,
      prenom: profil?.prenom || prenom,
      photo: profil?.photo || null
    }));

    window.location.href = '/index.html';

  } catch (err) {
    erreur.textContent = 'Prénom ou mot de passe incorrect.';
    erreur.style.display = 'block';
  }
}

// ================================
// VÉRIFIER SESSION
// ================================
async function verifierSession() {
  const { data } = await db.auth.getSession();
  if (data.session) {
    const user = data.session.user;
    const { data: profil } = await db
      .from('profils').select('*').eq('id', user.id).maybeSingle();
    const meta = user.user_metadata || {};
    localStorage.setItem('sanctuary-user-actif', JSON.stringify({
      id: user.id,
      prenom: profil?.prenom || meta.given_name || meta.full_name
              || (user.email || '').split('@')[0],
      photo: profil?.photo || meta.avatar_url || meta.picture || null
    }));
    window.location.href = '/index.html';
  }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  verifierSession();
});

async function connexionGoogle() {
  const { error } = await db.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/login.html' }
  });
  if (error) alert('Erreur Google : ' + error.message);
}