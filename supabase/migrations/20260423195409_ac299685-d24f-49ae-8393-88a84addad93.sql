
ALTER TABLE public.app_settings
  ADD COLUMN IF NOT EXISTS calendly_url_1on1 text,
  ADD COLUMN IF NOT EXISTS calendly_url_duo text,
  ADD COLUMN IF NOT EXISTS calendly_url_group text,
  ADD COLUMN IF NOT EXISTS calendly_url_trial text;

CREATE TABLE IF NOT EXISTS public.external_bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source text NOT NULL DEFAULT 'calendly',
  player_id uuid REFERENCES public.players(id) ON DELETE SET NULL,
  parent_user_id uuid,
  invitee_email text,
  invitee_name text,
  training_type text,
  scheduled_at timestamptz NOT NULL,
  ends_at timestamptz,
  status text NOT NULL DEFAULT 'active',
  event_uri text NOT NULL UNIQUE,
  raw jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS external_bookings_scheduled_at_idx ON public.external_bookings(scheduled_at);
CREATE INDEX IF NOT EXISTS external_bookings_player_idx ON public.external_bookings(player_id);

ALTER TABLE public.external_bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage external bookings"
  ON public.external_bookings FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Parents view own external bookings"
  ON public.external_bookings FOR SELECT
  TO authenticated
  USING (
    parent_user_id = auth.uid()
    OR player_id IN (SELECT id FROM public.players WHERE parent_user_id = auth.uid())
  );

CREATE POLICY "Service role manages external bookings"
  ON public.external_bookings FOR ALL
  TO public
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE TRIGGER external_bookings_set_updated_at
  BEFORE UPDATE ON public.external_bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
