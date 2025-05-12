"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { KanbanColumn } from "@/components/kanban-column";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

import {
  useCreateCard,
  useUpdateCard,
  useDeleteCard,
  useCreateColumn,
  useUpdateColumn,
  useDeleteColumn,
} from "@/hooks/use-columns-cards";

// Atualizar a definição do CardType para incluir campos de notificação e contato
export type CardType = {
  id: string;
  content: string;
  description?: string | null;
  order: number;
  columnId: string;
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  startDate?: string | null;
  dueDate?: string | null;
  completedDate?: string | null;
  sendNotifications?: boolean;
  contactId?: string | null;
  whatsappNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ColumnType = {
  id: string;
  title: string;
  order: number;
  boardId: string;
  cards: CardType[];
  createdAt: Date;
  updatedAt: Date;
};

export type BoardType = {
  id: string;
  title: string;
  description?: string | null;
  userId: string;
  columns: ColumnType[];
  createdAt: Date;
  updatedAt: Date;
};

interface BoardDetailProps {
  initialBoard: BoardType;
}

export function BoardDetail({ initialBoard }: BoardDetailProps) {
  const [board, setBoard] = useState<BoardType>(initialBoard);
  const [columns, setColumns] = useState<ColumnType[]>(initialBoard.columns);
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // TanStack Query hooks
  const createColumnMutation = useCreateColumn();
  const updateColumnMutation = useUpdateColumn();
  const deleteColumnMutation = useDeleteColumn();
  const createCardMutation = useCreateCard();
  const updateCardMutation = useUpdateCard();
  const deleteCardMutation = useDeleteCard();

  // Sync columns whenever board changes
  useEffect(() => {
    setColumns(board.columns);
  }, [board]);

  // Handle drag end event
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, type } = result;

    // If there's no destination, do nothing
    if (!destination) return;

    // If the item was dropped in the same position, do nothing
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // If we're dragging columns
    if (type === "column") {
      const newColumns = Array.from(columns);
      const movedColumn = newColumns.splice(source.index, 1)[0];
      newColumns.splice(destination.index, 0, movedColumn);

      // Update local state immediately for better UX
      setColumns(newColumns);

      // Update orders based on their new positions
      const updatedColumns = newColumns.map((col, index) => ({
        ...col,
        order: index,
      }));

      // Update the board with the new column order
      setBoard({ ...board, columns: updatedColumns });

      // Update orders in the database using TanStack Query
      try {
        // Update each column with its new order
        await Promise.all(
          updatedColumns.map((col) =>
            updateColumnMutation.mutateAsync({
              id: col.id,
              order: col.order,
            })
          )
        );
      } catch (error) {
        console.error("Error updating column order:", error);
        toast.error("Erro ao atualizar a ordem das colunas");
      }

      return;
    }

    // If we're dragging cards
    // Find the source and destination columns
    const sourceColumn = columns.find((col) => col.id === source.droppableId);
    const destColumn = columns.find(
      (col) => col.id === destination.droppableId
    );

    if (!sourceColumn || !destColumn) return;

    // If moving within the same column
    if (sourceColumn.id === destColumn.id) {
      const newCards = Array.from(sourceColumn.cards);
      const movedCard = newCards.splice(source.index, 1)[0];
      newCards.splice(destination.index, 0, movedCard);

      // Update card orders
      const updatedCards = newCards.map((card, index) => ({
        ...card,
        order: index,
      }));

      const newColumn = {
        ...sourceColumn,
        cards: updatedCards,
      };

      // Update local state immediately for better UX
      setColumns(
        columns.map((col) => (col.id === newColumn.id ? newColumn : col))
      );

      // Update the database using TanStack Query
      try {
        // Update each card with its new order
        await Promise.all(
          updatedCards.map((card) =>
            updateCardMutation.mutateAsync({
              id: card.id,
              order: card.order,
            })
          )
        );
      } catch (error) {
        console.error("Error updating card order:", error);
        toast.error("Erro ao atualizar a ordem dos cartões");
      }
    } else {
      // Moving from one column to another
      const sourceCards = Array.from(sourceColumn.cards);
      const destCards = Array.from(destColumn.cards);
      const movedCard = sourceCards.splice(source.index, 1)[0];
      destCards.splice(destination.index, 0, movedCard);

      // Update card orders and column ID for the moved card
      const updatedSourceCards = sourceCards.map((card, index) => ({
        ...card,
        order: index,
      }));

      const updatedDestCards = destCards.map((card, index) => ({
        ...card,
        order: index,
        columnId: destColumn.id,
      }));

      const newSourceColumn = {
        ...sourceColumn,
        cards: updatedSourceCards,
      };

      const newDestColumn = {
        ...destColumn,
        cards: updatedDestCards,
      };

      // Update local state
      setColumns(
        columns.map((col) => {
          if (col.id === newSourceColumn.id) return newSourceColumn;
          if (col.id === newDestColumn.id) return newDestColumn;
          return col;
        })
      );

      // Update database using TanStack Query
      try {
        // First update the moved card with its new column ID and order
        await updateCardMutation.mutateAsync({
          id: movedCard.id,
          columnId: destColumn.id,
          order: updatedDestCards.find((c) => c.id === movedCard.id)?.order,
        });

        // Then update orders for all other affected cards
        await Promise.all([
          ...updatedSourceCards.map((card) =>
            updateCardMutation.mutateAsync({
              id: card.id,
              order: card.order,
            })
          ),
          ...updatedDestCards
            .filter((card) => card.id !== movedCard.id)
            .map((card) =>
              updateCardMutation.mutateAsync({
                id: card.id,
                order: card.order,
              })
            ),
        ]);

        // Process notification if card has notifications enabled and it's moved to a new column
        if (movedCard.sendNotifications) {
          // Trigger notification processing through API
          fetch("/api/whatsapp/notify", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              cardId: movedCard.id,
              columnId: destColumn.id,
            }),
          })
            .then((response) => {
              if (response.ok) {
                console.log("Notification request sent successfully");
              }
            })
            .catch((error) => {
              console.error("Error sending notification request:", error);
            });
        }
      } catch (error) {
        console.error("Error moving card between columns:", error);
        toast.error("Erro ao mover o cartão entre colunas");
      }
    }
  };

  // Add a new card to a column using TanStack Query
  const addCard = async (
    columnId: string,
    content: string,
    description?: string,
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT" = "MEDIUM",
    contactId?: string
  ) => {
    try {
      const newCard = await createCardMutation.mutateAsync({
        content,
        description,
        columnId,
        priority,
        contactId, // Include the contactId in the mutation
      });

      // Update local state
      setColumns(
        columns.map((col) => {
          if (col.id === columnId) {
            return {
              ...col,
              cards: [...col.cards, newCard],
            };
          }
          return col;
        })
      );

      toast.success("Cartão criado com sucesso");
    } catch (error) {
      console.error("Error creating card:", error);
      toast.error("Erro ao criar cartão");
    }
  };

  // Update a card using TanStack Query
  const updateCard = async (
    columnId: string,
    cardId: string,
    data: Partial<CardType>
  ) => {
    try {
      await updateCardMutation.mutateAsync({
        id: cardId,
        ...data,
      });

      // Update local state
      setColumns(
        columns.map((col) => {
          if (col.id === columnId) {
            return {
              ...col,
              cards: col.cards.map((card) => {
                if (card.id === cardId) {
                  return { ...card, ...data };
                }
                return card;
              }),
            };
          }
          return col;
        })
      );

      toast.success("Cartão atualizado com sucesso");
    } catch (error) {
      console.error("Error updating card:", error);
      toast.error("Erro ao atualizar cartão");
    }
  };

  // Delete a card using TanStack Query
  const deleteCard = async (columnId: string, cardId: string) => {
    try {
      await deleteCardMutation.mutateAsync({ id: cardId, columnId });

      // Update local state
      setColumns(
        columns.map((col) => {
          if (col.id === columnId) {
            return {
              ...col,
              cards: col.cards.filter((card) => card.id !== cardId),
            };
          }
          return col;
        })
      );

      toast.success("Cartão excluído com sucesso");
    } catch (error) {
      console.error("Error deleting card:", error);
      toast.error("Erro ao excluir cartão");
    }
  };

  // Update a column title using TanStack Query
  const updateColumnTitle = async (columnId: string, title: string) => {
    try {
      await updateColumnMutation.mutateAsync({
        id: columnId,
        title,
      });

      // Update local state
      setColumns(
        columns.map((col) => {
          if (col.id === columnId) {
            return { ...col, title };
          }
          return col;
        })
      );

      toast.success("Coluna atualizada com sucesso");
    } catch (error) {
      console.error("Error updating column:", error);
      toast.error("Erro ao atualizar coluna");
    }
  };

  // Delete a column using TanStack Query
  const deleteColumn = async (columnId: string) => {
    try {
      const currentColumn = columns.find((col) => col.id === columnId);

      if (!currentColumn) {
        throw new Error("Column not found");
      }

      await deleteColumnMutation.mutateAsync({
        id: columnId,
        boardId: currentColumn.boardId,
      });

      // Update local state
      setColumns(columns.filter((col) => col.id !== columnId));

      toast.success("Coluna excluída com sucesso");
    } catch (error) {
      console.error("Error deleting column:", error);
      toast.error("Erro ao excluir coluna");
    }
  };

  // Add a new column using TanStack Query
  const handleAddColumn = async () => {
    if (!newColumnTitle.trim()) return;
    setIsLoading(true);

    try {
      const newColumn = await createColumnMutation.mutateAsync({
        title: newColumnTitle,
        boardId: board.id,
      });

      // Update local state
      setBoard({
        ...board,
        columns: [...board.columns, newColumn],
      });

      setNewColumnTitle("");
      setIsAddColumnOpen(false);
      toast.success("Coluna criada com sucesso");
    } catch (error) {
      console.error("Error creating column:", error);
      toast.error("Erro ao criar coluna");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button onClick={() => setIsAddColumnOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Coluna
        </Button>
      </div>

      <div className="flex-1 overflow-x-auto">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable
            droppableId="all-columns"
            direction="horizontal"
            type="column"
          >
            {(provided) => (
              <div
                className="flex gap-4 h-full"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {columns.map((column, index) => (
                  <KanbanColumn
                    key={column.id}
                    column={column}
                    index={index}
                    addCard={addCard}
                    updateCard={updateCard}
                    deleteCard={deleteCard}
                    updateColumnTitle={updateColumnTitle}
                    deleteColumn={deleteColumn}
                    boardTitle={board.title}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      <Dialog open={isAddColumnOpen} onOpenChange={setIsAddColumnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Nova Coluna</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Título da Coluna</Label>
              <Input
                id="title"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="Ex: A fazer, Em progresso, Concluído"
                disabled={isLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAddColumnOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddColumn}
              disabled={isLoading || !newColumnTitle.trim()}
            >
              {isLoading ? "Adicionando..." : "Adicionar Coluna"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
