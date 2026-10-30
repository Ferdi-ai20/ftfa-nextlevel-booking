-- =====================================================================
-- Guest bookings on public slots now require admin approval before
-- they count as confirmed. Introduces 'pending' booking status:
--   guest requests a public slot -> status 'pending' (reserves capacity)
--   admin approves              -> status 'confirmed'
--   admin declines              -> status 'cancelled'
-- Authenticated players keep instant-confirm bookings, unchanged.
-- =====================================================================

-- ---------- 1. New booking_status value
ALTER TYPE public.booking_status ADD VALUE IF NOT EXISTS 'pending';

-- ---------- 2. Guests insert as 'pending', not 'confirmed'
DROP POLICY IF EXISTS bookings_guest_insert ON public.bookings;
CREATE POLICY bookings_guest_insert ON public.bookings FOR INSERT TO anon
  WITH CHECK (
    status = 'pending' AND profile_id IS NULL AND player_id IS NULL
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

-- ---------- 3. validate_booking: pending reserves capacity, approval is a
-- plain status flip (no re-validation), decline frees capacity like a cancel.
CREATE OR REPLACE FUNCTION public.validate_booking()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  s RECORD;
  current_count INT;
  is_admin BOOLEAN := public.has_role(auth.uid(),'admin');
  becoming_active BOOLEAN := false;
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status IN ('confirmed','pending') THEN
    becoming_active := true;
  ELSIF TG_OP = 'UPDATE' AND NEW.status IN ('confirmed','pending') AND OLD.status NOT IN ('confirmed','pending') THEN
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

    -- Capacity (confirmed + pending both reserve a spot)
    SELECT COUNT(*) INTO current_count FROM public.bookings
      WHERE slot_id = NEW.slot_id AND status IN ('confirmed','pending')
        AND id <> COALESCE(NEW.id,'00000000-0000-0000-0000-000000000000'::uuid);
    IF current_count >= s.max_players THEN RAISE EXCEPTION 'Slot is full'; END IF;

    -- Active player rules
    IF NEW.profile_id IS NOT NULL THEN
      -- duplicate same-slot
      IF EXISTS (
        SELECT 1 FROM public.bookings WHERE slot_id = NEW.slot_id
          AND profile_id = NEW.profile_id AND status IN ('confirmed','pending')
          AND id <> COALESCE(NEW.id,'00000000-0000-0000-0000-000000000000'::uuid)
      ) THEN RAISE EXCEPTION 'You already have a booking for this slot'; END IF;

      -- overlap
      IF EXISTS (
        SELECT 1 FROM public.bookings b JOIN public.training_slots os ON os.id = b.slot_id
        WHERE b.profile_id = NEW.profile_id AND b.status IN ('confirmed','pending')
          AND b.id <> COALESCE(NEW.id,'00000000-0000-0000-0000-000000000000'::uuid)
          AND os.date = s.date AND os.start_time < s.end_time AND os.end_time > s.start_time
      ) THEN RAISE EXCEPTION 'You have another booking that overlaps with this time'; END IF;

      -- same-day rule (admin bypass)
      IF NOT is_admin AND EXISTS (
        SELECT 1 FROM public.bookings b JOIN public.training_slots os ON os.id = b.slot_id
        WHERE b.profile_id = NEW.profile_id AND b.status IN ('confirmed','pending')
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

    -- Auto-mark full (pending requests also occupy capacity)
    IF (current_count + 1) >= s.max_players THEN
      UPDATE public.training_slots SET status = 'full' WHERE id = s.id;
    END IF;
  END IF;

  -- Decline/cancel: free capacity back up. 48h notice rule only applies
  -- when a *confirmed* session is cancelled, not when a pending request
  -- is declined (admin-only action either way).
  IF TG_OP = 'UPDATE' AND OLD.status IN ('confirmed','pending') AND NEW.status = 'cancelled' THEN
    SELECT * INTO s FROM public.training_slots WHERE id = NEW.slot_id;
    IF OLD.status = 'confirmed' AND NOT is_admin AND s IS NOT NULL AND (s.date + s.start_time) < now() + interval '48 hours' THEN
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

-- ---------- 4. Keep the applications-tracking trigger firing for
-- pending requests too, so Ferdi still sees a draft "application" for a
-- guest who merely requested a slot -- this is unrelated to (and never
-- grants) account access, which only happens via the Applications tab.
CREATE OR REPLACE FUNCTION public.auto_create_application_from_guest_booking()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  player_name_extracted text;
  lower_guest_email text;
BEGIN
  IF NEW.profile_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  IF NEW.status NOT IN ('confirmed','pending') THEN
    RETURN NEW;
  END IF;

  IF NEW.guest_email IS NULL OR length(trim(NEW.guest_email)) = 0 THEN
    RETURN NEW;
  END IF;

  lower_guest_email := lower(trim(NEW.guest_email));

  IF EXISTS (
    SELECT 1
    FROM public.applications a
    WHERE lower(a.email) = lower_guest_email
  ) THEN
    RETURN NEW;
  END IF;

  IF EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE lower(u.email) = lower_guest_email
  ) THEN
    RETURN NEW;
  END IF;

  IF NEW.guest_name ILIKE '%ouder van %' THEN
    player_name_extracted := trim(substring(NEW.guest_name from '(?i)ouder van\s+([^)]*)'));
    IF player_name_extracted IS NULL OR length(player_name_extracted) = 0 THEN
      player_name_extracted := NEW.guest_name;
    END IF;
  ELSE
    player_name_extracted := NEW.guest_name;
  END IF;

  BEGIN
    INSERT INTO public.applications (
      email,
      parent_name,
      player_name,
      phone,
      birth_year,
      dob,
      club,
      team,
      position,
      status,
      notes,
      created_at
    ) VALUES (
      lower_guest_email,
      COALESCE(NULLIF(trim(NEW.guest_parent_name), ''), 'Onbekend'),
      COALESCE(NULLIF(trim(player_name_extracted), ''), COALESCE(NULLIF(trim(NEW.guest_name), ''), 'Onbekend')),
      NULLIF(trim(NEW.guest_phone), ''),
      CASE
        WHEN NEW.guest_dob IS NOT NULL THEN EXTRACT(YEAR FROM NEW.guest_dob)::int
        ELSE NEW.guest_birth_year
      END,
      NEW.guest_dob,
      NULLIF(trim(NEW.guest_club), ''),
      NULLIF(trim(NEW.guest_team), ''),
      NULLIF(trim(NEW.guest_position), ''),
      'pending',
      'Automatisch aangemaakt vanuit gastboeking',
      now()
    );
    RAISE LOG 'Application created for guest booking ID %', NEW.id;
  EXCEPTION WHEN OTHERS THEN
    RAISE LOG 'Error creating application for guest booking ID %: % %', NEW.id, SQLERRM, SQLSTATE;
  END;
  RETURN NEW;
END $$;
