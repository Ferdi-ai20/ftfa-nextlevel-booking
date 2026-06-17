import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate, fmtTime } from "@/lib/slots";
import { LoadingBlock, LoadingTimeoutFallback, useLoadingTimeout } from "@/components/LoadingState";

type FB = {
  id: string;
  player_id: string;
  slot_id: string | null;
  feedback_text: string | null;
  development_points: string | null;
  strengths: string | null;
  visible_to_player: boolean;
  created_at: string;
};

type Player = { id: string; player_name: string };
type Slot = { id: string; date: string; start_time: string };

const Feedback = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [items, setItems] = useState<FB[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const { timedOut, resetTimedOut } = useLoadingTimeout(loading);
  const [form, setForm] = useState({
    player_id: "",
    slot_id: "",
    feedback_text: "",
    development_points: "",
    strengths: "",
    visible_to_player: true,
  });

  useEffect(() => {
    void load();
  }, [retryKey]);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: p, error: playersError }, { data: s, error: slotsError }, { data: f, error: feedbackError }] = await Promise.all([
        supabase.from("players").select("id, player_name").eq("status", "active").order("player_name"),
        supabase.from("training_slots").select("id, date, start_time").order("date", { ascending: false }).limit(100),
        supabase.from("feedback").select("*").order("created_at", { ascending: false }).limit(100),
      ]);
      if (playersError) throw playersError;
      if (slotsError) throw slotsError;
      if (feedbackError) throw feedbackError;
      setPlayers((p ?? []) as Player[]);
      setSlots((s ?? []) as Slot[]);
      setItems((f ?? []) as FB[]);
    } catch (error) {
      console.error("Feedback load failed", error);
      toast.error(error instanceof Error ? error.message : "Feedback laden mislukt");
    } finally {
      setLoading(false);
    }
  };

  const retryLoad = () => {
    resetTimedOut();
    setLoading(true);
    setRetryKey((key) => key + 1);
  };

  const save = async () => {
    if (!form.player_id) return toast.error("Kies een speler");
    const { error } = await supabase.from("feedback").insert({
      player_id: form.player_id,
      slot_id: form.slot_id || null,
      feedback_text: form.feedback_text || null,
      development_points: form.development_points || null,
      strengths: form.strengths || null,
      visible_to_player: form.visible_to_player,
    });
    if (error) return toast.error(error.message);
    toast.success("Feedback opgeslagen");
    setForm({ ...form, feedback_text: "", development_points: "", strengths: "" });
    void load();
  };

  const toggleVisible = async (f: FB) => {
    await supabase.from("feedback").update({ visible_to_player: !f.visible_to_player }).eq("id", f.id);
    void load();
  };

  const remove = async (f: FB) => {
    if (!confirm("Verwijderen?")) return;
    await supabase.from("feedback").delete().eq("id", f.id);
    void load();
  };

  const playerName = (id: string) => players.find((p) => p.id === id)?.player_name ?? "—";
  const slotLabel = (id: string | null) => {
    if (!id) return "";
    const s = slots.find((x) => x.id === id);
    return s ? `${fmtDate(s.date)} ${fmtTime(s.start_time)}` : "";
  };

  const inputCls = "mt-1.5 w-full bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Feedback</div>
        <h1 className="display-font text-2xl md:text-3xl uppercase mt-2">Speler feedback</h1>
      </header>

      <div className="bg-card border border-border p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Speler</label>
            <select value={form.player_id} onChange={(e) => setForm({ ...form, player_id: e.target.value })} className={inputCls}>
              <option value="">— kies —</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.player_name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Training (optioneel)</label>
            <select value={form.slot_id} onChange={(e) => setForm({ ...form, slot_id: e.target.value })} className={inputCls}>
              <option value="">—</option>
              {slots.map((s) => <option key={s.id} value={s.id}>{fmtDate(s.date)} {fmtTime(s.start_time)}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sterke punten</label>
          <textarea rows={2} value={form.strengths} onChange={(e) => setForm({ ...form, strengths: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Ontwikkelpunten</label>
          <textarea rows={2} value={form.development_points} onChange={(e) => setForm({ ...form, development_points: e.target.value })} className={inputCls} />
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Algemene feedback</label>
          <textarea rows={3} value={form.feedback_text} onChange={(e) => setForm({ ...form, feedback_text: e.target.value })} className={inputCls} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.visible_to_player} onChange={(e) => setForm({ ...form, visible_to_player: e.target.checked })} />
          Zichtbaar voor ouder/speler
        </label>
        <button onClick={save} className="bg-primary text-primary-foreground px-5 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90">
          Opslaan
        </button>
      </div>

      <div className="space-y-2">
        {loading && (timedOut ? <LoadingTimeoutFallback onRetry={retryLoad} /> : <LoadingBlock />)}
        {!loading && items.length === 0 && <div className="border border-border bg-card p-6 text-sm text-muted-foreground">Nog geen feedback.</div>}
        {!loading && items.map((f) => (
          <div key={f.id} className="border border-border bg-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="display-font text-lg uppercase">{playerName(f.player_id)}</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {slotLabel(f.slot_id)} · {new Date(f.created_at).toLocaleDateString("nl-NL")}
                </div>
                {f.strengths && <div className="text-sm mt-2"><strong>Sterk:</strong> {f.strengths}</div>}
                {f.development_points && <div className="text-sm mt-1"><strong>Ontwikkelen:</strong> {f.development_points}</div>}
                {f.feedback_text && <div className="text-sm mt-1 text-muted-foreground italic">"{f.feedback_text}"</div>}
              </div>
              <div className="flex flex-col gap-1.5 shrink-0">
                <button onClick={() => toggleVisible(f)} className={`text-[10px] uppercase tracking-widest border px-2 py-1 ${f.visible_to_player ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}>
                  {f.visible_to_player ? "Zichtbaar" : "Verborgen"}
                </button>
                <button onClick={() => remove(f)} className="text-[10px] uppercase tracking-widest border border-destructive/40 text-destructive px-2 py-1 hover:bg-destructive/10">Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Feedback;
