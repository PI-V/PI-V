import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateBoard } from "@/hooks/use-boards";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Schema de validação para o formulário
const editBoardSchema = z.object({
  title: z.string().min(1, "O título é obrigatório"),
});

type EditBoardFormValues = z.infer<typeof editBoardSchema>;

interface EditBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
  boardTitle: string;
}

export function EditBoardModal({
  isOpen,
  onClose,
  boardId,
  boardTitle,
}: EditBoardModalProps) {
  const updateBoardMutation = useUpdateBoard();

  // Inicializar o formulário com react-hook-form e validação de zod
  const form = useForm<EditBoardFormValues>({
    resolver: zodResolver(editBoardSchema),
    defaultValues: {
      title: boardTitle,
    },
  });

  const onSubmit = async (data: EditBoardFormValues) => {
    try {
      await updateBoardMutation.mutateAsync({
        id: boardId,
        title: data.title,
      });

      toast.success("Quadro atualizado com sucesso");
      onClose();
    } catch (error) {
      toast.error("Erro ao atualizar o quadro");
      console.error("Error updating board:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Quadro</DialogTitle>
          <DialogDescription>Atualize o título do seu quadro</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o título do quadro"
                      {...field}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateBoardMutation.isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={updateBoardMutation.isPending}>
                {updateBoardMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
