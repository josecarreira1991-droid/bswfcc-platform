-- Group chat channels
CREATE TABLE IF NOT EXISTS public.chat_channels (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  is_default boolean DEFAULT false,
  created_by uuid REFERENCES members(id),
  created_at timestamptz DEFAULT now()
);

-- Group chat messages (supports text + media)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  channel_id uuid NOT NULL REFERENCES chat_channels(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  content text,
  media_url text,
  media_type text CHECK (media_type IN ('image', 'video', 'file')),
  media_name text,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_channel ON chat_messages(channel_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);

ALTER TABLE chat_channels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read channels" ON chat_channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can create channels" ON chat_channels FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members can read messages" ON chat_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Members can send messages" ON chat_messages FOR INSERT TO authenticated WITH CHECK (true);

-- Seed: default general channel
INSERT INTO chat_channels (name, description, is_default)
VALUES ('Geral', 'Canal principal da BSWFCC — todos os membros', true)
ON CONFLICT DO NOTHING;

-- Add media columns to existing direct_messages
ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS media_type text;
ALTER TABLE direct_messages ADD COLUMN IF NOT EXISTS media_name text;
