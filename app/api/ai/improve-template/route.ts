import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { improveTemplateWithAI } from "@/lib/gemini";

// POST /api/ai/improve-template
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

    // Extrair dados do corpo da requisição
    const { template, style = "criativo" } = await req.json();

    if (!template) {
      return NextResponse.json(
        { error: "O template é obrigatório" },
        { status: 400 }
      );
    }

    // Chamar o serviço Gemini para melhorar o template
    const improvedTemplate = await improveTemplateWithAI(template, style);

    // Retornar o template melhorado
    return NextResponse.json({
      success: true,
      improvedTemplate,
      originalTemplate: template,
      style,
    });
  } catch (error: unknown) {
    console.error("Erro ao aprimorar template com IA:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro interno do servidor";

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
