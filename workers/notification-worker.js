/**
 * Notification Worker — BSWFCC
 *
 * Sends scheduled notifications:
 * - Event reminders (24h before)
 * - Welcome emails for newly approved members
 * - Pending member alerts for admins
 *
 * Runs daily at 8 AM EST via PM2 cron.
 *
 * Env vars:
 * - NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * - SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM
 * - WAHA_API_URL, WAHA_API_KEY, WAHA_SESSION_NAME (optional for WhatsApp)
 * - NEXT_PUBLIC_APP_URL
 */

require("dotenv").config({ path: __dirname + "/.env" });
const { createClient } = require("@supabase/supabase-js");
const nodemailer = require("nodemailer");

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_FROM = process.env.SMTP_FROM || "BSWFCC <noreply@bswfcc.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://bswfcc.quantrexnow.io";
const WAHA_URL = process.env.WAHA_API_URL || "";
const WAHA_KEY = process.env.WAHA_API_KEY || "";
const WAHA_SESSION = process.env.WAHA_SESSION_NAME || "bswfcc";

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("[notifications] Missing SUPABASE env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

let transporter = null;
if (SMTP_HOST && SMTP_PASS) {
  if (SMTP_HOST === "resend") {
    // Resend uses fetch, not nodemailer
    transporter = "resend";
  } else {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
}

// ─── Email Sending ───

async function sendEmail(to, subject, html) {
  if (!transporter) {
    console.log(`[notifications] Email not configured. Skipped: ${subject} → ${to}`);
    return false;
  }

  try {
    if (transporter === "resend") {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${SMTP_PASS}` },
        body: JSON.stringify({ from: SMTP_FROM, to: [to], subject, html }),
      });
      return res.ok;
    }

    await transporter.sendMail({ from: SMTP_FROM, to, subject, html });
    return true;
  } catch (err) {
    console.error(`[notifications] Email error (${to}):`, err.message);
    return false;
  }
}

// ─── WhatsApp Sending ───

async function sendWhatsApp(phone, text) {
  if (!WAHA_URL) return false;
  try {
    const chatId = phone.replace(/[^0-9]/g, "") + "@c.us";
    const res = await fetch(`${WAHA_URL}/api/sendText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(WAHA_KEY ? { "X-Api-Key": WAHA_KEY } : {}),
      },
      body: JSON.stringify({ session: WAHA_SESSION, chatId, text }),
    });
    return res.ok;
  } catch (err) {
    console.error(`[notifications] WhatsApp error (${phone}):`, err.message);
    return false;
  }
}

// ─── Email Template ───

