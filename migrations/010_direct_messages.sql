-- Direct message conversations between members
CREATE TABLE IF NOT EXISTS public.direct_conversations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  participant_1 uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  participant_2 uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  last_message text,
  last_message_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(participant_1, participant_2)
);

-- Direct messages
CREATE TABLE IF NOT EXISTS public.direct_messages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES direct_conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  content text NOT NULL,
  read_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_dm_conv_participants ON direct_conversations(participant_1, participant_2);
CREATE INDEX idx_dm_conv_last_msg ON direct_conversations(last_message_at DESC);
CREATE INDEX idx_dm_messages_conv ON direct_messages(conversation_id, created_at);
CREATE INDEX idx_dm_messages_sender ON direct_messages(sender_id);
CREATE INDEX idx_dm_messages_unread ON direct_messages(conversation_id) WHERE read_at IS NULL;

-- RLS
ALTER TABLE direct_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own conversations" ON direct_conversations FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Users create conversations" ON direct_conversations FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "Users update own conversations" ON direct_conversations FOR UPDATE TO authenticated
  USING (true);

ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see messages in their conversations" ON direct_messages FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Users send messages" ON direct_messages FOR INSERT TO authenticated
  WITH CHECK (true);
CREATE POLICY "Users update own messages" ON direct_messages FOR UPDATE TO authenticated
  USING (true);

-- Trigger to update conversation last_message
CREATE OR REPLACE FUNCTION update_direct_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE direct_conversations SET
    last_message = NEW.content,
    last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_direct_conversation
  AFTER INSERT ON direct_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_direct_conversation_on_message();
