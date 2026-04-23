import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ageFromBirthdate } from "@/lib/dates";
import { LEVELS, TRAINING_TYPES, DAYS } from "@/components/site/WaitlistForm";

type Entry = {
  id: string;
  player_name: string;
  parent_name: string | null;
  phone: string;
  email: string | null;
  birthdate: string | null;
  club: string | null;
  team: string | null;
  position: string | null;
  level: string | null;
  training_type: string | null;
  available_days: string[];
  available_times: string | null;
  notes: string | null;
  status: "new" | "contacted" | "trial_scheduled" | "placed" | "removed";
  last_contact_at: string | null;
  created_at: string;
};

type Tag = { id: string; entry_id: string; tag: string };
type Note = { id: string; subject_id: string; body: string; created_at: string };

const TAGS = [
  { v: "high_priority", l: "High priority", c: "border-primary/50 text-primary bg-primary/10" },
  { v: "call_back", l: "Call back", c: "border-amber-500/50 text-amber-400 bg-amber-500/10" },
  { v: "trial_training", l: "Trial training", c: "border-sky-500/50 text-sky-400 bg-sky-500/10" },
  { v: "not_suitable", l: "Not suitable", c: "border-destructive/50 text-destructive bg-destructive/10" },
  { v: "offered_fixed_spot", l: "Offered fixed spot", c: "border-emerald-500/50 text-emerald-400 bg-emerald-500/10" },
] as const;

const STATUSES = ["new", "contacted", "trial_scheduled", "placed", "removed"] as const;

