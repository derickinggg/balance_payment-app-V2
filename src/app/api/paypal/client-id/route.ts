import { NextResponse } from "next/server";

export async function GET() {
  const id = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test";
  return NextResponse.json({ clientId: id });
}


