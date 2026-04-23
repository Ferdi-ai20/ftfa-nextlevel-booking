-- Add preferred training time columns to players
ALTER TABLE public.players
  ADD COLUMN IF NOT EXISTS preferred_time_from text,
  ADD COLUMN IF NOT EXISTS preferred_time_to text;

-- Allow parents to update their own player's preferred time
DROP POLICY IF EXISTS "Parents update own players prefs" ON public.players;
CREATE POLICY "Parents update own players prefs"
ON public.players
FOR UPDATE
TO authenticated
USING (parent_user_id = auth.uid())
WITH CHECK (parent_user_id = auth.uid());