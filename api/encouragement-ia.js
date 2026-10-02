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
      max_tokens: 100,
      messages: [
        {
          role: 'system',
          content: `Tu es une assistante bienveillante et chretienne.
          Tu envoies des messages d'encouragement courts et chaleureux.
          Maximum 2 phrases. Toujours en francais.
          Termine par un emoji ou un verset tres court.`
        },
        { role: 'user', content: situation }
      ]
    });
    res.json({ reponse: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ message: 'Que la grace de Dieu vous accompagne ! 🌸'});
  }
}