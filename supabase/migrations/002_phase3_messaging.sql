-- BSWFCC Platform — Phase 3: Messaging, Notifications & AI
-- Run this in Supabase SQL Editor on VPS 187.77.210.204:3000

-- ============================================
-- CONVERSATIONS TABLE
-- WhatsApp conversations with members
-- ============================================
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  whatsapp_number TEXT NOT NULL,
  member_name TEXT,
  last_message TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  unread_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'closed', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- MESSAGES TABLE
-- Individual messages in conversations
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  content TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'text'
    CHECK (content_type IN ('text', 'image', 'document', 'audio', 'video', 'location', 'system')),
  whatsapp_message_id TEXT,
  sender_name TEXT,
  is_from_bot BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'sent'
    CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- MESSAGE TEMPLATES TABLE
-- Pre-defined message templates for broadcasts
-- ============================================
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL DEFAULT 'general'
    CHECK (category IN ('welcome', 'event', 'reminder', 'billing', 'general', 'broadcast')),
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- NOTIFICATION LOG TABLE
-- Track all sent notifications (WhatsApp + Email)
-- ============================================
CREATE TABLE IF NOT EXISTS public.notification_log (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'email', 'both')),
  template_id UUID REFERENCES public.message_templates(id) ON DELETE SET NULL,
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced')),
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- WAHA SESSIONS TABLE
-- Track WhatsApp connection sessions
-- ============================================
CREATE TABLE IF NOT EXISTS public.waha_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_name TEXT NOT NULL DEFAULT 'bswfcc',
  status TEXT NOT NULL DEFAULT 'disconnected'
    CHECK (status IN ('connected', 'disconnected', 'qr_pending', 'error')),
  phone_number TEXT,
  qr_code TEXT,
  last_ping TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- AI BOT CONFIG TABLE
-- Bot behavior configuration
-- ============================================
CREATE TABLE IF NOT EXISTS public.bot_config (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  is_active BOOLEAN DEFAULT false,
  model TEXT DEFAULT 'deepseek-chat',
  system_prompt TEXT DEFAULT 'Você é o assistente virtual da BSWFCC (Brazilian SouthWest Florida Chamber of Commerce). Responda em português quando a mensagem for em português, e em inglês quando for em inglês. Seja profissional, cordial e direto. Você tem acesso a informações sobre membros, eventos, dados de mercado e a diretoria da câmara.',
  max_tokens INTEGER DEFAULT 500,
  temperature NUMERIC(3,2) DEFAULT 0.7,
  auto_reply_enabled BOOLEAN DEFAULT true,
  auto_reply_delay_ms INTEGER DEFAULT 2000,
  working_hours_only BOOLEAN DEFAULT false,
  working_hours_start TEXT DEFAULT '08:00',
  working_hours_end TEXT DEFAULT '18:00',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Conversations viewable by authenticated" ON public.conversations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Conversations insertable by authenticated" ON public.conversations FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Conversations updatable by authenticated" ON public.conversations FOR UPDATE TO authenticated USING (true);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Messages viewable by authenticated" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Messages insertable by authenticated" ON public.messages FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Templates viewable by authenticated" ON public.message_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Templates insertable by authenticated" ON public.message_templates FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Templates updatable by authenticated" ON public.message_templates FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Templates deletable by authenticated" ON public.message_templates FOR DELETE TO authenticated USING (true);

ALTER TABLE public.notification_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Notifications viewable by authenticated" ON public.notification_log FOR SELECT TO authenticated USING (true);
CREATE POLICY "Notifications insertable by authenticated" ON public.notification_log FOR INSERT TO authenticated WITH CHECK (true);

ALTER TABLE public.waha_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sessions viewable by authenticated" ON public.waha_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Sessions manageable by authenticated" ON public.waha_sessions FOR ALL TO authenticated USING (true);

ALTER TABLE public.bot_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bot config viewable by authenticated" ON public.bot_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Bot config manageable by authenticated" ON public.bot_config FOR ALL TO authenticated USING (true);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_conversations_member ON public.conversations(member_id);
CREATE INDEX IF NOT EXISTS idx_conversations_whatsapp ON public.conversations(whatsapp_number);
CREATE INDEX IF NOT EXISTS idx_conversations_last_msg ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_direction ON public.messages(direction);
CREATE INDEX IF NOT EXISTS idx_notification_log_member ON public.notification_log(member_id);
CREATE INDEX IF NOT EXISTS idx_notification_log_channel ON public.notification_log(channel);
CREATE INDEX IF NOT EXISTS idx_notification_log_status ON public.notification_log(status);

-- ============================================
-- SEED: DEFAULT TEMPLATES
-- ============================================
INSERT INTO public.message_templates (name, category, content, variables) VALUES
  ('welcome_member', 'welcome',
   'Bem-vindo(a) à BSWFCC, {{member_name}}! 🇧🇷🇺🇸

Sua conta foi aprovada. Agora você tem acesso completo à plataforma.

Acesse: https://bswfcc.quantrexnow.io

Qualquer dúvida, estamos aqui!

— BSWFCC', ARRAY['member_name']),

  ('event_created', 'event',
   'Novo evento BSWFCC! 📅

{{event_title}}
Data: {{event_date}}
Local: {{event_location}}

Inscreva-se: https://bswfcc.quantrexnow.io/eventos

Vagas limitadas!', ARRAY['event_title', 'event_date', 'event_location']),

  ('event_reminder', 'reminder',
   'Lembrete: {{event_title}} é amanhã! ⏰

Data: {{event_date}}
Horário: {{event_time}}
Local: {{event_location}}

Nos vemos lá!', ARRAY['event_title', 'event_date', 'event_time', 'event_location']),

  ('membership_expiring', 'billing',
   'Olá {{member_name}}, sua membership na BSWFCC vence em {{days_left}} dias.

Renove para continuar com acesso completo:
https://bswfcc.quantrexnow.io

Obrigado por fazer parte!', ARRAY['member_name', 'days_left']),

  ('broadcast_general', 'broadcast',
   '{{message}}

— BSWFCC
Brazilian SouthWest Florida Chamber of Commerce', ARRAY['message'])
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- SEED: DEFAULT BOT CONFIG
-- ============================================
INSERT INTO public.bot_config (is_active, model, auto_reply_enabled)
VALUES (false, 'deepseek-chat', false)
ON CONFLICT DO NOTHING;

-- ============================================
-- HELPER FUNCTION: Update conversation on new message
-- ============================================
CREATE OR REPLACE FUNCTION update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations SET
    last_message = NEW.content,
    last_message_at = NEW.created_at,
    unread_count = CASE
      WHEN NEW.direction = 'inbound' THEN unread_count + 1
      ELSE unread_count
    END,
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trigger_update_conversation
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_message();
