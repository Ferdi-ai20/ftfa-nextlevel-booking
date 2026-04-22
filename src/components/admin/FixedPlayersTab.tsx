import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Player = { id: string; name: string; phone: string; slot_day: string; slot_time: string; notes: string | null; active: boolean };

const FixedPlayersTab = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", slot_day: "sunday", slot_time: "10:00", notes: "" });

  const load = async () => {
    const { data } = await supabase.from("fixed_players").select("*").order("slot_day").order("slot_time");
    setPlayers(data || []);
  };
  useEffect(() => { load(); }, []);

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("fixed_players").insert({
      name: form.name.trim(),
      phone: form.phone.replace(/\s+/g, ""),
      slot_day: form.slot_day,
      slot_time: form.slot_time,
      notes: form.notes || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Player added");
    setForm({ name: "", phone: "", slot_day: "sunday", slot_time: "10:00", notes: "" });
    load();
  };

  const toggle = async (p: Player) => {
    await supabase.from("fixed_players").update({ active: !p.active }).eq("id", p.id);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this player?")) return;
    await supabase.from("fixed_players").delete().eq("id", id);
    load();
  };

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <form onSubmit={add} className="bg-card border border-border p-6 space-y-3">
        <div className="display-font text-xl uppercase">Add fixed player</div>
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-background border border-border px-3 py-2" />
        <input required placeholder="Phone (+31...)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full bg-background border border-border px-3 py-2" />
        <div className="grid grid-cols-2 gap-3">
          <select value={form.slot_day} onChange={(e) => setForm({ ...form, slot_day: e.target.value })}
            className="bg-background border border-border px-3 py-2">
            {["sunday","saturday","monday","tuesday","wednesday","thursday","friday"].map(d => <option key={d} value={d}>{d}</option>)}
          </select>
          <input type="time" value={form.slot_time} onChange={(e) => setForm({ ...form, slot_time: e.target.value })}
            className="bg-background border border-border px-3 py-2 [color-scheme:dark]" />
        </div>
        <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
          className="w-full bg-background border border-border px-3 py-2" />
        <button className="w-full bg-primary text-primary-foreground py-2 text-xs uppercase tracking-widest font-semibold">Add</button>
      </form>

      <div className="bg-card border border-border p-6">
        <div className="display-font text-xl uppercase mb-4">All players ({players.length})</div>
        <div className="space-y-2">
          {players.map((p) => (
            <div key={p.id} className={`flex items-center justify-between border border-border p-3 ${!p.active && "opacity-50"}`}>
              <div>
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-muted-foreground">{p.slot_day} {p.slot_time} · {p.phone}</div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggle(p)} className="text-xs uppercase border border-border px-3 py-1 hover:border-foreground/40">{p.active ? "Pause" : "Activate"}</button>
                <button onClick={() => remove(p.id)} className="text-xs uppercase border border-destructive/40 text-destructive px-3 py-1 hover:bg-destructive/10">Delete</button>
              </div>
            </div>
          ))}
          {players.length === 0 && <div className="text-sm text-muted-foreground">No fixed players yet.</div>}
        </div>
      </div>
    </div>
  );
};

export default FixedPlayersTab;
