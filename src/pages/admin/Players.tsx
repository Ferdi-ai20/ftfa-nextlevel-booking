import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LoadingBlock, LoadingTimeoutFallback, useLoadingTimeout } from "@/components/LoadingState";

type Profile = {
  id: string;
  full_name: string | null;
  phone: string | null;
  status: "pending" | "active" | "inactive";
  sticky_note: string | null;
};
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
  const [stickyDraft, setStickyDraft] = useState<Record<string, string>>({});
  const [stickyOpen, setStickyOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const { timedOut, resetTimedOut } = useLoadingTimeout(loading);

  useEffect(() => { void load(); }, [retryKey]);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: p, error: playersError }, { data: pr, error: profilesError }] = await Promise.all([
        supabase.from("players").select("*").order("player_name"),
        supabase.from("profiles").select("id, full_name, phone, status, sticky_note"),
      ]);
      if (playersError) throw playersError;
      if (profilesError) throw profilesError;
      setPlayers((p ?? []) as Player[]);
      setProfiles((pr ?? []) as Profile[]);
      const d: Record<string, string> = {};
      (pr ?? []).forEach((x: any) => { d[x.id] = x.sticky_note ?? ""; });
      setStickyDraft(d);
    } catch (error) {
      console.error("Players load failed", error);
      toast.error(error instanceof Error ? error.message : "Spelers laden mislukt");
    } finally {
      setLoading(false);
    }
  };

  const retryLoad = () => {
    resetTimedOut();
    setLoading(true);
    setRetryKey((key) => key + 1);
  };

  const profileFor = (id: string) => profiles.find((x) => x.id === id);
  const parentLabel = (id: string) => {
    const p = profileFor(id);
    return p ? `${p.full_name ?? "—"}${p.phone ? ` · ${p.phone}` : ""}` : id.slice(0, 8);
  };

  const saveSticky = async (profileId: string) => {
    const val = (stickyDraft[profileId] ?? "").slice(0, 100);
    if (val.length > 100) {
      toast.error("Sticky note max 100 tekens");
      return;
    }
    const { error } = await supabase.from("profiles").update({ sticky_note: val || null }).eq("id", profileId);
    if (error) return toast.error(error.message);
    toast.success("Notitie opgeslagen");
    setStickyOpen(null);
    void load();
  };

  const startCreate = () => { setEditing(null); setForm(empty); setCreating(true); };
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

  const archive = async (p: Player) => {
    if (!confirm(`Speler ${p.player_name} archiveren? Toekomstige boekingen worden geannuleerd en de login wordt uitgeschakeld.`)) return;
    const { data, error } = await supabase.functions.invoke("archive-player", { body: { profileId: p.parent_profile_id } });
    if (error || (data as any)?.error) return toast.error((data as any)?.error || error?.message || "Archiveren mislukt");
    toast.success("Speler gearchiveerd");
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
          <input placeholder="Zoek..." value={search} onChange={(e) => setSearch(e.target.value)} className="bg-background border border-border px-3 py-2 text-sm" />
          <button onClick={startCreate} className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 whitespace-nowrap">+ Speler</button>
        </div>
      </header>

      {loading ? (
        timedOut ? <LoadingTimeoutFallback onRetry={retryLoad} /> : <LoadingBlock />
      ) : (
      <div className="border border-border bg-card divide-y divide-border">
        {filtered.length === 0 && <div className="p-6 text-sm text-muted-foreground">Geen spelers.</div>}
        {filtered.map((p) => {
          const prof = profileFor(p.parent_profile_id);
          const sticky = prof?.sticky_note;
          const draft = stickyDraft[p.parent_profile_id] ?? "";
          const open = stickyOpen === p.parent_profile_id;
          return (
            <div key={p.id} className="p-4 space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-medium">{p.player_name} {p.birth_year && <span className="text-xs text-muted-foreground">({p.birth_year})</span>}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    Ouder: {parentLabel(p.parent_profile_id)}{p.club ? ` · ${p.club}` : ""}{p.team ? ` · ${p.team}` : ""}{p.position ? ` · ${p.position}` : ""}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 items-center">
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-1 border ${p.status === "active" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{p.status}</span>
                  <button onClick={() => setStickyOpen(open ? null : p.parent_profile_id)} className="text-[10px] uppercase tracking-widest border border-border px-3 py-1.5 hover:border-foreground/40">
                    📝 {sticky ? "Edit" : "Note"}
                  </button>
                  <button onClick={() => startEdit(p)} className="text-[10px] uppercase tracking-widest border border-border px-3 py-1.5 hover:border-foreground/40">Edit</button>
                  {p.status === "active" && (
                    <button onClick={() => archive(p)} className="text-[10px] uppercase tracking-widest border border-border px-3 py-1.5 hover:border-foreground/40">Archive</button>
                  )}
                  <button onClick={() => remove(p)} className="text-[10px] uppercase tracking-widest border border-destructive/40 text-destructive px-3 py-1.5 hover:bg-destructive/10">Del</button>
                </div>
              </div>
              {sticky && !open && (
                <div className="text-xs bg-yellow-500/10 border border-yellow-500/30 px-3 py-2 italic">📌 {sticky}</div>
              )}
              {open && (
                <div className="space-y-2 border border-border bg-background p-3">
                  <textarea
                    rows={2}
                    maxLength={100}
                    value={draft}
                    onChange={(e) => setStickyDraft({ ...stickyDraft, [p.parent_profile_id]: e.target.value.slice(0, 100) })}
                    placeholder="Sticky note (max 100 tekens, alleen voor admin)"
                    className="w-full bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                  />
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-widest">
                    <span className={draft.length > 100 ? "text-destructive" : "text-muted-foreground"}>{draft.length}/100</span>
                    <div className="flex gap-2">
                      <button onClick={() => setStickyOpen(null)} className="border border-border px-3 py-1.5 hover:border-foreground/40">Annuleer</button>
                      <button onClick={() => saveSticky(p.parent_profile_id)} className="bg-primary text-primary-foreground px-3 py-1.5 font-semibold hover:bg-primary/90">Opslaan</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      )}

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
              <I label="Notities (intern)" full><textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={cls} /></I>
            </div>

            <button onClick={save} className="w-full bg-primary text-primary-foreground py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90">Opslaan</button>
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
