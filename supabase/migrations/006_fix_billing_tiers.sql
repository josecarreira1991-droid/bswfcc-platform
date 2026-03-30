-- BSWFCC Platform — Migration 006: Fix Billing Tiers
-- Corrects tier names, prices, and adds missing Trustee tier
-- Prices in CENTS (e.g., 5000 = $50.00)
-- Run this in Supabase SQL Editor on VPS 187.77.210.204:3000

-- 1. Update Community tier — was $0, should be $50/mês
UPDATE public.membership_tiers
SET price_monthly = 5000, price_yearly = 60000,
    description = 'Acesso básico à plataforma e networking',
    features = ARRAY['Mixers mensais de networking', 'Diretório de membros', 'Newsletter semanal', 'Introduções básicas entre membros']
WHERE slug = 'community';

-- 2. Deactivate "Member" tier — replaced by updated Community
UPDATE public.membership_tiers
SET is_active = false
WHERE slug = 'member';

-- 3. Rename "Business Partner" → "Business" and fix price — was $25, should be $150/mês
UPDATE public.membership_tiers
SET name = 'Business',
    slug = 'business',
    price_monthly = 15000,
    price_yearly = 180000,
    description = 'Networking avançado + workshops + diretório completo',
    features = ARRAY['Tudo do Community', 'Workshops trimestrais', 'Tours SeaPort Manatee', 'Seminários jurídicos e fiscais', 'Diretório completo BR-FL (500+ empresas)', 'Match Score inteligente'],
    sort_order = 2
WHERE slug = 'business_partner';

-- 4. Update Executive tier — was $50, should be $500/mês
UPDATE public.membership_tiers
SET price_monthly = 50000, price_yearly = 600000,
    description = 'Consultoria 1:1 + relatórios exclusivos + prioridade',
    features = ARRAY['Tudo do Business', 'Consultoria 1:1 personalizada', 'Suporte para entrada no mercado brasileiro', 'Relatórios de inteligência exclusivos', 'Prioridade em eventos e workshops'],
    sort_order = 3
WHERE slug = 'executive';

-- 5. Insert Trustee tier — $1,500/mês (new)
INSERT INTO public.membership_tiers (name, slug, description, price_monthly, price_yearly, features, sort_order)
VALUES (
  'Trustee', 'trustee',
  'Acesso total + conselho consultivo + missões internacionais',
  150000, 1800000,
  ARRAY['Tudo do Executive', 'Acesso ao conselho consultivo', 'Missões comerciais internacionais', 'Gerente de conta dedicado', 'Voto em decisões estratégicas', 'Logo em materiais oficiais'],
  4
) ON CONFLICT (slug) DO UPDATE SET
  price_monthly = 150000,
  price_yearly = 1800000,
  features = EXCLUDED.features,
  description = EXCLUDED.description,
  is_active = true;
