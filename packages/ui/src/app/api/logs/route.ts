import { NextResponse } from "next/server";
import { webhookLogs } from "@/db/sqlite";

export async function GET() {
  const logs = webhookLogs.getAll();
  return NextResponse.json({ logs });
}

export async function POST() {
  webhookLogs.clear();
  return NextResponse.json({ success: true });
}

