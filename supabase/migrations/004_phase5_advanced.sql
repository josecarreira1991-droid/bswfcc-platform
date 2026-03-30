-- BSWFCC Platform — Phase 5: Advanced Features
-- Business Matchmaking, Document Center, QR Check-in, Referrals, Voting, Networking AI

-- ============================================
-- BUSINESS PROFILES (for matchmaking)
-- Extended member business info
-- ============================================
CREATE TABLE IF NOT EXISTS public.business_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT,
  business_type TEXT CHECK (business_type IN ('product', 'service', 'both', 'other')),
  description TEXT,
  services_offered TEXT[] DEFAULT '{}',
  services_needed TEXT[] DEFAULT '{}',
  target_industries TEXT[] DEFAULT '{}',
  languages TEXT[] DEFAULT ARRAY['en', 'pt'],
  website TEXT,
  year_established INTEGER,
  employee_count TEXT,
  revenue_range TEXT,
  looking_for TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- MATCH REQUESTS
-- Member-to-member connection requests
-- ============================================
CREATE TABLE IF NOT EXISTS public.match_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  to_member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  match_score INTEGER,
  match_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (from_member_id, to_member_id)
);

-- ============================================
-- DOCUMENTS
-- Shared document center
-- ============================================
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('legal', 'financial', 'marketing', 'operations', 'compliance', 'templates', 'guides', 'reports', 'general')),
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  access_level TEXT NOT NULL DEFAULT 'member'
    CHECK (access_level IN ('public', 'member', 'business_partner', 'executive', 'admin')),
  uploaded_by UUID REFERENCES public.members(id) ON DELETE SET NULL,
  download_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- EVENT CHECK-INS (QR-based)
-- ============================================
CREATE TABLE IF NOT EXISTS public.event_checkins (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  check_in_method TEXT DEFAULT 'qr' CHECK (check_in_method IN ('qr', 'manual', 'auto')),
  notes TEXT,
  UNIQUE (event_id, member_id)
);

-- Add QR code field to events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS qr_code TEXT;
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS check_in_enabled BOOLEAN DEFAULT false;

-- ============================================
-- REFERRALS
-- Member-to-member referral tracking
-- ============================================
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  referred_name TEXT NOT NULL,
  referred_email TEXT,
  referred_phone TEXT,
  referred_company TEXT,
  referred_member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'contacted', 'registered', 'active', 'declined')),
  notes TEXT,
  reward_given BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- POLLS / VOTING
-- ============================================
CREATE TABLE IF NOT EXISTS public.polls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'single' CHECK (type IN ('single', 'multiple', 'ranked')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
  created_by UUID REFERENCES public.members(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  is_anonymous BOOLEAN DEFAULT false,
  eligible_roles TEXT[] DEFAULT ARRAY['presidente','vice_presidente','secretario','tesoureiro','diretor_marketing','diretor_tecnologia','diretor_inovacao','diretor','membro','parceiro_estrategico','voluntario'],
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.poll_options (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.poll_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  poll_id UUID NOT NULL REFERENCES public.polls(id) ON DELETE CASCADE,
  option_id UUID NOT NULL REFERENCES public.poll_options(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  rank_position INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (poll_id, member_id, option_id)
);

-- ============================================
-- NETWORKING SUGGESTIONS (AI-generated)
-- ============================================
CREATE TABLE IF NOT EXISTS public.networking_suggestions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  suggested_member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  reasons TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'seen', 'connected', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (member_id, suggested_member_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.business_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Business profiles viewable by authenticated" ON public.business_profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Business profiles manageable by authenticated" ON public.business_profiles FOR ALL TO authenticated USING (true);

ALTER TABLE public.match_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Match requests viewable by authenticated" ON public.match_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Match requests insertable by authenticated" ON public.match_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Match requests updatable by authenticated" ON public.match_requests FOR UPDATE TO authenticated USING (true);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Documents viewable by authenticated" ON public.documents FOR SELECT TO authenticated USING (true);
CREATE POLICY "Documents manageable by authenticated" ON public.documents FOR ALL TO authenticated USING (true);

ALTER TABLE public.event_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Checkins viewable by authenticated" ON public.event_checkins FOR SELECT TO authenticated USING (true);
CREATE POLICY "Checkins insertable by authenticated" ON public.event_checkins FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Referrals viewable by authenticated" ON public.referrals FOR SELECT TO authenticated USING (true);
CREATE POLICY "Referrals manageable by authenticated" ON public.referrals FOR ALL TO authenticated USING (true);

ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Polls viewable by authenticated" ON public.polls FOR SELECT TO authenticated USING (true);
CREATE POLICY "Polls manageable by authenticated" ON public.polls FOR ALL TO authenticated USING (true);

ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Poll options viewable by authenticated" ON public.poll_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "Poll options manageable by authenticated" ON public.poll_options FOR ALL TO authenticated USING (true);

ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Poll votes viewable by authenticated" ON public.poll_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Poll votes insertable by authenticated" ON public.poll_votes FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE public.networking_suggestions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Suggestions viewable by authenticated" ON public.networking_suggestions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Suggestions manageable by authenticated" ON public.networking_suggestions FOR ALL TO authenticated USING (true);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_business_profiles_member ON public.business_profiles(member_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_visible ON public.business_profiles(is_visible);
CREATE INDEX IF NOT EXISTS idx_match_requests_from ON public.match_requests(from_member_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_to ON public.match_requests(to_member_id);
CREATE INDEX IF NOT EXISTS idx_match_requests_status ON public.match_requests(status);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_access ON public.documents(access_level);
CREATE INDEX IF NOT EXISTS idx_event_checkins_event ON public.event_checkins(event_id);
CREATE INDEX IF NOT EXISTS idx_event_checkins_member ON public.event_checkins(member_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);
CREATE INDEX IF NOT EXISTS idx_polls_status ON public.polls(status);
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll ON public.poll_votes(poll_id);
CREATE INDEX IF NOT EXISTS idx_poll_votes_member ON public.poll_votes(member_id);
CREATE INDEX IF NOT EXISTS idx_networking_member ON public.networking_suggestions(member_id);
CREATE INDEX IF NOT EXISTS idx_networking_status ON public.networking_suggestions(status);
