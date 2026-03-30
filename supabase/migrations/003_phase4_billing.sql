-- BSWFCC Platform — Phase 4: Billing & Reports
-- Run this in Supabase SQL Editor on VPS 187.77.210.204:3000

-- ============================================
-- MEMBERSHIP TIERS TABLE
-- Defines available plans/tiers
-- ============================================
CREATE TABLE IF NOT EXISTS public.membership_tiers (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_monthly INTEGER NOT NULL DEFAULT 0,
  price_yearly INTEGER DEFAULT 0,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  features TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- SUBSCRIPTIONS TABLE
-- Tracks member subscriptions
-- ============================================
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES public.membership_tiers(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'past_due', 'canceled', 'trialing', 'incomplete', 'free')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (member_id)
);

-- ============================================
-- PAYMENT HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- REPORTS TABLE
-- Generated reports metadata
-- ============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('members', 'events', 'financial', 'market', 'monthly')),
  generated_by UUID REFERENCES public.members(id) ON DELETE SET NULL,
  data JSONB DEFAULT '{}',
  file_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.membership_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Tiers viewable by everyone" ON public.membership_tiers FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Tiers manageable by authenticated" ON public.membership_tiers FOR ALL TO authenticated USING (true);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subscriptions viewable by authenticated" ON public.subscriptions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Subscriptions manageable by authenticated" ON public.subscriptions FOR ALL TO authenticated USING (true);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Payments viewable by authenticated" ON public.payments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Payments insertable by authenticated" ON public.payments FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reports viewable by authenticated" ON public.reports FOR SELECT TO authenticated USING (true);
CREATE POLICY "Reports manageable by authenticated" ON public.reports FOR ALL TO authenticated USING (true);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_subscriptions_member ON public.subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_payments_member ON public.payments(member_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON public.payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON public.payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_type ON public.reports(type);
CREATE INDEX IF NOT EXISTS idx_reports_created ON public.reports(created_at DESC);

-- ============================================
-- ADD tier_slug TO MEMBERS TABLE
-- Links member to their subscription tier
-- ============================================
ALTER TABLE public.members ADD COLUMN IF NOT EXISTS tier_slug TEXT DEFAULT 'community';

-- ============================================
-- SEED: MEMBERSHIP TIERS
-- ============================================
INSERT INTO public.membership_tiers (name, slug, description, price_monthly, price_yearly, features, sort_order) VALUES
  ('Community', 'community', 'Acesso básico à plataforma e networking', 5000, 60000,
   ARRAY['Mixers mensais de networking', 'Diretório de membros', 'Newsletter semanal', 'Introduções básicas entre membros'],
   1),
  ('Business', 'business', 'Networking avançado + workshops + diretório completo', 15000, 180000,
   ARRAY['Tudo do Community', 'Workshops trimestrais', 'Tours SeaPort Manatee', 'Seminários jurídicos e fiscais', 'Diretório completo BR-FL (500+ empresas)', 'Match Score inteligente'],
   2),
  ('Executive', 'executive', 'Consultoria 1:1 + relatórios exclusivos + prioridade', 50000, 600000,
   ARRAY['Tudo do Business', 'Consultoria 1:1 personalizada', 'Suporte para entrada no mercado brasileiro', 'Relatórios de inteligência exclusivos', 'Prioridade em eventos e workshops'],
   3),
  ('Trustee', 'trustee', 'Acesso total + conselho consultivo + missões internacionais', 150000, 1800000,
   ARRAY['Tudo do Executive', 'Acesso ao conselho consultivo', 'Missões comerciais internacionais', 'Gerente de conta dedicado', 'Voto em decisões estratégicas', 'Logo em materiais oficiais'],
   4)
ON CONFLICT (slug) DO NOTHING;
