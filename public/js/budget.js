// ================================
// SANCTUARY — budget.js
// Synchronisé avec Supabase
// ================================

let budget = { revenus: 0, depenses: 0, economies: 0 };
let transactions = [];
let courses = [];
let champActif = '';
let graphe = null;

// ================================
// CHARGEMENT DEPUIS SUPABASE
// ================================
async function chargerBudget() {
  const user = JSON.parse(localStorage.getItem('sanctuary-user-actif'));
  if (!user) return;

  const today = new Date();
  const mois = today.getMonth() + 1;
  const annee = today.getFullYear();

  // Charger budget
  const { data: budgetData } = await db
    .from('budget')
    .select('*')
    .eq('user_id', user.id)
    .eq('mois', mois)
    .eq('annee', annee)
    .single();

  if (budgetData) {
    budget = {
      revenus: budgetData.revenus || 0,
      depenses: budgetData.depenses || 0,
      economies: budgetData.economies || 0
    };
  }

  // Charger transactions
  const { data: transData } = await db
    .from('transactions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (transData) transactions = transData;

  // Charger courses
  const { data: coursesData } = await db
    .from('courses')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true });

  if (coursesData) courses = coursesData;

  afficherBudget();
  afficherTransactions();
  afficherCourses();
}

// ================================
// SAUVEGARDER BUDGET SUPABASE
// ================================
async function sauvegarderBudgetDB() {
  const user = JSON.parse(localStorage.getItem('sanctuary-user-actif'));
  if (!user) return;

  const today = new Date();
  const mois = today.getMonth() + 1;
  const annee = today.getFullYear();

  await db.from('budget').upsert({
    user_id: user.id,
    revenus: budget.revenus,
    depenses: budget.depenses,
    economies: budget.economies,
    mois,
    annee,
    updated_at: new Date().toISOString()
  }, { onConflict: 'user_id,mois,annee' });
}

// ================================
// GRAPHE CAMEMBERT
// ================================
function initGraphe() {
  const canvas = document.getElementById('graphe-budget');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const solde = Math.max(0, budget.revenus - budget.depenses - budget.economies);

  const donnees = [budget.depenses, budget.economies, solde];
  const couleurs = ['#E24B4A', '#1D9E75', '#D4A373'];
  const labels = ['Dépenses', 'Économies', 'Solde'];

  if (graphe) graphe.destroy();

  graphe = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data: donnees.map(d => d || 0),
        backgroundColor: couleurs,
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` ${ctx.label} : ${ctx.raw.toLocaleString('fr-FR')} €`
          }
        }
      },
      animation: { animateRotate: true, duration: 800 }
    }
  });

  // Centre du graphe
  const container = document.querySelector('.graphe-container');
  const ancien = container.querySelector('.graphe-centre');
  if (ancien) ancien.remove();

  const centre = document.createElement('div');
  centre.className = 'graphe-centre';
  centre.innerHTML = `
    <div class="graphe-centre-val">
      ${solde.toLocaleString('fr-FR')} €
    </div>
    <div class="graphe-centre-label">Solde</div>
  `;
  container.appendChild(centre);

  // Légende
  const legende = document.getElementById('graphe-legende');
  if (!legende) return;

  const infos = [
    { label: '💰 Revenus', montant: budget.revenus,
      couleur: '#D4A373', pct: 100 },
    { label: '📉 Dépenses', montant: budget.depenses,
      couleur: '#E24B4A',
      pct: budget.revenus > 0
        ? Math.round((budget.depenses / budget.revenus) * 100) : 0 },
    { label: '🏦 Économies', montant: budget.economies,
      couleur: '#1D9E75',
      pct: budget.revenus > 0
        ? Math.round((budget.economies / budget.revenus) * 100) : 0 },
    { label: '✨ Solde', montant: solde,
      couleur: '#D4A373',
      pct: budget.revenus > 0
        ? Math.round((solde / budget.revenus) * 100) : 0 }
  ];

  legende.innerHTML = infos.map(i => `
    <div class="legende-item">
      <div class="legende-gauche">
        <div class="legende-couleur" style="background:${i.couleur};"></div>
        <div>
          <div class="legende-nom">${i.label}</div>
          <div class="legende-pct">${i.pct}% du budget</div>
        </div>
      </div>
      <div class="legende-montant">
        ${i.montant.toLocaleString('fr-FR')} €
      </div>
    </div>
  `).join('');
}

// ================================
// AFFICHER BUDGET
// ================================
function afficherBudget() {
  document.getElementById('val-revenus').textContent =
    budget.revenus.toLocaleString('fr-FR') + ' €';
  document.getElementById('val-depenses').textContent =
    budget.depenses.toLocaleString('fr-FR') + ' €';
  document.getElementById('val-economies').textContent =
    budget.economies.toLocaleString('fr-FR') + ' €';

  const solde = budget.revenus - budget.depenses - budget.economies;
  const soldeEl = document.getElementById('val-solde');
  soldeEl.textContent = solde.toLocaleString('fr-FR') + ' €';
  soldeEl.style.color = solde >= 0 ? 'var(--caramel)' : '#E24B4A';

  const pct = budget.revenus > 0
    ? Math.min(100, Math.round((solde / budget.revenus) * 100))
    : 0;
  document.getElementById('solde-progress').style.width = pct + '%';

  initGraphe();
}

// ================================
// MODAL MODIFICATION
// ================================
function modifierMontant(champ) {
  champActif = champ;
  const titres = {
    revenus: '💰 Revenus du mois',
    depenses: '📉 Dépenses totales',
    economies: '🏦 Économies'
  };
  document.getElementById('modal-titre').textContent = titres[champ];
  document.getElementById('modal-input').value = budget[champ];
  document.getElementById('modal-budget').style.display = 'flex';
  document.getElementById('modal-input').focus();
}

