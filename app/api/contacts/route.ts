import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

// Schema para validação do corpo da requisição
const contactSchema = z.object({
  name: z.string().min(1).max(100),
  whatsappNumber: z.string().min(1).max(20),
});

export async function GET(req: Request) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Você precisa estar autenticado" },
        { status: 401 }
      );
    }

    // Obter o ID do contato da query string, se existir
    const url = new URL(req.url);
    const contactId = url.searchParams.get("id");

    // Se um ID específico for fornecido, retornar apenas esse contato
    if (contactId) {
      const contact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          userId: session.user.id,
        },
      });

      if (!contact) {
        return NextResponse.json(
          { error: "Contato não encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json({ contact });
    }

    // Caso contrário, listar todos os contatos do usuário
    const contacts = await prisma.contact.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ contacts });
  } catch (error: unknown) {
    console.error("Erro ao buscar contatos:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Você precisa estar autenticado" },
        { status: 401 }
      );
    }

    // Validar dados do corpo da requisição
    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error },
        { status: 400 }
      );
    }

    const { name, whatsappNumber } = result.data;

    // Criar o contato
    const contact = await prisma.contact.create({
      data: {
        name,
        whatsappNumber,
        userId: session.user.id,
      },
    });

    return NextResponse.json({ contact });
  } catch (error: unknown) {
    console.error("Erro ao criar contato:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Você precisa estar autenticado" },
        { status: 401 }
      );
    }

    // Obter o ID do contato da query string
    const url = new URL(req.url);
    const contactId = url.searchParams.get("id");

    if (!contactId) {
      return NextResponse.json(
        { error: "ID do contato é obrigatório" },
        { status: 400 }
      );
    }

    // Validar dados do corpo da requisição
    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error },
        { status: 400 }
      );
    }

    const { name, whatsappNumber } = result.data;

    // Verificar se o contato existe e pertence ao usuário
    const existingContact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        userId: session.user.id,
      },
    });

    if (!existingContact) {
      return NextResponse.json(
        { error: "Contato não encontrado" },
        { status: 404 }
      );
    }

    // Atualizar o contato
    const contact = await prisma.contact.update({
      where: {
        id: contactId,
      },
      data: {
        name,
        whatsappNumber,
      },
    });

    return NextResponse.json({ contact });
  } catch (error: unknown) {
    console.error("Erro ao atualizar contato:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Você precisa estar autenticado" },
        { status: 401 }
      );
    }

    // Obter o ID do contato da query string
    const url = new URL(req.url);
    const contactId = url.searchParams.get("id");

    if (!contactId) {
      return NextResponse.json(
        { error: "ID do contato é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se o contato existe e pertence ao usuário
    const contact = await prisma.contact.findFirst({
      where: {
        id: contactId,
        userId: session.user.id,
      },
    });

    if (!contact) {
      return NextResponse.json(
        { error: "Contato não encontrado" },
        { status: 404 }
      );
    }

    // Remover referências do contato em cartões
    await prisma.card.updateMany({
      where: {
        contactId: contactId,
      },
      data: {
        contactId: null,
      },
    });

    // Excluir o contato
    await prisma.contact.delete({
      where: {
        id: contactId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    console.error("Erro ao excluir contato:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
