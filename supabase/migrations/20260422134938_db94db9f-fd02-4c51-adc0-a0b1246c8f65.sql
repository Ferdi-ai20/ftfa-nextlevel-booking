
-- Restrict public update of attendance: only within 30 minutes of creation
DROP POLICY IF EXISTS "Public update own attendance" ON public.weekly_attendance;
CREATE POLICY "Public update recent attendance" ON public.weekly_attendance
  FOR UPDATE TO anon, authenticated
  USING (created_at > now() - interval '30 minutes')
  WITH CHECK (created_at > now() - interval '30 minutes');

-- Tighten attendance insert with basic validation
DROP POLICY IF EXISTS "Public insert attendance" ON public.weekly_attendance;
CREATE POLICY "Public insert attendance" ON public.weekly_attendance
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status IN ('confirmed','cancelled')
    AND session_date >= CURRENT_DATE
    AND session_date <= CURRENT_DATE + interval '60 days'
  );
