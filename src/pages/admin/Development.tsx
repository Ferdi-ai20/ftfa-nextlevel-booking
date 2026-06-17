import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate } from "@/lib/slots";
import { LoadingBlock, LoadingTimeoutFallback, useLoadingTimeout } from "@/components/LoadingState";

type Profile = { id: string; full_name: string | null; phone: string | null; status: string };
type Goal = { id: string; profile_id: string; description: string; status: string; created_at: string };
type Homework = { id: string; profile_id: string; title: string; description: string | null; video_url: string | null; due_date: string | null; status: string };
type Note = { id: string; profile_id: string; note: string; created_at: string };

const Development = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);

  const [newGoal, setNewGoal] = useState("");
  const [hwForm, setHwForm] = useState({ title: "", description: "", video_url: "", due_date: "" });
  const [newNote, setNewNote] = useState("");
  const [profilesLoading, setProfilesLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const [dataRetryKey, setDataRetryKey] = useState(0);
  const { timedOut: profilesTimedOut, resetTimedOut: resetProfilesTimedOut } = useLoadingTimeout(profilesLoading);
  const { timedOut: dataTimedOut, resetTimedOut: resetDataTimedOut } = useLoadingTimeout(dataLoading);

  useEffect(() => { void loadProfiles(); }, [retryKey]);
  useEffect(() => { if (selected) void loadData(selected); }, [selected, dataRetryKey]);

  const loadProfiles = async () => {
    setProfilesLoading(true);
    try {
      const { data, error } = await supabase.from("profiles").select("id, full_name, phone, status").eq("status", "active").order("full_name");
      if (error) throw error;
      setProfiles((data ?? []) as Profile[]);
    } catch (error) {
      console.error("Development profiles load failed", error);
      toast.error(error instanceof Error ? error.message : "Spelers laden mislukt");
    } finally {
      setProfilesLoading(false);
    }
  };

  const loadData = async (pid: string) => {
    setDataLoading(true);
    try {
      const [{ data: g, error: goalsError }, { data: h, error: homeworkError }, { data: n, error: notesError }] = await Promise.all([
        supabase.from("player_goals").select("*").eq("profile_id", pid).order("created_at", { ascending: false }),
        supabase.from("player_homework").select("*").eq("profile_id", pid).order("assigned_at", { ascending: false }),
        supabase.from("player_coach_notes").select("*").eq("profile_id", pid).order("created_at", { ascending: false }),
      ]);
      if (goalsError) throw goalsError;
      if (homeworkError) throw homeworkError;
      if (notesError) throw notesError;
      setGoals((g ?? []) as Goal[]);
      setHomework((h ?? []) as Homework[]);
      setNotes((n ?? []) as Note[]);
    } catch (error) {
      console.error("Development data load failed", error);
      toast.error(error instanceof Error ? error.message : "Ontwikkeling laden mislukt");
    } finally {
      setDataLoading(false);
    }
  };

  const retryProfiles = () => {
    resetProfilesTimedOut();
    setProfilesLoading(true);
    setRetryKey((key) => key + 1);
  };
  const retryData = () => {
    resetDataTimedOut();
    setDataLoading(true);
    setDataRetryKey((key) => key + 1);
  };

  const addGoal = async () => {
    if (!selected || !newGoal.trim()) return;
    const { error } = await supabase.from("player_goals").insert({ profile_id: selected, description: newGoal.trim(), status: "open" });
    if (error) return toast.error(error.message);
    setNewGoal("");
    void loadData(selected);
  };
  const toggleGoal = async (g: Goal) => {
    const next = g.status === "completed" ? "open" : "completed";
    await supabase.from("player_goals").update({ status: next }).eq("id", g.id);
    void loadData(selected!);
  };
  const delGoal = async (g: Goal) => {
    if (!confirm("Doel verwijderen?")) return;
    await supabase.from("player_goals").delete().eq("id", g.id);
    void loadData(selected!);
  };

  const addHomework = async () => {
    if (!selected || !hwForm.title.trim()) return;
    const { error } = await supabase.from("player_homework").insert({
      profile_id: selected,
      title: hwForm.title.trim(),
      description: hwForm.description.trim() || null,
      video_url: hwForm.video_url.trim() || null,
      due_date: hwForm.due_date || null,
      status: "open",
    });
    if (error) return toast.error(error.message);
    setHwForm({ title: "", description: "", video_url: "", due_date: "" });
    void loadData(selected);
  };
  const delHomework = async (h: Homework) => {
    if (!confirm("Huiswerk verwijderen?")) return;
    await supabase.from("player_homework").delete().eq("id", h.id);
    void loadData(selected!);
  };

  const addNote = async () => {
    if (!selected || !newNote.trim()) return;
    const { error } = await supabase.from("player_coach_notes").insert({ profile_id: selected, note: newNote.trim() });
    if (error) return toast.error(error.message);
    setNewNote("");
    void loadData(selected);
  };
  const delNote = async (n: Note) => {
    if (!confirm("Notitie verwijderen?")) return;
    await supabase.from("player_coach_notes").delete().eq("id", n.id);
    void loadData(selected!);
  };

  const inputCls = "w-full bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Development</div>
        <h1 className="display-font text-2xl md:text-3xl uppercase mt-2">Speler ontwikkeling</h1>
      </header>

      <div className="grid md:grid-cols-[260px_1fr] gap-6">
        <aside className="border border-border bg-card divide-y divide-border max-h-[70vh] overflow-auto">
          {profilesLoading && (profilesTimedOut ? <LoadingTimeoutFallback onRetry={retryProfiles} /> : <LoadingBlock />)}
          {!profilesLoading && profiles.length === 0 && <div className="p-4 text-xs text-muted-foreground">Geen active players.</div>}
          {!profilesLoading && profiles.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelected(p.id)}
              className={`w-full text-left p-3 text-sm hover:bg-muted/30 ${selected === p.id ? "bg-primary/10 border-l-2 border-primary" : ""}`}
            >
              <div className="font-medium truncate">{p.full_name ?? "—"}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5 truncate">{p.phone ?? ""}</div>
            </button>
          ))}
        </aside>

        <div className="space-y-8 min-w-0">
          {!selected ? (
            <div className="border border-border p-6 text-sm text-muted-foreground">Kies een speler links.</div>
          ) : (
            dataLoading ? (
              dataTimedOut ? <LoadingTimeoutFallback onRetry={retryData} /> : <LoadingBlock />
            ) : <>
              <section>
                <h2 className="display-font text-xl uppercase mb-3">Doelen</h2>
                <div className="flex gap-2 mb-3">
                  <input value={newGoal} onChange={(e) => setNewGoal(e.target.value)} placeholder="Nieuw doel…" className={inputCls} />
                  <button onClick={addGoal} className="bg-primary text-primary-foreground px-4 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90">+</button>
                </div>
                <div className="space-y-1.5">
                  {goals.length === 0 && <div className="text-xs text-muted-foreground">Nog geen doelen.</div>}
                  {goals.map((g) => (
                    <div key={g.id} className="border border-border bg-card p-3 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <input type="checkbox" checked={g.status === "completed"} onChange={() => toggleGoal(g)} className="h-4 w-4 accent-primary" />
                        <span className={`text-sm ${g.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{g.description}</span>
                      </div>
                      <button onClick={() => delGoal(g)} className="text-[10px] uppercase tracking-widest text-destructive">Del</button>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="display-font text-xl uppercase mb-3">Huiswerk</h2>
                <div className="border border-border bg-card p-4 space-y-2 mb-3">
                  <input placeholder="Titel" value={hwForm.title} onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })} className={inputCls} />
                  <textarea rows={2} placeholder="Omschrijving" value={hwForm.description} onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })} className={inputCls} />
                  <div className="grid sm:grid-cols-2 gap-2">
                    <input placeholder="Video URL (optioneel)" value={hwForm.video_url} onChange={(e) => setHwForm({ ...hwForm, video_url: e.target.value })} className={inputCls} />
                    <input type="date" value={hwForm.due_date} onChange={(e) => setHwForm({ ...hwForm, due_date: e.target.value })} className={`${inputCls} [color-scheme:dark]`} />
                  </div>
                  <button onClick={addHomework} className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90">+ Huiswerk</button>
                </div>
                <div className="space-y-1.5">
                  {homework.length === 0 && <div className="text-xs text-muted-foreground">Geen huiswerk.</div>}
                  {homework.map((h) => (
                    <div key={h.id} className="border border-border bg-card p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className={`display-font text-sm uppercase ${h.status === "completed" ? "line-through text-muted-foreground" : ""}`}>{h.title}</div>
                          {h.description && <div className="text-xs text-muted-foreground mt-1">{h.description}</div>}
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
                            {h.due_date ? `Deadline: ${fmtDate(h.due_date)}` : "Geen deadline"} · {h.status}
                          </div>
                        </div>
                        <button onClick={() => delHomework(h)} className="text-[10px] uppercase tracking-widest text-destructive shrink-0">Del</button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="display-font text-xl uppercase mb-3">Coach notities</h2>
                <div className="flex gap-2 mb-3">
                  <textarea rows={2} value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Notitie…" className={inputCls} />
                  <button onClick={addNote} className="bg-primary text-primary-foreground px-4 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90">+</button>
                </div>
                <div className="space-y-1.5">
                  {notes.length === 0 && <div className="text-xs text-muted-foreground">Nog geen notities.</div>}
                  {notes.map((n) => (
                    <div key={n.id} className="border border-border bg-card p-3 flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{new Date(n.created_at).toLocaleDateString("nl-NL")}</div>
                        <div className="text-sm mt-1 whitespace-pre-wrap">{n.note}</div>
                      </div>
                      <button onClick={() => delNote(n)} className="text-[10px] uppercase tracking-widest text-destructive shrink-0">Del</button>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Development;
