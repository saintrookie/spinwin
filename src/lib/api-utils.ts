import "server-only";
import { NextResponse } from "next/server";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function withApiErrors<T>(fn: () => Promise<T>) {
  try {
    const data = await fn();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected server error";
    return apiError(message, 500);
  }
}
