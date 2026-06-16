
CREATE OR REPLACE FUNCTION public.ensure_application_for_guest(
  _email text,
  _parent_name text,
  _player_name text,
  _dob date,
  _club text,
  _team text,
  _position text,
  _phone text,
  _notes text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _email IS NULL OR length(trim(_email)) = 0 THEN RETURN; END IF;

  IF EXISTS (SELECT 1 FROM public.applications WHERE lower(email) = lower(_email)) THEN
    RETURN;
  END IF;

  IF EXISTS (SELECT 1 FROM auth.users u WHERE lower(u.email) = lower(_email)) THEN
    RETURN;
  END IF;

  INSERT INTO public.applications
    (parent_name, player_name, email, phone, club, team, position, notes, birth_year, status)
  VALUES (
    COALESCE(NULLIF(trim(_parent_name), ''), 'Onbekend'),
    COALESCE(NULLIF(trim(_player_name), ''), 'Onbekend'),
    lower(trim(_email)),
    NULLIF(trim(_phone), ''),
    NULLIF(trim(_club), ''),
    NULLIF(trim(_team), ''),
    NULLIF(trim(_position), ''),
    NULLIF(trim(_notes), ''),
    CASE WHEN _dob IS NOT NULL THEN EXTRACT(YEAR FROM _dob)::int ELSE NULL END,
    'pending'
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.ensure_application_for_guest(text,text,text,date,text,text,text,text,text) FROM public;
GRANT  EXECUTE ON FUNCTION public.ensure_application_for_guest(text,text,text,date,text,text,text,text,text) TO anon, authenticated;
