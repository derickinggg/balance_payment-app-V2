import { fetchTransactions } from '../src/paypal.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  try {
    const { clientId, clientSecret, env, startDate, endDate, page_size, days } = req.body || {};
    const data = await fetchTransactions({ clientId, clientSecret, env, startDate, endDate, page_size, days });
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}


