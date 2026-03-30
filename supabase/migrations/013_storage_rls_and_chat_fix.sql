-- ═══════════════════════════════════════════════════════════════════
-- Migration 013: Storage RLS policies + direct_messages fix
-- Fix 1: Add UPDATE policy for storage (upsert support)
-- Fix 2: Make direct_messages.content nullable (file-only messages)
-- ═══════════════════════════════════════════════════════════════════

-- Ensure bucket exists and is public (for reads via public URL)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('chat-media', 'chat-media', true, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (idempotent: skip if already exist)
DO $$ BEGIN
  -- INSERT: authenticated users can upload
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_upload' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY storage_upload ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'chat-media');
  END IF;

  -- SELECT: public can read
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_read' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY storage_read ON storage.objects FOR SELECT TO public USING (bucket_id = 'chat-media');
  END IF;

  -- UPDATE: authenticated users can update (needed for upsert)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_update' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY storage_update ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'chat-media') WITH CHECK (bucket_id = 'chat-media');
  END IF;

  -- DELETE: authenticated users can delete
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'storage_delete' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY storage_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'chat-media');
  END IF;
END $$;

-- Fix: direct_messages.content must be nullable for file-only messages
ALTER TABLE direct_messages ALTER COLUMN content DROP NOT NULL;