function wrapEmail(content) {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0A1628;font-family:Inter,system-ui,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:40px 20px;">
    <div style="text-align:center;margin-bottom:24px;">
      <span style="font-size:20px;font-weight:700;color:#C9A84C;">BSWFCC</span>
      <p style="color:#64748b;font-size:11px;margin:4px 0 0;">Brazilian SouthWest Florida Chamber of Commerce</p>
    </div>
    <div style="background:#1B2A4A;border:1px solid rgba(148,163,184,0.15);border-radius:12px;padding:32px;color:#e2e8f0;font-size:14px;line-height:1.6;">
      ${content}
    </div>
    <p style="text-align:center;color:#475569;font-size:11px;margin-top:24px;">BSWFCC | 501(c)(6) | bswfcc.quantrexnow.io</p>
  </div>
</body></html>`;
}

// ─── Task: Event Reminders (24h before) ───

async function sendEventReminders() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data: events } = await supabase
    .from("events")
    .select("id, title, date, time, location")
    .eq("date", tomorrowStr);

  if (!events || events.length === 0) {
    console.log("[notifications] No events tomorrow");
    return 0;
  }

  // Fetch all registrations for tomorrow's events in one query
  const eventIds = events.map((e) => e.id);
  const { data: allRegistrations } = await supabase
    .from("event_registrations")
    .select("event_id, member_id, members(email, full_name, phone)")
    .in("event_id", eventIds)
    .eq("status", "confirmado");

  if (!allRegistrations || allRegistrations.length === 0) return 0;

  // Group registrations by event
  const byEvent = {};
  for (const reg of allRegistrations) {
    (byEvent[reg.event_id] ??= []).push(reg);
  }

  let sent = 0;
  const logRows = [];

  for (const event of events) {
    const registrations = byEvent[event.id] || [];

    for (const reg of registrations) {
      const member = reg.members;
      if (!member) continue;

      const html = wrapEmail(`
        <h2 style="color:#C9A84C;">Lembrete de Evento</h2>
        <p><strong>${event.title}</strong> é amanhã!</p>
        <p><strong>Data:</strong> ${event.date}</p>
        ${event.time ? `<p><strong>Horário:</strong> ${event.time}</p>` : ""}
        ${event.location ? `<p><strong>Local:</strong> ${event.location}</p>` : ""}
        <p><a href="${APP_URL}/eventos" style="display:inline-block;padding:12px 24px;background:#C9A84C;color:#0A1628;text-decoration:none;border-radius:8px;font-weight:600;">Ver Detalhes</a></p>
      `);

      const emailOk = await sendEmail(member.email, `Lembrete: ${event.title} é amanhã!`, html);

      let waOk = false;
      if (member.phone) {
        waOk = await sendWhatsApp(
          member.phone,
          `🗓 Lembrete BSWFCC: "${event.title}" é amanhã!${event.time ? ` Horário: ${event.time}` : ""}${event.location ? ` Local: ${event.location}` : ""}\n\n${APP_URL}/eventos`
        );
      }

      if (emailOk) sent++;

      logRows.push({
        member_id: reg.member_id,
        channel: emailOk && waOk ? "both" : emailOk ? "email" : waOk ? "whatsapp" : "none",
        content: `Lembrete: ${event.title}`,
        subject: `Lembrete: ${event.title} é amanhã!`,
        status: emailOk || waOk ? "sent" : "failed",
      });
    }
  }

  // Batch insert all logs
  if (logRows.length > 0) {
    await supabase.from("notification_log").insert(logRows);
  }

  return sent;
}

// ─── Task: Pending Member Alerts ───

async function alertPendingMembers() {
  const { data: pending } = await supabase
    .from("members")
    .select("id, full_name, created_at")
    .eq("status", "pendente");

  if (!pending || pending.length === 0) return 0;

  // Get admin emails
  const adminRoles = ["presidente", "vice_presidente", "secretario", "tesoureiro", "diretor_tecnologia", "diretor_marketing", "head_automation"];
  const { data: admins } = await supabase
    .from("members")
    .select("email, full_name")
    .in("role", adminRoles)
    .eq("status", "ativo");

  if (!admins || admins.length === 0) return 0;

  const pendingList = pending
    .map((m) => `• ${m.full_name} (${new Date(m.created_at).toLocaleDateString("pt-BR")})`)
    .join("<br>");

  const html = wrapEmail(`
    <h2 style="color:#C9A84C;">Membros Pendentes de Aprovação</h2>
    <p>Existem <strong>${pending.length}</strong> membros aguardando aprovação:</p>
    <p style="background:rgba(0,0,0,0.2);padding:12px;border-radius:8px;">${pendingList}</p>
    <p><a href="${APP_URL}/membros" style="display:inline-block;padding:12px 24px;background:#C9A84C;color:#0A1628;text-decoration:none;border-radius:8px;font-weight:600;">Aprovar Membros</a></p>
  `);

  let sent = 0;
  for (const admin of admins) {
    const ok = await sendEmail(admin.email, `BSWFCC: ${pending.length} membros pendentes`, html);
    if (ok) sent++;
  }

  return sent;
}

// ─── Task: Weekly Digest (Sundays only) ───

async function sendWeeklyDigest() {
  const today = new Date();
  if (today.getDay() !== 0) return 0; // Only on Sundays

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString();

  const [{ count: newMembers }, { data: upcomingEvents }, { count: totalActive }] = await Promise.all([
    supabase.from("members").select("id", { count: "exact", head: true }).gte("created_at", weekAgoStr),
    supabase.from("events").select("title, date, time").gte("date", today.toISOString().split("T")[0]).order("date").limit(3),
    supabase.from("members").select("id", { count: "exact", head: true }).eq("status", "ativo"),
  ]);

  const eventsList = (upcomingEvents || [])
    .map((e) => `• ${e.title} — ${e.date}${e.time ? ` às ${e.time}` : ""}`)
    .join("<br>") || "Nenhum evento agendado";

  const html = wrapEmail(`
    <h2 style="color:#C9A84C;">Resumo Semanal BSWFCC</h2>
    <p><strong>${totalActive || 0}</strong> membros ativos | <strong>${newMembers || 0}</strong> novos esta semana</p>
    <h3 style="color:#C9A84C;margin-top:16px;">Próximos Eventos</h3>
    <p>${eventsList}</p>
    <p><a href="${APP_URL}/dashboard" style="display:inline-block;padding:12px 24px;background:#C9A84C;color:#0A1628;text-decoration:none;border-radius:8px;font-weight:600;">Abrir Dashboard</a></p>
  `);

  // Send to all active members
  const { data: members } = await supabase
    .from("members")
    .select("email")
    .eq("status", "ativo");

  let sent = 0;
  for (const m of members || []) {
    const ok = await sendEmail(m.email, "BSWFCC — Resumo Semanal", html);
    if (ok) sent++;
    // Rate limit: 100ms between emails
    await new Promise((r) => setTimeout(r, 100));
  }

  return sent;
}

// ─── Main ───

async function run() {
  console.log(`[notifications] Starting at ${new Date().toISOString()}`);

  const [reminders, pendingAlerts, digest] = await Promise.all([
    sendEventReminders().catch((err) => { console.error("[notifications] Reminders error:", err.message); return 0; }),
    alertPendingMembers().catch((err) => { console.error("[notifications] Pending alerts error:", err.message); return 0; }),
    sendWeeklyDigest().catch((err) => { console.error("[notifications] Digest error:", err.message); return 0; }),
  ]);

  console.log(`[notifications] Done — Reminders: ${reminders}, Pending alerts: ${pendingAlerts}, Digest: ${digest}`);
}

run().catch((err) => {
  console.error("[notifications] Fatal:", err);
  process.exit(1);
});
