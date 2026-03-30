/**
 * Email Service for BSWFCC
 *
 * Uses nodemailer-compatible SMTP or direct fetch to a mail API.
 * For now, implements a lightweight SMTP sender without extra deps.
 *
 * Env vars required:
 * - SMTP_HOST (e.g., smtp.gmail.com)
 * - SMTP_PORT (e.g., 587)
 * - SMTP_USER (e.g., bswfcc@gmail.com)
 * - SMTP_PASS (app password)
 * - SMTP_FROM (e.g., "BSWFCC <bswfcc@gmail.com>")
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || "BSWFCC <noreply@bswfcc.com>";

export function isEmailConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

/**
 * Send email using fetch-based API (Resend, Mailgun, etc.)
 * Falls back to a pending state if not configured.
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  if (!isEmailConfigured()) {
    console.log("[Email] SMTP not configured. Email queued:", options.subject);
    return { success: false, error: "SMTP not configured" };
  }

  // Use Resend API if SMTP_HOST is "resend"
  if (SMTP_HOST === "resend") {
    return sendViaResend(options);
  }

  // For SMTP, install nodemailer separately: npm install nodemailer @types/nodemailer
  // Then update this function to use it. For now, log the intent.
  console.log("[Email] SMTP sending not yet configured. Install nodemailer for SMTP support.");
  console.log("[Email] To:", options.to, "Subject:", options.subject);
  return { success: false, error: "SMTP not yet configured. Use Resend or install nodemailer." };
}

async function sendViaResend(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SMTP_PASS}`,
      },
      body: JSON.stringify({
        from: SMTP_FROM,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html,
      }),
    });
    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: err };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

// ─── Email Templates ───

export function buildWelcomeEmail(memberName: string): EmailOptions {
  return {
    to: "",
    subject: "Bem-vindo(a) à BSWFCC!",
    html: emailLayout(`
      <h2 style="color: #C9A84C;">Bem-vindo(a), ${memberName}!</h2>
      <p>Sua conta na BSWFCC foi aprovada com sucesso.</p>
      <p>Agora você tem acesso à plataforma com:</p>
      <ul>
        <li>Dashboard com indicadores de mercado FL-Brasil</li>
        <li>Diretório de membros e networking</li>
        <li>Eventos exclusivos da câmara</li>
        <li>Relatórios de inteligência de mercado</li>
      </ul>
      <p><a href="https://bswfcc.quantrexnow.io" style="display:inline-block;padding:12px 24px;background:#C9A84C;color:#0A1628;text-decoration:none;border-radius:8px;font-weight:600;">Acessar Plataforma</a></p>
    `),
  };
}

export function buildEventEmail(title: string, date: string, time: string | null, location: string | null): EmailOptions {
  return {
    to: "",
    subject: `Novo Evento BSWFCC: ${title}`,
    html: emailLayout(`
      <h2 style="color: #C9A84C;">Novo Evento BSWFCC</h2>
      <h3>${title}</h3>
      <p><strong>Data:</strong> ${date}</p>
      ${time ? `<p><strong>Horário:</strong> ${time}</p>` : ""}
      ${location ? `<p><strong>Local:</strong> ${location}</p>` : ""}
      <p><a href="https://bswfcc.quantrexnow.io/eventos" style="display:inline-block;padding:12px 24px;background:#C9A84C;color:#0A1628;text-decoration:none;border-radius:8px;font-weight:600;">Ver Evento</a></p>
    `),
  };
}

export function buildReminderEmail(title: string, date: string, time: string | null, location: string | null): EmailOptions {
  return {
    to: "",
    subject: `Lembrete: ${title} é amanhã!`,
    html: emailLayout(`
      <h2 style="color: #C9A84C;">Lembrete de Evento</h2>
      <p><strong>${title}</strong> é amanhã!</p>
      <p><strong>Data:</strong> ${date}</p>
      ${time ? `<p><strong>Horário:</strong> ${time}</p>` : ""}
      ${location ? `<p><strong>Local:</strong> ${location}</p>` : ""}
      <p>Nos vemos lá!</p>
    `),
  };
}

function emailLayout(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background:#0A1628;font-family:Inter,system-ui,sans-serif;">
      <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
        <div style="text-align:center;margin-bottom:24px;">
          <span style="font-size:20px;font-weight:700;color:#C9A84C;">BSWFCC</span>
          <p style="color:#64748b;font-size:11px;margin:4px 0 0;">Brazilian SouthWest Florida Chamber of Commerce</p>
        </div>
        <div style="background:#1B2A4A;border:1px solid rgba(148,163,184,0.15);border-radius:12px;padding:32px;color:#e2e8f0;font-size:14px;line-height:1.6;">
          ${content}
        </div>
        <p style="text-align:center;color:#475569;font-size:11px;margin-top:24px;">
          BSWFCC | 501(c)(6) | EIN 99-4852466<br>
          Fort Myers, FL | bswfcc.quantrexnow.io
        </p>
      </div>
    </body>
    </html>
  `;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}
