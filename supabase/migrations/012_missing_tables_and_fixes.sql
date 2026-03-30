-- Migration 012: Create missing tables + atomic referral_count increment
-- Tables: referral_codes, direct_conversations, direct_messages, chat_channels, chat_messages
-- Function: increment_referral_count (atomic counter)
-- Also: add tier_slug column to members if missing

-- ═══════════════════════════════════════════════════════════
-- 1. Referral Codes table
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS referral_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  is_active BOOLEAN DEFAULT true,
  used_by UUID REFERENCES members(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_referral_codes_member ON referral_codes(member_id);
CREATE INDEX IF NOT EXISTS idx_referral_codes_code ON referral_codes(code);
CREATE INDEX IF NOT EXISTS idx_referral_codes_active ON referral_codes(is_active);

ALTER TABLE referral_codes ENABLE ROW LEVEL SECURITY;

-- Members can view their own codes
DO $$ BEGIN
  CREATE POLICY "Members view own codes" ON referral_codes FOR SELECT TO authenticated
  USING (member_id = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Admins can view all codes
DO $$ BEGIN
  CREATE POLICY "Admins view all codes" ON referral_codes FOR SELECT TO authenticated
  USING ((SELECT role FROM members WHERE email = auth.jwt()->>'email' LIMIT 1) IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_marketing', 'diretor_tecnologia', 'diretor_inovacao', 'diretor'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Authenticated users can insert (code generation)
DO $$ BEGIN
  CREATE POLICY "Auth users insert codes" ON referral_codes FOR INSERT TO authenticated
  WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Update own codes or via service role
DO $$ BEGIN
  CREATE POLICY "Update codes" ON referral_codes FOR UPDATE TO authenticated
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════
-- 2. Direct Conversations table
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS direct_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

CREATE INDEX IF NOT EXISTS idx_dc_participant_1 ON direct_conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_dc_participant_2 ON direct_conversations(participant_2);

ALTER TABLE direct_conversations ENABLE ROW LEVEL SECURITY;

-- Participant-scoped policies (already created in migration 010 — safe to skip if exist)
DO $$ BEGIN
  CREATE POLICY "DC select participants" ON direct_conversations FOR SELECT TO authenticated
  USING (
    participant_1 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
    OR participant_2 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "DC insert participants" ON direct_conversations FOR INSERT TO authenticated
  WITH CHECK (
    participant_1 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
    OR participant_2 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "DC update participants" ON direct_conversations FOR UPDATE TO authenticated
  USING (
    participant_1 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
    OR participant_2 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════
-- 3. Direct Messages table
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS direct_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES direct_conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  media_url TEXT,
  media_type TEXT,
  media_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dm_conversation ON direct_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_dm_sender ON direct_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_dm_created ON direct_messages(created_at);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "DM select participants" ON direct_messages FOR SELECT TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM direct_conversations
      WHERE participant_1 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
         OR participant_2 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "DM insert sender" ON direct_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════
-- 4. Chat Channels table (Group Chat)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_by UUID REFERENCES members(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Channels viewable by auth" ON chat_channels FOR SELECT TO authenticated
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Channels insert by admin" ON chat_channels FOR INSERT TO authenticated
  WITH CHECK ((SELECT role FROM members WHERE email = auth.jwt()->>'email' LIMIT 1) IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_marketing', 'diretor_tecnologia', 'diretor_inovacao', 'diretor'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Channels update by admin" ON chat_channels FOR UPDATE TO authenticated
  USING ((SELECT role FROM members WHERE email = auth.jwt()->>'email' LIMIT 1) IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_marketing', 'diretor_tecnologia', 'diretor_inovacao', 'diretor'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Channels delete by admin" ON chat_channels FOR DELETE TO authenticated
  USING ((SELECT role FROM members WHERE email = auth.jwt()->>'email' LIMIT 1) IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_marketing', 'diretor_tecnologia', 'diretor_inovacao', 'diretor'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════
-- 5. Chat Messages table (Group Chat)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type TEXT,
  media_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cm_channel ON chat_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_cm_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_cm_created ON chat_messages(created_at);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Chat msgs viewable by auth" ON chat_messages FOR SELECT TO authenticated
  USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Chat msgs insert by auth" ON chat_messages FOR INSERT TO authenticated
  WITH CHECK (sender_id = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Chat msgs delete own or admin" ON chat_messages FOR DELETE TO authenticated
  USING (
    sender_id = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
    OR (SELECT role FROM members WHERE email = auth.jwt()->>'email' LIMIT 1) IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_marketing', 'diretor_tecnologia', 'diretor_inovacao', 'diretor')
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════
-- 6. Atomic referral_count increment function
-- ═══════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION increment_referral_count(member_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE members SET referral_count = COALESCE(referral_count, 0) + 1 WHERE id = member_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════
-- 7. Add tier_slug column to members (if not exists)
-- ═══════════════════════════════════════════════════════════
DO $$ BEGIN
  ALTER TABLE members ADD COLUMN IF NOT EXISTS tier_slug TEXT DEFAULT 'community';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ═══════════════════════════════════════════════════════════
-- 8. Add storage bucket for chat media (if not exists)
-- ═══════════════════════════════════════════════════════════
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat-media', 'chat-media', true)
ON CONFLICT (id) DO NOTHING;
