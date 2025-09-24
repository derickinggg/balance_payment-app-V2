"use client";
import { useState } from "react";

export default function CredentialForm() {
  const [label, setLabel] = useState("");
  const [environment, setEnvironment] = useState<"sandbox" | "live">("sandbox");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/credentials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, environment, clientId, clientSecret }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setError(json.error ?? "Failed");
    } else {
      setLabel("");
      setClientId("");
      setClientSecret("");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-2">
      <input className="w-full rounded bg-black/40 border border-white/10 px-3 py-2" placeholder="Label" value={label} onChange={(e)=>setLabel(e.target.value)} />
      <select className="w-full rounded bg-black/40 border border-white/10 px-3 py-2" value={environment} onChange={(e)=>setEnvironment(e.target.value as any)}>
        <option value="sandbox">Sandbox</option>
        <option value="live">Live</option>
      </select>
      <input className="w-full rounded bg-black/40 border border-white/10 px-3 py-2" placeholder="Client ID" value={clientId} onChange={(e)=>setClientId(e.target.value)} />
      <input className="w-full rounded bg-black/40 border border-white/10 px-3 py-2" placeholder="Client Secret" type="password" value={clientSecret} onChange={(e)=>setClientSecret(e.target.value)} />
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button onClick={submit} disabled={loading} className="w-full bg-[#00bfff] text-black font-semibold py-2 rounded">{loading?"...":"Add Credential"}</button>
    </div>
  );
}


