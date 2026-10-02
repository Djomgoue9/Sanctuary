const versets = [
  { texte: "L'Éternel est mon berger : je ne manquerai de rien.", ref: "Psaume 23 : 1" },
  { texte: "Je puis tout par celui qui me fortifie.", ref: "Philippiens 4 : 13" },
  { texte: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique.", ref: "Jean 3 : 16" },
  { texte: "Toutes choses concourent au bien de ceux qui aiment Dieu.", ref: "Romains 8 : 28" },
  { texte: "Ceux qui se confient en l'Éternel renouvellent leur force.", ref: "Ésaïe 40 : 31" },
  { texte: "Confie-toi en l'Éternel de tout ton cœur.", ref: "Proverbes 3 : 5" },
  { texte: "Cherchez premièrement le royaume et la justice de Dieu.", ref: "Matthieu 6 : 33" },
  { texte: "Sois fort et courageux. Ne t'effraie point.", ref: "Josué 1 : 9" },
  { texte: "Dieu est pour nous un refuge et un appui.", ref: "Psaume 46 : 1" },
  { texte: "Que le Dieu de l'espérance vous remplisse de toute joie.", ref: "Romains 15 : 13" },
  { texte: "Ta parole est une lampe à mes pieds.", ref: "Psaume 119 : 105" },
  { texte: "Je suis le chemin, la vérité, et la vie.", ref: "Jean 14 : 6" },
  { texte: "La paix de Dieu gardera vos cœurs.", ref: "Philippiens 4 : 7" },
  { texte: "Fais tes délices de l'Éternel.", ref: "Psaume 37 : 4" },
  { texte: "Ne crains rien, car je suis avec toi.", ref: "Ésaïe 41 : 10" },
  { texte: "Venez à moi, vous tous qui êtes fatigués.", ref: "Matthieu 11 : 28" },
  { texte: "Le fruit de l'Esprit, c'est l'amour, la joie, la paix.", ref: "Galates 5 : 22" },
  { texte: "L'Éternel bénira ton entrée et ta sortie.", ref: "Psaume 121 : 8" },
  { texte: "C'est par la grâce que vous êtes sauvés.", ref: "Éphésiens 2 : 8" },
  { texte: "L'amour est patient, il est plein de bonté.", ref: "1 Corinthiens 13 : 4" },
  { texte: "Ne vous inquiétez de rien ; faites connaître vos besoins à Dieu.", ref: "Philippiens 4 : 6" },
  { texte: "Heureux les cœurs purs, car ils verront Dieu.", ref: "Matthieu 5 : 8" },
  { texte: "Aimez-vous les uns les autres comme je vous ai aimés.", ref: "Jean 15 : 12" },
  { texte: "Dieu est amour, et celui qui demeure dans l'amour demeure en Dieu.", ref: "1 Jean 4 : 16" },
  { texte: "Car c'est moi qui connais les projets de paix que j'ai formés sur vous.", ref: "Jérémie 29 : 11" },
  { texte: "L'Éternel est proche de ceux qui ont le cœur brisé.", ref: "Psaume 34 : 18" },
  { texte: "Que tout ce que vous faites soit fait avec amour.", ref: "1 Corinthiens 16 : 14" },
  { texte: "L'Éternel est ma lumière et mon salut.", ref: "Psaume 27 : 1" },
  { texte: "Que votre lumière brille ainsi devant les hommes.", ref: "Matthieu 5 : 16" },
  { texte: "L'Éternel ton Dieu est au milieu de toi, comme un héros qui sauve.", ref: "Sophonie 3 : 17" },
  { texte: "Je suis avec vous tous les jours, jusqu'à la fin du monde.", ref: "Matthieu 28 : 20" },
  { texte: "La femme forte, qui la trouvera ? Elle a bien plus de valeur que les perles.", ref: "Proverbes 31 : 10" },
  { texte: "Goûtez et voyez combien l'Éternel est bon !", ref: "Psaume 34 : 8" },
  { texte: "Réjouissez-vous dans le Seigneur en tout temps.", ref: "Philippiens 4 : 4" },
  { texte: "L'Éternel est bon, il est un refuge au jour de la détresse.", ref: "Nahoum 1 : 7" }
];

// Verset du jour — change chaque jour
function chargerVerset() {
  const today = new Date();
  const index = (today.getDate() + today.getMonth() * 31) % versets.length;
  const verset = versets[index];
  document.getElementById('verset-texte').textContent = '« ' + verset.texte + ' »';
  document.getElementById('verset-ref').textContent = '— ' + verset.ref;
}

// Nouveau verset aléatoire
function nouveauVerset() {
  const index = Math.floor(Math.random() * versets.length);
  const verset = versets[index];
  document.getElementById('verset-texte').textContent = '« ' + verset.texte + ' »';
  document.getElementById('verset-ref').textContent = '— ' + verset.ref;
}

// IA Spirituel
async function demanderIASpirituel() {
  const question = document.getElementById('ia-spirituel-question').value.trim();
  if (!question) return;

  const reponseDiv = document.getElementById('ia-spirituel-reponse');
  const texteDiv = document.getElementById('ia-spirituel-reponse-texte');
  reponseDiv.style.display = 'block';
  texteDiv.textContent = '✦ Je consulte la Parole...';

  try {
    const response = await fetch(`${window.location.origin}/spirituel-ia`, {
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

// Initialisation
chargerVerset();