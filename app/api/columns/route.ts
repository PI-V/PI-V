import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/columns - Create a new column
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, boardId, order } = await request.json();

    if (!title || !boardId) {
      return NextResponse.json(
        { error: "Title and boardId are required" },
        { status: 400 }
      );
    }

    // Check if board exists and belongs to user
    const board = await prisma.board.findUnique({
      where: {
        id: boardId,
        userId: session.user.id,
      },
    });

    if (!board) {
      return NextResponse.json({ error: "Board not found" }, { status: 404 });
    }

    // Get max order value if not provided
    let columnOrder = order;
    if (columnOrder === undefined) {
      const lastColumn = await prisma.column.findFirst({
        where: { boardId },
        orderBy: { order: "desc" },
      });
      columnOrder = lastColumn ? lastColumn.order + 1 : 0;
    }

    const column = await prisma.column.create({
      data: {
        title,
        order: columnOrder,
        boardId,
      },
    });

    return NextResponse.json(column);
  } catch (error) {
    console.error("Error creating column:", error);
    return NextResponse.json(
      { error: "Failed to create column" },
      { status: 500 }
    );
  }
}
