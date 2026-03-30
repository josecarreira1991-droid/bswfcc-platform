/**
 * Waha WhatsApp API Service
 *
 * Waha runs as a Docker container on VPS 187.77.210.204
 * Default port: 3001 (configured to avoid conflict with Supabase Studio on 3000)
 *
 * Env vars required:
 * - WAHA_API_URL (e.g., http://187.77.210.204:3001)
 * - WAHA_API_KEY (set in Waha config)
 * - WAHA_SESSION_NAME (default: "bswfcc")
 */

const WAHA_URL = process.env.WAHA_API_URL || "http://187.77.210.204:3001";
const WAHA_KEY = process.env.WAHA_API_KEY || "";
const SESSION = process.env.WAHA_SESSION_NAME || "bswfcc";

function headers() {
  return {
    "Content-Type": "application/json",
    ...(WAHA_KEY ? { "X-Api-Key": WAHA_KEY } : {}),
  };
}

// ─── Session Management ───

export async function getSessionStatus() {
  try {
    const res = await fetch(`${WAHA_URL}/api/sessions/${SESSION}`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return { status: "disconnected" as const, error: `HTTP ${res.status}` };
    const data = await res.json();
    return {
      status: data.status as "connected" | "disconnected" | "qr_pending",
      name: data.name,
      phone: data.me?.id?.split("@")[0] || null,
    };
  } catch (err) {
    return { status: "error" as const, error: String(err) };
  }
}

export async function startSession() {
  const res = await fetch(`${WAHA_URL}/api/sessions/${SESSION}/start`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      name: SESSION,
      config: {
        webhooks: [
          {
            url: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/waha`,
            events: ["message", "message.any", "session.status"],
          },
        ],
      },
    }),
  });
  if (!res.ok) throw new Error(`Waha startSession failed: HTTP ${res.status}`);
  return res.json();
}

export async function stopSession() {
  const res = await fetch(`${WAHA_URL}/api/sessions/${SESSION}/stop`, {
    method: "POST",
    headers: headers(),
  });
  if (!res.ok) throw new Error(`Waha stopSession failed: HTTP ${res.status}`);
  return res.json();
}

export async function getQRCode() {
  try {
    const res = await fetch(`${WAHA_URL}/api/${SESSION}/auth/qr`, {
      headers: headers(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.value || null;
  } catch {
    return null;
  }
}

// ─── Sending Messages ───

export async function sendTextMessage(chatId: string, text: string) {
  const res = await fetch(`${WAHA_URL}/api/sendText`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      session: SESSION,
      chatId: formatChatId(chatId),
      text,
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Waha sendText failed: ${err}`);
  }
  return res.json();
}

export async function sendImageMessage(chatId: string, imageUrl: string, caption?: string) {
  const res = await fetch(`${WAHA_URL}/api/sendImage`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      session: SESSION,
      chatId: formatChatId(chatId),
      file: { url: imageUrl },
      caption: caption || "",
    }),
  });
  if (!res.ok) throw new Error("Waha sendImage failed");
  return res.json();
}

// ─── Broadcast ───

export async function broadcastMessage(numbers: string[], text: string) {
  const results: { number: string; success: boolean; error?: string }[] = [];

  for (const number of numbers) {
    try {
      await sendTextMessage(number, text);
      results.push({ number, success: true });
      // Small delay between messages to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1500));
    } catch (err) {
      results.push({ number, success: false, error: String(err) });
    }
  }

  return results;
}

// ─── Helpers ───

function formatChatId(number: string): string {
  // Ensure number is in WhatsApp format: 5511999999999@c.us
  const clean = number.replace(/[^0-9]/g, "");
  if (clean.includes("@")) return clean;
  return `${clean}@c.us`;
}

export function extractPhoneFromChatId(chatId: string): string {
  return chatId.replace("@c.us", "").replace("@s.whatsapp.net", "");
}
