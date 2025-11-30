// pages/api/openai-generate.js
import axios from 'axios';
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { prompt } = req.body;
  try {
    const OPENAI_KEY = process.env.OPENAI_API_KEY;
    if (!OPENAI_KEY) return res.status(500).json({ error: "OpenAI not configured" });
    const r = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600
    }, {
      headers: { Authorization: `Bearer ${OPENAI_KEY}` }
    });
    const content = r.data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ text: content });
  } catch (e) {
    console.error(e.response?.data || e.message);
    return res.status(500).json({ error: 'openai error' });
  }
}
