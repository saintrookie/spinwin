import "server-only";
import { supabaseAdmin } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { selectCurrentPrize } from "@/lib/select-current-prize";
import type {
  DrawSettings,
  DrawStats,
  Prize,
  RollCandidate,
  Winner,
} from "@/types/domain";

type PrizeRow = Database["public"]["Tables"]["prizes"]["Row"];
type PrizeUpdate = Database["public"]["Tables"]["prizes"]["Update"];
type SettingsRow = Database["public"]["Tables"]["draw_settings"]["Row"];
type SettingsUpdate = Database["public"]["Tables"]["draw_settings"]["Update"];

function mapPrize(row: PrizeRow): Prize {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    quantity: row.quantity,
    awardedCount: row.awarded_count,
    displayOrder: row.display_order,
    imageUrl: row.image_url,
    isActive: row.is_active,
    createdAt: row.created_at,
  };
}

function mapSettings(row: SettingsRow): DrawSettings {
  return {
    currentPrizeId: row.current_prize_id,
    rollDurationMs: row.roll_duration_ms,
    rollSpeedMs: row.roll_speed_ms,
    soundEnabled: row.sound_enabled,
    confettiEnabled: row.confetti_enabled,
    theme: row.theme === "light" ? "light" : "dark",
  };
}

export async function listPrizes(): Promise<Prize[]> {
  const { data, error } = await supabaseAdmin()
    .from("prizes")
    .select("*")
    .order("display_order", { ascending: true });
  if (error) throw error;
  return data.map(mapPrize);
}

export async function createPrize(input: {
  name: string;
  description?: string | null;
  quantity: number;
  displayOrder: number;
  imageUrl?: string | null;
}): Promise<Prize> {
  const { data, error } = await supabaseAdmin()
    .from("prizes")
    .insert({
      name: input.name,
      description: input.description ?? null,
      quantity: input.quantity,
      display_order: input.displayOrder,
      image_url: input.imageUrl ?? null,
    })
    .select("*")
    .single();
  if (error) throw error;
  return mapPrize(data);
}

export async function updatePrize(
  id: string,
  input: Partial<{
    name: string;
    description: string | null;
    quantity: number;
    displayOrder: number;
    imageUrl: string | null;
    isActive: boolean;
  }>
): Promise<Prize> {
  const payload: PrizeUpdate = {};
  if (input.name !== undefined) payload.name = input.name;
  if (input.description !== undefined) payload.description = input.description;
  if (input.quantity !== undefined) payload.quantity = input.quantity;
  if (input.displayOrder !== undefined) payload.display_order = input.displayOrder;
  if (input.imageUrl !== undefined) payload.image_url = input.imageUrl;
  if (input.isActive !== undefined) payload.is_active = input.isActive;

  const { data, error } = await supabaseAdmin()
    .from("prizes")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return mapPrize(data);
}

export async function deletePrize(id: string): Promise<void> {
  const { error } = await supabaseAdmin().from("prizes").delete().eq("id", id);
  if (error) throw error;
}

export async function getSettings(): Promise<DrawSettings> {
  const { data, error } = await supabaseAdmin()
    .from("draw_settings")
    .select("*")
    .eq("id", 1)
    .single();
  if (error) throw error;
  return mapSettings(data);
}

export async function updateSettings(
  input: Partial<{
    currentPrizeId: string | null;
    rollDurationMs: number;
    rollSpeedMs: number;
    soundEnabled: boolean;
    confettiEnabled: boolean;
    theme: "light" | "dark";
  }>
): Promise<DrawSettings> {
  const payload: SettingsUpdate = { updated_at: new Date().toISOString() };
  if (input.currentPrizeId !== undefined) payload.current_prize_id = input.currentPrizeId;
  if (input.rollDurationMs !== undefined) payload.roll_duration_ms = input.rollDurationMs;
  if (input.rollSpeedMs !== undefined) payload.roll_speed_ms = input.rollSpeedMs;
  if (input.soundEnabled !== undefined) payload.sound_enabled = input.soundEnabled;
  if (input.confettiEnabled !== undefined) payload.confetti_enabled = input.confettiEnabled;
  if (input.theme !== undefined) payload.theme = input.theme;

  const { data, error } = await supabaseAdmin()
    .from("draw_settings")
    .update(payload)
    .eq("id", 1)
    .select("*")
    .single();
  if (error) throw error;
  return mapSettings(data);
}

export async function getStats(): Promise<DrawStats> {
  const admin = supabaseAdmin();
  const [{ count: total }, { count: remaining }, { count: winners }, prizes] =
    await Promise.all([
      admin.from("participants").select("*", { count: "exact", head: true }),
      admin
        .from("participants")
        .select("*", { count: "exact", head: true })
        .eq("has_won", false),
      admin.from("winners").select("*", { count: "exact", head: true }),
      listPrizes(),
    ]);

  return {
    total: total ?? 0,
    remaining: remaining ?? 0,
    winners: winners ?? 0,
    currentPrize: selectCurrentPrize(prizes),
  };
}

export async function listRecentWinners(limit: number): Promise<Winner[]> {
  const { data, error } = await supabaseAdmin()
    .from("winners")
    .select(
      "id, participant_id, prize_id, won_at, participants(participant_no, full_name, plate_number), prizes(name)"
    )
    .order("won_at", { ascending: false })
    .limit(limit);
  if (error) throw error;

  type Row = {
    id: string;
    participant_id: string;
    prize_id: string;
    won_at: string;
    participants: {
      participant_no: string;
      full_name: string;
      plate_number: string | null;
    } | null;
    prizes: { name: string } | null;
  };

  return (data as unknown as Row[]).map((row) => ({
    id: row.id,
    participantId: row.participant_id,
    prizeId: row.prize_id,
    wonAt: row.won_at,
    participant: {
      participantNo: row.participants?.participant_no ?? "",
      fullName: row.participants?.full_name ?? "",
      plateNumber: row.participants?.plate_number ?? null,
    },
    prize: { name: row.prizes?.name ?? "" },
  }));
}

export async function getRollPool(size: number): Promise<RollCandidate[]> {
  // Random sample of eligible participants for the cosmetic rolling animation.
  // Not the authoritative candidate pool for winner selection (that's the
  // draw_winners RPC, which considers every eligible row server-side).
  const { data, error } = await supabaseAdmin().rpc("sample_eligible_participants", {
    p_size: size,
  });
  if (error) throw error;
  return data.map((row) => ({
    id: row.id,
    fullName: row.full_name,
    plateNumber: row.plate_number,
  }));
}

export async function deleteAllParticipants(): Promise<void> {
  const admin = supabaseAdmin();
  const { error: winnersError } = await admin.from("winners").delete().neq(
    "id",
    "00000000-0000-0000-0000-000000000000"
  );
  if (winnersError) throw winnersError;
  const { error: participantsError } = await admin
    .from("participants")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");
  if (participantsError) throw participantsError;
  await updateSettings({ currentPrizeId: null });
}
