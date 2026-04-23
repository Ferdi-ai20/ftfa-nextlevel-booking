-- Unique index so upsert/update on (player_id, session_date) is reliable
CREATE UNIQUE INDEX IF NOT EXISTS weekly_confirmations_player_session_uniq
  ON public.weekly_confirmations (player_id, session_date);

-- Realtime support
ALTER TABLE public.weekly_confirmations REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'weekly_confirmations'
  ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.weekly_confirmations';
  END IF;
END $$;