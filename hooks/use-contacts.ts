"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export type Contact = {
  id: string;
  name: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
};

export type ContactFormValues = {
  name: string;
  phoneNumber: string;
};

// Definição do tipo para a resposta da API de contatos
interface ContactsApiResponse {
  contacts: Array<{
    id: string;
    name: string;
    whatsappNumber: string;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Definição do tipo para o contato retornado pela API
interface ContactApiResponse {
  contact: {
    id: string;
    name: string;
    whatsappNumber: string;
    createdAt: string;
    updatedAt: string;
  };
}

// Fetch all contacts
const fetchContacts = async (): Promise<Contact[]> => {
  const response = await fetch("/api/contacts");

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to load contacts");
  }

  const data = (await response.json()) as ContactsApiResponse;

  // Map the API response fields to match our frontend Contact type
  return (data.contacts || []).map((contact) => ({
    id: contact.id,
    name: contact.name,
    phoneNumber: contact.whatsappNumber,
    createdAt: contact.createdAt,
    updatedAt: contact.updatedAt,
  }));
};

// Create a new contact
const createContact = async (contact: ContactFormValues): Promise<Contact> => {
  const response = await fetch("/api/contacts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: contact.name,
      whatsappNumber: contact.phoneNumber, // Map phoneNumber to whatsappNumber
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create contact");
  }

  const data = (await response.json()) as ContactApiResponse;
  return {
    id: data.contact.id,
    name: data.contact.name,
    phoneNumber: data.contact.whatsappNumber,
    createdAt: data.contact.createdAt,
    updatedAt: data.contact.updatedAt,
  };
};

// Update an existing contact
const updateContact = async ({
  id,
  ...contact
}: ContactFormValues & { id: string }): Promise<Contact> => {
  const response = await fetch(`/api/contacts?id=${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: contact.name,
      whatsappNumber: contact.phoneNumber, // Map phoneNumber to whatsappNumber
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update contact");
  }

  const data = (await response.json()) as ContactApiResponse;
  return {
    id: data.contact.id,
    name: data.contact.name,
    phoneNumber: data.contact.whatsappNumber,
    createdAt: data.contact.createdAt,
    updatedAt: data.contact.updatedAt,
  };
};

// Delete a contact
const deleteContact = async (id: string): Promise<void> => {
  const response = await fetch(`/api/contacts?id=${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete contact");
  }
};

export function useContacts() {
  const queryClient = useQueryClient();

  // Query hook for fetching contacts
  const {
    data: contacts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["contacts"],
    queryFn: fetchContacts,
  });

  // Mutation hook for creating contact
  const createContactMutation = useMutation({
    mutationFn: createContact,
    onSuccess: (newContact) => {
      // Invalidate and refetch the contacts query
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contato criado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Mutation hook for updating contact
  const updateContactMutation = useMutation({
    mutationFn: updateContact,
    onSuccess: (updatedContact) => {
      // Invalidate and refetch the contacts query
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contato atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Mutation hook for deleting contact
  const deleteContactMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      // Invalidate and refetch the contacts query
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
      toast.success("Contato excluído com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  return {
    contacts,
    isLoading,
    error,
    refetch,
    createContact: createContactMutation.mutate,
    updateContact: updateContactMutation.mutate,
    deleteContact: deleteContactMutation.mutate,
    isCreating: createContactMutation.isPending,
    isUpdating: updateContactMutation.isPending,
    isDeleting: deleteContactMutation.isPending,
  };
}
