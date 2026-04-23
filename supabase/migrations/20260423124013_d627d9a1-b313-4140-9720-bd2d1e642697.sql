CREATE POLICY "Parents insert notes for own players"
ON public.notes
FOR INSERT
TO authenticated
WITH CHECK (
  author_id = auth.uid()
  AND subject_type = 'player'
  AND subject_id IN (SELECT id FROM public.players WHERE parent_user_id = auth.uid())
);