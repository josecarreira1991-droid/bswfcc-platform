-- Migration 010: Fix RLS policies + atomic counter function
-- Fixes: CR #1 (DM RLS), CR #2 (post delete for authors), CR #3 (race conditions)

-- ═══════════════════════════════════════════════════════════════════════
-- 1. Atomic counter function for posts (likes_count, comments_count)
-- ═══════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION increment_post_counter(
  post_id UUID,
  column_name TEXT,
  amount INT DEFAULT 1
) RETURNS VOID AS $$
BEGIN
  IF column_name = 'likes_count' THEN
    UPDATE posts SET likes_count = GREATEST(0, likes_count + amount) WHERE id = post_id;
  ELSIF column_name = 'comments_count' THEN
    UPDATE posts SET comments_count = GREATEST(0, comments_count + amount) WHERE id = post_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ═══════════════════════════════════════════════════════════════════════
-- 2. Fix posts DELETE policy — allow authors to delete their own posts
-- ═══════════════════════════════════════════════════════════════════════

DO $$
BEGIN
  -- Drop existing delete policy if any
  DROP POLICY IF EXISTS "Admins can delete posts" ON posts;
  DROP POLICY IF EXISTS "Authors and admins can delete posts" ON posts;
END $$;

CREATE POLICY "Authors and admins can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING (
    author_id = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
    OR
    (SELECT role FROM members WHERE email = auth.jwt()->>'email' LIMIT 1) IN ('presidente', 'vice_presidente', 'secretario', 'tesoureiro', 'diretor_marketing', 'diretor_tecnologia', 'diretor_inovacao', 'diretor')
  );

-- ═══════════════════════════════════════════════════════════════════════
-- 3. Fix direct_messages and direct_conversations RLS
--    Replace USING(true) with participant-scoped policies
-- ═══════════════════════════════════════════════════════════════════════

-- Direct Conversations: drop overly permissive policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view their conversations" ON direct_conversations;
  DROP POLICY IF EXISTS "Users can create conversations" ON direct_conversations;
  DROP POLICY IF EXISTS "Users can update their conversations" ON direct_conversations;
  DROP POLICY IF EXISTS "Authenticated users can read conversations" ON direct_conversations;
  DROP POLICY IF EXISTS "Authenticated users can create conversations" ON direct_conversations;
  DROP POLICY IF EXISTS "Authenticated users can update conversations" ON direct_conversations;
END $$;

CREATE POLICY "Users can view their own conversations"
  ON direct_conversations FOR SELECT
  TO authenticated
  USING (
    participant_1 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
    OR
    participant_2 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
  );

CREATE POLICY "Users can create conversations they participate in"
  ON direct_conversations FOR INSERT
  TO authenticated
  WITH CHECK (
    participant_1 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
    OR
    participant_2 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
  );

CREATE POLICY "Users can update their own conversations"
  ON direct_conversations FOR UPDATE
  TO authenticated
  USING (
    participant_1 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
    OR
    participant_2 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
  );

-- Direct Messages: drop overly permissive policies
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can view messages in their conversations" ON direct_messages;
  DROP POLICY IF EXISTS "Users can send messages" ON direct_messages;
  DROP POLICY IF EXISTS "Users can update their messages" ON direct_messages;
  DROP POLICY IF EXISTS "Authenticated users can read messages" ON direct_messages;
  DROP POLICY IF EXISTS "Authenticated users can create messages" ON direct_messages;
  DROP POLICY IF EXISTS "Authenticated users can update messages" ON direct_messages;
END $$;

CREATE POLICY "Users can view messages in their conversations"
  ON direct_messages FOR SELECT
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM direct_conversations
      WHERE participant_1 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
         OR participant_2 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON direct_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
    AND conversation_id IN (
      SELECT id FROM direct_conversations
      WHERE participant_1 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
         OR participant_2 = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
    )
  );

CREATE POLICY "Users can update their own messages"
  ON direct_messages FOR UPDATE
  TO authenticated
  USING (
    sender_id = (SELECT id FROM members WHERE email = auth.jwt()->>'email' LIMIT 1)
  );
