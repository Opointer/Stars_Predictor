import { NextResponse } from "next/server";

import { getUpcomingGames } from "@/lib/queries/dashboard";

export async function GET() {
  const games = await getUpcomingGames();
  return NextResponse.json(games);
}
