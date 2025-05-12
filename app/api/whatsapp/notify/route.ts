import { NextResponse } from "next/server";
import { processCardMovedNotification } from "@/lib/whatsapp";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { cardId, columnId, recipientPhone } = body;

    if (!cardId || !columnId) {
      return NextResponse.json(
        { error: "IDs do cartão e coluna são obrigatórios" },
        { status: 400 }
      );
    }

    const result = await processCardMovedNotification({
      cardId,
      columnId,
      recipientPhone,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: result.message });
  } catch (error) {
    console.error("Erro ao processar notificação:", error);
    return NextResponse.json(
      { error: "Erro ao processar notificação" },
      { status: 500 }
    );
  }
}
