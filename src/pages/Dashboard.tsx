import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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

type Slot = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  training_type: TrainingType;
  visibility: SlotVisibility;
  status: string;
  max_players: number;
  price_per_player: number | null;
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

type Player = { id: string; player_name: string };

const Dashboard = () => {
  const { session, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [profileName, setProfileName] = useState("");
  const [profileStatus, setProfileStatus] = useState<string>("pending");
  const [filter, setFilter] = useState<"all" | TrainingType>("all");
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) navigate("/auth?redirect=/dashboard", { replace: true });
    if (!loading && session && isAdmin) navigate("/admin", { replace: true });
  }, [session, isAdmin, loading, navigate]);

  useEffect(() => {
    if (!session) return;
    void loadAll();
  }, [session]);

  const loadAll = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const [{ data: prof }, { data: ps }, { data: sl }, { data: bk }] = await Promise.all([
      supabase.from("profiles").select("full_name, status").eq("id", session!.user.id).maybeSingle(),
      supabase.from("players").select("id, player_name").eq("parent_profile_id", session!.user.id),
      supabase.from("training_slots").select("*").gte("date", today).in("visibility", ["private", "public"]).eq("status", "open").order("date").order("start_time"),
      supabase.from("bookings").select("id, slot_id, status, profile_id, player_id").eq("profile_id", session!.user.id),
    ]);
    setProfileName(prof?.full_name ?? "");
    setProfileStatus(prof?.status ?? "pending");
    setPlayers((ps ?? []) as Player[]);
    setSlots((sl ?? []) as Slot[]);
    setBookings((bk ?? []) as Booking[]);
  };

  const slotCount = (slotId: string) =>
    // we only fetched own bookings — for capacity we trust DB enforcement; show own status
    bookings.filter((b) => b.slot_id === slotId && ACTIVE_BOOKING_STATUSES.includes(b.status)).length;

  const book = async (s: Slot, playerId?: string) => {
    if (profileStatus !== "active" && s.visibility === "private") {
      toast.error("Je profiel moet eerst goedgekeurd worden door Ferdi.");
      return;
    }
    setBusy(s.id);
    const { error } = await supabase.from("bookings").insert({
      slot_id: s.id,
      profile_id: session!.user.id,
      player_id: playerId ?? players[0]?.id ?? null,
      status: "confirmed",
    });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Geboekt!");
    void loadAll();
  };

  const cancel = async (b: Booking, s: Slot | undefined) => {
    if (s && hoursUntil(s.date, s.start_time) < 24) {
      toast.error("Binnen 24 uur kun je niet meer zelf annuleren. Neem contact op met Ferdi.");
      return;
    }
    if (!confirm("Boeking annuleren?")) return;
    const { error } = await supabase.from("bookings").update({ status: "cancelled_by_player" }).eq("id", b.id);
    if (error) return toast.error(error.message);
    toast.success("Geannuleerd");
    void loadAll();
  };

  const filteredSlots = useMemo(
    () => slots.filter((s) => filter === "all" || s.training_type === filter),
    [slots, filter],
  );

  const myActiveBookings = bookings.filter((b) => ACTIVE_BOOKING_STATUSES.includes(b.status));
  const myUpcoming = myActiveBookings
    .map((b) => ({ b, s: slots.find((x) => x.id === b.slot_id) }))
    .filter((x) => x.s);

  if (loading) return <div className="min-h-screen grid place-items-center bg-background text-foreground">Loading…</div>;
  if (!session) return null;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 md:px-10 py-4 flex items-center justify-between">
        <Link to="/" className="display-font text-xl uppercase">FTFA</Link>
        <div className="flex items-center gap-3">
          <div className="text-xs text-muted-foreground hidden sm:block">{profileName || session.user.email}</div>
          <button onClick={signOut} className="text-[10px] uppercase tracking-widest border border-border px-3 py-1.5 hover:border-foreground/40">Sign out</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-10">
        {profileStatus !== "active" && (
          <div className="border border-primary/40 bg-primary/5 p-5">
            <div className="text-xs uppercase tracking-widest text-primary mb-1">Profiel in afwachting</div>
            <p className="text-sm text-muted-foreground">
              Je account staat nog op <strong>{profileStatus}</strong>. Ferdi moet je eerst goedkeuren voordat je private trainingen kunt boeken. Public proeftrainingen zijn wel zichtbaar.
            </p>
          </div>
        )}

        {/* Mijn boekingen */}
        <section>
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Mijn boekingen</div>
          <h2 className="display-font text-3xl uppercase mt-2 mb-6">Aankomend</h2>
          {myUpcoming.length === 0 ? (
            <div className="border border-border bg-card p-6 text-sm text-muted-foreground">Nog geen aankomende trainingen.</div>
          ) : (
            <div className="space-y-2">
              {myUpcoming.map(({ b, s }) => (
                <div key={b.id} className="border border-border bg-card p-4 flex items-center justify-between gap-3">
                  <div>
                    <div className="display-font text-xl uppercase">{fmtDate(s!.date)}</div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                      {fmtTime(s!.start_time)}–{fmtTime(s!.end_time)} · {trainingTypeLabel(s!.training_type)}{s!.location ? ` · ${s!.location}` : ""}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest mt-1 text-primary">{b.status}</div>
                  </div>
                  <button onClick={() => cancel(b, s)} className="text-[10px] uppercase tracking-widest border border-destructive/40 text-destructive px-3 py-1.5 hover:bg-destructive/10">Annuleer</button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Beschikbare trainingen */}
        <section>
          <div className="flex items-end justify-between flex-wrap gap-3 mb-6">
            <div>
              <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Beschikbaar</div>
              <h2 className="display-font text-3xl uppercase mt-2">Boek een training</h2>
            </div>
            <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="bg-background border border-border px-3 py-2 text-sm">
              <option value="all">Alle types</option>
              <option value="one_on_one">1-op-1</option>
              <option value="duo">Duo</option>
              <option value="small_group">Small Group</option>
              <option value="bvo_small_group">BVO Small Group</option>
              <option value="trial">Proeftraining</option>
            </select>
          </div>

          {filteredSlots.length === 0 ? (
            <div className="border border-border bg-card p-6 text-sm text-muted-foreground">Geen beschikbare trainingen.</div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {filteredSlots.map((s) => {
                const alreadyBooked = bookings.some((b) => b.slot_id === s.id && ACTIVE_BOOKING_STATUSES.includes(b.status));
                return (
                  <div key={s.id} className="border border-border bg-card p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="display-font text-lg uppercase">{fmtDate(s.date)}</div>
                        <div className="font-mono text-sm mt-1">{fmtTime(s.start_time)} – {fmtTime(s.end_time)}</div>
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-1 border ${s.visibility === "public" ? "border-emerald-500/50 text-emerald-400" : "border-primary/50 text-primary"}`}>
                        {s.visibility}
                      </span>
                    </div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
                      {trainingTypeLabel(s.training_type)}{s.location ? ` · ${s.location}` : ""}{s.price_per_player ? ` · €${s.price_per_player}` : ""}
                    </div>
                    {s.player_note && <div className="text-xs text-muted-foreground mt-2 italic">"{s.player_note}"</div>}
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
                      Max {s.max_players} {s.max_players === 1 ? "speler" : "spelers"}
                    </div>
                    <button
                      disabled={alreadyBooked || busy === s.id || (profileStatus !== "active" && s.visibility === "private")}
                      onClick={() => book(s)}
                      className="mt-3 w-full bg-primary text-primary-foreground px-3 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 disabled:opacity-40"
                    >
                      {alreadyBooked ? "Al geboekt" : busy === s.id ? "..." : "Boek training"}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
