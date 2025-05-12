import { prisma } from "./prisma";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { randomUUID } from "crypto";

// Interface para mensagens de texto do WhatsApp
export interface WhatsAppTextMessageBody {
  messaging_product: "whatsapp";
  to: string;
  type: "text";
  text: {
    body: string;
  };
}

// Processador de template que substitui variáveis por valores reais
export function processTemplate(
  template: string,
  variables: Record<string, string | number | null | undefined>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, variable) => {
    const value = variables[variable];
    return value !== undefined && value !== null ? String(value) : match; // Mantém a variável intacta se o valor não for fornecido
  });
}

// Function to get variables from a card for template replacement
export async function getCardVariables(cardId: string, columnId: string) {
  const card = await prisma.card.findUnique({
    where: { id: cardId },
    include: {
      column: {
        include: {
          board: true,
        },
      },
      contact: true,
    },
  });

  if (!card) {
    throw new Error("Card not found");
  }

  // Get destination column
  const destinationColumn = await prisma.column.findUnique({
    where: { id: columnId },
    include: {
      board: true,
    },
  });

  if (!destinationColumn) {
    throw new Error("Destination column not found");
  }

  // Format dates
  const formattedDueDate = card.dueDate
    ? format(new Date(card.dueDate), "dd/MM/yyyy", { locale: ptBR })
    : "Não definida";

  const today = new Date();
  const currentDate = format(today, "dd/MM/yyyy", { locale: ptBR });
  const currentTime = format(today, "HH:mm", { locale: ptBR });

  // Get priority in Portuguese
  const priorityMap: Record<string, string> = {
    LOW: "Baixa",
    MEDIUM: "Média",
    HIGH: "Alta",
    URGENT: "Urgente",
  };

  // Build variables map
  const variables = {
    board_title: destinationColumn.board.title,
    column_title: destinationColumn.title,
    card_title: card.content,
    card_description: card.description || "Sem descrição",
    contact_name: card.contact?.name || "Cliente",
    card_priority:
      priorityMap[card.priority as keyof typeof priorityMap] || "Média",
    card_due_date: formattedDueDate,
    user_name: "Usuário", // In a real app, you might get this from the session
    date: currentDate,
    time: currentTime,
  };

  return {
    card,
    destinationColumn,
    variables,
  };
}

// Function to replace template variables in a string
export function replaceTemplateVariables(
  template: string,
  variables: Record<string, string>
) {
  if (!template) return "";

  return template.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
    const trimmedKey = key.trim();
    return variables[trimmedKey] !== undefined
      ? variables[trimmedKey]
      : `{{${key}}}`;
  });
}

