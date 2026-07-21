import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { apiError } from "@/lib/api-utils";
import { importPayloadSchema } from "@/lib/validation/participant-schema";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = importPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid import payload");
  }

  const payload = parsed.data.rows.map((row) => ({
    participant_no: row.participant_no,
    full_name: row.full_name,
    plate_number: row.plate_number || null,
    import_batch_id: parsed.data.batchId ?? null,
  }));

  const { error } = await supabaseAdmin()
    .from("participants")
    .upsert(payload, { onConflict: "participant_no" });

  if (error) return apiError(error.message, 500);

  return NextResponse.json({ inserted: payload.length });
}
