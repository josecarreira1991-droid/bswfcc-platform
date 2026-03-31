"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { register } from "@/lib/actions/auth";
import { validateReferralCode } from "@/lib/actions/referrals";
import { useState, useEffect, Suspense } from "react";
import { UserCheck, ShieldAlert, X } from "lucide-react";

const INPUT_CLASS =
  "w-full px-4 py-3 bg-slate-50 border border-corp-border rounded-lg text-corp-text placeholder-slate-400 focus:border-navy/30 focus:outline-none focus:ring-1 focus:ring-navy/20 transition-colors";
const LABEL_CLASS = "block text-sm text-corp-muted mb-1.5";

const tiers = [
  { value: "membro", slug: "community", label: "Community", price: "$50/mês ($600/ano)", desc: "Mixers mensais, diretório de membros, newsletter, introduções básicas" },
  { value: "membro", slug: "business", label: "Business", price: "$150/mês ($1.800/ano)", desc: "Tudo do Community + workshops trimestrais, tours SeaPort, seminários jurídicos/fiscais" },
  { value: "membro", slug: "executive", label: "Executive", price: "$500/mês ($6.000/ano)", desc: "Tudo do Business + consultoria 1:1, suporte para entrada no mercado brasileiro" },
  { value: "membro", slug: "trustee", label: "Trustee", price: "$1.500/mês ($18.000/ano)", desc: "Tudo do Executive + acesso ao conselho, missões comerciais, gerente dedicado" },
];

const industries = [
  "Construção", "Real Estate", "Restaurante / Food", "Saúde",
  "Tecnologia", "Comércio", "Serviços Profissionais", "Educação",
  "Beleza / Estética", "Automotivo", "Turismo / Hospitality",
  "Advocacia / Legal", "Contabilidade / Finance", "Outro",
];

