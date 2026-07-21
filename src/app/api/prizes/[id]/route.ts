import "server-only";
import { NextRequest } from "next/server";
import { deletePrize, updatePrize } from "@/lib/supabase/queries";
import { apiError, withApiErrors } from "@/lib/api-utils";
import { updatePrizeSchema } from "@/lib/validation/draw-schema";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updatePrizeSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid prize payload");
  }
  return withApiErrors(() => updatePrize(id, parsed.data));
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return withApiErrors(async () => {
    await deletePrize(id);
    return { ok: true };
  });
}
