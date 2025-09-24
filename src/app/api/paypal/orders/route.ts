import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { decryptString } from "@/lib/crypto";
import { createOrder } from "@/lib/paypal";

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { credentialId, amount, currency = "USD", description } = await req.json();
  if (!credentialId || !amount) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { data: rows, error } = await supabase
    .from("credentials")
    .select("enc_client_id, enc_client_secret, enc_iv, enc_salt, environment")
    .eq("id", credentialId)
    .single();
  if (error || !rows) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const clientId = await decryptString(rows.enc_client_id, rows.enc_iv, rows.enc_salt);
  const clientSecret = await decryptString(rows.enc_client_secret, rows.enc_iv, rows.enc_salt);
  const order = await createOrder(
    { clientId, clientSecret, environment: rows.environment },
    {
      intent: "CAPTURE",
      purchase_units: [
        { amount: { currency_code: currency, value: String(amount) }, description },
      ],
    },
  );
  return NextResponse.json({ order });
}


