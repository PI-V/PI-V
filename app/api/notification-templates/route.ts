import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { auth } from "@/lib/auth";

// Schema para validação do corpo da requisição
const templateSchema = z.object({
  columnId: z.string().min(1),
  enabled: z.boolean(),
  template: z.string().min(1).max(1000),
});

export async function GET(req: Request) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Você precisa estar autenticado" },
        { status: 401 }
      );
    }

    // Obter o ID da coluna da query string
    const url = new URL(req.url);
    const columnId = url.searchParams.get("columnId");

    if (!columnId) {
      return NextResponse.json(
        { error: "ID da coluna é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a coluna existe e pertence a um quadro do usuário
    const column = await prisma.column.findFirst({
      where: {
        id: columnId,
        board: {
          userId: session.user.id,
        },
      },
      include: {
        notificationTemplate: true,
      },
    });

    if (!column) {
      return NextResponse.json(
        { error: "Coluna não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      template: column.notificationTemplate,
    });
  } catch (error: unknown) {
    console.error("Erro ao buscar template de notificação:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Você precisa estar autenticado" },
        { status: 401 }
      );
    }

    // Validar dados do corpo da requisição
    const body = await req.json();
    const result = templateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: result.error },
        { status: 400 }
      );
    }

    const { columnId, enabled, template } = result.data;

    // Verificar se a coluna existe e pertence a um quadro do usuário
    const column = await prisma.column.findFirst({
      where: {
        id: columnId,
        board: {
          userId: session.user.id,
        },
      },
      include: {
        notificationTemplate: true,
      },
    });

    if (!column) {
      return NextResponse.json(
        { error: "Coluna não encontrada" },
        { status: 404 }
      );
    }

    // Criar ou atualizar o template de notificação
    const notificationTemplate = await prisma.notificationTemplate.upsert({
      where: {
        columnId,
      },
      update: {
        enabled,
        template,
      },
      create: {
        columnId,
        enabled,
        template,
      },
    });

    return NextResponse.json({
      template: notificationTemplate,
    });
  } catch (error: unknown) {
    console.error("Erro ao salvar template de notificação:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    // Verificar autenticação
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Você precisa estar autenticado" },
        { status: 401 }
      );
    }

    // Obter o ID da coluna da query string
    const url = new URL(req.url);
    const columnId = url.searchParams.get("columnId");

    if (!columnId) {
      return NextResponse.json(
        { error: "ID da coluna é obrigatório" },
        { status: 400 }
      );
    }

    // Verificar se a coluna existe e pertence a um quadro do usuário
    const column = await prisma.column.findFirst({
      where: {
        id: columnId,
        board: {
          userId: session.user.id,
        },
      },
    });

    if (!column) {
      return NextResponse.json(
        { error: "Coluna não encontrada" },
        { status: 404 }
      );
    }

    // Excluir o template de notificação
    await prisma.notificationTemplate.delete({
      where: {
        columnId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error: unknown) {
    console.error("Erro ao excluir template de notificação:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
