import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LEVELS, TRAINING_TYPES } from "@/components/site/WaitlistForm";
import { ageFromBirthdate } from "@/lib/dates";

type Player = {
  id: string;
  player_name: string;
  parent_name: string | null;
  phone: string | null;
  email: string | null;
  birthdate: string | null;
  club: string | null;
  team: string | null;
  level: string | null;
  position: string | null;
  training_type: string | null;
  parent_user_id: string | null;
  created_at: string;
};

const empty = {
  player_name: "",
  parent_name: "",
  phone: "",
  email: "",
  birthdate: "",
  club: "",
  team: "",
  level: "",
  position: "",
  training_type: "",
};

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Player | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    const { data } = await supabase.from("players").select("*").order("player_name");
    setPlayers((data ?? []) as Player[]);
  };

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setCreating(true);
  };

  const startEdit = (p: Player) => {
    setEditing(p);
    setForm({
      player_name: p.player_name ?? "",
      parent_name: p.parent_name ?? "",
      phone: p.phone ?? "",
      email: p.email ?? "",
      birthdate: p.birthdate ?? "",
      club: p.club ?? "",
      team: p.team ?? "",
      level: p.level ?? "",
      position: p.position ?? "",
      training_type: p.training_type ?? "",
    });
    setCreating(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.player_name.trim()) return toast.error("Player name required");
    const payload: any = { ...form };
    Object.keys(payload).forEach((k) => payload[k] === "" && (payload[k] = null));
    const { error } = editing
      ? await supabase.from("players").update(payload).eq("id", editing.id)
      : await supabase.from("players").insert(payload);
    if (error) return toast.error(error.message);
    toast.success("Saved.");
    setCreating(false);
    setEditing(null);
    void load();
  };

  const remove = async (p: Player) => {
    if (!confirm(`Delete ${p.player_name}? This removes their slot history.`)) return;
    const { error } = await supabase.from("players").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    void load();
  };

  const filtered = players.filter((p) =>
    [p.player_name, p.club, p.team, p.phone, p.email]
      .filter(Boolean)
      .some((v) => v!.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Players</div>
          <h1 className="display-font text-4xl uppercase mt-2">All players</h1>
        </div>
        <button
          onClick={startCreate}
          className="bg-primary text-primary-foreground px-4 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90"
        >
          + New player
        </button>
      </header>

      <input
        placeholder="Search by name, club, phone…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full bg-card border border-border px-4 py-3 focus:border-primary focus:outline-none"
      />

      <div className="border border-border bg-card divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No players yet.</div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="p-4 grid md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-3">
                <div className="font-medium">{p.player_name}</div>
                <div className="text-xs text-muted-foreground">
                  {[ageFromBirthdate(p.birthdate) && `${ageFromBirthdate(p.birthdate)}y`, p.position]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
              <div className="md:col-span-3 text-sm">
                <div>{p.club || <span className="text-muted-foreground">—</span>}</div>
                <div className="text-xs text-muted-foreground">{p.team}</div>
              </div>
              <div className="md:col-span-2 text-xs uppercase tracking-widest text-muted-foreground">
                {p.level || "—"}
              </div>
              <div className="md:col-span-2 text-xs">
                {p.phone && <div>{p.phone}</div>}
                {p.email && <div className="text-muted-foreground">{p.email}</div>}
              </div>
              <div className="md:col-span-2 flex gap-2 justify-end">
                <button
                  onClick={() => startEdit(p)}
                  className="text-[10px] uppercase tracking-widest border border-border px-2 py-1 hover:border-foreground/40"
                >
                  Edit
                </button>
                <button
                  onClick={() => remove(p)}
                  className="text-[10px] uppercase tracking-widest border border-destructive/40 text-destructive px-2 py-1 hover:bg-destructive/10"
                >
                  Del
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-4 overflow-auto">
          <form
            onSubmit={save}
            className="bg-card border border-border w-full max-w-2xl p-6 space-y-4 my-10"
          >
            <div className="flex items-center justify-between">
              <div className="display-font text-2xl uppercase">
                {editing ? "Edit player" : "New player"}
              </div>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                ✕ Close
              </button>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <FormField label="Player name *">
                <input required value={form.player_name} onChange={(e) => setForm({ ...form, player_name: e.target.value })} className={ic} />
              </FormField>
              <FormField label="Parent name">
                <input value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} className={ic} />
              </FormField>
              <FormField label="Phone">
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={ic} />
              </FormField>
              <FormField label="Email">
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={ic} />
              </FormField>
              <FormField label="Birthdate">
                <input type="date" value={form.birthdate} onChange={(e) => setForm({ ...form, birthdate: e.target.value })} className={`${ic} [color-scheme:dark]`} />
              </FormField>
              <FormField label="Position">
                <input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className={ic} />
              </FormField>
              <FormField label="Club">
                <input value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} className={ic} />
              </FormField>
              <FormField label="Team">
                <input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} className={ic} />
              </FormField>
              <FormField label="Level">
                <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className={ic}>
                  <option value="">—</option>
                  {LEVELS.map((l) => <option key={l}>{l}</option>)}
                </select>
              </FormField>
              <FormField label="Training type">
                <select value={form.training_type} onChange={(e) => setForm({ ...form, training_type: e.target.value })} className={ic}>
                  <option value="">—</option>
                  {TRAINING_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </FormField>
            </div>
            <button type="submit" className="w-full bg-primary text-primary-foreground py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90">
              Save
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

const ic = "mt-2 w-full bg-background border border-border px-3 py-2 focus:border-primary focus:outline-none text-sm";
const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default Players;
