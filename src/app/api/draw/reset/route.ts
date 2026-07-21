import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import { apiError } from "@/lib/api-utils";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const { error } = await supabaseAdmin().rpc("reset_draw");
  if (error) return apiError(error.message, 500);
  return NextResponse.json({ ok: true });
}
