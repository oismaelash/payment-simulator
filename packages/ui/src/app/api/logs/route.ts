import { NextResponse } from "next/server";
import { state } from "@/state";

export async function GET() {
  const logs = state.getLogs();
  return NextResponse.json({ logs });
}

export async function POST() {
  state.clearLogs();
  return NextResponse.json({ success: true });
}

