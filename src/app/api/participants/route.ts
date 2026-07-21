import "server-only";
import { deleteAllParticipants } from "@/lib/supabase/queries";
import { withApiErrors } from "@/lib/api-utils";

export const runtime = "nodejs";

export async function DELETE() {
  return withApiErrors(async () => {
    await deleteAllParticipants();
    return { ok: true };
  });
}
