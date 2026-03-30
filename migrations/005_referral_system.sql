-- 005_referral_system.sql
-- Referral/Affiliate system for BSWFCC

-- Referral codes table
CREATE TABLE IF NOT EXISTS referral_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  member_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  code text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  used_by uuid REFERENCES members(id),
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_referral_codes_code ON referral_codes(code);
CREATE INDEX idx_referral_codes_member ON referral_codes(member_id);

-- Add business profile fields to members (if they don't exist)
DO $$ BEGIN
  ALTER TABLE members ADD COLUMN IF NOT EXISTS website text;
  ALTER TABLE members ADD COLUMN IF NOT EXISTS linkedin_url text;
  ALTER TABLE members ADD COLUMN IF NOT EXISTS instagram text;
  ALTER TABLE members ADD COLUMN IF NOT EXISTS facebook text;
  ALTER TABLE members ADD COLUMN IF NOT EXISTS ein text;
  ALTER TABLE members ADD COLUMN IF NOT EXISTS bio text;
  ALTER TABLE members ADD COLUMN IF NOT EXISTS services_offered text[];
  ALTER TABLE members ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES members(id);
  ALTER TABLE members ADD COLUMN IF NOT EXISTS referral_count int DEFAULT 0;
END $$;
