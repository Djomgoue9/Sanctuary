// ================================
// SANCTUARY — notifications.js
// ================================

// ================================
// 1. ENREGISTRER LE SERVICE WORKER
// ================================
async function initNotifications() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Worker non supporté');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker enregistré !');

    // Demander permission
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notifications autorisées !');
      // Programmer toutes les notifications
      programmerToutesNotifications();
    }
  } catch (err) {
    console.error('Erreur Service Worker:', err);
  }
}

// ================================
// 2. ENVOYER UNE NOTIFICATION
// ================================
async function envoyerNotification(titre, corps, url = '/') {
  if (Notification.permission !== 'granted') return;

  const registration = await navigator.serviceWorker.ready;
  registration.showNotification(titre, {
    body: corps,
    icon: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: { url }
  });
}

// ================================
// 3. PROGRAMMER UNE NOTIFICATION
// ================================
async function programmerNotification(titre, corps, dateHeure, url = '/') {
  const maintenant = new Date();
  const dateNotif = new Date(dateHeure);
  const delai = dateNotif.getTime() - maintenant.getTime();

  if (delai <= 0) return;

  // Sauvegarder dans localStorage pour persistence
  const notifs = JSON.parse(localStorage.getItem('sanctuary-notifs-programmees') || '[]');
  notifs.push({ titre, corps, dateHeure, url, id: Date.now() });
  localStorage.setItem('sanctuary-notifs-programmees', JSON.stringify(notifs));

  // Programmer via Service Worker
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'PROGRAMMER_NOTIFICATION',
      titre,
      corps,
      delai,
      url
    });
  } else {
    // Fallback — setTimeout direct
    setTimeout(() => {
      envoyerNotification(titre, corps, url);
    }, delai);
  }

  console.log(`Notification programmée dans ${Math.round(delai/60000)} minutes`);
}

// ================================
// 4. NOTIFICATIONS RDV CALENDRIER
// ================================
function programmerNotificationsRdv() {
  const rdvs = JSON.parse(localStorage.getItem('sanctuary-rdvs') || '[]');
  const maintenant = new Date();

  rdvs.forEach(rdv => {
    const dateRdv = new Date(rdv.date);
    const rappelMin = rdv.rappel_minutes || 60;

    // Date du rappel
    const dateRappel = new Date(dateRdv.getTime() - (rappelMin * 60 * 1000));

    if (dateRappel > maintenant) {
      const heureRdv = dateRdv.toLocaleTimeString('fr-FR', {
        hour: '2-digit', minute: '2-digit'
      });

      programmerNotification(
        `⏰ Rappel — ${rdv.titre}`,
        `Votre RDV est dans ${rappelMin} minutes (${heureRdv}) 🌸`,
        dateRappel,
        '/agenda.html'
      );
    }
  });
}

// ================================
// 5. NOTIFICATION TÂCHES DU MATIN
// ================================
function programmerNotificationTaches() {
  const taches = JSON.parse(localStorage.getItem('sanctuary-taches') || '[]');
  const tachesNonFaites = taches.filter(t => !t.done);

  if (tachesNonFaites.length === 0) return;

  // Notification à 8h du matin
  const demain = new Date();
  demain.setDate(demain.getDate() + 1);
  demain.setHours(8, 0, 0, 0);

  programmerNotification(
    '🏠 Bonjour ! Vos tâches vous attendent',
    `${tachesNonFaites.length} tâche${tachesNonFaites.length > 1 ? 's' : ''} aujourd'hui — Que Dieu vous donne la force ! 🌸`,
    demain,
    '/taches.html'
  );
}

// ================================
// 6. VERSET DU MATIN
// ================================
function programmerVersetMatin() {
  const versets = [
    "L'Éternel est mon berger : je ne manquerai de rien. — Psaume 23:1",
    "Je puis tout par celui qui me fortifie. — Philippiens 4:13",
    "Ne crains rien, car je suis avec toi. — Ésaïe 41:10",
    "Que tout ce que vous faites soit fait avec amour. — 1 Cor 16:14",
    "La femme forte, qui la trouvera ? — Proverbes 31:10"
  ];

  const today = new Date();
  const verset = versets[today.getDate() % versets.length];

  // Notification à 7h du matin
  const demain = new Date();
  demain.setDate(demain.getDate() + 1);
  demain.setHours(7, 0, 0, 0);

  programmerNotification(
    '✦ Verset du jour — Sanctuary',
    verset,
    demain,
    '/spirituel.html'
  );
}

// ================================
// 7. PROGRAMMER TOUTES LES NOTIFS
// ================================
function programmerToutesNotifications() {
  programmerNotificationsRdv();
  programmerNotificationTaches();
  programmerVersetMatin();
}

// ================================
// 8. NOTIFICATION IMMÉDIATE (test)
// ================================
function testerNotification() {
  envoyerNotification(
    '🌸 Sanctuary fonctionne !',
    'Les notifications sont activées sur votre appareil.',
    '/'
  );
}

// ================================
// INITIALISATION
// ================================
document.addEventListener('DOMContentLoaded', () => {
  initNotifications();
});