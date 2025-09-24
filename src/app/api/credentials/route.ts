import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabaseServer";
import { encryptString } from "@/lib/crypto";
import { z } from "zod";
import { fetchBalances } from "@/lib/paypal";

const bodySchema = z.object({
  label: z.string().min(1),
  clientId: z.string().min(5),
  clientSecret: z.string().min(5),
  environment: z.enum(["sandbox", "live"]),
});

export async function GET() {
  const supabase = await getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data: rows, error } = await supabase
    .from("credentials")
    .select("id,label,environment,created_at,updated_at").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: rows ?? [] });
}

export async function POST(req: NextRequest) {
  const supabase = await getSupabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const { clientId, clientSecret, label, environment } = parsed.data;

  const encId = await encryptString(clientId);
  const encSecret = await encryptString(clientSecret);

  // Validate by doing a lightweight balance call
  try {
    await fetchBalances({ clientId, clientSecret, environment });
  } catch (e: any) {
    return NextResponse.json({ error: "Invalid PayPal credentials" }, { status: 400 });
  }

  const { error } = await supabase.from("credentials").insert({
    user_id: data.user.id,
    label,
    environment,
    enc_client_id: encId.ciphertext,
    enc_client_secret: encSecret.ciphertext,
    enc_iv: encId.iv,
    enc_salt: encId.salt,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}


