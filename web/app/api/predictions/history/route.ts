import { NextResponse } from "next/server";

import { getPredictionHistory } from "@/lib/queries/dashboard";

export async function GET() {
  const games = await getPredictionHistory();
  return NextResponse.json(games);
}
