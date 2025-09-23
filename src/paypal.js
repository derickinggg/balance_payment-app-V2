import fetch from 'node-fetch';

export function baseForEnv(env) {
  const e = (env || 'sandbox').toLowerCase();
  // Use api-m hostnames as used in balance_checker repo
  return e === 'live' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com';
}

export async function generateAccessToken({ clientId, clientSecret, env } = {}) {
  if (!clientId || !clientSecret) {
    throw new Error('Missing clientId or clientSecret');
  }
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const base = baseForEnv(env);
  const response = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${error}`);
  }
  const data = await response.json();
  return data.access_token;
}

export async function generateClientToken({ clientId, clientSecret, env } = {}) {
  const accessToken = await generateAccessToken({ clientId, clientSecret, env });
  const base = baseForEnv(env);
  const response = await fetch(`${base}/v1/identity/generate-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get client token: ${error}`);
  }
  return response.json();
}

export async function createOrderServer({ value = '1.00', currency_code = 'USD', clientId, clientSecret, env } = {}) {
  const accessToken = await generateAccessToken({ clientId, clientSecret, env });
  const base = baseForEnv(env);
  const payload = {
    intent: 'CAPTURE',
    purchase_units: [ { amount: { currency_code, value } } ],
  };
  const response = await fetch(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await response.json();
  return { status: response.status, json };
}

export async function captureOrderServer(orderId, { clientId, clientSecret, env } = {}) {
  const accessToken = await generateAccessToken({ clientId, clientSecret, env });
  const base = baseForEnv(env);
  const response = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const json = await response.json();
  return { status: response.status, json };
}

export async function fetchTransactions({ clientId, clientSecret, env, startDate, endDate, page_size = 100, days = 31 } = {}) {
  const base = baseForEnv(env);
  const accessToken = await generateAccessToken({ clientId, clientSecret, env });
  const now = new Date();
  const lookbackDays = Math.max(1, Math.min(31, Number(days) || 31));
  const past = new Date(now.getTime() - lookbackDays*24*60*60*1000);
  const start = (startDate || past.toISOString());
  const end = (endDate || now.toISOString());
  const params = new URLSearchParams();
  params.set('start_date', start);
  params.set('end_date', end);
  params.set('page_size', String(page_size));
  params.set('fields', 'all');
  const url = `${base}/v1/reporting/transactions?${params.toString()}`;
  const response = await fetch(url, { headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' } });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to fetch transactions: ${error}`);
  }
  return response.json();
}

export async function fetchCurrentBalance({ clientId, clientSecret, env } = {}) {
  const base = baseForEnv(env);
  const accessToken = await generateAccessToken({ clientId, clientSecret, env });
  const asOf = new Date().toISOString();
  const response = await fetch(`${base}/v1/reporting/balances?as_of_time=${encodeURIComponent(asOf)}`, {
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
  });
  if (!response.ok) {
    // Fallback to transactions-derived balance if balances endpoint not available
    const tx = await fetchTransactions({ clientId, clientSecret, env, days: 30 });
    const details = tx?.transaction_details || [];
    let balance = 0; let currency = 'USD';
    for (const t of details) {
      const amount = parseFloat(t?.transaction_info?.transaction_amount?.value || 0);
      currency = t?.transaction_info?.transaction_amount?.currency_code || currency;
      const code = t?.transaction_info?.transaction_event_code;
      if (code === 'T0006' || code === 'T0001') balance += amount; else if (code === 'T0002' || code === 'T0003') balance -= amount;
    }
    return { derived: true, balance: balance.toFixed(2), currency };
  }
  return response.json();
}


