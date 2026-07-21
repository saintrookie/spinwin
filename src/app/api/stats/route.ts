import "server-only";
import { getStats } from "@/lib/supabase/queries";
import { withApiErrors } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function GET() {
  return withApiErrors(() => getStats());
}
