
-- =====================================================================
-- PHASE 1: FTFA booking system foundation
-- =====================================================================

-- ---------- 1. Drop legacy triggers/policies that depend on old enums
DROP TRIGGER IF EXISTS bookings_validate ON public.bookings;
DROP TRIGGER IF EXISTS bookings_free_slot ON public.bookings;
DROP FUNCTION IF EXISTS public.validate_booking() CASCADE;
DROP FUNCTION IF EXISTS public.bookings_after_delete() CASCADE;

DROP POLICY IF EXISTS bookings_admin_all ON public.bookings;
DROP POLICY IF EXISTS bookings_guest_insert ON public.bookings;
DROP POLICY IF EXISTS bookings_insert_own ON public.bookings;
DROP POLICY IF EXISTS bookings_select_own ON public.bookings;
DROP POLICY IF EXISTS bookings_update_own_cancel ON public.bookings;

DROP POLICY IF EXISTS slots_admin_write ON public.training_slots;
DROP POLICY IF EXISTS slots_auth_select ON public.training_slots;
DROP POLICY IF EXISTS slots_public_select ON public.training_slots;

-- ---------- 2. Drop payment columns + enums
ALTER TABLE public.bookings
  DROP COLUMN IF EXISTS payment_status,
  DROP COLUMN IF EXISTS payment_method;
DROP TYPE IF EXISTS public.payment_status;
DROP TYPE IF EXISTS public.payment_method;

-- ---------- 3. Drop auto-public columns
ALTER TABLE public.training_slots
  DROP COLUMN IF EXISTS auto_public_enabled,
  DROP COLUMN IF EXISTS auto_public_hours_before,
  DROP COLUMN IF EXISTS auto_public_min_bookings_threshold;

-- ---------- 4. Rebuild enums to the simplified set
-- booking_status: confirmed | cancelled
ALTER TABLE public.bookings ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.bookings ALTER COLUMN status TYPE text USING status::text;
DROP TYPE public.booking_status;
CREATE TYPE public.booking_status AS ENUM ('confirmed','cancelled');
UPDATE public.bookings SET status = CASE
  WHEN status IN ('cancelled_by_player','cancelled_by_admin','no_show') THEN 'cancelled'
  ELSE 'confirmed'
END;
ALTER TABLE public.bookings
  ALTER COLUMN status TYPE public.booking_status USING status::public.booking_status,
  ALTER COLUMN status SET DEFAULT 'confirmed';

-- slot_status: open | full | cancelled
ALTER TABLE public.training_slots ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.training_slots ALTER COLUMN status TYPE text USING status::text;
DROP TYPE public.slot_status;
CREATE TYPE public.slot_status AS ENUM ('open','full','cancelled');
UPDATE public.training_slots SET status = CASE
  WHEN status = 'booked' THEN 'full'
  WHEN status = 'reserved' THEN 'open'
  WHEN status = 'expired' THEN 'cancelled'
  ELSE status
END;
ALTER TABLE public.training_slots
  ALTER COLUMN status TYPE public.slot_status USING status::public.slot_status,
  ALTER COLUMN status SET DEFAULT 'open';

-- training_type: one_on_one | duo | small_group
ALTER TABLE public.training_slots ALTER COLUMN training_type TYPE text USING training_type::text;
DROP TYPE public.training_type;
CREATE TYPE public.training_type AS ENUM ('one_on_one','duo','small_group');
UPDATE public.training_slots SET training_type = CASE
  WHEN training_type IN ('bvo_small_group') THEN 'small_group'
  WHEN training_type = 'trial' THEN 'one_on_one'
  ELSE training_type
END;
ALTER TABLE public.training_slots
  ALTER COLUMN training_type TYPE public.training_type USING training_type::public.training_type;

-- profile_status: add 'archived'
ALTER TABLE public.profiles ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.profiles ALTER COLUMN status TYPE text USING status::text;
DROP TYPE public.profile_status;
CREATE TYPE public.profile_status AS ENUM ('pending','active','archived');
UPDATE public.profiles SET status = 'pending' WHERE status NOT IN ('pending','active','archived');
ALTER TABLE public.profiles
  ALTER COLUMN status TYPE public.profile_status USING status::public.profile_status,
  ALTER COLUMN status SET DEFAULT 'pending';

