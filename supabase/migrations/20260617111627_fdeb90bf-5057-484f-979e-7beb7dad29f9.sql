ALTER TABLE public.applications
ADD COLUMN IF NOT EXISTS dob date;

CREATE INDEX IF NOT EXISTS idx_applications_lower_email
ON public.applications (lower(email));

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

  IF NEW.status <> 'confirmed' THEN
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
END;
$$;

DROP TRIGGER IF EXISTS trg_auto_create_application_from_guest_booking ON public.bookings;

CREATE TRIGGER trg_auto_create_application_from_guest_booking
AFTER INSERT ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.auto_create_application_from_guest_booking();