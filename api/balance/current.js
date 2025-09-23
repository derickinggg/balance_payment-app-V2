import { fetchCurrentBalance } from '../../src/paypal.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { clientId, clientSecret, env } = req.body || {};
    const result = await fetchCurrentBalance({ clientId, clientSecret, env });
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}


