
-- ============ DROP OLD TABLES ============
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.booking_window_slots CASCADE;
DROP TABLE IF EXISTS public.booking_windows CASCADE;
DROP TABLE IF EXISTS public.weekly_confirmations CASCADE;
DROP TABLE IF EXISTS public.weekly_attendance CASCADE;
DROP TABLE IF EXISTS public.fixed_sunday_slots CASCADE;
DROP TABLE IF EXISTS public.fixed_players CASCADE;
DROP TABLE IF EXISTS public.waitlist CASCADE;
DROP TABLE IF EXISTS public.waitlist_entry_tags CASCADE;
DROP TABLE IF EXISTS public.waitlist_entries CASCADE;
DROP TABLE IF EXISTS public.external_bookings CASCADE;
DROP TABLE IF EXISTS public.players CASCADE;

-- ============ ENUMS ============
DO $$ BEGIN
  CREATE TYPE public.profile_status AS ENUM ('pending', 'active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.player_status AS ENUM ('active', 'inactive');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.training_type AS ENUM ('one_on_one', 'duo', 'small_group', 'bvo_small_group', 'trial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.slot_visibility AS ENUM ('private', 'public', 'hidden');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.slot_status AS ENUM ('open', 'reserved', 'booked', 'cancelled', 'expired');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.booking_status AS ENUM (
    'confirmed', 'pending_review', 'pending_payment',
    'cancelled_by_player', 'cancelled_by_admin', 'no_show', 'completed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_status AS ENUM ('not_required', 'unpaid', 'paid', 'refunded');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.payment_method AS ENUM ('cash', 'bank_transfer', 'tikkie', 'online');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.application_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ PROFILES: add status ============
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status public.profile_status NOT NULL DEFAULT 'pending';

-- ============ PLAYERS ============
CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  player_name TEXT NOT NULL,
  birth_year INT,
  club TEXT,
  team TEXT,
  position TEXT,
  status public.player_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.players TO authenticated;
GRANT ALL ON public.players TO service_role;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "players_select_own" ON public.players FOR SELECT TO authenticated
  USING (parent_profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "players_admin_all" ON public.players FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "players_parent_insert" ON public.players FOR INSERT TO authenticated
  WITH CHECK (parent_profile_id = auth.uid());
CREATE POLICY "players_parent_update" ON public.players FOR UPDATE TO authenticated
  USING (parent_profile_id = auth.uid()) WITH CHECK (parent_profile_id = auth.uid());

CREATE TRIGGER players_set_updated_at BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX players_parent_idx ON public.players(parent_profile_id);

-- ============ TRAINING SLOTS ============
CREATE TABLE public.training_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  training_type public.training_type NOT NULL,
  visibility public.slot_visibility NOT NULL DEFAULT 'private',
  status public.slot_status NOT NULL DEFAULT 'open',
  max_players INT NOT NULL DEFAULT 1 CHECK (max_players >= 1 AND max_players <= 50),
  price_per_player NUMERIC(10,2),
  location TEXT,
  admin_note TEXT,
  player_note TEXT,
  auto_public_enabled BOOLEAN NOT NULL DEFAULT false,
  auto_public_hours_before INT NOT NULL DEFAULT 24,
  auto_public_min_bookings_threshold INT NOT NULL DEFAULT 1,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.training_slots TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_slots TO authenticated;
GRANT ALL ON public.training_slots TO service_role;
ALTER TABLE public.training_slots ENABLE ROW LEVEL SECURITY;

-- guests: only see public+open+future slots
CREATE POLICY "slots_public_select" ON public.training_slots FOR SELECT TO anon
  USING (visibility = 'public' AND status = 'open' AND (date + start_time) > now());
-- authenticated active players & guests: see public + private (not hidden); admins see all
CREATE POLICY "slots_auth_select" ON public.training_slots FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR visibility IN ('private', 'public')
  );
CREATE POLICY "slots_admin_write" ON public.training_slots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER slots_set_updated_at BEFORE UPDATE ON public.training_slots
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX slots_date_idx ON public.training_slots(date, start_time);
CREATE INDEX slots_visibility_status_idx ON public.training_slots(visibility, status);

-- ============ BOOKINGS ============
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES public.training_slots(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  guest_name TEXT,
  guest_email TEXT,
  guest_phone TEXT,
  guest_birth_year INT,
  guest_club TEXT,
  guest_team TEXT,
  guest_position TEXT,
  guest_goal TEXT,
  guest_notes TEXT,
  status public.booking_status NOT NULL DEFAULT 'confirmed',
  payment_status public.payment_status NOT NULL DEFAULT 'not_required',
  payment_method public.payment_method,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.bookings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- guests: insert pending_review for public slots only; cannot select
CREATE POLICY "bookings_guest_insert" ON public.bookings FOR INSERT TO anon
  WITH CHECK (
    status = 'pending_review'
    AND profile_id IS NULL
    AND player_id IS NULL
    AND guest_email IS NOT NULL
    AND guest_name IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.training_slots s
      WHERE s.id = slot_id
        AND s.visibility = 'public'
        AND s.status = 'open'
        AND (s.date + s.start_time) > now()
    )
  );

-- authenticated players: see/manage own bookings
CREATE POLICY "bookings_select_own" ON public.bookings FOR SELECT TO authenticated
  USING (profile_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "bookings_insert_own" ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (
    profile_id = auth.uid()
    AND status IN ('confirmed', 'pending_payment', 'pending_review')
  );

CREATE POLICY "bookings_update_own_cancel" ON public.bookings FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid() AND status = 'cancelled_by_player');

CREATE POLICY "bookings_admin_all" ON public.bookings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER bookings_set_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX bookings_slot_idx ON public.bookings(slot_id);
CREATE INDEX bookings_profile_idx ON public.bookings(profile_id);

-- ============ BOOKING VALIDATION TRIGGER ============
CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  s RECORD;
  current_count INT;
  active_states public.booking_status[] := ARRAY['confirmed','pending_review','pending_payment']::public.booking_status[];
BEGIN
  -- Only validate when adding an "active" booking
  IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.status = ANY(active_states) AND OLD.status <> NEW.status) THEN
    SELECT * INTO s FROM public.training_slots WHERE id = NEW.slot_id FOR UPDATE;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Slot not found';
    END IF;
    IF s.status <> 'open' THEN
      RAISE EXCEPTION 'Slot is not open for booking';
    END IF;
    IF (s.date + s.start_time) <= now() THEN
      RAISE EXCEPTION 'Slot has already passed';
    END IF;
    -- private slot needs active player
    IF s.visibility = 'private' THEN
      IF NEW.profile_id IS NULL THEN
        RAISE EXCEPTION 'Private slots require an authenticated active player';
      END IF;
      IF NOT EXISTS (
        SELECT 1 FROM public.profiles p
        WHERE p.id = NEW.profile_id AND p.status = 'active'
      ) AND NOT public.has_role(NEW.profile_id, 'admin') THEN
        RAISE EXCEPTION 'Only active players can book private slots';
      END IF;
    END IF;
    -- capacity
    SELECT COUNT(*) INTO current_count
    FROM public.bookings
    WHERE slot_id = NEW.slot_id
      AND status = ANY(active_states)
      AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
    IF current_count >= s.max_players THEN
      RAISE EXCEPTION 'Slot is full';
    END IF;
    -- duplicate booking for same profile on same slot
    IF NEW.profile_id IS NOT NULL THEN
      IF EXISTS (
        SELECT 1 FROM public.bookings
        WHERE slot_id = NEW.slot_id
          AND profile_id = NEW.profile_id
          AND status = ANY(active_states)
          AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      ) THEN
        RAISE EXCEPTION 'You already have a booking for this slot';
      END IF;
      -- overlap check
      IF EXISTS (
        SELECT 1 FROM public.bookings b
        JOIN public.training_slots os ON os.id = b.slot_id
        WHERE b.profile_id = NEW.profile_id
          AND b.status = ANY(active_states)
          AND b.id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
          AND os.date = s.date
          AND os.start_time < s.end_time
          AND os.end_time > s.start_time
      ) THEN
        RAISE EXCEPTION 'You have another booking that overlaps with this time';
      END IF;
    END IF;
    -- auto-set slot to booked when full
    IF (current_count + 1) >= s.max_players THEN
      UPDATE public.training_slots SET status = 'booked' WHERE id = s.id;
    END IF;
  END IF;

  -- On cancel: free up slot if it was marked booked
  IF TG_OP = 'UPDATE'
     AND OLD.status = ANY(active_states)
     AND NEW.status IN ('cancelled_by_player','cancelled_by_admin') THEN
    UPDATE public.training_slots SET status = 'open'
    WHERE id = NEW.slot_id AND status = 'booked';
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER bookings_validate
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking();

-- on delete: free slot
CREATE OR REPLACE FUNCTION public.bookings_after_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.training_slots SET status = 'open'
  WHERE id = OLD.slot_id AND status = 'booked';
  RETURN OLD;
END;
$$;
CREATE TRIGGER bookings_free_slot AFTER DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.bookings_after_delete();

-- ============ APPLICATIONS ============
CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_name TEXT NOT NULL,
  player_name TEXT NOT NULL,
  birth_year INT,
  email TEXT NOT NULL,
  phone TEXT,
  club TEXT,
  team TEXT,
  position TEXT,
  goal TEXT,
  notes TEXT,
  status public.application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.applications TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications_guest_insert" ON public.applications FOR INSERT TO anon
  WITH CHECK (status = 'pending');
CREATE POLICY "applications_auth_insert" ON public.applications FOR INSERT TO authenticated
  WITH CHECK (status = 'pending');
CREATE POLICY "applications_admin_all" ON public.applications FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER applications_set_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ FEEDBACK ============
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  slot_id UUID REFERENCES public.training_slots(id) ON DELETE SET NULL,
  feedback_text TEXT,
  development_points TEXT,
  strengths TEXT,
  visible_to_player BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT ALL ON public.feedback TO service_role;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "feedback_parent_select" ON public.feedback FOR SELECT TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR (visible_to_player = true AND EXISTS (
      SELECT 1 FROM public.players p
      WHERE p.id = player_id AND p.parent_profile_id = auth.uid()
    ))
  );
CREATE POLICY "feedback_admin_all" ON public.feedback FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER feedback_set_updated_at BEFORE UPDATE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
