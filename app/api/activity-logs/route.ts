import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    // Get URL parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Get user activities
    const activities = await prisma.activityLog.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });

    return NextResponse.json(activities);
  } catch (error) {
    console.error("[ACTIVITY_LOGS_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
