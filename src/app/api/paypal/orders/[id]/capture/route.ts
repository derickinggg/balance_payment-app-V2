import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/src/lib/supabaseServer";
import { decryptString } from "@/src/lib/crypto";
import { captureOrder } from "@/src/lib/paypal";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const supabase = getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { credentialId } = await req.json();
  if (!credentialId) return NextResponse.json({ error: "Missing credentialId" }, { status: 400 });

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
    params.id,
  );
  return NextResponse.json({ result });
}


