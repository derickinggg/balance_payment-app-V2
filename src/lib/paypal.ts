export type PayPalEnvironment = "sandbox" | "live";

export interface PayPalCredential {
  clientId: string;
  clientSecret: string;
  environment: PayPalEnvironment;
}

function baseUrl(env: PayPalEnvironment) {
  return env === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
}

export async function getAccessToken(cred: PayPalCredential) {
  const tokenRes = await fetch(baseUrl(cred.environment) + "/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: "Basic " + Buffer.from(`${cred.clientId}:${cred.clientSecret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }).toString(),
  });
  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error("PayPal token error: " + text);
  }
  const json = (await tokenRes.json()) as { access_token: string };
  return json.access_token;
}

export async function fetchBalances(cred: PayPalCredential) {
  const token = await getAccessToken(cred);
  const res = await fetch(baseUrl(cred.environment) + "/v2/balances", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("PayPal balances error: " + text);
  }
  return res.json();
}

export async function createOrder(cred: PayPalCredential, body: any) {
  const token = await getAccessToken(cred);
  const res = await fetch(baseUrl(cred.environment) + "/v2/checkout/orders", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("PayPal order create error: " + text);
  }
  return res.json();
}

export async function captureOrder(cred: PayPalCredential, orderId: string) {
  const token = await getAccessToken(cred);
  const res = await fetch(baseUrl(cred.environment) + `/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error("PayPal order capture error: " + text);
  }
  return res.json();
}


