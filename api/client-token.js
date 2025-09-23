import { generateClientToken } from '../src/paypal.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { clientId, clientSecret, env } = req.body || {};
    const token = await generateClientToken({ clientId, clientSecret, env });
    res.status(200).json(token);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}


