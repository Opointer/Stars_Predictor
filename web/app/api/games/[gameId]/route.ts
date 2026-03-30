import { NextResponse } from "next/server";

import { getGameDetail } from "@/lib/queries/dashboard";

export async function GET(_: Request, { params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const game = await getGameDetail(Number(gameId));

  if (!game) {
    return NextResponse.json({ message: "Game not found" }, { status: 404 });
  }

  return NextResponse.json(game);
}
