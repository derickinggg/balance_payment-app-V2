"use client";

import { getSupabaseBrowser } from "@/src/lib/supabaseClient";
import { useState } from "react";

export default function AuthPage() {
  const supabase = getSupabaseBrowser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
    if (!error) window.location.href = "/dashboard";
  }

  async function signUp() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    setLoading(false);
    if (!error) window.location.href = "/dashboard";
  }

  return (
    <div className="min-h-screen grid place-items-center bg-[#0a0a0a] text-white">
      <div className="w-full max-w-sm p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur">
        <h1 className="text-2xl font-bold mb-2">PayPal Dominion Toolkit V3</h1>
        <p className="text-sm text-white/70 mb-6">Enter the Vault</p>
        <input
          className="w-full mb-3 rounded bg-black/40 border border-white/10 px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="w-full mb-3 rounded bg.black/40 border border-white/10 px-3 py-2"
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <div className="flex gap-2">
          <button onClick={signIn} disabled={loading} className="flex-1 bg-[#00bfff] text-black font-semibold py-2 rounded">
            {loading ? "..." : "Sign In"}
          </button>
          <button onClick={signUp} disabled={loading} className="flex-1 bg-[#ff0040] text-white font-semibold py-2 rounded">
            {loading ? "..." : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}


