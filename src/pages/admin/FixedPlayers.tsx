import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Player = { id: string; player_name: string; phone: string | null };
type Slot = {
  id: string;
  player_id: string;
  slot_time: string;
  duration_minutes: number;
  active: boolean;
  player: Player | null;
};

const FixedPlayers = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ player_id: "", slot_time: "10:00", duration_minutes: 60 });

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    const [{ data: sl }, { data: pl }] = await Promise.all([
      supabase
        .from("fixed_sunday_slots")
        .select("*, player:players(id, player_name, phone)")
        .order("slot_time"),
      supabase.from("players").select("id, player_name, phone").order("player_name"),
    ]);
    setSlots((sl ?? []) as any);
    setPlayers((pl ?? []) as Player[]);
  };

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.player_id) return toast.error("Pick a player");
    const { error } = await supabase.from("fixed_sunday_slots").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Slot added");
    setAdding(false);
    setForm({ player_id: "", slot_time: "10:00", duration_minutes: 60 });
    void load();
  };

  const toggleActive = async (s: Slot) => {
    await supabase.from("fixed_sunday_slots").update({ active: !s.active }).eq("id", s.id);
    void load();
  };

  const remove = async (s: Slot) => {
    if (!confirm("Delete this slot?")) return;
    await supabase.from("fixed_sunday_slots").delete().eq("id", s.id);
    void load();
  };

  const updateTime = async (s: Slot, slot_time: string) => {
    await supabase.from("fixed_sunday_slots").update({ slot_time }).eq("id", s.id);
    void load();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Fixed Players</div>
          <h1 className="display-font text-2xl md:text-3xl uppercase mt-2">Sunday roster</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Assign players to a recurring Sunday slot. Add players first in the Players tab.
          </p>
        </div>
        <button
          onClick={() => setAdding(true)}
          className="bg-primary text-primary-foreground px-4 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 self-start sm:self-auto whitespace-nowrap"
        >
          + Assign slot
        </button>
      </header>

      <div className="border border-border bg-card divide-y divide-border">
        {slots.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No fixed slots yet.</div>
        ) : (
          slots.map((s) => (
            <div key={s.id} className="p-4 grid md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-2">
                <input
                  type="time"
                  defaultValue={s.slot_time}
                  onBlur={(e) => updateTime(s, e.target.value)}
                  className="w-full bg-background border border-border px-3 py-2 [color-scheme:dark] font-mono"
                />
              </div>
              <div className="md:col-span-4">
                <div className="font-medium">{s.player?.player_name}</div>
                <div className="text-xs text-muted-foreground">{s.player?.phone}</div>
              </div>
              <div className="md:col-span-3 text-xs uppercase tracking-widest text-muted-foreground">
                {s.duration_minutes} min · {s.active ? "active" : "paused"}
              </div>
              <div className="md:col-span-3 flex gap-2 justify-end">
                <button
                  onClick={() => toggleActive(s)}
                  className="text-[10px] uppercase tracking-widest border border-border px-2 py-1 hover:border-foreground/40"
                >
                  {s.active ? "Pause" : "Activate"}
                </button>
                <button
                  onClick={() => remove(s)}
                  className="text-[10px] uppercase tracking-widest border border-destructive/40 text-destructive px-2 py-1 hover:bg-destructive/10"
                >
                  Del
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-4">
          <form onSubmit={add} className="bg-card border border-border w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="display-font text-2xl uppercase">Assign slot</div>
              <button type="button" onClick={() => setAdding(false)} className="text-xs uppercase">✕</button>
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Player</label>
              <select
                required
                value={form.player_id}
                onChange={(e) => setForm({ ...form, player_id: e.target.value })}
                className="mt-2 w-full bg-background border border-border px-3 py-2"
              >
                <option value="">Select…</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.player_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Sunday time</label>
                <input
                  type="time"
                  value={form.slot_time}
                  onChange={(e) => setForm({ ...form, slot_time: e.target.value })}
                  className="mt-2 w-full bg-background border border-border px-3 py-2 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Duration (min)</label>
                <input
                  type="number"
                  min={15}
                  max={180}
                  value={form.duration_minutes}
                  onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
                  className="mt-2 w-full bg-background border border-border px-3 py-2"
                />
              </div>
            </div>
            <button className="w-full bg-primary text-primary-foreground py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90">
              Assign
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default FixedPlayers;
