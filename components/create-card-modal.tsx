"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ContactManager } from "./contact-manager";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Contact } from "@/hooks/use-contacts";

// Define the validation schema
const cardSchema = z.object({
  content: z.string().min(1, { message: "Título é obrigatório" }),
  description: z.string().optional(),
  contactId: z.string().min(1, { message: "Selecione um contato" }),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
});

type CardFormValues = z.infer<typeof cardSchema>;

// Define o tipo para os dados do cartão a ser criado
type CreateCardData = CardFormValues & {
  columnId: string;
};

interface CreateCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCard: (data: CreateCardData) => Promise<void>;
  columnId: string;
}

export function CreateCardModal({
  isOpen,
  onClose,
  onCreateCard,
  columnId,
}: CreateCardModalProps) {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<CardFormValues>({
    resolver: zodResolver(cardSchema),
    defaultValues: {
      content: "",
      description: "",
      contactId: "",
      priority: "MEDIUM",
    },
  });

  const onSubmit = async (data: CardFormValues) => {
    try {
      await onCreateCard({
        ...data,
        columnId,
      });
      reset();
      onClose();

      setSelectedContact(null);
      setValue("contactId", "");
    } catch (error) {
      console.error("Failed to create card:", error);
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            reset();
            onClose();
          }
        }}
      >
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cartão</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="content">Título do Cartão *</Label>
                <Input
                  id="content"
                  {...register("content")}
                  placeholder="Digite o título do cartão"
                />
                {errors.content && (
                  <p className="text-destructive text-sm">
                    {errors.content.message}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Digite a descrição do cartão"
                  rows={3}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="contactId">Contato *</Label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <ContactManager
                      selectedContact={selectedContact}
                      onSelectContact={(contact) => {
                        setSelectedContact(contact);
                        setValue("contactId", contact?.id || "");
                      }}
                    />

                    <input type="hidden" {...register("contactId")} />
                    {errors.contactId && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.contactId.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
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
                  )}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  reset();
                  onClose();
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Adicionar Cartão"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
