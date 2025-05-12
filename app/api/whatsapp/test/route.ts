import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { processTemplate } from "@/lib/whatsapp";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return new NextResponse("Não autorizado", { status: 401 });
    }

    const { template, phoneNumber, variables } = await req.json();

    if (!template || !phoneNumber) {
      return new NextResponse(
        "Template e número de telefone são obrigatórios",
        { status: 400 }
      );
    }

    // Processar o template com as variáveis
    const message = processTemplate(template, variables || {});

    console.log("[WHATSAPP_TEST]", {
      message,
      phoneNumber,
      userId: user.id,
    });

    // Enviar mensagem de teste
    // const result = await sendWhatsAppMessage(phoneNumber, message);
    const result = { success: true, messageId: randomUUID(), error: null };

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Log activity
    const { prisma } = await import("@/lib/prisma");
    await prisma.activityLog.create({
      data: {
        userId: user.id,
        type: "NOTIFICATION_SENT",
        description: `Enviou mensagem de teste para ${phoneNumber}`,
        metadata: {
          entityType: "WhatsApp",
          phoneNumber,
          message:
            message.substring(0, 100) + (message.length > 100 ? "..." : ""),
        },
      },
    });

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error: unknown) {
    console.error("[WHATSAPP_TEST]", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erro ao enviar mensagem de teste";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
