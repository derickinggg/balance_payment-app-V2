import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import {
  generateClientToken,
  createOrderServer,
  captureOrderServer,
  fetchCurrentBalance,
  fetchTransactions,
} from './paypal.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health
app.get('/api/health', (_, res) => res.json({ status: 'OK' }));

// Checkout endpoints
app.post('/api/client-token', async (req, res) => {
  try {
    const { clientId, clientSecret, env } = req.body || {};
    const token = await generateClientToken({ clientId, clientSecret, env });
    res.status(200).json(token);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const { amount, currency, clientId, clientSecret, env } = req.body || {};
    const { status, json } = await createOrderServer({ value: amount || '1.00', currency_code: currency || 'USD', clientId, clientSecret, env });
    res.status(status).json(json);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/orders/:id/capture', async (req, res) => {
  try {
    const { id } = req.params;
    const { clientId, clientSecret, env } = req.body || {};
    const { status, json } = await captureOrderServer(id, { clientId, clientSecret, env });
    res.status(status).json(json);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Balance endpoints
app.post('/api/balance/current', async (req, res) => {
  try {
    const { clientId, clientSecret, env } = req.body || {};
    const result = await fetchCurrentBalance({ clientId, clientSecret, env });
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/balance/transactions', async (req, res) => {
  try {
    const { clientId, clientSecret, env, startDate, endDate, page_size, days } = req.body || {};
    const data = await fetchTransactions({ clientId, clientSecret, env, startDate, endDate, page_size, days });
    res.status(200).json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Note: For SPA routing, add a safe fallback pattern compatible with Express v5 if needed.

app.listen(PORT, () => {
  console.log(`Unified app running at http://localhost:${PORT}`);
});


