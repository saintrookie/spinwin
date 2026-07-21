import "server-only";
import { advancePrize } from "@/lib/supabase/queries";
import { withApiErrors } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function POST() {
  return withApiErrors(() => advancePrize());
}
