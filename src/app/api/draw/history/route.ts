import "server-only";
import { NextRequest } from "next/server";
import { listRecentWinners } from "@/lib/supabase/queries";
import { withApiErrors } from "@/lib/api-utils";
import { WINNER_HISTORY_LIMIT } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : WINNER_HISTORY_LIMIT;
  return withApiErrors(() => listRecentWinners(Number.isFinite(limit) ? limit : WINNER_HISTORY_LIMIT));
}
