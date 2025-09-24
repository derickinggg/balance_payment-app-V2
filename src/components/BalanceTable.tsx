"use client";
import { useEffect, useState } from "react";

export default function BalanceTable() {
  const [credentialId, setCredentialId] = useState<string>("");
  const [items, setItems] = useState<any[]>([]);
  const [creds, setCreds] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/credentials").then((r) => r.json()).then((j) => setCreds(j.items ?? []));
  }, []);

  async function scan() {
    if (!credentialId) return;
    setLoading(true);
    const res = await fetch("/api/paypal/balance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credentialId }),
    });
    const json = await res.json();
    setItems(json.balances?.balances ?? []);
    setLoading(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <select className="flex-1 rounded bg-black/40 border border-white/10 px-3 py-2" value={credentialId} onChange={(e)=>setCredentialId(e.target.value)}>
          <option value="">Select credential</option>
          {creds.map((c: any) => (
            <option key={c.id} value={c.id}>{c.label} ({c.environment})</option>
          ))}
        </select>
        <button onClick={scan} disabled={!credentialId || loading} className="bg-[#00bfff] text-black font-semibold px-3 rounded">{loading?"...":"Scan"}</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-white/70">
              <th className="py-2">Currency</th>
              <th className="py-2">Available</th>
              <th className="py-2">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {items.map((b: any, i) => (
              <tr key={i} className="border-t border-white/10">
                <td className="py-2">{b.currency_code}</td>
                <td className="py-2">{b.available_value?.value}</td>
                <td className="py-2">{b.as_of_time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


