import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BoardDetail, BoardType } from "./board-detail";

// Next.js App Router dynamic route parameter interface
interface BoardPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Use the correct pattern for dynamic route params in Next.js App Router
export async function generateMetadata({ params }: BoardPageProps) {
  const { id } = await params;
  return {
    title: `Board ${id}`,
  };
}

// Helper function to format dates and ensure type compatibility
function formatBoardData(board: {
  id: string;
  title: string;
  description?: string | null;
  userId: string;
  columns: Array<{
    id: string;
    title: string;
    order: number;
    boardId: string;
    cards: Array<{
      id: string;
      content: string;
      description?: string | null;
      order: number;
      columnId: string;
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      startDate?: Date | null;
      dueDate?: Date | null;
      completedDate?: Date | null;
      sendNotifications?: boolean;
      contactId?: string | null;
      whatsappNumber?: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
    createdAt: Date;
    updatedAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}): BoardType {
  return {
    ...board,
    columns: board.columns.map((column) => ({
      ...column,
      cards: column.cards.map((card) => ({
        ...card,
        startDate: card.startDate ? card.startDate.toISOString() : null,
        dueDate: card.dueDate ? card.dueDate.toISOString() : null,
        completedDate: card.completedDate
          ? card.completedDate.toISOString()
          : null,
      })),
    })),
  };
}

export default async function BoardPage(props: BoardPageProps) {
  const { id } = await props.params;

  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const boardData = await prisma.board.findUnique({
    where: {
      id,
      userId: session.user.id,
    },
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
  });

  if (!boardData) {
    redirect("/dashboard");
  }

  // Format the board data to match expected types
  const board = formatBoardData(boardData);

  return (
    <div className="container mx-auto p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Link
            href="/dashboard"
            className="mr-4 flex items-center text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Link>
          <div>
            <h1 className="text-xl font-bold">{board.title}</h1>
            {board.description && (
              <p className="text-muted-foreground text-sm">
                {board.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <BoardDetail initialBoard={board} />
      </div>
    </div>
  );
}
