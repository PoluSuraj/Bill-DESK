import { NextResponse } from "next/server";

export function jsonSuccess(data: unknown, message = "OK") {
  return NextResponse.json({ success: true, message, data });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, message }, { status });
}
