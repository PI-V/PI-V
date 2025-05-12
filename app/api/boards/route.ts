import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/boards - Get all boards for the current user
export async function GET() {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const boards = await prisma.board.findMany({
      where: { userId: session.user.id },
      include: {
        columns: {
          orderBy: { order: "asc" },
          include: {
            cards: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Failed to fetch boards" },
      { status: 500 }
    );
  }
}

// POST /api/boards - Create a new board
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    // Make sure userId is a non-nullable string before creating the board
    const userId = session.user.id;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const board = await prisma.board.create({
      data: {
        title,
        description,
        userId, // Now userId is guaranteed to be a string
        columns: {
          create: [
            { title: "A fazer", order: 0 },
            { title: "Em progresso", order: 1 },
            { title: "Concluído", order: 2 },
          ],
        },
      },
      include: {
        columns: {
          orderBy: { order: "asc" },
          include: {
            cards: true,
          },
        },
      },
    });

    return NextResponse.json(board);
  } catch (error) {
    console.error("Error creating board:", error);
    return NextResponse.json(
      { error: "Failed to create board" },
      { status: 500 }
    );
  }
}
