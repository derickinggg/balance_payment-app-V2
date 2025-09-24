import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { decryptString } from "@/lib/crypto";
import { captureOrder } from "@/lib/paypal";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { credentialId } = await req.json();
  if (!credentialId) return NextResponse.json({ error: "Missing credentialId" }, { status: 400 });
  const { id } = await context.params;

  const { data: rows, error } = await supabase
    .from("credentials")
    .select("enc_client_id, enc_client_secret, enc_iv, enc_salt, environment")
    .eq("id", credentialId)
    .single();
  if (error || !rows) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const clientId = await decryptString(rows.enc_client_id, rows.enc_iv, rows.enc_salt);
  const clientSecret = await decryptString(rows.enc_client_secret, rows.enc_iv, rows.enc_salt);
  const result = await captureOrder(
    { clientId, clientSecret, environment: rows.environment },
    id,
  );
  return NextResponse.json({ result });
}


