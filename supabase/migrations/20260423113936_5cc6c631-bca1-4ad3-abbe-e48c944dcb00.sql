
-- =========================================================
-- PROFILES (one per auth user)
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update all profiles" ON public.profiles
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at trigger function (shared)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- PLAYERS
-- =========================================================
CREATE TYPE public.player_level AS ENUM ('BVO', 'Divisie', 'Hoofdklasse', 'Eerste klasse', 'Recreatief');
CREATE TYPE public.training_type AS ENUM ('1-on-1', 'Duo', 'Group');

CREATE TABLE public.players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  player_name TEXT NOT NULL,
  parent_name TEXT,
  phone TEXT,
  email TEXT,
  birthdate DATE,
  club TEXT,
  team TEXT,
  level public.player_level,
  position TEXT,
  training_type public.training_type,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents view own players" ON public.players
  FOR SELECT TO authenticated USING (parent_user_id = auth.uid());
CREATE POLICY "Admins manage players" ON public.players
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER players_updated_at BEFORE UPDATE ON public.players
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX players_parent_user_id_idx ON public.players(parent_user_id);

-- =========================================================
-- FIXED SUNDAY SLOTS
-- =========================================================
CREATE TABLE public.fixed_sunday_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  slot_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.fixed_sunday_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents view own slots" ON public.fixed_sunday_slots
  FOR SELECT TO authenticated USING (
    player_id IN (SELECT id FROM public.players WHERE parent_user_id = auth.uid())
  );
CREATE POLICY "Admins manage slots" ON public.fixed_sunday_slots
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER fixed_sunday_slots_updated_at BEFORE UPDATE ON public.fixed_sunday_slots
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX fixed_sunday_slots_player_idx ON public.fixed_sunday_slots(player_id);

-- =========================================================
-- WEEKLY CONFIRMATIONS
-- =========================================================
CREATE TYPE public.confirmation_status AS ENUM ('attending', 'not_attending', 'different_time');

CREATE TABLE public.weekly_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  session_date DATE NOT NULL,
  status public.confirmation_status NOT NULL,
  alt_from TEXT,
  alt_to TEXT,
  note TEXT,
  locked BOOLEAN NOT NULL DEFAULT false,
  responded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (player_id, session_date)
);

ALTER TABLE public.weekly_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents view own confirmations" ON public.weekly_confirmations
  FOR SELECT TO authenticated USING (
    player_id IN (SELECT id FROM public.players WHERE parent_user_id = auth.uid())
  );
CREATE POLICY "Parents insert own confirmations" ON public.weekly_confirmations
  FOR INSERT TO authenticated WITH CHECK (
    player_id IN (SELECT id FROM public.players WHERE parent_user_id = auth.uid())
    AND locked = false
  );
CREATE POLICY "Parents update own unlocked confirmations" ON public.weekly_confirmations
  FOR UPDATE TO authenticated USING (
    player_id IN (SELECT id FROM public.players WHERE parent_user_id = auth.uid())
    AND locked = false
  ) WITH CHECK (
    player_id IN (SELECT id FROM public.players WHERE parent_user_id = auth.uid())
  );
CREATE POLICY "Admins manage confirmations" ON public.weekly_confirmations
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER weekly_confirmations_updated_at BEFORE UPDATE ON public.weekly_confirmations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX weekly_confirmations_session_idx ON public.weekly_confirmations(session_date);

-- =========================================================
-- WAITLIST ENTRIES (new expanded version, keep old table for now)
-- =========================================================
CREATE TYPE public.waitlist_status AS ENUM ('new', 'contacted', 'trial_scheduled', 'placed', 'removed');

CREATE TABLE public.waitlist_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name TEXT NOT NULL,
  parent_name TEXT,
  phone TEXT NOT NULL,
  email TEXT,
  birthdate DATE,
  club TEXT,
  team TEXT,
  position TEXT,
  level public.player_level,
  training_type public.training_type,
  available_days TEXT[] NOT NULL DEFAULT '{}',
  available_times TEXT,
  notes TEXT,
  status public.waitlist_status NOT NULL DEFAULT 'new',
  last_contact_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.waitlist_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can join waitlist" ON public.waitlist_entries
  FOR INSERT TO anon, authenticated WITH CHECK (
    length(player_name) BETWEEN 1 AND 100
    AND length(phone) BETWEEN 5 AND 30
  );
CREATE POLICY "Admins manage waitlist entries" ON public.waitlist_entries
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER waitlist_entries_updated_at BEFORE UPDATE ON public.waitlist_entries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX waitlist_entries_status_idx ON public.waitlist_entries(status);
CREATE INDEX waitlist_entries_created_idx ON public.waitlist_entries(created_at DESC);

-- =========================================================
-- WAITLIST TAGS
-- =========================================================
CREATE TYPE public.waitlist_tag AS ENUM ('high_priority', 'call_back', 'trial_training', 'not_suitable', 'offered_fixed_spot');

CREATE TABLE public.waitlist_entry_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_id UUID NOT NULL REFERENCES public.waitlist_entries(id) ON DELETE CASCADE,
  tag public.waitlist_tag NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (entry_id, tag)
);

ALTER TABLE public.waitlist_entry_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage waitlist tags" ON public.waitlist_entry_tags
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- NOTES (polymorphic timeline)
-- =========================================================
CREATE TYPE public.note_subject AS ENUM ('player', 'waitlist_entry');

CREATE TABLE public.notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_type public.note_subject NOT NULL,
  subject_id UUID NOT NULL,
  body TEXT NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage notes" ON public.notes
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX notes_subject_idx ON public.notes(subject_type, subject_id);

-- =========================================================
-- BOOKING WINDOWS
-- =========================================================
CREATE TYPE public.booking_audience AS ENUM ('everyone', 'waitlist_only', 'tagged_only');

CREATE TABLE public.booking_windows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  audience public.booking_audience NOT NULL DEFAULT 'everyone',
  audience_tags public.waitlist_tag[] NOT NULL DEFAULT '{}',
  message TEXT,
  is_open BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_windows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view open windows" ON public.booking_windows
  FOR SELECT TO authenticated USING (is_open = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage windows" ON public.booking_windows
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER booking_windows_updated_at BEFORE UPDATE ON public.booking_windows
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.booking_window_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  window_id UUID NOT NULL REFERENCES public.booking_windows(id) ON DELETE CASCADE,
  slot_time TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (window_id, slot_time)
);

ALTER TABLE public.booking_window_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view open window slots" ON public.booking_window_slots
  FOR SELECT TO authenticated USING (
    window_id IN (SELECT id FROM public.booking_windows WHERE is_open = true)
    OR public.has_role(auth.uid(), 'admin')
  );
CREATE POLICY "Admins manage window slots" ON public.booking_window_slots
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- BOOKINGS
-- =========================================================
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES public.booking_window_slots(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (slot_id, user_id)
);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own bookings" ON public.bookings
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users create own bookings" ON public.bookings
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete own bookings" ON public.bookings
  FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Admins manage bookings" ON public.bookings
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX bookings_user_idx ON public.bookings(user_id);
CREATE INDEX bookings_slot_idx ON public.bookings(slot_id);