-- ---------- 5. New columns on bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS cancelled_by text NULL,
  ADD COLUMN IF NOT EXISTS cancelled_at timestamptz NULL,
  ADD COLUMN IF NOT EXISTS reminder_sent boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS guest_dob date NULL,
  ADD COLUMN IF NOT EXISTS guest_parent_name text NULL;

-- ---------- 6. Locations table
CREATE TABLE IF NOT EXISTS public.locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NULL,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.locations TO anon, authenticated;
GRANT ALL ON public.locations TO service_role;
GRANT INSERT, UPDATE, DELETE ON public.locations TO authenticated;
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY locations_select_all ON public.locations FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY locations_admin_write ON public.locations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER locations_updated_at BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- 7. New columns on training_slots
ALTER TABLE public.training_slots
  ADD COLUMN IF NOT EXISTS location_id uuid NULL REFERENCES public.locations(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS recurrence text NULL,
  ADD COLUMN IF NOT EXISTS recurrence_group_id uuid NULL,
  ADD COLUMN IF NOT EXISTS recurrence_end_date date NULL;

-- ---------- 8. Sticky note on profiles (DB-side guard, FE also validates)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sticky_note text NULL;
CREATE OR REPLACE FUNCTION public.profiles_validate_sticky()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.sticky_note IS NOT NULL AND char_length(NEW.sticky_note) > 100 THEN
    RAISE EXCEPTION 'Sticky note must be at most 100 characters';
  END IF;
  RETURN NEW;
END $$;
DROP TRIGGER IF EXISTS profiles_sticky_check ON public.profiles;
CREATE TRIGGER profiles_sticky_check BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.profiles_validate_sticky();

-- ---------- 9. Price-per-player: admin-only read
-- Revoke column SELECT from non-service roles. Admin UI reads via SECURITY DEFINER fn.
REVOKE SELECT (price_per_player) ON public.training_slots FROM anon, authenticated;
GRANT SELECT (price_per_player) ON public.training_slots TO service_role;

CREATE OR REPLACE FUNCTION public.get_slot_price(_slot_id uuid)
RETURNS numeric LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE p numeric;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  SELECT price_per_player INTO p FROM public.training_slots WHERE id = _slot_id;
  RETURN p;
END $$;
GRANT EXECUTE ON FUNCTION public.get_slot_price(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_slot_price(_slot_id uuid, _price numeric)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;
  UPDATE public.training_slots SET price_per_player = _price WHERE id = _slot_id;
END $$;
GRANT EXECUTE ON FUNCTION public.admin_set_slot_price(uuid, numeric) TO authenticated;

-- ---------- 10. Player Development tables
CREATE TABLE IF NOT EXISTS public.player_homework (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  video_url text NULL,
  description text NULL,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  due_date date NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_homework TO authenticated;
GRANT ALL ON public.player_homework TO service_role;
ALTER TABLE public.player_homework ENABLE ROW LEVEL SECURITY;
CREATE POLICY hw_admin_all ON public.player_homework FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY hw_owner_select ON public.player_homework FOR SELECT TO authenticated
  USING (profile_id = auth.uid());
CREATE POLICY hw_owner_update_status ON public.player_homework FOR UPDATE TO authenticated
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());
CREATE TRIGGER hw_updated_at BEFORE UPDATE ON public.player_homework
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.player_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_goals TO authenticated;
GRANT ALL ON public.player_goals TO service_role;
ALTER TABLE public.player_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY goals_admin_all ON public.player_goals FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY goals_owner_select ON public.player_goals FOR SELECT TO authenticated
  USING (profile_id = auth.uid());
CREATE TRIGGER goals_updated_at BEFORE UPDATE ON public.player_goals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE IF NOT EXISTS public.player_coach_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  note text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.player_coach_notes TO authenticated;
GRANT ALL ON public.player_coach_notes TO service_role;
ALTER TABLE public.player_coach_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY notes_admin_all ON public.player_coach_notes FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY notes_owner_select ON public.player_coach_notes FOR SELECT TO authenticated
  USING (profile_id = auth.uid());
CREATE TRIGGER coachnotes_updated_at BEFORE UPDATE ON public.player_coach_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------- 11. iCal tokens (Ferdi)
CREATE TABLE IF NOT EXISTS public.ical_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ical_tokens TO authenticated;
GRANT ALL ON public.ical_tokens TO service_role;
ALTER TABLE public.ical_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY ical_admin_all ON public.ical_tokens FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ---------- 12. Spam guard helper for guest bookings
CREATE OR REPLACE FUNCTION public.guest_booking_email_count_24h(_email text)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(*)::int FROM public.bookings
  WHERE lower(guest_email) = lower(_email)
    AND created_at > now() - interval '24 hours';
$$;
GRANT EXECUTE ON FUNCTION public.guest_booking_email_count_24h(text) TO anon, authenticated;

-- ---------- 13. New validate_booking trigger
CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s RECORD;
  current_count INT;
  is_admin BOOLEAN := public.has_role(auth.uid(),'admin');
  becoming_active BOOLEAN := false;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'confirmed' THEN
    becoming_active := true;
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'confirmed' AND OLD.status <> 'confirmed' THEN
    becoming_active := true;
  END IF;

  IF becoming_active THEN
    SELECT * INTO s FROM public.training_slots WHERE id = NEW.slot_id FOR UPDATE;
    IF NOT FOUND THEN RAISE EXCEPTION 'Slot not found'; END IF;
    IF s.status <> 'open' THEN RAISE EXCEPTION 'Slot is not open for booking'; END IF;
    IF (s.date + s.start_time) <= now() THEN RAISE EXCEPTION 'Slot has already passed'; END IF;

    -- 24h booking lead time (admin bypass)
    IF NOT is_admin AND (s.date + s.start_time) < now() + interval '24 hours' THEN
      RAISE EXCEPTION 'Online booking closed: starts within 24 hours';
    END IF;

    -- Private slots: only active players
    IF s.visibility = 'private' THEN
      IF NEW.profile_id IS NULL THEN
        RAISE EXCEPTION 'Private slots require an authenticated active player';
      END IF;
      IF NOT is_admin AND NOT EXISTS (
        SELECT 1 FROM public.profiles p WHERE p.id = NEW.profile_id AND p.status = 'active'
      ) THEN
        RAISE EXCEPTION 'Only active players can book private slots';
      END IF;
    END IF;

    -- Hidden slots: admin only
    IF s.visibility = 'hidden' AND NOT is_admin THEN
      RAISE EXCEPTION 'Slot is not bookable';
    END IF;

    -- Capacity
    SELECT COUNT(*) INTO current_count FROM public.bookings
      WHERE slot_id = NEW.slot_id AND status = 'confirmed'
        AND id <> COALESCE(NEW.id,'00000000-0000-0000-0000-000000000000'::uuid);
    IF current_count >= s.max_players THEN RAISE EXCEPTION 'Slot is full'; END IF;

    -- Active player rules
    IF NEW.profile_id IS NOT NULL THEN
      -- duplicate same-slot
      IF EXISTS (
        SELECT 1 FROM public.bookings WHERE slot_id = NEW.slot_id
          AND profile_id = NEW.profile_id AND status = 'confirmed'
          AND id <> COALESCE(NEW.id,'00000000-0000-0000-0000-000000000000'::uuid)
      ) THEN RAISE EXCEPTION 'You already have a booking for this slot'; END IF;

      -- overlap
      IF EXISTS (
        SELECT 1 FROM public.bookings b JOIN public.training_slots os ON os.id = b.slot_id
        WHERE b.profile_id = NEW.profile_id AND b.status = 'confirmed'
          AND b.id <> COALESCE(NEW.id,'00000000-0000-0000-0000-000000000000'::uuid)
          AND os.date = s.date AND os.start_time < s.end_time AND os.end_time > s.start_time
      ) THEN RAISE EXCEPTION 'You have another booking that overlaps with this time'; END IF;

      -- same-day rule (admin bypass)
      IF NOT is_admin AND EXISTS (
        SELECT 1 FROM public.bookings b JOIN public.training_slots os ON os.id = b.slot_id
        WHERE b.profile_id = NEW.profile_id AND b.status = 'confirmed'
          AND b.id <> COALESCE(NEW.id,'00000000-0000-0000-0000-000000000000'::uuid)
          AND os.date = s.date
      ) THEN RAISE EXCEPTION 'You already have a session booked on this day'; END IF;
    END IF;

    -- Guest spam guard
    IF NEW.profile_id IS NULL AND NEW.guest_email IS NOT NULL AND NOT is_admin THEN
      IF (SELECT COUNT(*) FROM public.bookings
            WHERE lower(guest_email) = lower(NEW.guest_email)
              AND created_at > now() - interval '24 hours'
              AND id <> COALESCE(NEW.id,'00000000-0000-0000-0000-000000000000'::uuid)) >= 3 THEN
        RAISE EXCEPTION 'Too many bookings for this email in the last 24 hours';
      END IF;
    END IF;

    -- Auto-mark full
    IF (current_count + 1) >= s.max_players THEN
      UPDATE public.training_slots SET status = 'full' WHERE id = s.id;
    END IF;
  END IF;

  -- Cancellation: 48h rule (admin bypass), free slot, record metadata
  IF TG_OP = 'UPDATE' AND OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
    SELECT * INTO s FROM public.training_slots WHERE id = NEW.slot_id;
    IF NOT is_admin AND s IS NOT NULL AND (s.date + s.start_time) < now() + interval '48 hours' THEN
      RAISE EXCEPTION 'Online cancellation closed: starts within 48 hours';
    END IF;
    IF NEW.cancelled_at IS NULL THEN NEW.cancelled_at := now(); END IF;
    IF NEW.cancelled_by IS NULL THEN
      NEW.cancelled_by := CASE WHEN is_admin THEN 'admin'
                               WHEN NEW.profile_id IS NOT NULL THEN 'player'
                               ELSE 'guest' END;
    END IF;
    -- free slot back to open unless admin cancelled the slot itself
    UPDATE public.training_slots SET status = 'open'
      WHERE id = NEW.slot_id AND status = 'full';
  END IF;

  RETURN NEW;
END $$;

CREATE TRIGGER bookings_validate BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.validate_booking();

-- After delete: free slot if it was full
CREATE OR REPLACE FUNCTION public.bookings_after_delete()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  UPDATE public.training_slots SET status = 'open'
    WHERE id = OLD.slot_id AND status = 'full';
  RETURN OLD;
END $$;
CREATE TRIGGER bookings_free_slot AFTER DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.bookings_after_delete();

-- ---------- 14. RLS policies (slots + bookings)
-- training_slots
CREATE POLICY slots_admin_all ON public.training_slots FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY slots_public_select ON public.training_slots FOR SELECT TO anon
  USING (visibility = 'public' AND status = 'open' AND (date + start_time) > now());

CREATE POLICY slots_active_player_select ON public.training_slots FOR SELECT TO authenticated
  USING (
    visibility = 'public'
    OR (
      visibility = 'private'
      AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.status = 'active')
    )
  );

-- bookings
CREATE POLICY bookings_admin_all ON public.bookings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE POLICY bookings_select_own ON public.bookings FOR SELECT TO authenticated
  USING (profile_id = auth.uid());

CREATE POLICY bookings_guest_insert ON public.bookings FOR INSERT TO anon
  WITH CHECK (
    status = 'confirmed' AND profile_id IS NULL AND player_id IS NULL
    AND guest_email IS NOT NULL AND guest_name IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.training_slots s
      WHERE s.id = bookings.slot_id
        AND s.visibility = 'public' AND s.status = 'open'
        AND (s.date + s.start_time) > now() + interval '24 hours'
    )
    AND (
      SELECT COUNT(*) FROM public.bookings b
      WHERE lower(b.guest_email) = lower(bookings.guest_email)
        AND b.created_at > now() - interval '24 hours'
    ) < 3
  );

CREATE POLICY bookings_insert_own ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid() AND status = 'confirmed');

CREATE POLICY bookings_update_own_cancel ON public.bookings FOR UPDATE TO authenticated
  USING (profile_id = auth.uid())
  WITH CHECK (profile_id = auth.uid() AND status = 'cancelled');

-- ---------- 15. Applications: ensure status enum is exactly pending/approved/rejected
-- (already is, no changes needed)
