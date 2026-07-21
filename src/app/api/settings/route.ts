import "server-only";
import { NextRequest } from "next/server";
import { getSettings, updateSettings } from "@/lib/supabase/queries";
import { apiError, withApiErrors } from "@/lib/api-utils";
import { updateSettingsSchema } from "@/lib/validation/draw-schema";

export const runtime = "nodejs";

export async function GET() {
  return withApiErrors(() => getSettings());
}

export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = updateSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return apiError(parsed.error.issues[0]?.message ?? "Invalid settings payload");
  }
  return withApiErrors(() => updateSettings(parsed.data));
}
