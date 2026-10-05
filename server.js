require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Groq = require('groq-sdk');

const app = express();
app.use(cors());
app.use(express.json());

// La clé vient de .env (en local) ou de Vercel > Environment Variables
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const MODEL = 'llama-3.3-70b-versatile';

// Routes IA simples (question -> réponse en 5 lignes max)
function routeSimple(chemin, role) {
  app.post(chemin, async (req, res) => {
    try {
      const completion = await groq.chat.completions.create({
        model: MODEL,
        max_tokens: 250,
        messages: [
          { role: 'system', content: `${role} Reponds en francais en 5 lignes max.` },
          { role: 'user', content: req.body.question }
        ]
      });
      res.json({ reponse: completion.choices[0].message.content });
    } catch (err) {
      console.error(err);
      res.status(500).json({ erreur: err.message });
    }
  });
}

routeSimple('/cuisine-ia', 'Tu es une assistante cuisine.');
routeSimple('/sport-ia', 'Tu es une coach sportive.');
routeSimple('/spirituel-ia', 'Tu es un compagnon biblique.');
routeSimple('/budget-ia', 'Tu es une conseillere financiere.');

// Planning
app.post('/planning-ia', async (req, res) => {
  try {
    const { taches, tempsLibre, rdvDuJour, heureDebut } = req.body;
    const completion = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 400,
      messages: [
        {
          role: 'system',
          content:
            'Tu es une assistante organisatrice. Reponds TOUJOURS avec ce format : MATIN\n08:00 - tache (10 min)\nRDV DU JOUR\n14:30 - rdv\nENCOURAGEMENT\nphrase courte\nVERSET\nverset court. Pas de symboles * ou **.'
        },
        {
          role: 'user',
          content: `Planning: debut ${heureDebut}, temps libre ${tempsLibre} min, RDV: ${rdvDuJour || 'aucun'}, taches: ${taches.map(t => t.nom + ' ' + t.duree + 'min').join(', ')}`
        }
      ]
    });
    res.json({ planning: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erreur: err.message });
  }
});

// Verset du jour (fetch est intégré à Node 18+, pas besoin de node-fetch)
app.get('/verset-du-jour', async (req, res) => {
  try {
    const versets = [
      'john/3/16', 'psalms/23/1', 'philippians/4/13', 'romans/8/28',
      'isaiah/40/31', 'proverbs/3/5', 'matthew/6/33', 'joshua/1/9',
      'psalms/46/1', 'john/14/6', 'philippians/4/7', 'psalms/119/105',
      'matthew/11/28', 'jeremiah/29/11', 'psalms/27/1'
    ];
    const today = new Date();
    const index = (today.getDate() + today.getMonth()) % versets.length;

    const response = await fetch(
      `https://bible-api.com/${versets[index]}?translation=fr-lsg`
    );
    const data = await response.json();

    res.json({ texte: data.text.trim(), reference: data.reference });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      texte: "L'Éternel est mon berger : je ne manquerai de rien.",
      reference: 'Psaume 23 : 1'
    });
  }
});

// Encouragement
app.post('/encouragement-ia', async (req, res) => {
  const { situation } = req.body;
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content: `Tu es une assistante bienveillante et chretienne.
Tu envoies des messages d'encouragement courts, chaleureux et personnalises.
Maximum 2 phrases. Toujours en francais.
Termine par un emoji ou un verset tres court.`
        },
        { role: 'user', content: situation }
      ]
    });
    res.json({ message: completion.choices[0].message.content });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Que la grâce de Dieu vous accompagne ! 🌸' });
  }
});

// Vocal : extraire un rendez-vous depuis une commande vocale
app.post('/vocal-ia', async (req, res) => {
  const { texte } = req.body;
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      max_tokens: 300,
      messages: [
        {
          role: 'system',
          content: `Tu es un assistant qui extrait des informations de rendez-vous depuis du texte en français.
Tu dois toujours répondre UNIQUEMENT avec un JSON valide, sans aucun texte avant ou après.
Format JSON attendu :
{
  "action": "ajouter_rdv",
  "titre": "nom du rendez-vous",
  "date": "YYYY-MM-DD",
  "heure": "HH:MM",
  "note": "note optionnelle",
  "importance": "normal" ou "important" ou "urgent",
  "rappel_minutes": nombre de minutes avant le rappel (60 par défaut)
}
Si tu ne comprends pas la commande, réponds :
{
  "action": "incompris",
  "message": "explication courte"
}
La date actuelle est ${new Date().toLocaleDateString('fr-FR')}.
Année actuelle : ${new Date().getFullYear()}.`
        },
        { role: 'user', content: texte }
      ]
    });
    const texteReponse = completion.choices[0].message.content;
    const jsonPropre = texteReponse.replace(/```json|```/g, '').trim();
    res.json(JSON.parse(jsonPropre));
  } catch (err) {
    console.error(err);
    res.status(500).json({ action: 'erreur', message: 'Erreur serveur' });
  }
});

// Lancement local uniquement (sur Vercel, c'est Vercel qui lance l'app)
if (require.main === module) {
  app.use(express.static(__dirname));
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Sanctuary tourne sur http://localhost:${PORT}`);
  });
}

module.exports = app;