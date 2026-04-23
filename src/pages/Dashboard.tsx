import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ageFromBirthdate, deadlineFor, fmtSunday, isPastDeadline, isoDate, nextSunday } from "@/lib/dates";
import ParentBooking from "@/components/site/ParentBooking";

type Player = {
  id: string;
  player_name: string;
  parent_name: string | null;
  birthdate: string | null;
  club: string | null;
  team: string | null;
  level: string | null;
  position: string | null;
};

type Slot = { id: string; player_id: string; slot_time: string; duration_minutes: number };

type Confirmation = {
  id: string;
  player_id: string;
  session_date: string;
  status: "attending" | "not_attending" | "different_time";
  alt_from: string | null;
  alt_to: string | null;
  note: string | null;
  locked: boolean;
};

const Dashboard = () => {
  const { session, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<Player[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [confirmations, setConfirmations] = useState<Confirmation[]>([]);
  const [profileName, setProfileName] = useState("");

  const sunday = useMemo(nextSunday, []);
  const sessionDate = isoDate(sunday);
  const deadline = useMemo(() => deadlineFor(sunday), [sunday]);
  const locked = isPastDeadline(sunday);

  useEffect(() => {
    if (!loading && !session) navigate("/auth?redirect=/dashboard", { replace: true });
    if (!loading && session && isAdmin) navigate("/admin", { replace: true });
  }, [session, isAdmin, loading, navigate]);

  useEffect(() => {
    if (!session) return;
    void loadAll();
  }, [session]);

  const loadAll = async () => {
    const [{ data: ps }, { data: prof }] = await Promise.all([
      supabase.from("players").select("*").eq("parent_user_id", session!.user.id),
      supabase.from("profiles").select("full_name").eq("id", session!.user.id).maybeSingle(),
    ]);
    setProfileName(prof?.full_name ?? "");
    setPlayers((ps ?? []) as Player[]);
    if (ps && ps.length) {
      const ids = ps.map((p: any) => p.id);
      const [{ data: sl }, { data: cf }] = await Promise.all([
        supabase.from("fixed_sunday_slots").select("*").in("player_id", ids).eq("active", true),
        supabase
          .from("weekly_confirmations")
          .select("*")
          .in("player_id", ids)
          .order("session_date", { ascending: false })
          .limit(40),
      ]);
      setSlots((sl ?? []) as Slot[]);
      setConfirmations((cf ?? []) as Confirmation[]);
    }
  };

  const respond = async (
    playerId: string,
    status: Confirmation["status"],
    extras?: { alt_from?: string; alt_to?: string; note?: string }
  ) => {
    if (locked) return toast.error("Deadline passed. Contact your coach.");
    const existing = confirmations.find((c) => c.player_id === playerId && c.session_date === sessionDate);
    const payload = {
      player_id: playerId,
      session_date: sessionDate,
      status,
      alt_from: extras?.alt_from ?? null,
      alt_to: extras?.alt_to ?? null,
      note: extras?.note ?? null,
      responded_by: session!.user.id,
    };
    const { error } = existing
      ? await supabase.from("weekly_confirmations").update(payload).eq("id", existing.id)
      : await supabase.from("weekly_confirmations").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved.");
    void loadAll();
  };

  const saveProfile = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: profileName })
      .eq("id", session!.user.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated.");
  };

  if (loading || !session) {
    return <div className="min-h-screen grid place-items-center bg-background text-foreground">Loading…</div>;
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur z-40">
        <div className="container flex items-center justify-between h-16">
          <Link to="/" className="display-font text-2xl">FTFA</Link>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs uppercase tracking-widest text-muted-foreground">
              {session.user.email}
            </span>
            <button
              onClick={signOut}
              className="text-xs uppercase tracking-widest border border-border px-3 py-1.5 hover:border-foreground/40"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="container py-10 space-y-12">
        <section>
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ This Sunday</div>
          <h1 className="display-font text-5xl md:text-6xl uppercase mt-2">{fmtSunday(sunday)}</h1>
          <div className={`mt-4 inline-flex items-center gap-3 border px-4 py-2 ${locked ? "border-destructive/50 bg-destructive/10 text-destructive" : "border-primary/40 bg-primary/5 text-primary"}`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            <span className="text-xs uppercase tracking-widest">
              {locked
                ? "Locked — contact coach to change"
                : `Respond before ${deadline.toLocaleDateString("en-GB", { weekday: "short" })} ${deadline.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`}
            </span>
          </div>
        </section>

        {players.length === 0 ? (
          <section className="bg-card border border-border p-8">
            <div className="display-font text-2xl uppercase">No player linked yet</div>
            <p className="mt-3 text-sm text-muted-foreground max-w-md">
              Your account isn't linked to a player profile yet. Your coach will link you after your first session — or join the waitlist to get started.
            </p>
            <Link
              to="/waitlist"
              className="inline-block mt-6 bg-primary text-primary-foreground px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90"
            >
              Join the waitlist
            </Link>
          </section>
        ) : (
          players.map((p) => {
            const slot = slots.find((s) => s.player_id === p.id);
            const cf = confirmations.find((c) => c.player_id === p.id && c.session_date === sessionDate);
            return <PlayerCard key={p.id} player={p} slot={slot} confirmation={cf} locked={locked} onRespond={respond} />;
          })
        )}

        {/* Available bookings */}
        <ParentBooking />

        {/* History */}
        {players.length > 0 && (
          <section>
            <h2 className="display-font text-3xl uppercase mb-6">History</h2>
            <div className="bg-card border border-border divide-y divide-border">
              {confirmations.filter((c) => c.session_date !== sessionDate).slice(0, 8).map((c) => {
                const p = players.find((pl) => pl.id === c.player_id);
                return (
                  <div key={c.id} className="flex items-center justify-between p-4 text-sm">
                    <div>
                      <div className="font-medium">{p?.player_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(c.session_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>
                );
              })}
              {confirmations.filter((c) => c.session_date !== sessionDate).length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">No history yet.</div>
              )}
            </div>
          </section>
        )}

        {/* Profile */}
        <section>
          <h2 className="display-font text-3xl uppercase mb-6">Your profile</h2>
          <div className="bg-card border border-border p-6 space-y-4 max-w-xl">
            <div>
              <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Full name</label>
              <input
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="mt-2 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Email</label>
              <div className="mt-2 px-4 py-3 border border-border bg-secondary/30 text-sm">{session.user.email}</div>
            </div>
            <button
              onClick={saveProfile}
              className="bg-primary text-primary-foreground px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90"
            >
              Save changes
            </button>
          </div>
        </section>
      </div>
    </main>
  );
};

const StatusBadge = ({ status }: { status: Confirmation["status"] }) => {
  const map = {
    attending: { label: "Attending", cls: "border-primary/50 bg-primary/10 text-primary" },
    not_attending: { label: "Absent", cls: "border-destructive/50 bg-destructive/10 text-destructive" },
    different_time: { label: "Different time", cls: "border-amber-500/50 bg-amber-500/10 text-amber-400" },
  } as const;
  const m = map[status];
  return <span className={`text-[10px] uppercase tracking-widest border px-2 py-1 ${m.cls}`}>{m.label}</span>;
};

const PlayerCard = ({
  player,
  slot,
  confirmation,
  locked,
  onRespond,
}: {
  player: Player;
  slot: Slot | undefined;
  confirmation: Confirmation | undefined;
  locked: boolean;
  onRespond: (
    id: string,
    status: Confirmation["status"],
    extras?: { alt_from?: string; alt_to?: string; note?: string }
  ) => void;
}) => {
  const [showAlt, setShowAlt] = useState(false);
  const [from, setFrom] = useState(confirmation?.alt_from ?? "");
  const [to, setTo] = useState(confirmation?.alt_to ?? "");
  const [note, setNote] = useState(confirmation?.note ?? "");

  const age = ageFromBirthdate(player.birthdate);

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border p-6 md:p-8"
    >
      <div className="flex items-start justify-between gap-6 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Player</div>
          <div className="display-font text-3xl uppercase mt-1">{player.player_name}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {[age && `${age}y`, player.club, player.team, player.level, player.position].filter(Boolean).join(" · ")}
          </div>
        </div>
        {confirmation && <StatusBadge status={confirmation.status} />}
      </div>

      <div className="mt-6 border-t border-border pt-6">
        {slot ? (
          <div>
            <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Your fixed slot</div>
            <div className="display-font text-2xl uppercase mt-1">
              Sunday <span className="text-primary">{slot.slot_time}</span>
              <span className="text-sm text-muted-foreground ml-2 normal-case font-sans tracking-normal">
                ({slot.duration_minutes} min)
              </span>
            </div>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No fixed Sunday slot assigned.</div>
        )}
      </div>

      {slot && (
        <div className="mt-6">
          <div className="grid sm:grid-cols-3 gap-3">
            <button
              disabled={locked}
              onClick={() => onRespond(player.id, "attending")}
              className={`px-4 py-4 text-xs uppercase tracking-widest font-semibold border transition-colors ${confirmation?.status === "attending" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground/40"} disabled:opacity-40`}
            >
              ✅ Attending
            </button>
            <button
              disabled={locked}
              onClick={() => onRespond(player.id, "not_attending")}
              className={`px-4 py-4 text-xs uppercase tracking-widest font-semibold border transition-colors ${confirmation?.status === "not_attending" ? "bg-destructive text-destructive-foreground border-destructive" : "border-border hover:border-foreground/40"} disabled:opacity-40`}
            >
              ❌ Not attending
            </button>
            <button
              disabled={locked}
              onClick={() => setShowAlt((v) => !v)}
              className={`px-4 py-4 text-xs uppercase tracking-widest font-semibold border transition-colors ${confirmation?.status === "different_time" || showAlt ? "bg-amber-500 text-background border-amber-500" : "border-border hover:border-foreground/40"} disabled:opacity-40`}
            >
              ⏰ Different time
            </button>
          </div>

          {showAlt && (
            <div className="mt-6 grid sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Available from</label>
                <input
                  type="time"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="mt-2 w-full bg-background border border-border px-3 py-2 focus:border-primary focus:outline-none [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Until</label>
                <input
                  type="time"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="mt-2 w-full bg-background border border-border px-3 py-2 focus:border-primary focus:outline-none [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Note (optional)</label>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  maxLength={200}
                  className="mt-2 w-full bg-background border border-border px-3 py-2 focus:border-primary focus:outline-none"
                />
              </div>
              <button
                onClick={() => {
                  onRespond(player.id, "different_time", { alt_from: from, alt_to: to, note });
                  setShowAlt(false);
                }}
                className="sm:col-span-3 bg-primary text-primary-foreground py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90"
              >
                Submit alternative time
              </button>
            </div>
          )}
        </div>
      )}
    </motion.section>
  );
};

export default Dashboard;
