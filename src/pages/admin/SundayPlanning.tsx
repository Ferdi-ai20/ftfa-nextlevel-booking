import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { addWeeks, fmtSunday, isoDate, nextSunday } from "@/lib/dates";

type Slot = {
  id: string;
  player_id: string;
  slot_time: string;
  duration_minutes: number;
  active: boolean;
  player: { id: string; player_name: string; phone: string | null } | null;
};

type Confirmation = {
  player_id: string;
  status: "attending" | "not_attending" | "different_time";
  alt_from: string | null;
  alt_to: string | null;
  note: string | null;
};

const SundayPlanning = () => {
  const [weekOffset, setWeekOffset] = useState(0);
  const sunday = useMemo(() => addWeeks(nextSunday(), weekOffset), [weekOffset]);
  const sessionDate = isoDate(sunday);

  const [slots, setSlots] = useState<Slot[]>([]);
  const [confirms, setConfirms] = useState<Confirmation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void load();
  }, [sessionDate]);

  const load = async () => {
    setLoading(true);
    const [{ data: sl }, { data: cf }] = await Promise.all([
      supabase
        .from("fixed_sunday_slots")
        .select("id, player_id, slot_time, duration_minutes, active, player:players(id, player_name, phone)")
        .eq("active", true)
        .order("slot_time"),
      supabase
        .from("weekly_confirmations")
        .select("player_id, status, alt_from, alt_to, note")
        .eq("session_date", sessionDate),
    ]);
    setSlots((sl ?? []) as any);
    setConfirms((cf ?? []) as Confirmation[]);
    setLoading(false);
  };

  const cfFor = (pid: string) => confirms.find((c) => c.player_id === pid);

  const counts = {
    attending: confirms.filter((c) => c.status === "attending").length,
    absent: confirms.filter((c) => c.status === "not_attending").length,
    diff: confirms.filter((c) => c.status === "different_time").length,
    pending: slots.length - confirms.length,
  };
  const freedSlots = slots.filter((s) => {
    const c = cfFor(s.player_id);
    return c?.status === "not_attending" || c?.status === "different_time";
  });

  const wa = (phone: string | null | undefined) => {
    if (!phone) return null;
    return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(
      `Hi! Quick reminder — confirm your FTFA slot for Sunday ${fmtSunday(sunday)}.`
    )}`;
  };

  const overrideStatus = async (pid: string, status: Confirmation["status"]) => {
    const existing = confirms.find((c) => c.player_id === pid);
    const payload = {
      player_id: pid,
      session_date: sessionDate,
      status,
    };
    if (existing) {
      await supabase
        .from("weekly_confirmations")
        .update(payload)
        .eq("player_id", pid)
        .eq("session_date", sessionDate);
    } else {
      await supabase.from("weekly_confirmations").insert(payload);
    }
    void load();
  };

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Sunday Planning</div>
          <h1 className="display-font text-4xl md:text-5xl uppercase mt-2">{fmtSunday(sunday)}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset((w) => w - 1)}
            className="px-3 py-2 text-xs uppercase tracking-widest border border-border hover:border-foreground/40"
          >
            ← Prev
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="px-3 py-2 text-xs uppercase tracking-widest border border-border hover:border-foreground/40"
          >
            This Sun
          </button>
          <button
            onClick={() => setWeekOffset((w) => w + 1)}
            className="px-3 py-2 text-xs uppercase tracking-widest border border-border hover:border-foreground/40"
          >
            Next →
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Attending" value={counts.attending} tone="primary" />
        <Stat label="Absent" value={counts.absent} tone="destructive" />
        <Stat label="Different time" value={counts.diff} tone="amber" />
        <Stat label="No response" value={counts.pending} tone="muted" />
      </div>

      {freedSlots.length > 0 && (
        <div className="border border-amber-500/40 bg-amber-500/10 p-4">
          <div className="text-[11px] uppercase tracking-[0.25em] text-amber-400 mb-2">
            {freedSlots.length} slot{freedSlots.length > 1 ? "s" : ""} freed up
          </div>
          <div className="flex flex-wrap gap-2">
            {freedSlots.map((s) => (
              <span key={s.id} className="text-xs border border-amber-500/40 px-2 py-1">
                {s.slot_time} — {s.player?.player_name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="border border-border bg-card divide-y divide-border">
        {loading ? (
          <div className="p-6 text-sm text-muted-foreground">Loading…</div>
        ) : slots.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No fixed Sunday slots yet. Add players in the Fixed Players tab.
          </div>
        ) : (
          slots.map((s) => {
            const c = cfFor(s.player_id);
            return (
              <div key={s.id} className="p-4 grid md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-2 font-mono text-lg">{s.slot_time}</div>
                <div className="md:col-span-3">
                  <div className="font-medium">{s.player?.player_name}</div>
                  {s.player?.phone && (
                    <div className="text-xs text-muted-foreground">{s.player.phone}</div>
                  )}
                </div>
                <div className="md:col-span-3">
                  <StatusBadge status={c?.status ?? null} />
                  {c?.status === "different_time" && (c.alt_from || c.alt_to) && (
                    <div className="text-xs text-amber-400 mt-1">
                      Available {c.alt_from || "?"}–{c.alt_to || "?"}
                    </div>
                  )}
                  {c?.note && <div className="text-xs text-muted-foreground mt-1">"{c.note}"</div>}
                </div>
                <div className="md:col-span-4 flex flex-wrap gap-2 justify-start md:justify-end">
                  {!c && wa(s.player?.phone) && (
                    <a
                      href={wa(s.player?.phone)!}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] uppercase tracking-widest border border-border px-2 py-1 hover:border-foreground/40"
                    >
                      Remind
                    </a>
                  )}
                  <button
                    onClick={() => overrideStatus(s.player_id, "attending")}
                    className="text-[10px] uppercase tracking-widest border border-primary/40 text-primary px-2 py-1 hover:bg-primary/10"
                  >
                    Mark in
                  </button>
                  <button
                    onClick={() => overrideStatus(s.player_id, "not_attending")}
                    className="text-[10px] uppercase tracking-widest border border-destructive/40 text-destructive px-2 py-1 hover:bg-destructive/10"
                  >
                    Mark out
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

const Stat = ({ label, value, tone }: { label: string; value: number; tone: "primary" | "destructive" | "amber" | "muted" }) => {
  const toneCls = {
    primary: "border-primary/40 text-primary",
    destructive: "border-destructive/40 text-destructive",
    amber: "border-amber-500/40 text-amber-400",
    muted: "border-border text-muted-foreground",
  }[tone];
  return (
    <div className={`border ${toneCls} bg-card p-4`}>
      <div className="text-[10px] uppercase tracking-widest">{label}</div>
      <div className="display-font text-4xl mt-1">{value}</div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: Confirmation["status"] | null }) => {
  if (!status)
    return (
      <span className="text-[10px] uppercase tracking-widest border border-border px-2 py-1 text-muted-foreground">
        ⏳ No response
      </span>
    );
  const map = {
    attending: { l: "✅ Attending", c: "border-primary/50 bg-primary/10 text-primary" },
    not_attending: { l: "❌ Absent", c: "border-destructive/50 bg-destructive/10 text-destructive" },
    different_time: { l: "⏰ Different time", c: "border-amber-500/50 bg-amber-500/10 text-amber-400" },
  } as const;
  const m = map[status];
  return <span className={`text-[10px] uppercase tracking-widest border px-2 py-1 ${m.c}`}>{m.l}</span>;
};

export default SundayPlanning;
