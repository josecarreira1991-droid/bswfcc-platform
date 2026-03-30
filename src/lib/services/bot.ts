/**
 * AI Bot Service for BSWFCC WhatsApp Assistant
 *
 * Uses DeepSeek API (or OpenAI-compatible endpoint) to generate responses.
 * Queries Supabase for context about members, events, market data, and directors.
 *
 * Env vars required:
 * - BOT_API_KEY (DeepSeek or OpenAI API key)
 * - BOT_API_URL (default: https://api.deepseek.com/v1)
 * - BOT_MODEL (default: deepseek-chat)
 */

import { createClient } from "@supabase/supabase-js";
import { APP_URL } from "@/lib/utils";

const BOT_API_URL = process.env.BOT_API_URL || "https://api.deepseek.com/v1";
const BOT_API_KEY = process.env.BOT_API_KEY || "";
const BOT_MODEL = process.env.BOT_MODEL || "deepseek-chat";

// Service client for DB reads (no auth context needed)
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface BotContext {
  upcomingEvents: Array<{ title: string; date: string; time: string | null; location: string | null; type: string }>;
  directors: Array<{ name: string; role: string; company: string | null }>;
  memberCount: number;
  marketHighlights: Array<{ indicator: string; value: string; category: string }>;
  senderInfo: { name: string; role: string; company: string | null } | null;
}

export async function gatherBotContext(senderPhone?: string): Promise<BotContext> {
  const supabase = getServiceClient();
  const today = new Date().toISOString().split("T")[0];

  const [eventsResult, directorsResult, membersResult, marketResult, senderResult] = await Promise.all([
    supabase.from("events").select("title, date, time, location, type").gte("date", today).order("date").limit(5),
    supabase.from("directors").select("name, role, company").order("order_index"),
    supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "ativo"),
    supabase.from("market_data").select("indicator, value, category").limit(10),
    senderPhone
      ? supabase.from("members").select("full_name, role, company").eq("phone", senderPhone).single()
      : Promise.resolve({ data: null }),
  ]);

  return {
    upcomingEvents: eventsResult.data || [],
    directors: directorsResult.data || [],
    memberCount: membersResult.count || 0,
    marketHighlights: marketResult.data || [],
    senderInfo: senderResult.data
      ? { name: senderResult.data.full_name, role: senderResult.data.role, company: senderResult.data.company }
      : null,
  };
}

function buildSystemPrompt(context: BotContext, customPrompt?: string): string {
  const base = customPrompt || `Você é o assistente virtual da BSWFCC (Brazilian SouthWest Florida Chamber of Commerce). Responda em português quando a mensagem for em português, e em inglês quando for em inglês. Seja profissional, cordial e direto.`;

  const contextParts: string[] = [base, "\n\n--- CONTEXTO ATUAL ---"];

  if (context.senderInfo) {
    contextParts.push(`\nRemetente: ${context.senderInfo.name} (${context.senderInfo.role}${context.senderInfo.company ? `, ${context.senderInfo.company}` : ""})`);
  }

  contextParts.push(`\nMembros ativos: ${context.memberCount}`);

  if (context.upcomingEvents.length > 0) {
    contextParts.push("\n\nPróximos eventos:");
    context.upcomingEvents.forEach((e) => {
      contextParts.push(`- ${e.title} | ${e.date}${e.time ? ` às ${e.time}` : ""} | ${e.location || "Local a confirmar"} | Tipo: ${e.type}`);
    });
  } else {
    contextParts.push("\n\nNenhum evento próximo agendado.");
  }

  if (context.directors.length > 0) {
    contextParts.push("\n\nDiretoria:");
    context.directors.forEach((d) => {
      contextParts.push(`- ${d.name}: ${d.role}${d.company ? ` (${d.company})` : ""}`);
    });
  }

  if (context.marketHighlights.length > 0) {
    contextParts.push("\n\nDados de mercado:");
    context.marketHighlights.forEach((m) => {
      contextParts.push(`- ${m.indicator.replace(/_/g, " ")}: ${m.value}`);
    });
  }

  contextParts.push(`\n\nSite: ${APP_URL}`);
  contextParts.push("EIN: 99-4852466 | 501(c)(6) | Registrada em Set 2024");

  return contextParts.join("\n");
}

export async function generateBotResponse(
  userMessage: string,
  senderPhone?: string,
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>,
  customSystemPrompt?: string
): Promise<string> {
  if (!BOT_API_KEY) {
    return `Desculpe, o assistente virtual está temporariamente indisponível. Por favor, acesse ${APP_URL} ou envie email para contato.`;
  }

  const context = await gatherBotContext(senderPhone);
  const systemPrompt = buildSystemPrompt(context, customSystemPrompt);

  const messages = [
    { role: "system", content: systemPrompt },
    ...(conversationHistory || []),
    { role: "user", content: userMessage },
  ];

  try {
    const res = await fetch(`${BOT_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BOT_API_KEY}`,
      },
      body: JSON.stringify({
        model: BOT_MODEL,
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      console.error("Bot API error:", res.status, await res.text());
      return "Desculpe, não consegui processar sua mensagem. Tente novamente em alguns minutos.";
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "Desculpe, não consegui gerar uma resposta.";
  } catch (err) {
    console.error("Bot error:", err);
    return "Desculpe, ocorreu um erro. Por favor, tente novamente.";
  }
}
