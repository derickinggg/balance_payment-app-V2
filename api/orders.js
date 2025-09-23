import { createOrderServer } from '../src/paypal.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { amount, currency = 'USD', clientId, clientSecret, env } = req.body || {};
    const { status, json } = await createOrderServer({ value: amount || '1.00', currency_code: currency, clientId, clientSecret, env });
    res.status(status).json(json);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}


