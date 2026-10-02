import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { texte } = req.body;

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
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
            "rappel_minutes": 60
          }
          Si tu ne comprends pas :
          {
            "action": "incompris",
            "message": "explication courte"
          }
          Année actuelle : ${new Date().getFullYear()}.`
        },
        { role: 'user', content: texte }
      ]
    });

    const texteReponse = completion.choices[0].message.content;
    const jsonPropre = texteReponse.replace(/```json|```/g, '').trim();
    const data = JSON.parse(jsonPropre);
    res.json(data);
  } catch (err) {
    res.status(500).json({ action: 'erreur', message: err.message });
  }
}