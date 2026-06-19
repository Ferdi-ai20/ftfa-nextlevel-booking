import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { notify, ADMIN_EMAIL } from "@/lib/notify";
import { LoadingBlock, LoadingTimeoutFallback, useLoadingTimeout } from "@/components/LoadingState";
import { timedWithTimeout } from "@/lib/timing";
import {
  TrainingType,
  SlotVisibility,
  trainingTypeLabel,
  fmtTime,
  fmtDate,
  hoursUntil,
  ACTIVE_BOOKING_STATUSES,
  BookingStatus,
} from "@/lib/slots";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Slot = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  training_type: TrainingType;
  visibility: SlotVisibility;
  status: string;
  max_players: number;
  location: string | null;
  player_note: string | null;
};

type Booking = {
  id: string;
  slot_id: string;
  status: BookingStatus;
  profile_id: string | null;
  player_id: string | null;
};

type Player = {
  id: string;
  player_name: string;
  birth_year: number | null;
  club: string | null;
  team: string | null;
  position: string | null;
};

type Goal = { id: string; description: string; status: string; created_at: string };
type Homework = { id: string; title: string; description: string | null; video_url: string | null; due_date: string | null; status: string };
type CoachNote = { id: string; note: string; created_at: string };

const TABS = [
  { id: "available", label: "Beschikbare trainingen" },
  { id: "bookings", label: "Mijn boekingen" },
  { id: "development", label: "Mijn ontwikkeling" },
  { id: "profile", label: "Profiel" },
] as const;
type TabId = typeof TABS[number]["id"];
type SectionKey = "profile" | "players" | "slots" | "bookings" | "goals" | "homework" | "coachNotes";
type SectionLoadState = Record<SectionKey, { loading: boolean; error: string | null }>;

const initialSectionState: SectionLoadState = {
  profile: { loading: true, error: null },
  players: { loading: true, error: null },
  slots: { loading: true, error: null },
  bookings: { loading: true, error: null },
  goals: { loading: true, error: null },
  homework: { loading: true, error: null },
  coachNotes: { loading: true, error: null },
};

const sectionErrorMessage = "Dit onderdeel kon niet snel genoeg worden geladen.";

const SectionGate = ({ loading, error, onRetry, children }: { loading: boolean; error: boolean; onRetry: () => void; children: ReactNode }) => {
  const { timedOut, resetTimedOut } = useLoadingTimeout(loading);
  const retry = () => {
    resetTimedOut();
    onRetry();
  };

  if (loading) return timedOut ? <LoadingTimeoutFallback onRetry={retry} showSignOut={false} /> : <LoadingBlock />;
  if (error) return <LoadingTimeoutFallback onRetry={retry} showSignOut={false} />;
  return <>{children}</>;
};

