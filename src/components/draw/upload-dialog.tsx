"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileSpreadsheet, Upload, Download, AlertTriangle } from "lucide-react";
import { parseParticipantsFile, type ParseResult } from "@/lib/excel/parse-participants";
import { downloadParticipantTemplate } from "@/lib/excel/template";
import { api } from "@/lib/api-client";
import { IMPORT_CHUNK_SIZE, IMPORT_MAX_CONCURRENCY } from "@/lib/constants";
import type { ParticipantRow } from "@/lib/validation/participant-schema";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImported: () => void;
};

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) chunks.push(items.slice(i, i + size));
  return chunks;
}

async function runWithConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
  onEach: () => void
) {
  const results: T[] = [];
  let cursor = 0;
  async function worker() {
    while (cursor < tasks.length) {
      const index = cursor++;
      results[index] = await tasks[index]();
      onEach();
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, worker));
  return results;
}

export function UploadDialog({ open, onOpenChange, onImported }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  function reset() {
    setParseResult(null);
    setFileName(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseResult(null);
    try {
      const result = await parseParticipantsFile(file);
      setParseResult(result);
      if (result.rows.length === 0) {
        toast.error("No valid rows found in this file");
      }
    } catch {
      toast.error("Could not read this file. Make sure it's a valid .xlsx or .csv file");
    }
  }

  async function handleImport() {
    if (!parseResult || parseResult.rows.length === 0) return;
    setUploading(true);
    setProgress(0);
    try {
      if (replaceExisting) {
        await api.wipeParticipants();
      }
      const batchId = crypto.randomUUID();
      const chunks = chunk<ParticipantRow>(parseResult.rows, IMPORT_CHUNK_SIZE);
      let completed = 0;
      const tasks = chunks.map((rows) => () => api.importChunk(rows, batchId));
      await runWithConcurrency(tasks, IMPORT_MAX_CONCURRENCY, () => {
        completed += 1;
        setProgress(Math.round((completed / chunks.length) * 100));
      });
      toast.success(`Imported ${parseResult.rows.length} participants`);
      onImported();
      onOpenChange(false);
      reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
    } finally {
      setUploading(false);
    }
  }

  const errors = parseResult?.errors ?? [];
  const validCount = parseResult?.rows.length ?? 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!uploading) {
          onOpenChange(next);
          if (!next) reset();
        }
      }}
    >
      <DialogContent className="sm:max-w-2xl p-4 sm:p-6 max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload participants</DialogTitle>
          <DialogDescription>
            Excel file with columns: Participant No, Full Name, Plate Number.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex flex-col gap-4 overflow-y-auto py-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="justify-center"
            >
              <FileSpreadsheet className="mr-2 size-4" /> Choose file
            </Button>
            <Button
              variant="ghost"
              onClick={downloadParticipantTemplate}
              type="button"
              className="justify-center"
            >
              <Download className="mr-2 size-4" /> Download template
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={handleFileChange}
            />
            {fileName && (
              <span className="text-muted-foreground text-sm truncate px-1">
                {fileName}
              </span>
            )}
          </div>

          {parseResult && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                <span className="text-emerald-500 font-medium">{validCount} valid rows</span>
                {errors.length > 0 && (
                  <span className="text-amber-500 font-medium flex items-center gap-1">
                    <AlertTriangle className="size-3.5" /> {errors.length} rows skipped
                  </span>
                )}
              </div>

              {errors.length > 0 && (
                <div className="max-h-48 overflow-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">Row</TableHead>
                        <TableHead className="w-24 sm:w-32">Field</TableHead>
                        <TableHead>Issue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {errors.slice(0, 200).map((e, i) => (
                        <TableRow key={i}>
                          <TableCell>{e.row}</TableCell>
                          <TableCell className="text-muted-foreground">{e.field ?? "-"}</TableCell>
                          <TableCell className="break-words">{e.message}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {errors.length > 200 && (
                    <p className="text-muted-foreground text-xs p-2">
                      + {errors.length - 200} more issues not shown
                    </p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2">
                <Switch
                  id="replace-existing"
                  checked={replaceExisting}
                  onCheckedChange={setReplaceExisting}
                  disabled={uploading}
                />
                <Label htmlFor="replace-existing" className="text-sm font-normal">
                  Replace existing data
                </Label>
              </div>

              {uploading && <Progress value={progress} />}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4 sm:mt-0">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={uploading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={!validCount || uploading}
            className="w-full sm:w-auto"
          >
            <Upload className="mr-2 size-4" />{" "}
            {uploading ? `Importing... ${progress}%` : `Import ${validCount || ""} participants`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}