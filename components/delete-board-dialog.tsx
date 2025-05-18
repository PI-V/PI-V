"use client";

import { useState } from "react";
import { useDeleteBoard } from "@/hooks/use-boards";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteBoardDialogProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  boardTitle: string;
}

export function DeleteBoardDialog({
  isOpen,
  onClose,
  boardId,
  boardTitle,
}: DeleteBoardDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteBoardMutation = useDeleteBoard();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteBoardMutation.mutateAsync(boardId);
      toast.success("Quadro excluído com sucesso");
      onClose();
    } catch (error) {
      toast.error("Erro ao excluir o quadro");
      console.error("Error deleting board:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o
            quadro <strong>{boardTitle}</strong> e todas as suas colunas e
            cartões.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
