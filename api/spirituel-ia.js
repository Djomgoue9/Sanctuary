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
      max_tokens: 250,
      messages: [
        {
          role: 'system',
          content: `Tu es un compagnon biblique sage pour femmes chretiennes.
          Tu utilises la Bible Louis Segond.
          Tu reponds en francais de facon COURTE et PRECISE — maximum 5 lignes.
          Termine par une benediction.`
        },
        { role: 'user', content: question }
      ]
    });
    res.json({ reponse: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
}