const Dashboard = () => {
  const { session, isAdmin, profileStatus: authProfileStatus, profileName: authProfileName, loading, accessResolved, accessError, signOut } = useAuth();
  const navigate = useNavigate();
  const redirectKeyRef = useRef<string | null>(null);
  const sessionUserId = session?.user.id ?? null;
  const accessPending = !!session && (!accessResolved || !!accessError);
  const { timedOut, resetTimedOut } = useLoadingTimeout(loading || accessPending);
  const [tab, setTab] = useState<TabId>("available");

  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [coachNotes, setCoachNotes] = useState<CoachNote[]>([]);
  const [profileName, setProfileName] = useState(authProfileName);
  const [profilePhone, setProfilePhone] = useState("");
  const [sectionState, setSectionState] = useState<SectionLoadState>(initialSectionState);
  const [retryKey, setRetryKey] = useState(0);
  const [filter, setFilter] = useState<"all" | TrainingType>("all");
  const [busy, setBusy] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<{ b: Booking; s: Slot } | null>(null);

  useEffect(() => {
    if (loading) return;
    const redirect = (to: string) => {
      const key = `${sessionUserId ?? "anon"}:${to}`;
      if (redirectKeyRef.current === key) return;
      redirectKeyRef.current = key;
      navigate(to, { replace: true });
    };
    if (!session) { redirect("/auth?redirect=/dashboard"); return; }
    if (!accessResolved || accessError) return;
    if (isAdmin) { redirect("/admin"); return; }
    if (authProfileStatus && authProfileStatus !== "active") { redirect("/wachten"); }
  }, [session, sessionUserId, isAdmin, authProfileStatus, loading, accessResolved, accessError, navigate]);

  const runSection = async <T,>(key: SectionKey, label: string, operation: PromiseLike<{ data: T; error: any }>, applyData: (data: T) => void, timeoutMs = 5000) => {
    setSectionState((state) => ({ ...state, [key]: { loading: true, error: null } }));
    try {
      const { data, error } = await timedWithTimeout(label, operation, timeoutMs);
      if (error) throw error;
      applyData(data);
      setSectionState((state) => ({ ...state, [key]: { loading: false, error: null } }));
    } catch (error: any) {
      console.error(`${label} failed`, error);
      setSectionState((state) => ({ ...state, [key]: { loading: false, error: error?.message ?? sectionErrorMessage } }));
    }
  };

  const loadSection = (key: SectionKey, uid = session?.user.id) => {
    if (!uid) return;
    const today = new Date().toISOString().slice(0, 10);
    if (key === "profile") {
      void runSection("profile", "Dashboard.profile", supabase.from("profiles").select("full_name, phone, status").eq("id", uid).maybeSingle(), (prof) => {
        setProfileName(prof?.full_name ?? "");
        setProfilePhone(prof?.phone ?? "");
      }, 3000);
    } else if (key === "players") {
      void runSection("players", "Dashboard.players", supabase.from("players").select("id, player_name, birth_year, club, team, position").eq("parent_profile_id", uid), (ps) => setPlayers((ps ?? []) as Player[]));
    } else if (key === "slots") {
      void runSection("slots", "Dashboard.slots", supabase.from("training_slots").select("id, date, start_time, end_time, training_type, visibility, status, max_players, location, player_note")
        .gte("date", today).eq("visibility", "private").eq("status", "open").order("date").order("start_time"), (sl) => setSlots((sl ?? []) as Slot[]));
    } else if (key === "bookings") {
      void runSection("bookings", "Dashboard.bookings", supabase.from("bookings").select("id, slot_id, status, profile_id, player_id").eq("profile_id", uid), (bk) => setBookings((bk ?? []) as Booking[]));
    } else if (key === "goals") {
      void runSection("goals", "Dashboard.goals", supabase.from("player_goals").select("id, description, status, created_at").eq("profile_id", uid).order("created_at", { ascending: false }), (gl) => setGoals((gl ?? []) as Goal[]));
    } else if (key === "homework") {
      void runSection("homework", "Dashboard.homework", supabase.from("player_homework").select("id, title, description, video_url, due_date, status").eq("profile_id", uid).order("assigned_at", { ascending: false }), (hw) => setHomework((hw ?? []) as Homework[]));
    } else if (key === "coachNotes") {
      void runSection("coachNotes", "Dashboard.coachNotes", supabase.from("player_coach_notes").select("id, note, created_at").eq("profile_id", uid).order("created_at", { ascending: false }), (cn) => setCoachNotes((cn ?? []) as CoachNote[]));
    }
  };

  const loadAll = (uid = session?.user.id) => {
    if (!uid) return;
    setSectionState(initialSectionState);
    (["profile", "players", "slots", "bookings", "goals", "homework", "coachNotes"] as SectionKey[]).forEach((key) => loadSection(key, uid));
  };

  useEffect(() => {
    if (!session || isAdmin || loading || !accessResolved || accessError || authProfileStatus !== "active") return;
    loadAll(session.user.id);
  }, [session?.user.id, isAdmin, loading, accessResolved, accessError, authProfileStatus, retryKey]);

  const retryLoad = () => setRetryKey((key) => key + 1);
  const retryAccess = () => {
    resetTimedOut();
    window.location.reload();
  };

  const book = async (s: Slot) => {
    if (authProfileStatus !== "active") {
      toast.error("Je profiel moet eerst goedgekeurd worden door Ferdi.");
      return;
    }
    if (hoursUntil(s.date, s.start_time) < 24) {
      toast.error("Online boeken is gesloten binnen 24 uur voor aanvang.");
      return;
    }
    setBusy(s.id);
    const { error } = await supabase.from("bookings").insert({
      slot_id: s.id,
      profile_id: session!.user.id,
      player_id: players[0]?.id ?? null,
      status: "confirmed",
    });
    setBusy(null);
    if (error) {
      const msg = error.message.includes("24 hours") ? "Online boeken is gesloten binnen 24 uur voor aanvang."
        : error.message.includes("already have a booking") ? "Je hebt deze training al geboekt."
        : error.message.includes("same day") || error.message.includes("session booked on this day") ? "Je hebt al een training op deze dag."
        : error.message.includes("overlap") ? "Je hebt al een boeking die overlapt met deze tijd."
        : error.message.includes("full") ? "Deze training zit vol."
        : error.message;
      toast.error(msg);
      return;
    }
    toast.success("Geboekt!");
    void notify("booking-confirmed", session!.user.email, {
      parentName: profileName,
      playerName: players[0]?.player_name ?? "",
      date: fmtDate(s.date),
      slotTime: fmtTime(s.start_time),
      trainingType: trainingTypeLabel(s.training_type),
      location: s.location ?? "",
    }, `book-${s.id}-${session!.user.id}`);
    void notify("admin-new-booking", ADMIN_EMAIL, {
      who: profileName || session!.user.email,
      date: fmtDate(s.date),
      slotTime: fmtTime(s.start_time),
      trainingType: trainingTypeLabel(s.training_type),
      location: s.location ?? "",
      contact: session!.user.email,
      bookingType: "player",
      visibility: s.visibility,
    }, `admin-book-${s.id}-${session!.user.id}`);
    void loadAll();
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    const { b, s } = cancelTarget;
    const { error } = await supabase.from("bookings").update({ status: "cancelled", cancelled_by: "player" }).eq("id", b.id);
    setCancelTarget(null);
    if (error) {
      const msg = error.message.includes("48 hours") ? "Online annuleren is gesloten binnen 48 uur voor aanvang." : error.message;
      toast.error(msg);
      return;
    }
    toast.success("Boeking geannuleerd.");
    void notify("booking-cancelled", session!.user.email, {
      recipientName: profileName,
      date: fmtDate(s.date),
      slotTime: fmtTime(s.start_time),
      trainingType: trainingTypeLabel(s.training_type),
      byAdmin: false,
    }, `cancel-${b.id}`);
    void notify("admin-booking-cancelled", ADMIN_EMAIL, {
      who: profileName || session!.user.email,
      contact: session!.user.email,
      date: fmtDate(s.date),
      slotTime: fmtTime(s.start_time),
      trainingType: trainingTypeLabel(s.training_type),
      cancelledBy: "player",
      cancelledAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    }, `admin-cancel-${b.id}`);
    void loadAll();
  };

  const toggleHomework = async (h: Homework) => {
    const next = h.status === "completed" ? "open" : "completed";
    const { error } = await supabase.from("player_homework").update({ status: next }).eq("id", h.id);
    if (error) return toast.error(error.message);
    setHomework((arr) => arr.map((x) => x.id === h.id ? { ...x, status: next } : x));
  };

  const filteredSlots = useMemo(() => {
    const bookedIds = new Set(bookings.filter((b) => ACTIVE_BOOKING_STATUSES.includes(b.status)).map((b) => b.slot_id));
    return slots
      .filter((s) => !bookedIds.has(s.id))
      .filter((s) => hoursUntil(s.date, s.start_time) >= 24)
      .filter((s) => filter === "all" || s.training_type === filter);
  }, [slots, bookings, filter]);

  const myUpcoming = useMemo(() => bookings
    .filter((b) => ACTIVE_BOOKING_STATUSES.includes(b.status))
    .map((b) => ({ b, s: slots.find((x) => x.id === b.slot_id) || null }))
    .filter((x): x is { b: Booking; s: Slot } => !!x.s)
    .sort((a, b) => (a.s.date + a.s.start_time).localeCompare(b.s.date + b.s.start_time)),
    [bookings, slots]);

  if (loading && !session) return <LoadingBlock fullScreen />;
  if (accessPending) {
    if (timedOut || accessError) return <LoadingTimeoutFallback onRetry={retryAccess} fullScreen />;
    return <LoadingBlock fullScreen />;
  }
  if (!session || isAdmin) return null;
  if (authProfileStatus !== "active") return <LoadingBlock fullScreen />;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 md:px-10 py-4 flex items-center justify-between">
        <Link to="/" className="display-font text-xl uppercase">FTFA</Link>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground hidden sm:block">{profileName || session.user.email}</div>
          <button onClick={signOut} className="text-[10px] uppercase tracking-widest border border-border px-3 py-1.5 hover:border-foreground/40">Uitloggen</button>
        </div>
      </header>

      <nav className="border-b border-border px-4 md:px-10 overflow-x-auto">
        <div className="flex gap-1 max-w-5xl mx-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-3 text-[11px] uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${tab === t.id ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-10">
        {tab === "available" && (
          <section>
            <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Beschikbaar</div>
                <h2 className="display-font text-3xl uppercase mt-2">Boek een training</h2>
                <p className="text-xs text-muted-foreground mt-2">Private trainingen, minimaal 24 uur vooraf te boeken.</p>
              </div>
              <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="bg-background border border-border px-3 py-2 text-sm">
                <option value="all">Alle types</option>
                <option value="one_on_one">1-op-1</option>
                <option value="duo">Duo</option>
                <option value="small_group">Small Group</option>
              </select>
            </div>

            <SectionGate loading={sectionState.slots.loading || sectionState.bookings.loading || sectionState.players.loading} error={!!sectionState.slots.error || !!sectionState.bookings.error || !!sectionState.players.error} onRetry={() => { loadSection("slots"); loadSection("bookings"); loadSection("players"); }}>
              {filteredSlots.length === 0 ? (
                <div className="border border-border bg-card p-6 text-sm text-muted-foreground">Geen beschikbare trainingen.</div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {filteredSlots.map((s) => (
                    <div key={s.id} className="border border-border bg-card p-4">
                      <div className="display-font text-lg uppercase">{fmtDate(s.date)}</div>
                      <div className="font-mono text-sm mt-1">{fmtTime(s.start_time)} – {fmtTime(s.end_time)}</div>
                      <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
                        {trainingTypeLabel(s.training_type)}{s.location ? ` · ${s.location}` : ""}
                      </div>
                      {s.player_note && <div className="text-xs text-muted-foreground mt-2 italic">"{s.player_note}"</div>}
                      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
                        Max {s.max_players} {s.max_players === 1 ? "speler" : "spelers"}
                      </div>
                      <button
                        disabled={busy === s.id}
                        onClick={() => book(s)}
                        className="mt-3 w-full bg-primary text-primary-foreground px-3 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 disabled:opacity-40"
                      >
                        {busy === s.id ? "Bezig…" : "Boek training"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </SectionGate>
          </section>
        )}

        {tab === "bookings" && (
          <section>
            <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Mijn boekingen</div>
            <h2 className="display-font text-3xl uppercase mt-2 mb-6">Aankomende trainingen</h2>
            <SectionGate loading={sectionState.bookings.loading || sectionState.slots.loading} error={!!sectionState.bookings.error || !!sectionState.slots.error} onRetry={() => { loadSection("bookings"); loadSection("slots"); }}>
              {myUpcoming.length === 0 ? (
                <div className="border border-border bg-card p-6 text-sm text-muted-foreground">Nog geen aankomende trainingen.</div>
              ) : (
                <div className="space-y-2">
                  {myUpcoming.map(({ b, s }) => {
                    const hours = hoursUntil(s.date, s.start_time);
                    const canCancel = hours >= 48;
                    return (
                      <div key={b.id} className="border border-border bg-card p-4 flex items-center justify-between gap-3">
                        <div>
                          <div className="display-font text-xl uppercase">{fmtDate(s.date)}</div>
                          <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                            {fmtTime(s.start_time)}–{fmtTime(s.end_time)} · {trainingTypeLabel(s.training_type)}{s.location ? ` · ${s.location}` : ""}
                          </div>
                          <div className="text-[10px] uppercase tracking-widest mt-1 text-primary">Bevestigd</div>
                        </div>
                        {canCancel ? (
                          <button
                            onClick={() => setCancelTarget({ b, s })}
                            className="text-[10px] uppercase tracking-widest border border-destructive/40 text-destructive px-3 py-1.5 hover:bg-destructive/10"
                          >
                            Annuleren
                          </button>
                        ) : (
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground text-right max-w-[160px]">
                            Annuleren niet meer mogelijk (&lt; 48u). Neem contact op met Ferdi.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionGate>
          </section>
        )}

        {tab === "development" && (
          <section className="space-y-10">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Ontwikkeling</div>
              <h2 className="display-font text-3xl uppercase mt-2 mb-6">Mijn doelen</h2>
              <SectionGate loading={sectionState.goals.loading} error={!!sectionState.goals.error} onRetry={() => loadSection("goals")}>
                {goals.length === 0 ? (
                  <div className="border border-border bg-card p-6 text-sm text-muted-foreground">Nog geen doelen vastgelegd.</div>
                ) : (
                  <div className="space-y-2">
                    {goals.map((g) => (
                      <div key={g.id} className="border border-border bg-card p-4">
                        <div className="text-sm">{g.description}</div>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">Status: {g.status}</div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionGate>
            </div>

            <div>
              <h2 className="display-font text-3xl uppercase mb-6">Huiswerk</h2>
              <SectionGate loading={sectionState.homework.loading} error={!!sectionState.homework.error} onRetry={() => loadSection("homework")}>
                {homework.length === 0 ? (
                  <div className="border border-border bg-card p-6 text-sm text-muted-foreground">Geen huiswerk op dit moment.</div>
                ) : (
                  <div className="space-y-2">
                    {homework.map((h) => (
                      <div key={h.id} className="border border-border bg-card p-4 flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={h.status === "completed"}
                          onChange={() => toggleHomework(h)}
                          className="mt-1 h-4 w-4 accent-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className={`display-font text-lg uppercase ${h.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{h.title}</div>
                          {h.description && <div className="text-sm text-muted-foreground mt-1">{h.description}</div>}
                          {h.video_url && (
                            <a href={h.video_url} target="_blank" rel="noreferrer" className="text-xs uppercase tracking-widest text-primary mt-2 inline-block">
                              Bekijk video →
                            </a>
                          )}
                          {h.due_date && <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">Deadline: {fmtDate(h.due_date)}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionGate>
            </div>

            <div>
              <h2 className="display-font text-3xl uppercase mb-6">Coach notities</h2>
              <SectionGate loading={sectionState.coachNotes.loading} error={!!sectionState.coachNotes.error} onRetry={() => loadSection("coachNotes")}>
                {coachNotes.length === 0 ? (
                  <div className="border border-border bg-card p-6 text-sm text-muted-foreground">Nog geen notities van de coach.</div>
                ) : (
                  <div className="space-y-2">
                    {coachNotes.map((n) => (
                      <div key={n.id} className="border border-border bg-card p-4">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {new Date(n.created_at).toLocaleDateString("nl-NL")}
                        </div>
                        <div className="text-sm mt-1 whitespace-pre-wrap">{n.note}</div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionGate>
            </div>
          </section>
        )}

        {tab === "profile" && (
          <section className="space-y-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Profiel</div>
              <h2 className="display-font text-3xl uppercase mt-2 mb-6">Mijn gegevens</h2>
            </div>
            <SectionGate loading={sectionState.profile.loading} error={!!sectionState.profile.error} onRetry={() => loadSection("profile")}>
              <div className="border border-border bg-card p-5 space-y-2">
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Naam</div>
                <div className="text-sm">{profileName || "—"}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground pt-3">E-mail</div>
                <div className="text-sm">{session.user.email}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground pt-3">Telefoon</div>
                <div className="text-sm">{profilePhone || "—"}</div>
              </div>
            </SectionGate>

            <SectionGate loading={sectionState.players.loading} error={!!sectionState.players.error} onRetry={() => loadSection("players")}>
              {players.length > 0 && (
                <div>
                  <h3 className="display-font text-2xl uppercase mb-4">Speler(s)</h3>
                  <div className="space-y-2">
                    {players.map((p) => (
                      <div key={p.id} className="border border-border bg-card p-5">
                        <div className="display-font text-xl uppercase">{p.player_name}</div>
                        <div className="text-xs text-muted-foreground mt-2 space-y-1">
                          {p.birth_year && <div>Geboortejaar: {p.birth_year}</div>}
                          <div>Club: {p.club ?? "—"}</div>
                          <div>Team: {p.team ?? "—"}</div>
                          <div>Positie: {p.position ?? "—"}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </SectionGate>

            <p className="text-xs text-muted-foreground">
              Wil je gegevens wijzigen? Neem contact op met Ferdi via WhatsApp:{" "}
              <a href="https://wa.me/31621275348" target="_blank" rel="noreferrer" className="text-primary underline">+31 6 21 27 53 48</a>.
            </p>
          </section>
        )}
      </div>

      <Dialog open={!!cancelTarget} onOpenChange={(o) => !o && setCancelTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Boeking annuleren?</DialogTitle>
            <DialogDescription>
              {cancelTarget && (
                <>
                  Je staat op het punt je training op <strong>{fmtDate(cancelTarget.s.date)}</strong> om{" "}
                  <strong>{fmtTime(cancelTarget.s.start_time)}</strong> te annuleren. Dit kun je niet ongedaan maken.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button onClick={() => setCancelTarget(null)} className="px-4 py-2 text-xs uppercase tracking-widest border border-border hover:border-foreground/40">
              Nee, behoud
            </button>
            <button onClick={confirmCancel} className="px-4 py-2 text-xs uppercase tracking-widest bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Ja, annuleren
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
};

export default Dashboard;
