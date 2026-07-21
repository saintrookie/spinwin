import { z } from "zod";

export const participantRowSchema = z.object({
  participant_no: z.string().trim().min(1, "Participant No is required").max(100),
  full_name: z.string().trim().min(1, "Full Name is required").max(200),
  plate_number: z.string().trim().max(50).optional().default(""),
});

export type ParticipantRow = z.infer<typeof participantRowSchema>;

export const importPayloadSchema = z.object({
  rows: z.array(participantRowSchema).min(1).max(2000),
  batchId: z.string().uuid().optional(),
});
