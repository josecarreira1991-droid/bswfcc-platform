-- 008: Referral Rewards / Bonificação por Indicações
-- Tracks rewards earned by members through successful referrals

CREATE TYPE referral_reward_type AS ENUM (
  'discount_10',
  'discount_20',
  'free_renewal',
  'vip_ambassador',
  'lifetime_ambassador'
);

CREATE TYPE referral_reward_status AS ENUM (
  'earned',
  'redeemed',
  'expired'
);

CREATE TABLE referral_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  reward_type referral_reward_type NOT NULL,
  status referral_reward_status NOT NULL DEFAULT 'earned',
  milestone INT NOT NULL,                -- number of approved referrals that triggered this
  discount_pct INT NOT NULL DEFAULT 0,   -- 10, 20, 100 etc.
  label TEXT NOT NULL,                   -- human-readable description
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,                -- optional expiration
  redeemed_by UUID REFERENCES members(id), -- admin who marked as redeemed
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_referral_rewards_member ON referral_rewards(member_id);
CREATE INDEX idx_referral_rewards_status ON referral_rewards(status);

-- RLS
ALTER TABLE referral_rewards ENABLE ROW LEVEL SECURITY;

-- Members can see their own rewards
CREATE POLICY "Members can view own rewards"
  ON referral_rewards FOR SELECT TO authenticated
  USING (member_id = (SELECT id FROM members WHERE email = (current_setting('request.jwt.claims', true)::json ->> 'email')));

-- Admins can view all rewards
CREATE POLICY "Admins can view all rewards"
  ON referral_rewards FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.email = (current_setting('request.jwt.claims', true)::json ->> 'email')
      AND m.role IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_tecnologia', 'diretor_marketing', 'head_automation')
    )
  );

-- Admins can insert rewards (granted by system via server action)
CREATE POLICY "Admins can insert rewards"
  ON referral_rewards FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.email = (current_setting('request.jwt.claims', true)::json ->> 'email')
      AND m.role IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_tecnologia', 'diretor_marketing', 'head_automation')
    )
  );

-- Admins can update rewards (redeem, expire)
CREATE POLICY "Admins can update rewards"
  ON referral_rewards FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.email = (current_setting('request.jwt.claims', true)::json ->> 'email')
      AND m.role IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_tecnologia', 'diretor_marketing', 'head_automation')
    )
  );
