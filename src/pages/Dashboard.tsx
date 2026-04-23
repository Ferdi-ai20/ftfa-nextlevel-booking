import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ageFromBirthdate, deadlineFor, fmtSunday, isPastDeadline, isoDate, nextSunday } from "@/lib/dates";
import ParentBooking from "@/components/site/ParentBooking";
import CalendlyButton from "@/components/site/CalendlyButton";

type Player = {
  id: string;
  player_name: string;
  parent_name: string | null;
  birthdate: string | null;
  club: string | null;
  team: string | null;
  level: string | null;
  position: string | null;
  training_type?: string | null;
  preferred_time_from?: string | null;
  preferred_time_to?: string | null;
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
    const existing = confirmations.find((c) => c.player_id === playerId && c.session_date === sessionDate);
    if (existing?.locked) {
      toast.error("This response is locked by your coach. Contact them to change it.");
      return;
    }
    const payload = {
      player_id: playerId,
      session_date: sessionDate,
      status,
      alt_from: extras?.alt_from ?? null,
      alt_to: extras?.alt_to ?? null,
      note: extras?.note ?? null,
      responded_by: session!.user.id,
    };

    if (existing) {
      const { data, error } = await supabase
        .from("weekly_confirmations")
        .update(payload)
        .eq("id", existing.id)
        .select()
        .maybeSingle();
      if (error) {
        console.error("respond update error", error);
        toast.error(error.message || "Could not save your response.");
        return;
      }
      if (data) {
        setConfirmations((prev) => prev.map((c) => (c.id === data.id ? (data as Confirmation) : c)));
      }
    } else {
      const { data, error } = await supabase
        .from("weekly_confirmations")
        .insert(payload)
        .select()
        .maybeSingle();
      if (error) {
        console.error("respond insert error", error);
        toast.error(error.message || "Could not save your response.");
        return;
      }
      if (data) {
        setConfirmations((prev) => [data as Confirmation, ...prev]);
      }
    }
    toast.success("Response saved");
  };

  const savePreferredTime = async (
    playerId: string,
    from: string,
    to: string,
  ) => {
    const { error } = await supabase
      .from("players")
      .update({
        preferred_time_from: from || null,
        preferred_time_to: to || null,
      })
      .eq("id", playerId);
    if (error) {
      console.error("savePreferredTime error", error);
      toast.error(error.message || "Could not save preferred time.");
      return;
    }
    setPlayers((prev) =>
      prev.map((p) =>
        p.id === playerId
          ? { ...p, preferred_time_from: from || null, preferred_time_to: to || null }
          : p,
      ),
    );
    toast.success("Preferred time saved");
  };

  const saveProfile = async () => {
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: profileName })
      .eq("id", session!.user.id);
    if (error) return toast.error(error.message);
    toast.success("Profile updated.");
  };

  const [requestText, setRequestText] = useState("");
  const [requestPlayerId, setRequestPlayerId] = useState<string | null>(null);
  const submitRequest = async () => {
    if (!requestPlayerId || !requestText.trim()) return;
    const { error } = await supabase.from("notes").insert({
      subject_type: "player",
      subject_id: requestPlayerId,
      author_id: session!.user.id,
      body: `[CHANGE REQUEST from ${session!.user.email}] ${requestText.trim()}`,
    });
    if (error) return toast.error(error.message);
    toast.success("Request sent to your coach.");
    setRequestText("");
    setRequestPlayerId(null);
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
          <div className={`mt-4 inline-flex items-center gap-3 border px-4 py-2 ${locked ? "border-amber-500/50 bg-amber-500/10 text-amber-400" : "border-primary/40 bg-primary/5 text-primary"}`}>
            <span className="w-2 h-2 rounded-full bg-current" />
            <span className="text-xs uppercase tracking-widest">
              {locked
                ? "Deadline passed — late responses still accepted"
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
            return (
              <PlayerCard
                key={p.id}
                player={p}
                slot={slot}
                confirmation={cf}
                onRespond={respond}
                onSavePreferredTime={savePreferredTime}
              />
            );
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

        {/* Player profiles (read-only) with request changes */}
        {players.length > 0 && (
          <section>
            <h2 className="display-font text-3xl uppercase mb-6">Player details</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {players.map((p) => (
                <div key={p.id} className="bg-card border border-border p-6 space-y-3">
                  <div className="display-font text-xl uppercase">{p.player_name}</div>
                  <dl className="text-sm space-y-1.5">
                    <Row label="Club" value={p.club} />
                    <Row label="Team" value={p.team} />
                    <Row label="Level" value={p.level} />
                    <Row label="Position" value={p.position} />
                  </dl>
                  <button
                    onClick={() => setRequestPlayerId(p.id)}
                    className="text-[11px] uppercase tracking-widest border border-border px-4 py-2 hover:border-foreground/40"
                  >
                    Request changes
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Request changes modal */}
      {requestPlayerId && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-4">
          <div className="bg-card border border-border w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="display-font text-xl uppercase">Request changes</div>
              <button onClick={() => setRequestPlayerId(null)} className="text-xs uppercase">✕</button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tell your coach what should change in your player profile (club, team, contact info, etc.).
            </p>
            <textarea
              value={requestText}
              onChange={(e) => setRequestText(e.target.value)}
              rows={5}
              maxLength={500}
              placeholder="e.g. New club: Ajax U15, position changed to CAM."
              className="w-full bg-background border border-border px-3 py-2 focus:border-primary focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRequestPlayerId(null)}
                className="flex-1 border border-border px-4 py-2.5 text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
              <button
                onClick={submitRequest}
                disabled={!requestText.trim()}
                className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 text-xs uppercase tracking-widest font-semibold disabled:opacity-40"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

const Row = ({ label, value }: { label: string | null; value: string | null }) => (
  <div className="flex justify-between gap-4">
    <dt className="text-muted-foreground text-xs uppercase tracking-widest">{label}</dt>
    <dd className="text-right">{value || <span className="text-muted-foreground">—</span>}</dd>
  </div>
);

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
  onRespond,
  onSavePreferredTime,
}: {
  player: Player;
  slot: Slot | undefined;
  confirmation: Confirmation | undefined;
  onRespond: (
    id: string,
    status: Confirmation["status"],
    extras?: { alt_from?: string; alt_to?: string; note?: string }
  ) => void;
  onSavePreferredTime: (id: string, from: string, to: string) => void;
}) => {
  const [showAlt, setShowAlt] = useState(false);
  const [from, setFrom] = useState(confirmation?.alt_from ?? "");
  const [to, setTo] = useState(confirmation?.alt_to ?? "");
  const [note, setNote] = useState(confirmation?.note ?? "");
  const [pending, setPending] = useState<null | Confirmation["status"]>(null);

  const [prefFrom, setPrefFrom] = useState(player.preferred_time_from ?? "");
  const [prefTo, setPrefTo] = useState(player.preferred_time_to ?? "");
  const [savingPref, setSavingPref] = useState(false);

  const recordLocked = confirmation?.locked === true;
  const age = ageFromBirthdate(player.birthdate);

  const handle = async (status: Confirmation["status"], extras?: { alt_from?: string; alt_to?: string; note?: string }) => {
    setPending(status);
    try {
      await onRespond(player.id, status, extras);
    } finally {
      setPending(null);
    }
  };

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
          <div className="text-sm text-muted-foreground">No fixed Sunday slot — let your coach know your preferred time below.</div>
        )}
        <div className="mt-4">
          <CalendlyButton trainingType={(player as any).training_type} />
        </div>
      </div>

      <div className="mt-6">
        {recordLocked && (
          <div className="mb-4 text-[11px] uppercase tracking-widest text-amber-400 border border-amber-500/40 bg-amber-500/10 px-3 py-2">
            🔒 Locked by coach — contact them to change this week's response
          </div>
        )}
        <div className="grid sm:grid-cols-3 gap-3">
          <button
            disabled={recordLocked || pending !== null}
            onClick={() => handle("attending")}
            className={`px-4 py-4 text-xs uppercase tracking-widest font-semibold border transition-colors ${confirmation?.status === "attending" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:border-foreground/40"} disabled:opacity-40`}
          >
            {pending === "attending" ? "Saving…" : "✅ Attending"}
          </button>
          <button
            disabled={recordLocked || pending !== null}
            onClick={() => handle("not_attending")}
            className={`px-4 py-4 text-xs uppercase tracking-widest font-semibold border transition-colors ${confirmation?.status === "not_attending" ? "bg-destructive text-destructive-foreground border-destructive" : "border-border hover:border-foreground/40"} disabled:opacity-40`}
          >
            {pending === "not_attending" ? "Saving…" : "❌ Not attending"}
          </button>
          <button
            disabled={recordLocked || pending !== null}
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
              disabled={pending !== null}
              onClick={async () => {
                await handle("different_time", { alt_from: from, alt_to: to, note });
                setShowAlt(false);
              }}
              className="sm:col-span-3 bg-primary text-primary-foreground py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 disabled:opacity-40"
            >
              {pending === "different_time" ? "Saving…" : "Submit alternative time"}
            </button>
          </div>
        )}
      </div>

      {/* Preferred training time */}
      <div className="mt-8 border-t border-border pt-6">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">My preferred training time</div>
        <p className="text-xs text-muted-foreground mt-1">
          The window you'd ideally train in each Sunday. Your coach uses this when planning the schedule.
        </p>
        <div className="mt-4 grid sm:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">From</label>
            <input
              type="time"
              value={prefFrom}
              onChange={(e) => setPrefFrom(e.target.value)}
              className="mt-2 w-full bg-background border border-border px-3 py-2 focus:border-primary focus:outline-none [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Until</label>
            <input
              type="time"
              value={prefTo}
              onChange={(e) => setPrefTo(e.target.value)}
              className="mt-2 w-full bg-background border border-border px-3 py-2 focus:border-primary focus:outline-none [color-scheme:dark]"
            />
          </div>
          <button
            disabled={savingPref}
            onClick={async () => {
              setSavingPref(true);
              try {
                await onSavePreferredTime(player.id, prefFrom, prefTo);
              } finally {
                setSavingPref(false);
              }
            }}
            className="bg-primary text-primary-foreground px-4 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 disabled:opacity-40"
          >
            {savingPref ? "Saving…" : "Save preferred time"}
          </button>
        </div>
      </div>
    </motion.section>
  );
};

export default Dashboard;
