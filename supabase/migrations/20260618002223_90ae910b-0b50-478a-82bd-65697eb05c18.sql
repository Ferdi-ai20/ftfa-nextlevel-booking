CREATE INDEX IF NOT EXISTS player_goals_profile_created_idx ON public.player_goals (profile_id, created_at DESC);
CREATE INDEX IF NOT EXISTS player_homework_profile_assigned_idx ON public.player_homework (profile_id, assigned_at DESC);
CREATE INDEX IF NOT EXISTS player_coach_notes_profile_created_idx ON public.player_coach_notes (profile_id, created_at DESC);