function RegisterForm() {
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") || "";
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedTier, setSelectedTier] = useState(0);
  const [referrer, setReferrer] = useState<{ full_name: string; company: string | null } | null>(null);
  const [validatingCode, setValidatingCode] = useState(false);
  const [codeChecked, setCodeChecked] = useState(false);
  const [bioLength, setBioLength] = useState(0);
  const [serviceTags, setServiceTags] = useState<string[]>([]);
  const [serviceInput, setServiceInput] = useState("");

  useEffect(() => {
    if (refCode) {
      setValidatingCode(true);
      validateReferralCode(refCode).then((result) => {
        if (result.valid && result.referrer) {
          setReferrer(result.referrer);
        }
        setCodeChecked(true);
        setValidatingCode(false);
      });
    } else {
      setCodeChecked(true);
    }
  }, [refCode]);

  function addServiceTag() {
    const tag = serviceInput.trim();
    if (tag && !serviceTags.includes(tag)) {
      setServiceTags([...serviceTags, tag]);
    }
    setServiceInput("");
  }

  function removeServiceTag(tag: string) {
    setServiceTags(serviceTags.filter((t) => t !== tag));
  }

  function handleServiceKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addServiceTag();
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    if (refCode) {
      formData.set("referral_code", refCode);
    }
    if (serviceTags.length > 0) {
      formData.set("services_offered", serviceTags.join(","));
    }
    try {
      const result = await register(formData);
      if (result?.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch {
      setError("Erro de conexão com o servidor. Tente novamente.");
      setLoading(false);
    }
  }

  // Loading — show spinner while validating the referral code
  if (validatingCode || !codeChecked) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-navy/30 border-t-navy rounded-full animate-spin mx-auto mb-4" />
          <p className="text-corp-muted text-sm">Validando convite...</p>
        </div>
      </div>
    );
  }

  // No referral code — invite-only gate
  if (!refCode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-navy">BSWFCC</Link>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-corp-border shadow-card">
            <div className="w-16 h-16 rounded-full bg-navy/5 border border-navy/15 flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={28} className="text-navy" />
            </div>
            <h2 className="text-2xl font-bold text-corp-text mb-3">Cadastro por Indicação</h2>
            <p className="text-corp-muted mb-6">
              O cadastro na BSWFCC funciona por indicação de membros ativos. Peça seu convite a um membro da câmara para receber seu link exclusivo de cadastro.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 border border-corp-border mb-6">
              <p className="text-sm text-corp-text mb-2 font-medium">Como funciona:</p>
              <ol className="text-sm text-corp-muted space-y-2 text-left">
                {[
                  "Um membro ativo gera um link de convite exclusivo",
                  "Você acessa o link e preenche o formulário de cadastro",
                  "A diretoria revisa e aprova seu perfil",
                  "Você recebe acesso completo e seu próprio código de indicação",
                ].map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-navy font-bold mt-0.5">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/"
                className="px-6 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-light-navy transition-colors"
              >
                Voltar ao Site
              </Link>
              <Link
                href="/login"
                className="px-6 py-3 border border-navy/20 text-navy rounded-xl hover:bg-navy/5 transition-colors"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Invalid referral code
  if (!referrer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg text-center">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold text-navy">BSWFCC</Link>
          </div>
          <div className="bg-white rounded-2xl p-8 border border-red-200 shadow-card">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-6">
              <span className="text-red-600 text-2xl font-bold">!</span>
            </div>
            <h2 className="text-2xl font-bold text-corp-text mb-3">Convite Inválido</h2>
            <p className="text-corp-muted mb-6">
              Este código de convite não é mais válido. Ele pode já ter sido utilizado ou expirado. Entre em contato com a BSWFCC para solicitar um novo convite.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-3 bg-navy text-white font-semibold rounded-xl hover:bg-light-navy transition-colors"
            >
              Voltar ao Site
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-bold text-navy">BSWFCC</Link>
          <p className="text-corp-muted mt-2">Torne-se membro da câmara</p>
        </div>

        {/* Referrer Banner */}
        {referrer && (
          <div className="mb-6 bg-navy/5 border border-navy/15 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-navy/10 flex items-center justify-center flex-shrink-0">
              <UserCheck size={22} className="text-navy" />
            </div>
            <div>
              <p className="text-sm text-navy font-medium">Indicado por {referrer.full_name}</p>
              {referrer.company && <p className="text-xs text-corp-muted">{referrer.company}</p>}
              <p className="text-[10px] text-corp-muted mt-1">Ao se cadastrar, seus serviços serão recomendados a outros membros da rede através do nosso sistema de Matchmaking inteligente.</p>
            </div>
          </div>
        )}

        {/* Membership Tiers */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-navy uppercase tracking-wider mb-4 text-center">Planos de Membership</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {tiers.map((tier, i) => (
              <button
                key={tier.label}
                type="button"
                onClick={() => setSelectedTier(i)}
                className={`rounded-xl p-4 border text-left transition-all ${
                  selectedTier === i
                    ? "border-navy bg-navy/5 shadow-card"
                    : "border-corp-border bg-white hover:border-navy/30"
                }`}
              >
                <p className={`font-semibold text-sm ${selectedTier === i ? "text-navy" : "text-corp-text"}`}>
                  {tier.label}
                </p>
                <p className="text-xs text-corp-muted mt-1">{tier.price}</p>
                <p className="text-[10px] text-corp-muted mt-2 line-clamp-2">{tier.desc}</p>
              </button>
            ))}
          </div>
          <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-corp-border">
            <p className="text-xs text-corp-muted">
              <span className="text-navy font-medium">Informativo:</span> A seleção de tier será confirmada após aprovação. O pagamento é configurado pós-cadastro.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-corp-border shadow-card">
          <h2 className="text-2xl font-bold text-corp-text mb-6">Cadastro Completo</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <form action={handleSubmit} className="space-y-4">
            {/* Hidden role + tier slug for admin to see which plan was selected */}
            <input type="hidden" name="role" value={tiers[selectedTier].value} />
            <input type="hidden" name="tier_slug" value={tiers[selectedTier].slug} />

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label htmlFor="full_name" className={LABEL_CLASS}>Nome Completo *</label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  className={INPUT_CLASS}
                  placeholder="Seu nome completo"
                />
              </div>
              <div>
                <label htmlFor="reg_email" className={LABEL_CLASS}>Email *</label>
                <input
                  id="reg_email"
                  name="email"
                  type="email"
                  required
                  className={INPUT_CLASS}
                  placeholder="seu@email.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className={LABEL_CLASS}>Telefone</label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  className={INPUT_CLASS}
                  placeholder="(239) 000-0000"
                />
              </div>
              <div>
                <label htmlFor="reg_password" className={LABEL_CLASS}>Senha *</label>
                <input
                  id="reg_password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  className={INPUT_CLASS}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
              <div>
                <label htmlFor="company" className={LABEL_CLASS}>Empresa *</label>
                <input
                  id="company"
                  name="company"
                  type="text"
                  required
                  className={INPUT_CLASS}
                  placeholder="Nome da empresa"
                />
              </div>
            </div>

            {/* Business Info */}
            <div className="pt-4 border-t border-corp-border">
              <p className="text-xs font-semibold text-navy uppercase tracking-wider mb-4">Perfil Empresarial</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="website" className={LABEL_CLASS}>Website</label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    className={INPUT_CLASS}
                    placeholder="https://suaempresa.com"
                  />
                </div>
                <div>
                  <label htmlFor="linkedin_url" className={LABEL_CLASS}>LinkedIn URL</label>
                  <input
                    id="linkedin_url"
                    name="linkedin_url"
                    type="url"
                    className={INPUT_CLASS}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label htmlFor="instagram" className={LABEL_CLASS}>Instagram</label>
                  <input
                    id="instagram"
                    name="instagram"
                    type="text"
                    className={INPUT_CLASS}
                    placeholder="@suaempresa"
                  />
                </div>
                <div>
                  <label htmlFor="facebook" className={LABEL_CLASS}>Facebook</label>
                  <input
                    id="facebook"
                    name="facebook"
                    type="text"
                    className={INPUT_CLASS}
                    placeholder="facebook.com/suaempresa"
                  />
                </div>
                <div>
                  <label htmlFor="ein" className={LABEL_CLASS}>EIN (opcional)</label>
                  <input
                    id="ein"
                    name="ein"
                    type="text"
                    className={INPUT_CLASS}
                    placeholder="XX-XXXXXXX"
                  />
                </div>
                <div>
                  <label htmlFor="industry" className={LABEL_CLASS}>Indústria *</label>
                  <select
                    id="industry"
                    name="industry"
                    required
                    className={INPUT_CLASS}
                  >
                    <option value="">Selecione...</option>
                    {industries.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="city" className={LABEL_CLASS}>Cidade *</label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    required
                    className={INPUT_CLASS}
                    placeholder="Fort Myers, Cape Coral..."
                  />
                </div>
              </div>
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className={LABEL_CLASS}>Bio / Sobre a empresa</label>
              <textarea
                id="bio"
                name="bio"
                rows={3}
                maxLength={500}
                onChange={(e) => setBioLength(e.target.value.length)}
                className={`${INPUT_CLASS} resize-none`}
                placeholder="Descreva brevemente sua empresa e o que ela faz..."
              />
              <p className="text-[10px] text-corp-muted text-right mt-1">{bioLength}/500</p>
            </div>

            {/* Services */}
            <div>
              <label className={LABEL_CLASS}>Serviços Oferecidos</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={serviceInput}
                  onChange={(e) => setServiceInput(e.target.value)}
                  onKeyDown={handleServiceKeyDown}
                  className={INPUT_CLASS.replace("w-full", "flex-1")}
                  placeholder="Digite e pressione Enter para adicionar"
                />
                <button
                  type="button"
                  onClick={addServiceTag}
                  className="px-4 py-3 bg-navy/5 text-navy border border-navy/15 rounded-lg hover:bg-navy/10 transition-colors text-sm font-medium"
                >
                  Adicionar
                </button>
              </div>
              {serviceTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {serviceTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-navy/5 text-navy border border-navy/15 rounded-full text-xs font-medium"
                    >
                      {tag}
                      <button type="button" onClick={() => removeServiceTag(tag)} className="hover:text-red-600 transition-colors">
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-corp-muted mt-1">Ex: Pintura, Reforma, Consultoria, Design, Marketing Digital...</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-navy text-white font-semibold rounded-lg hover:bg-light-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>

          <p className="text-xs text-corp-muted mt-4 text-center">
            Seu cadastro será revisado pela diretoria. Status inicial: pendente. A seleção de tier será confirmada após aprovação.
          </p>

          <div className="mt-6 text-center text-sm text-corp-muted">
            Já tem conta?{" "}
            <Link href="/login" className="text-navy hover:text-light-navy font-medium transition-colors">
              Entrar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
