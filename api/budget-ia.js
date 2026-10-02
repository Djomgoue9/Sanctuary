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
          content: `Tu es une conseillere financiere bienveillante pour femmes chretiennes.
          Tu reponds en francais de facon COURTE et PRECISE — maximum 5 lignes.`
        },
        { role: 'user', content: question }
      ]
    });
    res.json({ reponse: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ erreur: err.message });
  }
}