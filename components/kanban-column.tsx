"use client";

import { useState, useEffect } from "react";
import { Draggable, Droppable } from "@hello-pangea/dnd";
import { MoreHorizontal, Plus, Settings } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import type { ColumnType } from "@/app/(private)/dashboard/boards/[id]/board-detail";
import { KanbanCard, ExtendedCardType } from "./kanban-card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NotificationTemplateEditor } from "./notification-template-editor";
import { CreateCardModal } from "./create-card-modal";

// Define Zod schema for column validation
const columnSchema = z.object({
  title: z.string().min(1, { message: "O título é obrigatório" }).max(50, {
    message: "O título não pode ter mais de 50 caracteres",
  }),
});

type ColumnFormValues = z.infer<typeof columnSchema>;

// Define o tipo para os dados do cartão a ser criado
type CreateCardData = {
  content: string;
  description?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  contactId: string;
  columnId: string;
};

interface KanbanColumnProps {
  column: ColumnType;
  index: number;
  addCard: (
    columnId: string,
    content: string,
    description?: string,
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
    contactId?: string
  ) => void;
  updateCard: (
    columnId: string,
    cardId: string,
    data: Partial<ExtendedCardType>
  ) => void;
  deleteCard: (columnId: string, cardId: string) => void;
  updateColumnTitle: (columnId: string, title: string) => void;
  deleteColumn: (columnId: string) => void;
  boardTitle: string;
}

export function KanbanColumn({
  column,
  index,
  addCard,
  updateCard,
  deleteCard,
  updateColumnTitle,
  deleteColumn,
  boardTitle,
}: KanbanColumnProps) {
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isEditColumnOpen, setIsEditColumnOpen] = useState(false);

  // Form for editing column title
  const {
    register: registerColumn,
    handleSubmit: handleSubmitColumn,
    formState: { errors: columnErrors },
    setValue: setColumnValue,
  } = useForm<ColumnFormValues>({
    resolver: zodResolver(columnSchema),
    defaultValues: {
      title: column.title,
    },
  });

  // Update column form values when the column title changes
  useEffect(() => {
    setColumnValue("title", column.title);
  }, [column.title, setColumnValue]);

  const handleAddCardSubmit = async (data: CreateCardData) => {
    try {
      await addCard(
        column.id,
        data.content,
        data.description,
        data.priority,
        data.contactId
      );
      setIsAddCardOpen(false);
    } catch (error) {
      console.error("Error adding card:", error);
    }
  };

  const handleUpdateColumnSubmit = (data: ColumnFormValues) => {
    updateColumnTitle(column.id, data.title);
    setIsEditColumnOpen(false);
  };

  return (
    <Draggable draggableId={column.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className="flex flex-col bg-muted rounded-lg w-80 min-w-80 h-full"
        >
          <div
            {...provided.dragHandleProps}
            className="p-3 font-medium flex items-center justify-between bg-muted rounded-t-lg border-b"
          >
            <h3 className="text-sm font-medium">{column.title}</h3>
            <div className="flex items-center gap-1">
              <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-sm">
                {column.cards.length}
              </span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditColumnOpen(true)}>
                    Editar Coluna
                  </DropdownMenuItem>
                  <NotificationTemplateEditor
                    columnId={column.id}
                    columnTitle={column.title}
                    boardTitle={boardTitle}
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <div className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Configurar Notificações
                        </div>
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => deleteColumn(column.id)}
                  >
                    Excluir Coluna
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <Droppable droppableId={column.id} type="card">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 p-2 overflow-y-auto ${
                  snapshot.isDraggingOver ? "bg-accent/50" : ""
                }`}
              >
                {column.cards.map((card, index) => (
                  <KanbanCard
                    key={card.id}
                    card={card as ExtendedCardType}
                    index={index}
                    columnId={column.id}
                    updateCard={updateCard}
                    deleteCard={deleteCard}
                  />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="p-2 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() => setIsAddCardOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Cartão
            </Button>
          </div>

          {/* Use our new CreateCardModal component */}
          <CreateCardModal
            isOpen={isAddCardOpen}
            onClose={() => setIsAddCardOpen(false)}
            onCreateCard={handleAddCardSubmit}
            columnId={column.id}
          />

          {/* Edit Column Dialog */}
          <Dialog open={isEditColumnOpen} onOpenChange={setIsEditColumnOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Coluna</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={handleSubmitColumn(handleUpdateColumnSubmit)}
                className="grid gap-4 py-4"
              >
                <div className="grid gap-2">
                  <Label htmlFor="columnTitle">Título da Coluna</Label>
                  <Input id="columnTitle" {...registerColumn("title")} />
                  {columnErrors.title && (
                    <p className="text-destructive text-sm">
                      {columnErrors.title.message}
                    </p>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditColumnOpen(false)}
                    type="button"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar Alterações</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </Draggable>
  );
}
