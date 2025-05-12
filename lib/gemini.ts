import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function improveTemplateWithAI(
  template: string,
  style: string = "criativo"
) {
  const stylePrompts = {
    formal:
      "Reescreva este template de mensagem WhatsApp para um tom mais formal e profissional, mantendo todas as informações e variáveis originais e sem aumentar muito a quantidade de palavras: ",
    descontraido:
      "Reescreva este template de mensagem WhatsApp em um tom mais descontraído e amigável, mantendo todas as informações e variáveis originais  e sem aumentar muito a quantidade de palavras: ",
    conciso:
      "Reescreva este template de mensagem WhatsApp de forma mais concisa e direta, mantendo todas as informações e variáveis originais  e sem aumentar muito a quantidade de palavras: ",
    criativo:
      "Reescreva este template de mensagem WhatsApp de forma mais criativa e envolvente, mantendo todas as informações e variáveis originais  e sem aumentar muito a quantidade de palavras: ",
  };

  const prompt = `${
    stylePrompts[style as keyof typeof stylePrompts] || stylePrompts.criativo
  }

${template}

Importante: Mantenha todas as variáveis no formato {{variable_name}} intactas e na mesma posição contextual. Não altere o formato ou o nome das variáveis. Preserve a formatação como quebras de linha e marcadores.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-lite",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error("Falha ao gerar conteúdo com a IA");
    }

    return text;
  } catch (error) {
    console.error("Erro ao melhorar template com IA:", error);
    throw new Error(
      "Não foi possível melhorar o template com IA. Tente novamente mais tarde."
    );
  }
}
