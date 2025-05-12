import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH /api/cards/[id] - Update a card
export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    const { id } = await params;
    // First check if card exists and belongs to user's board
    const card = await prisma.card.findUnique({
      where: { id: id },
      include: { column: { include: { board: true } } },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (card.column.board.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Track if card is being moved to a different column
    let isCardMoved = false;
    const oldColumn = card.column;
    let newColumn;

    // If moving to a different column, check if that column exists and belongs to the user
    if (columnId && columnId !== card.columnId) {
      isCardMoved = true;
      newColumn = await prisma.column.findUnique({
        where: { id: columnId },
        include: { board: true },
      });

      if (!newColumn) {
        return NextResponse.json(
          { error: "Column not found" },
          { status: 404 }
        );
      }

      if (newColumn.board.userId !== session.user.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const updatedCard = await prisma.card.update({
      where: { id: id },
      data: {
        content,
        description,
        columnId,
        order,
        priority,
        startDate,
        dueDate,
        completedDate,
        // Handle empty string contactId properly
        contactId: contactId === "" ? null : contactId,
        sendNotifications,
      },
    });

    // If the card was moved to a different column, log the activity
    if (isCardMoved && newColumn) {
      // Create an activity log entry for card movement
      await prisma.activityLog.create({
        data: {
          userId: session.user.id,
          type: "CARD_MOVED",
          description: `Card "${card.content}" foi movido de "${oldColumn.title}" para "${newColumn.title}"`,
          cardId: card.id,
          columnId: newColumn.id,
          boardId: newColumn.boardId,
          metadata: {
            cardTitle: card.content,
            fromColumn: oldColumn.title,
            toColumn: newColumn.title,
            boardTitle: newColumn.board.title,
          },
        },
      });

      // Also create a card activity record for notifications
      await prisma.cardActivity.create({
        data: {
          cardId: card.id,
          fromColumnId: oldColumn.id,
          toColumnId: newColumn.id,
        },
      });

      // await processCardNotification(card.id, newColumn.id);
    }

    return NextResponse.json(updatedCard);
  } catch (error) {
    console.error("Error updating card:", error);
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}

// DELETE /api/cards/[id] - Delete a card
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    // First check if card exists and belongs to user's board
    const card = await prisma.card.findUnique({
      where: { id: id },
      include: { column: { include: { board: true } } },
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    if (card.column.board.userId !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Delete the card
    await prisma.card.delete({
      where: { id: id },
    });

    // Update order of remaining cards
    await prisma.card.updateMany({
      where: {
        columnId: card.columnId,
        order: {
          gt: card.order,
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
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "Failed to delete card" },
      { status: 500 }
    );
  }
}
