// public/js/auth.js
// ================================
// SANCTUARY — Authentification
// ================================

// Vérifier si connectée
async function verifierAuth() {
  let { data } = await db.auth.getSession();
  if (!data.session) {
    const r = await db.auth.refreshSession();
    data = r.data;
  }
  if (!data || !data.session) {
    localStorage.removeItem('sanctuary-user-actif');
    window.location.href = '/login.html';
    return null;
  }
  return data.session.user;
}

// Récupérer l'utilisatrice connectée
async function getUser() {
  const { data } = await db.auth.getSession();
  return data.session?.user || null;
}

// Récupérer le profil
async function getProfil() {
  const user = await getUser();
  if (!user) return null;

  const { data } = await db
    .from('profils')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}

// Déconnexion
async function seDeconnecter() {
  await db.auth.signOut();
  window.location.href = '/login.html';
}

// Initialiser le header avec le profil
async function initHeader() {
  const profil = await getProfil();
  if (!profil) return;

  const prenomEl = document.getElementById('user-prenom');
  const avatarEl = document.getElementById('user-avatar');

  if (prenomEl) prenomEl.textContent = profil.prenom;

  if (avatarEl) {
    if (profil.photo) {
      avatarEl.innerHTML = `
        <img src="${profil.photo}"
          style="width:34px;height:34px;border-radius:50%;object-fit:cover;">`;
    } else {
      avatarEl.textContent = profil.prenom.charAt(0).toUpperCase();
    }
  }
}