import "server-only";
import { NextRequest } from "next/server";
import { getRollPool } from "@/lib/supabase/queries";
import { withApiErrors } from "@/lib/api-utils";
import { ROLL_POOL_SIZE } from "@/lib/constants";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sizeParam = request.nextUrl.searchParams.get("size");
  const size = sizeParam ? Number(sizeParam) : ROLL_POOL_SIZE;
  return withApiErrors(() => getRollPool(Number.isFinite(size) ? size : ROLL_POOL_SIZE));
}
