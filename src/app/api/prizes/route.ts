import "server-only";
import { NextRequest } from "next/server";
import { createPrize, listPrizes } from "@/lib/supabase/queries";
import { apiError, withApiErrors } from "@/lib/api-utils";
import { createPrizeSchema } from "@/lib/validation/draw-schema";

export const runtime = "nodejs";

export async function GET() {
  return withApiErrors(() => listPrizes());
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = createPrizeSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid prize payload");
  }
  return withApiErrors(() => createPrize(parsed.data));
}
