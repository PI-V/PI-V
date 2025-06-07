import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ActivityLogType } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { id: columnId } = await params;

    // Verify column exists and user has access to it
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: {
        board: true,
        notificationTemplate: true,
      },
    });

    if (!column) {
      return new NextResponse("Coluna não encontrada", { status: 404 });
    }

    if (column.board.userId !== user.id) {
      return new NextResponse("Não autorizado", { status: 403 });
    }

    if (!column.notificationTemplate) {
      return new NextResponse("Template não encontrado", { status: 404 });
    }

    return NextResponse.json(column.notificationTemplate);
  } catch (error) {
    console.error("[COLUMN_TEMPLATE_GET]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { id: columnId } = await params;
    const { template, isActive } = await req.json();

    // Verify column exists and user has access to it
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: { board: true },
    });

    if (!column) {
      return new NextResponse("Coluna não encontrada", { status: 404 });
    }

    if (column.board.userId !== user.id) {
      return new NextResponse("Não autorizado", { status: 403 });
    }

    // Check if template already exists
    const existingTemplate = await prisma.notificationTemplate.findUnique({
      where: { columnId },
    });

    if (existingTemplate) {
      return new NextResponse("Template já existe, use PUT para atualizar", {
        status: 400,
      });
    }

    // Create new template
    const newTemplate = await prisma.notificationTemplate.create({
      data: {
        template,
        isActive,
        columnId,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: ActivityLogType.COLUMN_UPDATED,
        description: `Criou template de notificação para coluna: ${column.title}`,
      },
    });

    return NextResponse.json(newTemplate);
  } catch (error) {
    console.error("[COLUMN_TEMPLATE_POST]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { id: columnId } = await params;
    const { template, isActive } = await req.json();

    // Verify column exists and user has access to it
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: { board: true },
    });

    if (!column) {
      return new NextResponse("Coluna não encontrada", { status: 404 });
    }

    if (column.board.userId !== user.id) {
      return new NextResponse("Não autorizado", { status: 403 });
    }

    // Update or create template
    const updatedTemplate = await prisma.notificationTemplate.upsert({
      where: { columnId },
      create: {
        template,
        isActive,
        columnId,
      },
      update: {
        template,
        isActive,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: ActivityLogType.COLUMN_UPDATED,
        description: `Atualizou template de notificação para coluna: ${column.title}`
      },
    });

    return NextResponse.json(updatedTemplate);
  } catch (error) {
    console.error("[COLUMN_TEMPLATE_PUT]", error);
    return new NextResponse("Erro interno", { status: 500 });
  }
}
