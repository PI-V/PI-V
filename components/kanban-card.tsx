"use client";

import { useState, useEffect } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { MoreHorizontal, CalendarIcon, Bell } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import type { CardType } from "@/app/(private)/dashboard/boards/[id]/board-detail";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ContactManager } from "./contact-manager";
import { Contact, useContacts } from "@/hooks/use-contacts";

// Define Zod schema for card validation
const cardSchema = z.object({
  content: z.string().min(1, { message: "O título é obrigatório" }).max(100, {
    message: "O título não pode ter mais de 100 caracteres",
  }),
  description: z
    .string()
    .max(500, {
      message: "A descrição não pode ter mais de 500 caracteres",
    })
    .optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  contactId: z.string().optional().nullable(),
  sendNotifications: z.boolean().optional(),
});

type CardFormValues = z.infer<typeof cardSchema>;

export interface ExtendedCardType extends CardType {
  priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  startDate?: string | null;
  dueDate?: string | null;
  completedDate?: string | null;
  sendNotifications?: boolean;
  contactId?: string | null;
  contact?: Contact | null;
}

interface KanbanCardProps {
  card: ExtendedCardType;
  index: number;
  columnId: string;
  updateCard: (
    columnId: string,
    cardId: string,
    data: Partial<ExtendedCardType>
  ) => void;
  deleteCard: (columnId: string, cardId: string) => void;
}

export function KanbanCard({
  card,
  index,
  columnId,
  updateCard,
  deleteCard,
}: KanbanCardProps) {
  const [isEditCardOpen, setIsEditCardOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const { contacts } = useContacts();

  // Initialize React Hook Form for editing a card
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      content: card.content,
      description: card.description || "",
      priority: (card.priority || "MEDIUM") as
        | "LOW"
        | "MEDIUM"
        | "HIGH"
        | "URGENT",
      contactId: card.contactId || null,
      sendNotifications: card.sendNotifications || false,
    },
  });

  // Update form values when the card changes
  useEffect(() => {
    setValue("content", card.content);
    setValue("description", card.description || "");
    setValue(
      "priority",
      (card.priority || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH" | "URGENT"
    );
    setValue("contactId", card.contactId || null);
    setValue("sendNotifications", card.sendNotifications || false);

    // Set the selected contact if it exists
    if (card.contactId && card.contact) {
      setSelectedContact(card.contact);
    } else {
      setSelectedContact(null);
    }
  }, [card, setValue]);

  // Find and set the contact when the edit modal is opened
  useEffect(() => {
    if (isEditCardOpen && card.contactId && !selectedContact) {
      // Find the contact in the contacts list
      const foundContact = contacts.find(
        (contact) => contact.id === card.contactId
      );
      if (foundContact) {
        setSelectedContact(foundContact);
      }
    }
  }, [isEditCardOpen, card.contactId, contacts, selectedContact]);

  // Get form values
  const priority = watch("priority");

  // Handle contact selection
  const handleContactSelect = (contact: Contact | null) => {
    setSelectedContact(contact);
    setValue("contactId", contact?.id || null);
  };

  const handleUpdateCardSubmit = (data: CardFormValues) => {
    updateCard(columnId, card.id, {
      content: data.content,
      description: data.description,
      priority: data.priority,
      contactId: data.contactId,
      sendNotifications: data.sendNotifications,
    });

    setIsEditCardOpen(false);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "bg-blue-100 text-blue-800";
      case "MEDIUM":
        return "bg-gray-100 text-gray-800";
      case "HIGH":
        return "bg-orange-100 text-orange-800";
      case "URGENT":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format priority for display
  const formatPriority = (priority: string) => {
    switch (priority) {
      case "LOW":
        return "Baixa";
      case "MEDIUM":
        return "Média";
      case "HIGH":
        return "Alta";
      case "URGENT":
        return "Urgente";
      default:
        return "Média";
    }
  };

  return (
    <>
      <Draggable draggableId={card.id} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`mb-2 ${snapshot.isDragging ? "opacity-70" : ""}`}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-sm">{card.content}</p>
                  {card.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {card.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {/* Priority Badge */}
                    {card.priority && (
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${getPriorityColor(
                          card.priority
                        )}`}
                      >
                        {formatPriority(card.priority)}
                      </span>
                    )}

                    {/* Due Date Badge */}
                    {card.dueDate && (
                      <span className="flex items-center text-xs bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded">
                        <CalendarIcon className="mr-1 h-3 w-3" />
                        {format(new Date(card.dueDate), "dd/MM", {
                          locale: ptBR,
                        })}
                      </span>
                    )}

                    {/* Notification Badge */}
                    {card.sendNotifications && (
                      <span className="flex items-center text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">
                        <Bell className="mr-1 h-3 w-3" />
                        Notif.
                      </span>
                    )}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 -mr-2 -mt-1"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditCardOpen(true)}>
                      Editar Cartão
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => deleteCard(columnId, card.id)}
                    >
                      Excluir Cartão
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        )}
      </Draggable>

      {/* Edit Card Dialog */}
      <Dialog open={isEditCardOpen} onOpenChange={setIsEditCardOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Editar Cartão</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(handleUpdateCardSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="cardTitle">Título do Cartão</Label>
                <Input id="cardTitle" {...register("content")} />
                {errors.content && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.content.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="cardDescription">Descrição (opcional)</Label>
                <Textarea
                  id="cardDescription"
                  {...register("description")}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-destructive text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select
                  defaultValue={priority}
                  onValueChange={(value) =>
                    setValue(
                      "priority",
                      value as "LOW" | "MEDIUM" | "HIGH" | "URGENT"
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Baixa</SelectItem>
                    <SelectItem value="MEDIUM">Média</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="URGENT">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Contato para notificação</Label>
                {selectedContact ? (
                  <div className="flex items-center p-3 bg-muted rounded-md">
                    <div>
                      <div className="font-medium">{selectedContact.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {selectedContact.phoneNumber}
                      </div>
                    </div>
                  </div>
                ) : (
                  <ContactManager
                    selectedContact={selectedContact}
                    onSelectContact={handleContactSelect}
                  />
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sendNotifications"
                  {...register("sendNotifications")}
                  checked={watch("sendNotifications")}
                  onCheckedChange={(checked) =>
                    setValue("sendNotifications", checked)
                  }
                />
                <Label htmlFor="sendNotifications" className="cursor-pointer">
                  Enviar notificações para este cartão
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsEditCardOpen(false)}
                type="button"
              >
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
