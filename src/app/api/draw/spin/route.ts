import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { apiError } from "@/lib/api-utils";
import { spinSchema } from "@/lib/validation/draw-schema";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = spinSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid spin payload");
  }

  const { data, error } = await supabaseAdmin().rpc("draw_winners", {
    p_prize_id: parsed.data.prizeId,
    p_count: parsed.data.count,
  });

  if (error) return apiError(error.message, 500);

  const results = data.map((row) => ({
    winnerId: row.winner_id,
    participantId: row.participant_id,
    participantNo: row.participant_no,
    fullName: row.full_name,
    plateNumber: row.plate_number,
    prizeId: row.prize_id,
    wonAt: row.won_at,
  }));

  return NextResponse.json(results);
}
