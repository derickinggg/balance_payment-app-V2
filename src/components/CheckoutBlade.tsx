"use client";
import { useEffect, useState } from "react";

export default function CheckoutBlade() {
  const [credentialId, setCredentialId] = useState<string>("
");
  const [amount, setAmount] = useState<string>("10.00");
  const [currency, setCurrency] = useState<string>("USD");
  const [desc, setDesc] = useState<string>("Test charge");
  const [log, setLog] = useState<string[]>([]);
  const [creds, setCreds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/credentials").then((r) => r.json()).then((j) => setCreds(j.items ?? []));
  }, []);

  function pushLog(line: string) {
    setLog((l) => [new Date().toLocaleTimeString() + " | " + line, ...l]);
  }

  async function submit() {
    if (!credentialId) return;
    setLoading(true);
    pushLog("Creating order...");
    const orderRes = await fetch("/api/paypal/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credentialId, amount, currency, description: desc }),
    });
    const orderJson = await orderRes.json();
    if (!orderRes.ok) {
      pushLog("Order create failed: " + (orderJson.error ?? "error"));
      setLoading(false);
      return;
    }
    const orderId = orderJson.order.id;
    pushLog("Order ID: " + orderId + " | APPROVED");
    pushLog("Capturing order...");
    const capRes = await fetch(`/api/paypal/orders/${orderId}/capture`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credentialId }),
    });
    const capJson = await capRes.json();
    if (!capRes.ok) {
      pushLog("Capture failed: " + (capJson.error ?? "error"));
      setLoading(false);
      return;
    }
    const amountCaptured = capJson.result?.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
    pushLog(`Target Compromised: $${amountCaptured} Captured`);
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <select className="rounded bg-black/40 border border-white/10 px-3 py-2" value={credentialId} onChange={(e)=>setCredentialId(e.target.value)}>
          <option value="">Select credential</option>
          {creds.map((c: any) => (
            <option key={c.id} value={c.id}>{c.label} ({c.environment})</option>
          ))}
        </select>
        <input className="rounded bg-black/40 border border-white/10 px-3 py-2" placeholder="Amount" value={amount} onChange={(e)=>setAmount(e.target.value)} />
        <input className="rounded bg-black/40 border border-white/10 px-3 py-2" placeholder="Currency" value={currency} onChange={(e)=>setCurrency(e.target.value)} />
        <input className="rounded bg-black/40 border border-white/10 px-3 py-2" placeholder="Description" value={desc} onChange={(e)=>setDesc(e.target.value)} />
      </div>
      <button onClick={submit} disabled={!credentialId || loading} className="w-full bg-[#ff0040] text-white font-semibold py-2 rounded">{loading?"...":"Execute Checkout"}</button>
      <div className="rounded border border-white/10 bg-black/30 p-2 h-40 overflow-auto text-xs">
        {log.length===0 ? <div className="text-white/50">Awaiting Breach...</div> : (
          <ul className="space-y-1">{log.map((l,i)=>(<li key={i}>{l}</li>))}</ul>
        )}
      </div>
    </div>
  );
}