const Waitlist = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [search, setSearch] = useState("");
  const [statusF, setStatusF] = useState<string>("all");
  const [levelF, setLevelF] = useState<string>("all");
  const [tagF, setTagF] = useState<string>("all");
  const [dayF, setDayF] = useState<string>("all");
  const [trainingF, setTrainingF] = useState<string>("all");
  const [sort, setSort] = useState<"date_desc" | "age_asc" | "priority">("date_desc");
  const [active, setActive] = useState<Entry | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteBody, setNoteBody] = useState("");

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    const [{ data: e }, { data: t }] = await Promise.all([
      supabase.from("waitlist_entries").select("*").order("created_at", { ascending: false }),
      supabase.from("waitlist_entry_tags").select("*"),
    ]);
    setEntries((e ?? []) as Entry[]);
    setTags((t ?? []) as Tag[]);
  };

  const tagsFor = (id: string) => tags.filter((t) => t.entry_id === id).map((t) => t.tag);

  const filtered = useMemo(() => {
    let list = entries.filter((e) => {
      if (search) {
        const s = search.toLowerCase();
        if (![e.player_name, e.parent_name, e.phone, e.email, e.club].some((v) => v?.toLowerCase().includes(s)))
          return false;
      }
      if (statusF !== "all" && e.status !== statusF) return false;
      if (levelF !== "all" && e.level !== levelF) return false;
      if (trainingF !== "all" && e.training_type !== trainingF) return false;
      if (dayF !== "all" && !e.available_days.includes(dayF)) return false;
      if (tagF !== "all" && !tagsFor(e.id).includes(tagF)) return false;
      return true;
    });
    if (sort === "age_asc") {
      list = [...list].sort((a, b) => (ageFromBirthdate(a.birthdate) ?? 999) - (ageFromBirthdate(b.birthdate) ?? 999));
    } else if (sort === "priority") {
      list = [...list].sort((a, b) => (tagsFor(b.id).includes("high_priority") ? 1 : 0) - (tagsFor(a.id).includes("high_priority") ? 1 : 0));
    }
    return list;
  }, [entries, tags, search, statusF, levelF, dayF, tagF, trainingF, sort]);

  const setStatus = async (id: string, status: Entry["status"]) => {
    await supabase
      .from("waitlist_entries")
      .update({ status, last_contact_at: new Date().toISOString() })
      .eq("id", id);
    void load();
  };

  const toggleTag = async (entryId: string, tag: string) => {
    const has = tagsFor(entryId).includes(tag);
    if (has) {
      await supabase.from("waitlist_entry_tags").delete().eq("entry_id", entryId).eq("tag", tag as any);
    } else {
      await supabase.from("waitlist_entry_tags").insert({ entry_id: entryId, tag: tag as any });
    }
    void load();
  };

  const openProfile = async (e: Entry) => {
    setActive(e);
    const { data } = await supabase
      .from("notes")
      .select("*")
      .eq("subject_type", "waitlist_entry")
      .eq("subject_id", e.id)
      .order("created_at", { ascending: false });
    setNotes((data ?? []) as Note[]);
  };

  const addNote = async () => {
    if (!active || !noteBody.trim()) return;
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase.from("notes").insert({
      subject_type: "waitlist_entry",
      subject_id: active.id,
      body: noteBody.trim(),
      author_id: u.user?.id ?? null,
    });
    if (error) return toast.error(error.message);
    setNoteBody("");
    await openProfile(active);
  };

  const promote = async (e: Entry) => {
    if (!confirm(`Create a player profile for ${e.player_name}?`)) return;
    const { error } = await supabase.from("players").insert({
      player_name: e.player_name,
      parent_name: e.parent_name,
      phone: e.phone,
      email: e.email,
      birthdate: e.birthdate,
      club: e.club,
      team: e.team,
      level: e.level as any,
      position: e.position,
      training_type: e.training_type as any,
    });
    if (error) return toast.error(error.message);
    await setStatus(e.id, "placed");
    toast.success("Promoted to player");
    setActive(null);
  };

  const wa = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "")}`;

  return (
    <div className="space-y-6">
      <header>
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Waitlist CRM</div>
        <h1 className="display-font text-4xl uppercase mt-2">{filtered.length} of {entries.length}</h1>
      </header>

      <div className="grid md:grid-cols-6 gap-2 text-xs">
        <input placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} className={ic} />
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} className={ic}>
          <option value="all">All status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={levelF} onChange={(e) => setLevelF(e.target.value)} className={ic}>
          <option value="all">All levels</option>
          {LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
        </select>
        <select value={trainingF} onChange={(e) => setTrainingF(e.target.value)} className={ic}>
          <option value="all">All training</option>
          {TRAINING_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={dayF} onChange={(e) => setDayF(e.target.value)} className={ic}>
          <option value="all">Any day</option>
          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value as any)} className={ic}>
          <option value="date_desc">Newest first</option>
          <option value="age_asc">Youngest first</option>
          <option value="priority">High priority first</option>
        </select>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setTagF("all")} className={`text-[10px] uppercase tracking-widest border px-2 py-1 ${tagF === "all" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>
          All tags
        </button>
        {TAGS.map((t) => (
          <button
            key={t.v}
            onClick={() => setTagF(t.v)}
            className={`text-[10px] uppercase tracking-widest border px-2 py-1 ${tagF === t.v ? t.c : "border-border text-muted-foreground"}`}
          >
            {t.l}
          </button>
        ))}
      </div>

      <div className="border border-border bg-card divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">No matches.</div>
        ) : (
          filtered.map((e) => {
            const ets = tagsFor(e.id);
            return (
              <div key={e.id} className="p-4 grid md:grid-cols-12 gap-3 items-start">
                <button onClick={() => openProfile(e)} className="md:col-span-3 text-left">
                  <div className="font-medium hover:text-primary">{e.player_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {[ageFromBirthdate(e.birthdate) && `${ageFromBirthdate(e.birthdate)}y`, e.club, e.position]
                      .filter(Boolean)
                      .join(" · ")}
                  </div>
                </button>
                <div className="md:col-span-2 text-xs">
                  <div>{e.level || "—"}</div>
                  <div className="text-muted-foreground">{e.training_type || "—"}</div>
                </div>
                <div className="md:col-span-2 text-xs">
                  <div>{e.available_days.join(", ") || "—"}</div>
                  <div className="text-muted-foreground truncate" title={e.available_times || ""}>{e.available_times}</div>
                </div>
                <div className="md:col-span-2 flex flex-wrap gap-1">
                  {ets.map((tg) => {
                    const t = TAGS.find((x) => x.v === tg)!;
                    return <span key={tg} className={`text-[9px] uppercase tracking-widest border px-1.5 py-0.5 ${t.c}`}>{t.l}</span>;
                  })}
                </div>
                <div className="md:col-span-3 flex flex-wrap gap-1 justify-end">
                  <a href={`tel:${e.phone}`} className="text-[10px] uppercase tracking-widest border border-border px-2 py-1 hover:border-foreground/40">Call</a>
                  <a href={wa(e.phone)} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-widest border border-border px-2 py-1 hover:border-foreground/40">WA</a>
                  <select value={e.status} onChange={(ev) => setStatus(e.id, ev.target.value as any)} className="text-[10px] uppercase tracking-widest bg-background border border-border px-2 py-1">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Profile drawer */}
      {active && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur flex justify-end" onClick={() => setActive(null)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg h-full overflow-y-auto bg-card border-l border-border p-6 space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Waitlist entry</div>
                <div className="display-font text-3xl uppercase mt-1">{active.player_name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Joined {new Date(active.created_at).toLocaleDateString("en-GB")}
                </div>
              </div>
              <button onClick={() => setActive(null)} className="text-xs uppercase">✕</button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <Info label="Parent">{active.parent_name || "—"}</Info>
              <Info label="Age">{ageFromBirthdate(active.birthdate) ?? "—"}</Info>
              <Info label="Phone">{active.phone}</Info>
              <Info label="Email">{active.email || "—"}</Info>
              <Info label="Club">{active.club || "—"}</Info>
              <Info label="Team">{active.team || "—"}</Info>
              <Info label="Position">{active.position || "—"}</Info>
              <Info label="Level">{active.level || "—"}</Info>
              <Info label="Training">{active.training_type || "—"}</Info>
              <Info label="Days">{active.available_days.join(", ") || "—"}</Info>
            </div>
            {active.available_times && <Info label="Times">{active.available_times}</Info>}
            {active.notes && <Info label="Notes">{active.notes}</Info>}

            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Tags</div>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map((t) => {
                  const on = tagsFor(active.id).includes(t.v);
                  return (
                    <button
                      key={t.v}
                      onClick={() => toggleTag(active.id, t.v)}
                      className={`text-[10px] uppercase tracking-widest border px-2 py-1 ${on ? t.c : "border-border text-muted-foreground"}`}
                    >
                      {t.l}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <a href={`tel:${active.phone}`} className="text-[10px] uppercase tracking-widest border border-border px-3 py-2 hover:border-foreground/40">Call</a>
              <a href={wa(active.phone)} target="_blank" rel="noreferrer" className="text-[10px] uppercase tracking-widest border border-border px-3 py-2 hover:border-foreground/40">WhatsApp</a>
              <button onClick={() => promote(active)} className="text-[10px] uppercase tracking-widest border border-primary/50 text-primary px-3 py-2 hover:bg-primary/10">
                Promote to player
              </button>
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">Notes timeline</div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {notes.length === 0 && <div className="text-xs text-muted-foreground">No notes yet.</div>}
                {notes.map((n) => (
                  <div key={n.id} className="border border-border p-3">
                    <div className="text-xs">{n.body}</div>
                    <div className="text-[10px] text-muted-foreground mt-1">
                      {new Date(n.created_at).toLocaleString("en-GB")}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <input
                  value={noteBody}
                  onChange={(e) => setNoteBody(e.target.value)}
                  placeholder="Add note…"
                  className="flex-1 bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none"
                />
                <button onClick={addNote} className="bg-primary text-primary-foreground px-3 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90">
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ic = "bg-card border border-border px-3 py-2 focus:border-primary focus:outline-none";
const Info = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">{label}</div>
    <div className="text-sm mt-1">{children}</div>
  </div>
);

export default Waitlist;
