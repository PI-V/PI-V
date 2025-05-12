import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ColumnType,
  CardType,
} from "@/app/(private)/dashboard/boards/[id]/board-detail";

// API endpoints
const API_ENDPOINTS = {
  COLUMNS: "/api/columns",
  COLUMN: (id: string) => `/api/columns/${id}`,
  CARDS: "/api/cards",
  CARD: (id: string) => `/api/cards/${id}`,
};

// Create a new column
export function useCreateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      title,
      boardId,
    }: {
      title: string;
      boardId: string;
    }) => {
      const response = await fetch(API_ENDPOINTS.COLUMNS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, boardId }),
      });

      if (!response.ok) {
        throw new Error("Failed to create column");
      }

      return response.json() as Promise<ColumnType>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["board", data.boardId] });
    },
  });
}

// Update a column
export function useUpdateColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      order,
    }: {
      id: string;
      title?: string;
      order?: number;
    }) => {
      const response = await fetch(API_ENDPOINTS.COLUMN(id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, order }),
      });

      if (!response.ok) {
        throw new Error("Failed to update column");
      }

      return response.json() as Promise<ColumnType>;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["board", data.boardId] });
    },
  });
}

// Delete a column
export function useDeleteColumn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (columnData: { id: string; boardId: string }) => {
      const response = await fetch(API_ENDPOINTS.COLUMN(columnData.id), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete column");
      }

      return columnData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["board", data.boardId] });
    },
  });
}

// Create a new card
export function useCreateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      content,
      description,
      columnId,
      priority,
      contactId,
    }: {
      content: string;
      description?: string;
      columnId: string;
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      contactId?: string;
    }) => {
      const response = await fetch(API_ENDPOINTS.CARDS, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          description,
          columnId,
          priority,
          // Convert empty string to null for contactId
          contactId: contactId === "" ? null : contactId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create card");
      }

      return response.json() as Promise<CardType>;
    },
    onSuccess: (_, variables) => {
      // We need to get the board ID for the column to invalidate the board query
      // For simplicity, we'll invalidate all board queries
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });
}

// Update a card
export function useUpdateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      content,
      description,
      columnId,
      order,
      priority,
      startDate,
      dueDate,
      completedDate,
      sendNotifications,
      contactId,
      whatsappNumber,
    }: {
      id: string;
      content?: string;
      description?: string | null;
      columnId?: string;
      order?: number;
      priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
      startDate?: string | null;
      dueDate?: string | null;
      completedDate?: string | null;
      sendNotifications?: boolean;
      contactId?: string | null;
      whatsappNumber?: string | null;
    }) => {
      const response = await fetch(API_ENDPOINTS.CARD(id), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content,
          description,
          columnId,
          order,
          priority,
          startDate,
          dueDate,
          completedDate,
          sendNotifications,
          // Convert empty string to null for contactId
          contactId: contactId === "" ? null : contactId,
          whatsappNumber: whatsappNumber === "" ? null : whatsappNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update card");
      }

      return response.json() as Promise<CardType>;
    },
    onSuccess: () => {
      // Invalidate all board queries because we don't know which board this card belongs to
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });
}

// Delete a card
export function useDeleteCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cardData: { id: string; columnId: string }) => {
      const response = await fetch(API_ENDPOINTS.CARD(cardData.id), {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete card");
      }

      return cardData;
    },
    onSuccess: () => {
      // Invalidate all board queries
      queryClient.invalidateQueries({ queryKey: ["board"] });
    },
  });
}
