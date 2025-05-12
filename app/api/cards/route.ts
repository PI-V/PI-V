import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// POST /api/cards - Create a new card
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const {
      content,
      description,
      columnId,
      order,
      priority,
      startDate,
      dueDate,
      completedDate,
      contactId,
      sendNotifications,
    } = await request.json();

    if (!content || !columnId) {
      return NextResponse.json(
        { error: "Content and columnId are required" },
        { status: 400 }
      );
    }

    // Check if column exists and belongs to user's board
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: { board: true },
    });

    if (!column) {
      return NextResponse.json({ error: "Column not found" }, { status: 404 });
    }

    if (column.board.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get max order value if not provided
    let cardOrder = order;
    if (cardOrder === undefined) {
      const lastCard = await prisma.card.findFirst({
        where: { columnId },
        orderBy: { order: "desc" },
      });
      cardOrder = lastCard ? lastCard.order + 1 : 0;
    }

    // Create the card
    const card = await prisma.card.create({
      data: {
        content,
        description,
        order: cardOrder,
        columnId,
        priority: priority || "MEDIUM",
        startDate,
        dueDate,
        completedDate,
        // Handle empty string contactId properly
        contactId: contactId === "" ? null : contactId,
        sendNotifications: sendNotifications || true,
      },
    });

    // Create an activity log entry for card creation
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        type: "CARD_CREATED",
        description: `Card "${content}" foi criado`,
        cardId: card.id,
        columnId: columnId,
        boardId: column.boardId,
        metadata: {
          cardTitle: content,
          columnTitle: column.title,
          boardTitle: column.board.title,
        },
      },
    });

    return NextResponse.json(card);
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json(
      { error: "Failed to create card" },
      { status: 500 }
    );
  }
}
