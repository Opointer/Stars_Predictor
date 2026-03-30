import { NextResponse } from "next/server";

import { getPerformanceSummary } from "@/lib/queries/dashboard";

export async function GET() {
  const performance = await getPerformanceSummary();
  return NextResponse.json(performance);
}
