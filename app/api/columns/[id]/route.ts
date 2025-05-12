import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH /api/columns/[id] - Update a column
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, order } = await request.json();

    const { id } = await params;
    // First check if column exists and belongs to user's board
    const column = await prisma.column.findUnique({
      where: { id: id },
      include: { board: true },
    });

    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    if (column.board.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const updatedColumn = await prisma.column.update({
      where: { id: id },
      data: {
        title,
        order,
      },
    });

    return NextResponse.json(updatedColumn);
  } catch (error) {
    console.error("Error updating column:", error);
    return NextResponse.json(
      { error: "Failed to update column" },
      { status: 500 }
    );
  }
}

// DELETE /api/columns/[id] - Delete a column
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // First check if column exists and belongs to user's board
    const column = await prisma.column.findUnique({
      where: { id: id },
      include: { board: true },
    });

    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    if (column.board.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the column (cascade will delete cards)
    await prisma.column.delete({
      where: { id: id },
    });

    // Update order of remaining columns
    await prisma.column.updateMany({
      where: {
        boardId: column.boardId,
        order: {
          gt: column.order,
        },
      },
      data: {
        order: {
          decrement: 1,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting column:", error);
    return NextResponse.json(
      { error: "Failed to delete column" },
      { status: 500 }
    );
  }
}
