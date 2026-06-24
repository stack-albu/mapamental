import { NextResponse } from "next/server";

// Esta é uma rota de exemplo para integrar com OpenAI, Anthropic ou Gemini.
// No cenário real, substitua o mock abaixo por uma chamada SDK real.

export async function POST(req: Request) {
  try {
    const { prompt, parentId } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    // AQUI ENTRARIA A CHAMADA REAL DA IA. Exemplo com OpenAI:
    // const response = await openai.chat.completions.create({ ... })
    
    // Mock de delay de IA
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock response simulating AI output
    const suggestions = [
      `Expansão: ${prompt} 1`,
      `Expansão: ${prompt} 2`,
      `Expansão: ${prompt} 3`,
    ];

    return NextResponse.json({ suggestions, parentId });
  } catch (error) {
    return NextResponse.json({ error: "Failed to generate nodes" }, { status: 500 });
  }
}
