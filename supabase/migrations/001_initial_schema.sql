-- BSWFCC Platform — Initial Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'membro'
    CHECK (role IN (
      'presidente', 'vice_presidente', 'secretario', 'tesoureiro',
      'diretor_marketing', 'diretor_tecnologia', 'diretor_inovacao',
      'diretor', 'membro', 'parceiro_estrategico', 'voluntario'
    )),
  status TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('ativo', 'pendente', 'inativo')),
  company TEXT,
  industry TEXT,
  city TEXT,
  linkedin TEXT,
  bio TEXT,
  avatar_url TEXT
);

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT,
  location TEXT,
  type TEXT NOT NULL DEFAULT 'outro'
    CHECK (type IN ('networking', 'palestra', 'workshop', 'gala', 'almoco', 'outro')),
  max_attendees INTEGER,
  is_public BOOLEAN DEFAULT true NOT NULL
);

-- ============================================
-- EVENT REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  registered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmado'
    CHECK (status IN ('confirmado', 'cancelado', 'lista_espera')),
  UNIQUE (event_id, member_id)
);

-- ============================================
-- MARKET DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.market_data (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  indicator TEXT NOT NULL,
  value TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- DIRECTORS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.directors (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  profile TEXT NOT NULL,
  linkedin TEXT,
  company TEXT,
  photo_url TEXT,
  order_index INTEGER NOT NULL DEFAULT 0
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Members: authenticated users can read, only self can update own profile
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members are viewable by authenticated users"
  ON public.members FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can insert own profile"
  ON public.members FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Members can update own profile"
  ON public.members FOR UPDATE
  TO authenticated
  USING (email = auth.jwt() ->> 'email');

-- Events: everyone can read public, authenticated can read all
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public events are viewable by everyone"
  ON public.events FOR SELECT
  TO anon
  USING (is_public = true);

CREATE POLICY "All events viewable by authenticated"
  ON public.events FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Directors can create events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Event Registrations: authenticated can manage
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Registrations viewable by authenticated"
  ON public.event_registrations FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Members can register for events"
  ON public.event_registrations FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Members can update own registration"
  ON public.event_registrations FOR UPDATE
  TO authenticated
  USING (member_id IN (
    SELECT id FROM public.members WHERE email = auth.jwt() ->> 'email'
  ));

-- Market Data: read by authenticated
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market data viewable by authenticated"
  ON public.market_data FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Market data insert by authenticated"
  ON public.market_data FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Directors: public read
ALTER TABLE public.directors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Directors viewable by everyone"
  ON public.directors FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Directors insert by authenticated"
  ON public.directors FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_members_email ON public.members(email);
CREATE INDEX IF NOT EXISTS idx_members_role ON public.members(role);
CREATE INDEX IF NOT EXISTS idx_members_status ON public.members(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_type ON public.events(type);
CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON public.event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_member ON public.event_registrations(member_id);
CREATE INDEX IF NOT EXISTS idx_market_data_category ON public.market_data(category);
CREATE INDEX IF NOT EXISTS idx_directors_order ON public.directors(order_index);

-- ============================================
-- SEED DATA: DIRECTORS
-- ============================================
INSERT INTO public.directors (name, role, profile, linkedin, company, order_index) VALUES
  ('Carlo Barbieri Filho', 'Presidente', 'Mais de 40 anos de experiência em comércio internacional, ex-presidente de câmaras de comércio, consultor de empresas com foco em expansão Brasil-EUA.', 'linkedin.com/in/carlobarbieri', 'Consultoria Internacional', 1),
  ('Adriano Diogo', 'Vice-Presidente', 'Profissional com ampla trajetória em gestão e desenvolvimento de negócios internacionais, conectando empresas brasileiras ao mercado da Flórida.', NULL, 'Business Development', 2),
  ('Emerson Brito', 'Secretário', 'Especialista em administração e compliance, responsável pela documentação oficial e processos organizacionais da câmara.', NULL, NULL, 3),
  ('Karlos Oliveira', 'Tesoureiro', 'Profissional financeiro com experiência em gestão contábil e fiscal, responsável pela transparência financeira da BSWFCC.', NULL, NULL, 4),
  ('Juliano Mendes', 'Diretor de Marketing', 'Especialista em marketing digital e branding, lidera as estratégias de comunicação e posicionamento da câmara no mercado.', NULL, 'Marketing Digital', 5),
  ('Andrea Schossler', 'Diretora', 'Líder comunitária ativa na região de Lee County, conectora de negócios e facilitadora de networking entre empresários brasileiros e americanos.', 'linkedin.com/in/andreaschossler', NULL, 6),
  ('Leandro Krug', 'Diretor de Tecnologia', 'Engenheiro de software e empreendedor tech, responsável pela infraestrutura digital e inovação tecnológica da BSWFCC.', NULL, 'Tech Solutions', 7),
  ('Fabiula Fonseca Gervasoni', 'Diretora', 'Profissional multifacetada com experiência em gestão empresarial, contribui para a expansão e fortalecimento da rede da câmara.', NULL, NULL, 8),
  ('Fábio Meira', 'Diretor de Inovação', 'Empreendedor com foco em inovação e novas tecnologias, trazendo soluções criativas para o ecossistema empresarial brasileiro no SWFL.', NULL, NULL, 9),
  ('Gustavo Turra', 'Diretor', 'Empresário com experiência em operações e desenvolvimento de negócios na região do Southwest Florida.', NULL, NULL, 10),
  ('Marcos Vinicius', 'Diretor', 'Profissional com atuação em múltiplos setores, contribuindo com visão estratégica para o crescimento da câmara.', NULL, NULL, 11)
ON CONFLICT DO NOTHING;

-- ============================================
-- SEED DATA: MARKET DATA
-- ============================================
INSERT INTO public.market_data (indicator, value, category, source) VALUES
  ('comercio_bilateral', '$25.6B', 'comercio', 'Enterprise Florida 2024'),
  ('exportacoes_fl_brasil', '$8.2B', 'comercio', 'Enterprise Florida 2024'),
  ('importacoes_brasil_fl', '$17.4B', 'comercio', 'Enterprise Florida 2024'),
  ('ranking_fl_parceiro', '#3', 'comercio', 'Enterprise Florida 2024'),
  ('populacao_lee_county', '894K', 'demografico', 'U.S. Census Bureau 2026 est.'),
  ('brasileiros_lee_county', '15-20K', 'demografico', 'BSWFCC Research 2025'),
  ('crescimento_swfl', '42%', 'demografico', 'Census Bureau 2010-2024'),
  ('msa_cape_coral_fm', '760K+', 'demografico', 'Census Bureau 2024'),
  ('seaport_manatee_tons', '11.8M', 'infraestrutura', 'Port Manatee FY2025'),
  ('aeroporto_rsw', 'RSW', 'infraestrutura', 'Lee County Port Authority'),
  ('membros_bswfcc', '80+', 'bswfcc', 'BSWFCC Registros 2024'),
  ('registro_bswfcc', 'Set 2024', 'bswfcc', 'Florida SunBiz'),
  ('escritorio_fm', 'Fev 2026', 'bswfcc', 'BSWFCC'),
  ('status_fiscal', '501(c)(6)', 'bswfcc', 'IRS')
ON CONFLICT DO NOTHING;
