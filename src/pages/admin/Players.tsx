import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Profile = { id: string; full_name: string | null; phone: string | null; status: "pending" | "active" | "inactive" };
type Player = {
  id: string;
  parent_profile_id: string;
  player_name: string;
  birth_year: number | null;
  club: string | null;
  team: string | null;
  position: string | null;
  status: "active" | "inactive";
  notes: string | null;
};

const empty = {
  parent_profile_id: "",
  player_name: "",
  birth_year: "",
  club: "",
  team: "",
  position: "",
  status: "active" as "active" | "inactive",
  notes: "",
};

const Players = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Player | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState(empty);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    const [{ data: p }, { data: pr }] = await Promise.all([
      supabase.from("players").select("*").order("player_name"),
      supabase.from("profiles").select("id, full_name, phone, status"),
    ]);
    setPlayers((p ?? []) as Player[]);
    setProfiles((pr ?? []) as Profile[]);
  };

  const parentLabel = (id: string) => {
    const p = profiles.find((x) => x.id === id);
    return p ? `${p.full_name ?? "—"}${p.phone ? ` · ${p.phone}` : ""}` : id.slice(0, 8);
  };

  const startCreate = () => {
    setEditing(null);
    setForm(empty);
    setCreating(true);
  };

  const startEdit = (p: Player) => {
    setEditing(p);
    setForm({
      parent_profile_id: p.parent_profile_id,
      player_name: p.player_name,
      birth_year: p.birth_year?.toString() ?? "",
      club: p.club ?? "",
      team: p.team ?? "",
      position: p.position ?? "",
      status: p.status,
      notes: p.notes ?? "",
    });
    setCreating(true);
  };

  const save = async () => {
    if (!form.parent_profile_id || !form.player_name) {
      toast.error("Ouder en spelernaam zijn verplicht");
      return;
    }
    const payload = {
      parent_profile_id: form.parent_profile_id,
      player_name: form.player_name,
      birth_year: form.birth_year ? Number(form.birth_year) : null,
      club: form.club || null,
      team: form.team || null,
      position: form.position || null,
      status: form.status,
      notes: form.notes || null,
    };
    const { error } = editing
      ? await supabase.from("players").update(payload).eq("id", editing.id)
      : await supabase.from("players").insert(payload);
    if (error) return toast.error(error.message);
    // make sure parent profile is active when a player is linked
    await supabase.from("profiles").update({ status: "active" }).eq("id", form.parent_profile_id);
    toast.success("Opgeslagen");
    setCreating(false);
    setEditing(null);
    void load();
  };

  const remove = async (p: Player) => {
    if (!confirm("Speler verwijderen?")) return;
    await supabase.from("players").delete().eq("id", p.id);
    void load();
  };

  const filtered = players.filter((p) =>
    !search ||
    p.player_name.toLowerCase().includes(search.toLowerCase()) ||
    parentLabel(p.parent_profile_id).toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Players</div>
          <h1 className="display-font text-2xl md:text-3xl uppercase mt-2">Spelers</h1>
        </div>
        <div className="flex gap-2">
          <input
            placeholder="Zoek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-background border border-border px-3 py-2 text-sm"
          />
          <button onClick={startCreate} className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 whitespace-nowrap">
            + Speler
          </button>
        </div>
      </header>

      <div className="border border-border bg-card divide-y divide-border">
        {filtered.length === 0 && <div className="p-6 text-sm text-muted-foreground">Geen spelers.</div>}
        {filtered.map((p) => (
          <div key={p.id} className="p-4 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="font-medium">{p.player_name} {p.birth_year && <span className="text-xs text-muted-foreground">({p.birth_year})</span>}</div>
              <div className="text-xs text-muted-foreground truncate">
                Ouder: {parentLabel(p.parent_profile_id)}{p.club ? ` · ${p.club}` : ""}{p.team ? ` · ${p.team}` : ""}{p.position ? ` · ${p.position}` : ""}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <span className={`text-[10px] uppercase tracking-widest px-2 py-1 border ${p.status === "active" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{p.status}</span>
              <button onClick={() => startEdit(p)} className="text-[10px] uppercase tracking-widest border border-border px-3 py-1.5 hover:border-foreground/40">Edit</button>
              <button onClick={() => remove(p)} className="text-[10px] uppercase tracking-widest border border-destructive/40 text-destructive px-3 py-1.5 hover:bg-destructive/10">Del</button>
            </div>
          </div>
        ))}
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-4 overflow-auto">
          <div className="bg-card border border-border w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between">
              <div className="display-font text-2xl uppercase">{editing ? "Speler bewerken" : "Nieuwe speler"}</div>
              <button onClick={() => { setCreating(false); setEditing(null); }} className="text-xs uppercase">✕</button>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Ouder (profiel)</label>
              <select value={form.parent_profile_id} onChange={(e) => setForm({ ...form, parent_profile_id: e.target.value })} className="mt-1.5 w-full bg-background border border-border px-3 py-2 text-sm">
                <option value="">Kies ouder…</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>{p.full_name ?? "—"} {p.phone ? `· ${p.phone}` : ""}</option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <I label="Naam speler"><input value={form.player_name} onChange={(e) => setForm({ ...form, player_name: e.target.value })} className={cls} /></I>
              <I label="Geboortejaar"><input type="number" value={form.birth_year} onChange={(e) => setForm({ ...form, birth_year: e.target.value })} className={cls} /></I>
              <I label="Club"><input value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} className={cls} /></I>
              <I label="Team"><input value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} className={cls} /></I>
              <I label="Positie"><input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className={cls} /></I>
              <I label="Status">
                <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as "active" | "inactive" })} className={cls}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </I>
              <I label="Notities" full><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={cls} /></I>
            </div>

            <button onClick={save} className="w-full bg-primary text-primary-foreground py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90">
              Opslaan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const cls = "mt-1.5 w-full bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";
const I = ({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) => (
  <div className={full ? "sm:col-span-2" : ""}>
    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default Players;
