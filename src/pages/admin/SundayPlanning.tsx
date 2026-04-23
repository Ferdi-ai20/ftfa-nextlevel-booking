import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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
  const [editing, setEditing] = useState<string | null>(null); // player_id being edited
  const [editForm, setEditForm] = useState({ alt_from: "", alt_to: "", note: "" });

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
    const payload: any = {
      player_id: pid,
      session_date: sessionDate,
      status,
    };
    // When switching away from different_time, clear the alt fields
    if (status !== "different_time") {
      payload.alt_from = null;
      payload.alt_to = null;
    }
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

  const startEdit = (pid: string) => {
    const c = cfFor(pid);
    setEditForm({
      alt_from: c?.alt_from ?? "",
      alt_to: c?.alt_to ?? "",
      note: c?.note ?? "",
    });
    setEditing(pid);
  };

  const saveEdit = async (pid: string) => {
    const existing = cfFor(pid);
    const payload: any = {
      player_id: pid,
      session_date: sessionDate,
      status: "different_time",
      alt_from: editForm.alt_from || null,
      alt_to: editForm.alt_to || null,
      note: editForm.note || null,
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
    setEditing(null);
    void load();
  };

  const clearResponse = async (pid: string) => {
    if (!confirm("Clear this player's response? Status will reset to 'no response'.")) return;
    await supabase
      .from("weekly_confirmations")
      .delete()
      .eq("player_id", pid)
      .eq("session_date", sessionDate);
    void load();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Sunday Planning</div>
          <h1 className="display-font text-2xl md:text-3xl uppercase mt-2 truncate">{fmtSunday(sunday)}</h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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
            const isEditing = editing === s.player_id;
            return (
              <div key={s.id} className="p-4 space-y-3">
                {/* Top row: time + name + status */}
                <div className="flex flex-col gap-3 lg:grid lg:grid-cols-12 lg:gap-4 lg:items-center">
                  <div className="lg:col-span-2 font-mono text-lg">{s.slot_time}</div>
                  <div className="lg:col-span-3 min-w-0">
                    <div className="font-medium truncate">{s.player?.player_name}</div>
                    {s.player?.phone && (
                      <div className="text-xs text-muted-foreground truncate">{s.player.phone}</div>
                    )}
                  </div>
                  <div className="lg:col-span-3 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <StatusBadge status={c?.status ?? null} />
                      {c && (
                        <>
                          <button
                            onClick={() => startEdit(s.player_id)}
                            title="Edit response"
                            className="p-1 border border-border hover:border-foreground/40 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => clearResponse(s.player_id)}
                            title="Clear response"
                            className="p-1 border border-border hover:border-destructive/60 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </>
                      )}
                    </div>
                    {c?.status === "different_time" && (c.alt_from || c.alt_to) && (
                      <div className="text-sm text-amber-400 mt-1.5">
                        Available {c.alt_from || "?"}–{c.alt_to || "?"}
                      </div>
                    )}
                    {c?.note && <div className="text-sm text-muted-foreground mt-1 italic">"{c.note}"</div>}
                  </div>
                  <div className="lg:col-span-4 flex flex-wrap gap-2 lg:justify-end">
                    {!c && wa(s.player?.phone) && (
                      <a
                        href={wa(s.player?.phone)!}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] uppercase tracking-widest border border-border px-2.5 py-1.5 hover:border-foreground/40 whitespace-nowrap"
                      >
                        Remind
                      </a>
                    )}
                    <button
                      onClick={() => overrideStatus(s.player_id, "attending")}
                      className="text-[10px] uppercase tracking-widest border border-primary/40 text-primary px-2.5 py-1.5 hover:bg-primary/10 whitespace-nowrap"
                    >
                      Mark in
                    </button>
                    <button
                      onClick={() => overrideStatus(s.player_id, "not_attending")}
                      className="text-[10px] uppercase tracking-widest border border-destructive/40 text-destructive px-2.5 py-1.5 hover:bg-destructive/10 whitespace-nowrap"
                    >
                      Mark out
                    </button>
                    <button
                      onClick={() => startEdit(s.player_id)}
                      className="text-[10px] uppercase tracking-widest border border-amber-500/40 text-amber-400 px-2.5 py-1.5 hover:bg-amber-500/10 whitespace-nowrap"
                    >
                      Different time
                    </button>
                  </div>
                </div>

                {/* Inline editor */}
                {isEditing && (
                  <div className="border border-amber-500/40 bg-amber-500/5 p-3 space-y-3">
                    <div className="text-[10px] uppercase tracking-widest text-amber-400">
                      Edit response · Different time
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="text-xs">
                        <span className="text-muted-foreground">From</span>
                        <input
                          type="time"
                          value={editForm.alt_from}
                          onChange={(e) => setEditForm({ ...editForm, alt_from: e.target.value })}
                          className="mt-1 w-full bg-background border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none [color-scheme:dark]"
                        />
                      </label>
                      <label className="text-xs">
                        <span className="text-muted-foreground">To</span>
                        <input
                          type="time"
                          value={editForm.alt_to}
                          onChange={(e) => setEditForm({ ...editForm, alt_to: e.target.value })}
                          className="mt-1 w-full bg-background border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none [color-scheme:dark]"
                        />
                      </label>
                    </div>
                    <label className="text-xs block">
                      <span className="text-muted-foreground">Note (optional)</span>
                      <textarea
                        value={editForm.note}
                        onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
                        rows={2}
                        className="mt-1 w-full bg-background border border-border px-2 py-1.5 text-sm focus:border-primary focus:outline-none"
                      />
                    </label>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setEditing(null)}
                        className="text-[10px] uppercase tracking-widest border border-border px-3 py-1.5 hover:border-foreground/40"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEdit(s.player_id)}
                        className="text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-3 py-1.5 font-semibold hover:bg-primary/90"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                )}
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
      <div className="display-font text-3xl md:text-4xl mt-1">{value}</div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: Confirmation["status"] | null }) => {
  if (!status)
    return (
      <span className="text-[10px] uppercase tracking-widest border border-border px-2 py-1 text-muted-foreground whitespace-nowrap">
        ⏳ No response
      </span>
    );
  const map = {
    attending: { l: "✅ Attending", c: "border-primary/50 bg-primary/10 text-primary" },
    not_attending: { l: "❌ Absent", c: "border-destructive/50 bg-destructive/10 text-destructive" },
    different_time: { l: "⏰ Different time", c: "border-amber-500/50 bg-amber-500/10 text-amber-400" },
  } as const;
  const m = map[status];
  return <span className={`text-[10px] uppercase tracking-widest border px-2 py-1 whitespace-nowrap ${m.c}`}>{m.l}</span>;
};

export default SundayPlanning;
