-- 009: Feed / Mural de Comunicação + Oportunidades de Negócios
-- Central communication channel for members and leadership

CREATE TYPE post_category AS ENUM (
  'anuncio',
  'oportunidade',
  'parceria',
  'evento',
  'discussao',
  'geral'
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  category post_category NOT NULL DEFAULT 'geral',
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_opportunity BOOLEAN NOT NULL DEFAULT false,    -- highlighted in opportunities section
  opportunity_type TEXT,                             -- 'oferta' | 'procura' (what I offer / what I need)
  tags TEXT[] DEFAULT '{}',
  likes_count INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,         -- soft moderation
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, member_id)
);

-- Indexes
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category);
CREATE INDEX idx_posts_pinned ON posts(is_pinned) WHERE is_pinned = true;
CREATE INDEX idx_posts_opportunity ON posts(is_opportunity) WHERE is_opportunity = true;
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_post_comments_post ON post_comments(post_id);
CREATE INDEX idx_post_likes_post ON post_likes(post_id);
CREATE INDEX idx_post_likes_member ON post_likes(member_id);

-- RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;

-- All authenticated members can read visible posts
CREATE POLICY "Members can read visible posts"
  ON posts FOR SELECT TO authenticated
  USING (is_visible = true);

-- Members can create posts
CREATE POLICY "Members can create posts"
  ON posts FOR INSERT TO authenticated
  WITH CHECK (
    author_id = (SELECT id FROM members WHERE email = (current_setting('request.jwt.claims', true)::json ->> 'email'))
  );

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts"
  ON posts FOR UPDATE TO authenticated
  USING (
    author_id = (SELECT id FROM members WHERE email = (current_setting('request.jwt.claims', true)::json ->> 'email'))
  );

-- Admins can update any post (pin, moderate)
CREATE POLICY "Admins can update any post"
  ON posts FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.email = (current_setting('request.jwt.claims', true)::json ->> 'email')
      AND m.role IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_tecnologia', 'diretor_marketing', 'head_automation')
    )
  );

-- Admins can delete posts
CREATE POLICY "Admins can delete posts"
  ON posts FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.email = (current_setting('request.jwt.claims', true)::json ->> 'email')
      AND m.role IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_tecnologia', 'diretor_marketing', 'head_automation')
    )
  );

-- Comments: all members can read
CREATE POLICY "Members can read visible comments"
  ON post_comments FOR SELECT TO authenticated
  USING (is_visible = true);

-- Members can create comments
CREATE POLICY "Members can create comments"
  ON post_comments FOR INSERT TO authenticated
  WITH CHECK (
    author_id = (SELECT id FROM members WHERE email = (current_setting('request.jwt.claims', true)::json ->> 'email'))
  );

-- Admins can update/delete comments (moderation)
CREATE POLICY "Admins can update comments"
  ON post_comments FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM members m
      WHERE m.email = (current_setting('request.jwt.claims', true)::json ->> 'email')
      AND m.role IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_tecnologia', 'diretor_marketing', 'head_automation')
    )
  );

-- Likes: all members can read
CREATE POLICY "Members can read likes"
  ON post_likes FOR SELECT TO authenticated
  USING (true);

-- Members can like
CREATE POLICY "Members can like posts"
  ON post_likes FOR INSERT TO authenticated
  WITH CHECK (
    member_id = (SELECT id FROM members WHERE email = (current_setting('request.jwt.claims', true)::json ->> 'email'))
  );

-- Members can unlike (delete own like)
CREATE POLICY "Members can unlike posts"
  ON post_likes FOR DELETE TO authenticated
  USING (
    member_id = (SELECT id FROM members WHERE email = (current_setting('request.jwt.claims', true)::json ->> 'email'))
  );
