import * as XLSX from "xlsx";
import {
  participantRowSchema,
  type ParticipantRow,
} from "@/lib/validation/participant-schema";
import type { ImportRowError } from "@/types/domain";

type RawRow = {
  participant_no?: string;
  full_name?: string;
  plate_number?: string;
};

const HEADER_ALIASES: Record<string, keyof RawRow> = {
  "participant no": "participant_no",
  "participant no.": "participant_no",
  "participant number": "participant_no",
  "participant id": "participant_no",
  no: "participant_no",
  id: "participant_no",
  "full name": "full_name",
  name: "full_name",
  "plate number": "plate_number",
  "plate no": "plate_number",
  "plate no.": "plate_number",
  "license plate": "plate_number",
  plate: "plate_number",
  "no plat": "plate_number",
  "nomor plat": "plate_number",
  "plat nomor": "plate_number",
  "nomor polisi": "plate_number",
};

export type ParseResult = {
  rows: ParticipantRow[];
  errors: ImportRowError[];
};

export async function parseParticipantsFile(file: File): Promise<ParseResult> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) {
    return { rows: [], errors: [{ row: 0, message: "Workbook has no sheets" }] };
  }
  const sheet = workbook.Sheets[sheetName];
  const raw: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  const errors: ImportRowError[] = [];
  const rows: ParticipantRow[] = [];
  const seen = new Set<string>();

  raw.forEach((record, index) => {
    const rowNumber = index + 2; // +1 for header row, +1 for 1-indexing
    const mapped: RawRow = {};
    for (const [key, value] of Object.entries(record)) {
      const field = HEADER_ALIASES[key.trim().toLowerCase()];
      if (field) mapped[field] = String(value ?? "").trim();
    }

    const isBlank = !mapped.participant_no && !mapped.full_name && !mapped.plate_number;
    if (isBlank) return;

    const parsed = participantRowSchema.safeParse(mapped);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        errors.push({
          row: rowNumber,
          field: typeof issue.path[0] === "string" ? issue.path[0] : undefined,
          message: issue.message,
        });
      }
      return;
    }

    if (seen.has(parsed.data.participant_no)) {
      errors.push({
        row: rowNumber,
        field: "participant_no",
        message: `Duplicate Participant No "${parsed.data.participant_no}" already appears earlier in this file`,
      });
      return;
    }
    seen.add(parsed.data.participant_no);
    rows.push(parsed.data);
  });

  return { rows, errors };
}
