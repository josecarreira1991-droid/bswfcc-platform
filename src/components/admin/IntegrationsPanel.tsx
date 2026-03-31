"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Wifi, WifiOff, QrCode, RefreshCw, Play, Square,
  CreditCard, Mail, Database, CheckCircle2, XCircle, Clock,
} from "lucide-react";

interface WahaStatus {
  status: "connected" | "disconnected" | "qr_pending" | "error";
  qrCode?: string | null;
  phone?: string | null;
  error?: string;
}

export default function IntegrationsPanel() {
  const [wahaStatus, setWahaStatus] = useState<WahaStatus>({ status: "disconnected" });
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);

  async function checkWahaStatus() {
    setLoading(true);
    try {
      const res = await fetch("/api/waha/status");
      if (res.ok) {
        const data = await res.json();
        setWahaStatus(data);
      } else {
        setWahaStatus({ status: "error", error: "Waha não acessível" });
      }
    } catch {
      setWahaStatus({ status: "error", error: "Falha na conexão com Waha" });
    }
    setLoading(false);
  }

  async function startWahaSession() {
    setLoading(true);
    try {
      const res = await fetch("/api/waha/session", { method: "POST", body: JSON.stringify({ action: "start" }) });
      if (res.ok) {
        toast.success("Sessão iniciada. Aguarde o QR code...");
        setPolling(true);
      } else {
        toast.error("Falha ao iniciar sessão");
      }
    } catch {
      toast.error("Erro ao conectar com Waha");
    }
    setLoading(false);
  }

  async function stopWahaSession() {
    setLoading(true);
    try {
      const res = await fetch("/api/waha/session", { method: "POST", body: JSON.stringify({ action: "stop" }) });
      if (res.ok) {
        toast.success("Sessão encerrada");
        setWahaStatus({ status: "disconnected" });
        setPolling(false);
      }
    } catch {
      toast.error("Erro ao desconectar");
    }
    setLoading(false);
  }

  useEffect(() => {
    checkWahaStatus();
  }, []);

  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(async () => {
      await checkWahaStatus();
    }, 3000);
    return () => clearInterval(interval);
  }, [polling]);

  useEffect(() => {
    if (wahaStatus.status === "connected") {
      setPolling(false);
    }
  }, [wahaStatus.status]);

  const stripeConfigured = !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

  const StatusIcon = ({ ok }: { ok: boolean | "pending" }) =>
    ok === true
      ? <CheckCircle2 size={14} className="text-emerald-400" />
      : ok === "pending"
        ? <Clock size={14} className="text-amber-400" />
        : <XCircle size={14} className="text-red-400" />;

  return (
    <div className="space-y-4">
      {/* WhatsApp / Waha */}
      <div className="bg-corp-card border border-corp-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-corp-text">WhatsApp (Waha)</h3>
            <span className={`flex items-center gap-1 text-[11px] font-medium ${
              wahaStatus.status === "connected" ? "text-emerald-400" :
              wahaStatus.status === "qr_pending" ? "text-amber-400" :
              "text-red-400"
            }`}>
              {wahaStatus.status === "connected" ? <Wifi size={11} /> : <WifiOff size={11} />}
              {wahaStatus.status === "connected" ? "Conectado" :
               wahaStatus.status === "qr_pending" ? "Aguardando QR" :
               wahaStatus.status === "error" ? "Erro" :
               "Desconectado"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={checkWahaStatus}
              disabled={loading}
              className="p-1.5 text-corp-muted hover:text-corp-text hover:bg-white/[0.03] rounded-lg transition-colors disabled:opacity-50"
              title="Atualizar status"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
            {wahaStatus.status === "disconnected" || wahaStatus.status === "error" ? (
              <button
                onClick={startWahaSession}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 rounded-lg hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              >
                <Play size={12} /> Conectar
              </button>
            ) : wahaStatus.status === "connected" ? (
              <button
                onClick={stopWahaSession}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/15 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                <Square size={12} /> Desconectar
              </button>
            ) : null}
          </div>
        </div>

        {wahaStatus.status === "connected" && wahaStatus.phone && (
          <p className="text-xs text-corp-muted">Número: +{wahaStatus.phone}</p>
        )}

        {wahaStatus.error && (
          <p className="text-xs text-red-400 mt-2">{wahaStatus.error}</p>
        )}

        {/* QR Code Display */}
        {(wahaStatus.status === "qr_pending" || wahaStatus.qrCode) && wahaStatus.qrCode && (
          <div className="mt-4 flex flex-col items-center gap-3 p-4 bg-white/[0.03] rounded-xl">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(wahaStatus.qrCode)}`}
              alt="WhatsApp QR Code"
              width={250}
              height={250}
              className="rounded-lg"
            />
            <p className="text-xs text-corp-muted text-center">
              Abra o WhatsApp no celular da câmara e escaneie este QR code
            </p>
          </div>
        )}

        {wahaStatus.status === "disconnected" && !wahaStatus.error && (
          <div className="mt-3 text-xs text-corp-muted space-y-1">
            <p>Para conectar o WhatsApp:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-corp-muted/70">
              <li>Certifique-se que o Waha está rodando na VPS</li>
              <li>Clique em "Conectar" acima</li>
              <li>Escaneie o QR code com o WhatsApp Business da câmara</li>
            </ol>
          </div>
        )}
      </div>

      {/* Other Integrations */}
      <div className="bg-corp-card border border-corp-border rounded-xl p-5">
        <h3 className="text-sm font-medium text-corp-text mb-3">Status das Integrações</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-corp-border">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-corp-muted" />
              <span className="text-sm text-corp-muted">Supabase</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusIcon ok={true} />
              <span className="text-xs text-emerald-400">Conectado</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-corp-border">
            <div className="flex items-center gap-2">
              <Wifi size={14} className="text-corp-muted" />
              <span className="text-sm text-corp-muted">WhatsApp</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusIcon ok={wahaStatus.status === "connected"} />
              <span className={`text-xs ${wahaStatus.status === "connected" ? "text-emerald-400" : "text-red-400"}`}>
                {wahaStatus.status === "connected" ? "Conectado" : "Desconectado"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-corp-border">
            <div className="flex items-center gap-2">
              <CreditCard size={14} className="text-corp-muted" />
              <span className="text-sm text-corp-muted">Stripe</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusIcon ok={stripeConfigured ? true : "pending"} />
              <span className={`text-xs ${stripeConfigured ? "text-emerald-400" : "text-amber-400"}`}>
                {stripeConfigured ? "Configurado" : "Pendente"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-corp-muted" />
              <span className="text-sm text-corp-muted">Email (SMTP)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <StatusIcon ok={"pending"} />
              <span className="text-xs text-amber-400">Pendente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