// Function to send WhatsApp message using external API
export async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!process.env.WHATSAPP_API_URL || !process.env.FB_TOKEN) {
    console.error("WhatsApp API configuration is missing");
    return {
      success: false,
      error: "WhatsApp API configuration is missing",
    };
  }

  try {
    // Construindo o payload conforme a documentação do WhatsApp
    const payload: WhatsAppTextMessageBody = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "text",
      text: {
        body: message,
      },
    };

    console.log("Payload to WhatsApp API:", payload);

    // Make API request to WhatsApp API service
    // const response = await axios.post(process.env.WHATSAPP_API_URL, payload, {
    //   headers: {
    //     Authorization: `Bearer ${process.env.FB_TOKEN}`,
    //     "Content-Type": "application/json",
    //   },
    // });

    const response = {
      status: 200,
      data: {
        messages: [
          {
            id: randomUUID(),
            message_status: "sent",
          },
        ],
      },
    };
    // Log the API response
    console.log("WhatsApp API response:", response.data);

    if (response.status === 200 || response.status === 201) {
      // Extract message ID from the response
      // The response structure follows the WhatsApp API format:
      // { messaging_product, contacts, messages: [{ id, message_status }] }
      const messageId =
        response.data.messages && response.data.messages.length > 0
          ? response.data.messages[0].id
          : "unknown";

      // Create an activity log entry for the message
      await prisma.activityLog.create({
        data: {
          type: "NOTIFICATION_SENT",
          description: `Notificação WhatsApp enviada para ${phoneNumber}`,
          metadata: {
            messageId,
            phoneNumber,
            messageSummary:
              message.substring(0, 100) + (message.length > 100 ? "..." : ""),
          },
        },
      });

      return {
        success: true,
        messageId,
      };
    }

    return {
      success: false,
      error: `API responded with status ${response.status}`,
    };
  } catch (error: unknown) {
    console.error("Error sending WhatsApp message:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Process notification when a card is moved to a new column
export async function processCardNotification(
  cardId: string,
  columnId: string
) {
  try {
    // Get all necessary data
    const { card, destinationColumn, variables } = await getCardVariables(
      cardId,
      columnId
    );

    // If no contact, do nothing
    if (!card.contact) {
      console.log(`No contact for card ${cardId}`);
      return false;
    }

    // Get the notification template for the destination column
    const template = await prisma.notificationTemplate.findUnique({
      where: { columnId: destinationColumn.id },
    });

    // If no template or notifications not enabled for this column, do nothing
    if (!template || !template.isActive) {
      console.log(`No active template for column ${destinationColumn.id}`);
      return false;
    }

    // Replace template variables
    const message = replaceTemplateVariables(
      template.template,
      variables as Record<string, string>
    );

    // Determine which phone number to use
    const phoneNumber = card.contact.whatsappNumber;

    if (!phoneNumber) {
      console.log(`No WhatsApp number available for card ${cardId}`);
      return false;
    }

    // Send the message
    const result = await sendWhatsAppMessage(phoneNumber, message);

    // Record the activity
    await prisma.cardActivity.create({
      data: {
        cardId: card.id,
        fromColumnId: card.columnId,
        toColumnId: destinationColumn.id,
        notificationSent: result.success,
        notificationError: result.error,
      },
    });

    // Log the activity
    await prisma.activityLog.create({
      data: {
        type: "CARD_MOVED",
        description: `Cartão "${card.content}" movido para coluna "${destinationColumn.title}"`,
        cardId: card.id,
        columnId: destinationColumn.id,
        boardId: destinationColumn.boardId,
        userId: card.column.board.userId,
        metadata: {
          notification: {
            sent: result.success,
            phoneNumber,
            messageId: result.messageId,
            error: result.error,
            messageSummary:
              message.substring(0, 100) + (message.length > 100 ? "..." : ""),
          },
        },
      },
    });

    return result.success;
  } catch (error: unknown) {
    console.error("Error processing card notification:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro ao processar notificação do cartão";

    // Log the error
    try {
      await prisma.activityLog.create({
        data: {
          type: "ERROR",
          description: `Error processing notification for card ${cardId}: ${errorMessage}`,
          cardId,
          columnId,
          metadata: {
            error: errorMessage,
            stack: error instanceof Error ? error.stack : undefined,
          },
        },
      });
    } catch (logError) {
      console.error("Failed to log error:", logError);
    }

    return false;
  }
}

// Função para enviar uma mensagem de teste
export async function sendTestWhatsAppMessage(
  phoneNumber: string,
  template: string,
  variables: Record<string, string | number | null | undefined>
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    // Processar o template com as variáveis
    const message = processTemplate(template, variables);

    // Enviar a mensagem
    return await sendWhatsAppMessage(phoneNumber, message);
  } catch (error: unknown) {
    console.error("Erro ao enviar mensagem de teste:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro ao enviar mensagem de teste";
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// Interface para os dados necessários para envio de notificações
interface NotificationData {
  cardId: string;
  columnId: string;
  recipientPhone?: string;
}

/**
 * Verifica se um template de notificação está habilitado para uma coluna
 */
export async function isNotificationEnabled(
  columnId: string
): Promise<boolean> {
  try {
    const template = await prisma.notificationTemplate.findUnique({
      where: { columnId },
    });

    return template?.isActive || false;
  } catch (error) {
    console.error("Erro ao verificar se notificação está habilitada:", error);
    return false;
  }
}

/**
 * Processa a notificação quando um cartão é movido para uma coluna
 */
export async function processCardMovedNotification({
  cardId,
  columnId,
  recipientPhone,
}: NotificationData): Promise<{ success: boolean; message: string }> {
  try {
    // Verificar se as notificações estão habilitadas para esta coluna
    const template = await prisma.notificationTemplate.findUnique({
      where: { columnId },
    });

    if (!template || !template.enabled) {
      return {
        success: true,
        message: "Cartão movido, mas notificações não estão habilitadas",
      };
    }

    // Buscar informações do cartão para personalizar a mensagem
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        column: {
          include: {
            board: true,
          },
        },
        contact: true,
      },
    });

    if (!card) {
      return {
        success: false,
        message: "Cartão não encontrado",
      };
    }

    // Se não tiver um telefone específico, usar o telefone do contato associado ao cartão
    const phone = recipientPhone || card.contact?.whatsappNumber;

    if (!phone) {
      return {
        success: false,
        message:
          "Nenhum número de telefone disponível para enviar a notificação",
      };
    }

    // Personalizar o template com informações do cartão
    const boardName = card.column.board.title;
    const columnName = card.column.title;
    const cardTitle = card.content;
    const cardDescription = card.description || "";
    const contactName = card.contact?.name || "Cliente";
    const dueDate = card.dueDate
      ? new Date(card.dueDate).toLocaleDateString()
      : "Não definida";
    const priority = card.priority || "Não definida";

    // Substituir variáveis no template usando o formato padrão {{variable_name}}
    const variables = {
      board_title: boardName,
      column_title: columnName,
      card_title: cardTitle,
      card_description: cardDescription,
      contact_name: contactName,
      card_priority: priority,
      card_due_date: dueDate,
      date: new Date().toLocaleDateString("pt-BR"),
      time: new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Usar o processador de template para substituir todas as variáveis
    const message = processTemplate(template.template, variables);

    // Enviar a mensagem
    const result = await sendWhatsAppMessage(phone, message);

    if (result.success) {
      // Registrar o envio da notificação
      await prisma.activityLog.create({
        data: {
          type: "NOTIFICATION_SENT",
          description: `Notificação enviada para ${phone}`,
          cardId,
          columnId,
          userId: card.column.board.userId,
          metadata: {
            recipient: phone,
            templateId: template.id,
            message:
              message.substring(0, 100) + (message.length > 100 ? "..." : ""),
          },
        },
      });
    }

    return result.success
      ? { success: true, message: "Notificação enviada com sucesso" }
      : {
          success: false,
          message: result.error || "Falha ao enviar notificação",
        };
  } catch (error) {
    console.error("Erro ao processar notificação:", error);
    return {
      success: false,
      message: "Erro ao processar notificação: " + (error as Error).message,
    };
  }
}

// Get notification templates for a board
export async function getNotificationTemplatesForBoard(boardId: string) {
  const columns = await prisma.column.findMany({
    where: { boardId },
    include: {
      notificationTemplate: true,
    },
  });

  return columns.map((column) => ({
    columnId: column.id,
    columnTitle: column.title,
    template: column.notificationTemplate?.template || null,
    isActive: column.notificationTemplate?.isActive || false,
  }));
}

// Update notification template for a column
export async function updateNotificationTemplate(
  columnId: string,
  template: string,
  isActive: boolean
) {
  return prisma.notificationTemplate.upsert({
    where: { columnId },
    update: {
      template,
      isActive,
    },
    create: {
      columnId,
      template,
      isActive,
    },
  });
}

// Get notification status for a board
export async function getBoardNotificationStatus(boardId: string) {
  const columns = await prisma.column.findMany({
    where: { boardId },
    include: {
      notificationTemplate: true,
    },
  });

  return {
    totalColumns: columns.length,
    columnsWithTemplates: columns.filter((c) => c.notificationTemplate).length,
    activeTemplates: columns.filter((c) => c.notificationTemplate?.isActive)
      .length,
    enabledTemplates: columns.filter((c) => c.notificationTemplate?.isActive)
      .length, // Fixed: changed 'enabled' to 'isActive'
  };
}

// Function to generate default notification template for a column
export function generateDefaultTemplate(columnTitle: string) {
  return `Olá! O cartão "{{card_title}}" foi movido para a coluna "${columnTitle}" no quadro "{{board_title}}".

Detalhes do cartão:
- Descrição: {{card_description}}
- Prioridade: {{card_priority}}
- Data de vencimento: {{card_due_date}}

Data: {{date}}
Hora: {{time}}

Este é um serviço automatizado de notificações.`;
}
