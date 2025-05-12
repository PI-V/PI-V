"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";

// Define the Zod schema for board creation
const boardSchema = z.object({
  title: z.string().min(1, { message: "O título é obrigatório" }).max(100, {
    message: "O título não pode ter mais de 100 caracteres",
  }),
  description: z
    .string()
    .max(500, {
      message: "A descrição não pode ter mais de 500 caracteres",
    })
    .optional(),
});

// TypeScript type derived from the Zod schema
type BoardFormValues = z.infer<typeof boardSchema>;

// API client function for creating a board
const createBoard = async (data: BoardFormValues) => {
  const response = await fetch("/api/boards", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const responseData = await response.json();
    throw new Error(responseData.error || "Erro ao criar o quadro");
  }

  return response.json();
};

export default function NewBoardPage() {
  const router = useRouter();

  // Initialize react-hook-form with zod validation
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BoardFormValues>({
    resolver: zodResolver(boardSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Setup mutation for creating a board
  const { mutate, isPending } = useMutation({
    mutationFn: createBoard,
    onSuccess: (board) => {
      toast.success("Quadro criado com sucesso!");
      router.push(`/dashboard/boards/${board.id}`);
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : "Erro ao criar o quadro"
      );
    },
  });

  const onSubmit = (data: BoardFormValues) => {
    mutate(data);
  };

  return (
    <div className="container mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <Link
          href="/dashboard"
          className="flex items-center text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o Dashboard
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Criar novo quadro</CardTitle>
          <CardDescription>
            Crie um novo quadro Kanban para organizar suas tarefas
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do quadro</Label>
              <Input
                id="title"
                placeholder="Ex: Projeto Website"
                disabled={isPending}
                {...register("title")}
                aria-invalid={errors.title ? "true" : "false"}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                placeholder="Adicione uma descrição para o quadro"
                rows={3}
                disabled={isPending}
                {...register("description")}
                aria-invalid={errors.description ? "true" : "false"}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard")}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Criando..." : "Criar quadro"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