async function sauvegarderMontant() {
  const val = parseFloat(document.getElementById('modal-input').value);
  if (!isNaN(val) && val >= 0) {
    budget[champActif] = val;
    await sauvegarderBudgetDB();
    afficherBudget();
  }
  fermerModal();
}

function fermerModal() {
  document.getElementById('modal-budget').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('modal-input');
  if (input) {
    input.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') sauvegarderMontant();
    });
  }
});

// ================================
// TRANSACTIONS
// ================================
async function ajouterTransaction() {
  const nom = document.getElementById('dep-nom').value.trim();
  const montant = parseFloat(document.getElementById('dep-montant').value);
  const type = document.getElementById('dep-type').value;

  if (!nom || isNaN(montant) || montant <= 0) return;

  const user = JSON.parse(localStorage.getItem('sanctuary-user-actif'));
  if (!user) return;

  const { data, error } = await db
    .from('transactions')
    .insert({
      user_id: user.id,
      nom,
      montant,
      type,
      date: new Date().toISOString().split('T')[0]
    })
    .select()
    .single();

  if (!error && data) {
    transactions.unshift(data);

    // Synchroniser budget
    if (type === 'depense') budget.depenses += montant;
    else if (type === 'revenu') budget.revenus += montant;
    else if (type === 'epargne') budget.economies += montant;

    await sauvegarderBudgetDB();
    afficherBudget();
    afficherTransactions();

    document.getElementById('dep-nom').value = '';
    document.getElementById('dep-montant').value = '';
  }
}

async function supprimerTransaction(id) {
  const tr = transactions.find(t => t.id === id);
  if (tr) {
    if (tr.type === 'depense')
      budget.depenses = Math.max(0, budget.depenses - tr.montant);
    else if (tr.type === 'revenu')
      budget.revenus = Math.max(0, budget.revenus - tr.montant);
    else if (tr.type === 'epargne')
      budget.economies = Math.max(0, budget.economies - tr.montant);
  }

  await db.from('transactions').delete().eq('id', id);
  transactions = transactions.filter(t => t.id !== id);
  await sauvegarderBudgetDB();
  afficherBudget();
  afficherTransactions();
}

function afficherTransactions() {
  const liste = document.getElementById('liste-transactions');
  if (!liste) return;

  if (transactions.length === 0) {
    liste.innerHTML = `
      <div style="text-align:center;padding:16px;
        color:var(--texte-doux);font-size:13px;">
        Aucune transaction enregistrée
      </div>`;
    return;
  }

  const icones = { depense: '📉', revenu: '💰', epargne: '🏦' };
  const signes = { depense: '-', revenu: '+', epargne: '+' };

  liste.innerHTML = transactions.slice(0, 10).map(t => `
    <div class="transaction-item">
      <div class="transaction-icon ${t.type}">${icones[t.type]}</div>
      <div class="transaction-info">
        <div class="transaction-nom">${t.nom}</div>
        <div class="transaction-date">${t.date}</div>
      </div>
      <div class="transaction-montant ${t.type}">
        ${signes[t.type]} ${parseFloat(t.montant).toLocaleString('fr-FR')} €
      </div>
      <button onclick="supprimerTransaction(${t.id})"
        style="background:transparent;border:none;
        color:#C0A090;font-size:16px;cursor:pointer;">×</button>
    </div>
  `).join('');
}

// ================================
// LISTE DE COURSES
// ================================
async function ajouterArticle() {
  const input = document.getElementById('nouvel-article');
  const valeur = input.value.trim();
  if (!valeur) return;

  const user = JSON.parse(localStorage.getItem('sanctuary-user-actif'));
  if (!user) return;

  const { data, error } = await db
    .from('courses')
    .insert({ user_id: user.id, nom: valeur, fait: false })
    .select()
    .single();

  if (!error && data) {
    courses.push(data);
    afficherCourses();
    input.value = '';
  }
}

async function toggleArticle(id) {
  const article = courses.find(c => c.id === id);
  if (!article) return;

  article.fait = !article.fait;

  await db.from('courses')
    .update({ fait: article.fait })
    .eq('id', id);

  afficherCourses();
}

async function supprimerArticle(id) {
  await db.from('courses').delete().eq('id', id);
  courses = courses.filter(c => c.id !== id);
  afficherCourses();
}

function afficherCourses() {
  const liste = document.getElementById('liste-courses');
  if (!liste) return;

  if (courses.length === 0) {
    liste.innerHTML = `
      <p style="color:var(--texte-doux);font-size:13px;padding:8px 0;">
        Aucun article
      </p>`;
    return;
  }

  liste.innerHTML = courses.map(a => `
    <li style="${a.fait ? 'opacity:0.5;' : ''}">
      <span onclick="toggleArticle(${a.id})"
        style="cursor:pointer;flex:1;
        ${a.fait ? 'text-decoration:line-through;' : ''}">
        ${a.fait ? '✓' : '○'} ${a.nom}
      </span>
      <button class="btn-suppr-item"
        onclick="supprimerArticle(${a.id})">×</button>
    </li>
  `).join('');
}

// ================================
// IA BUDGET
// ================================
async function demanderIABudget() {
  const question = document.getElementById('ia-budget-question').value.trim();
  if (!question) return;

  const reponseDiv = document.getElementById('ia-budget-reponse');
  const texteDiv = document.getElementById('ia-budget-reponse-texte');
  reponseDiv.style.display = 'block';
  texteDiv.textContent = '✦ Votre conseillère réfléchit...';

  try {
    const response = await fetch('/api/budget-ia', {
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
  chargerBudget();
});