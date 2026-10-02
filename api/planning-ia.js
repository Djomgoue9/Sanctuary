// api/cuisine-ia.js
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question } = req.body;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 400,
      messages: [
        {
          role: 'system',
          content: `Tu es une assistante organisatrice pour femmes chretiennes.
          Reponds TOUJOURS avec ce format :
          MATIN
          08:00 - tache (10 min)
          RDV DU JOUR
          14:30 - rdv
          ENCOURAGEMENT
          phrase courte
          VERSET
          verset court.
          Pas de symboles * ou **.`
        },
        { role: 'user',        
          content: `Planning: debut ${heureDebut}, temps libre ${tempsLibre} min, RDV: ${rdvDuJour || 'aucun'}, taches: ${taches.map(t => t.nom + ' ' + t.duree + 'min').join(', ')}` }
      ]
    });
    res.json({ reponse: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
}