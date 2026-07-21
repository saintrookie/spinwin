import * as XLSX from "xlsx";
import { PARTICIPANT_TEMPLATE_HEADERS } from "@/lib/constants";

export function downloadParticipantTemplate() {
  const sample = [
    ["00001", "Jane Doe", "B 1234 CD"],
    ["00002", "John Smith", "B 5678 EF"],
  ];
  const sheet = XLSX.utils.aoa_to_sheet([[...PARTICIPANT_TEMPLATE_HEADERS], ...sample]);
  sheet["!cols"] = [{ wch: 16 }, { wch: 24 }, { wch: 18 }];
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, "Participants");
  XLSX.writeFile(workbook, "spinwin-participant-template.xlsx");
}
