import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionStatus, getQRCode } from "@/lib/services/waha";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = await getSessionStatus();
  let qrCode = null;

  // If Waha is unreachable, return friendly disconnected status
  if (status.status === "error") {
    return NextResponse.json({
      status: "disconnected",
      error: "Servidor WhatsApp (Waha) não está acessível. Verifique se o container está rodando.",
      qrCode: null,
    });
  }

  if (status.status === "qr_pending" || status.status === "disconnected") {
    qrCode = await getQRCode();
  }

  return NextResponse.json({ ...status, qrCode });
}
