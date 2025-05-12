import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BoardType } from "@/app/(private)/dashboard/boards/[id]/board-detail";

// API endpoints
const API_ENDPOINTS = {
  BOARDS: "/api/boards",
  BOARD: (id: string) => `/api/boards/${id}`,
};

// Fetch all boards
export function useBoards() {
  return useQuery({
    queryKey: ["boards"],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.BOARDS);
      if (!response.ok) {
        throw new Error("Failed to fetch boards");
      }
      return response.json() as Promise<BoardType[]>;
    },
  });
}

// Fetch a single board
export function useBoard(id: string) {
  return useQuery({
    queryKey: ["board", id],
    queryFn: async () => {
      const response = await fetch(API_ENDPOINTS.BOARD(id));
      if (!response.ok) {
        throw new Error("Failed to fetch board");
      }
      return response.json() as Promise<BoardType>;
    },
    enabled: !!id,
  });
}

// Create a new board
export function useCreateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      description,
    }: {
      title: string;
      description?: string;
    }) => {
      const response = await fetch(API_ENDPOINTS.BOARDS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error("Failed to create board");
      }

      return response.json() as Promise<BoardType>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });
}

// Update a board
export function useUpdateBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
    }: {
      id: string;
      title?: string;
      description?: string;
    }) => {
      const response = await fetch(API_ENDPOINTS.BOARD(id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description }),
      });

      if (!response.ok) {
        throw new Error("Failed to update board");
      }

      return response.json() as Promise<BoardType>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.invalidateQueries({ queryKey: ["board", data.id] });
    },
  });
}

// Delete a board
export function useDeleteBoard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(API_ENDPOINTS.BOARD(id), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete board");
      }

      return { id };
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
      queryClient.removeQueries({ queryKey: ["board", id] });
    },
  });
}
