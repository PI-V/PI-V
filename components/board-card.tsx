"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, PencilIcon, TrashIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { EditBoardModal } from "@/components/edit-board-modal";
import { DeleteBoardDialog } from "@/components/delete-board-dialog";

interface Board {
  id: string;
  title: string;
  description: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  backgroundColor?: string | null;
  backgroundImage?: string | null;
}

interface BoardCardProps {
  board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  return (
    <>
      <Card className="h-full hover:border-primary/50 transition-colors group relative">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{board.title}</CardTitle>
              {board.description && (
                <CardDescription>{board.description}</CardDescription>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="sr-only">Abrir menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditModalOpen(true)}>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  <span>Excluir</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Criado em {new Date(board.createdAt).toLocaleDateString("pt-BR")}
          </p>
        </CardContent>
        <CardFooter>
          <Link href={`/dashboard/boards/${board.id}`} className="w-full">
            <Button variant="default" className="w-full">
              Abrir quadro
            </Button>
          </Link>
        </CardFooter>
      </Card>

      <EditBoardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        boardId={board.id}
        boardTitle={board.title}
      />

      <DeleteBoardDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        boardId={board.id}
        boardTitle={board.title}
      />
    </>
  );
}
