
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "Admins read roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Fixed players (vaste spelers)
CREATE TABLE public.fixed_players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  slot_day TEXT NOT NULL DEFAULT 'sunday',
  slot_time TEXT NOT NULL,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.fixed_players ENABLE ROW LEVEL SECURITY;

-- Public can look up by exact phone match (used to fetch own slot)
CREATE POLICY "Public lookup own by phone" ON public.fixed_players FOR SELECT TO anon, authenticated USING (active = true);
CREATE POLICY "Admin manage fixed_players" ON public.fixed_players FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Weekly attendance responses
CREATE TABLE public.weekly_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fixed_player_id UUID REFERENCES public.fixed_players(id) ON DELETE CASCADE NOT NULL,
  session_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed','cancelled')),
  available_from TEXT,
  available_to TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (fixed_player_id, session_date)
);
ALTER TABLE public.weekly_attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert attendance" ON public.weekly_attendance FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Public update own attendance" ON public.weekly_attendance FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Admin read attendance" ON public.weekly_attendance FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete attendance" ON public.weekly_attendance FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Waitlist
CREATE TABLE public.waitlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  age INT,
  level TEXT,
  club TEXT,
  preferred_slots TEXT[] NOT NULL DEFAULT '{}',
  other_availability TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','placed','removed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public join waitlist" ON public.waitlist FOR INSERT TO anon, authenticated WITH CHECK (
  length(name) BETWEEN 1 AND 100 AND length(phone) BETWEEN 5 AND 20
);
CREATE POLICY "Admin read waitlist" ON public.waitlist FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin update waitlist" ON public.waitlist FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admin delete waitlist" ON public.waitlist FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- App settings
CREATE TABLE public.app_settings (
  id INT PRIMARY KEY DEFAULT 1,
  waitlist_open BOOLEAN NOT NULL DEFAULT true,
  active_time_slots TEXT[] NOT NULL DEFAULT ARRAY['09:00','10:00','11:00','12:00','14:00','16:00','18:00','20:00'],
  closed_message TEXT NOT NULL DEFAULT 'Waitlist temporarily closed. Follow @ftfa.academy for updates.',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT singleton CHECK (id = 1)
);
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.app_settings (id) VALUES (1);

CREATE POLICY "Public read settings" ON public.app_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin update settings" ON public.app_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
