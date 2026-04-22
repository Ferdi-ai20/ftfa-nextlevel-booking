import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string; name: string; phone: string; age: number | null; level: string | null;
  club: string | null; preferred_slots: string[]; other_availability: string | null;
  status: "waiting" | "placed" | "removed"; created_at: string;
};

const WaitlistTab = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"waiting" | "all">("waiting");

  const load = async () => {
    const { data } = await supabase.from("waitlist").select("*").order("created_at");
    setRows((data as any) || []);
  };
  useEffect(() => { load(); }, []);

  const slotOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.preferred_slots.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [rows]);

  const filtered = rows.filter((r) => {
    if (statusFilter === "waiting" && r.status !== "waiting") return false;
    if (filter && !r.preferred_slots.includes(filter)) return false;
    return true;
  });

  const setStatus = async (id: string, status: Row["status"]) => {
    await supabase.from("waitlist").update({ status }).eq("id", id);
    load();
  };

  const wa = (phone: string) => `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;

  return (
    <div className="bg-card border border-border p-6">
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="display-font text-xl uppercase mr-auto">Waitlist ({filtered.length})</div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}
          className="bg-background border border-border px-3 py-2 text-sm">
          <option value="waiting">Waiting only</option>
          <option value="all">All</option>
        </select>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="bg-background border border-border px-3 py-2 text-sm">
          <option value="">Any preferred slot</option>
          {slotOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-2">
        {filtered.map((r) => (
          <div key={r.id} className={`border border-border p-4 ${r.status !== "waiting" && "opacity-50"}`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="font-semibold">{r.name} {r.age && <span className="text-muted-foreground text-sm">· {r.age}y</span>}</div>
                <div className="text-xs text-muted-foreground">
                  <a href={wa(r.phone)} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{r.phone}</a>
                  {r.level && ` · ${r.level}`}{r.club && ` · ${r.club}`}
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {r.preferred_slots.map((s) => (
                    <span key={s} className="text-[10px] uppercase tracking-widest bg-primary/10 text-primary px-2 py-1">{s}</span>
                  ))}
                </div>
                {r.other_availability && <div className="text-xs text-muted-foreground mt-2">Other: {r.other_availability}</div>}
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">Joined {new Date(r.created_at).toLocaleDateString()}</div>
              </div>
              <div className="flex flex-col gap-2">
                <a href={wa(r.phone)} target="_blank" rel="noopener noreferrer"
                  className="text-xs uppercase border border-border px-3 py-1 hover:border-foreground/40 text-center">WhatsApp</a>
                {r.status === "waiting" ? (
                  <>
                    <button onClick={() => setStatus(r.id, "placed")}
                      className="text-xs uppercase bg-primary text-primary-foreground px-3 py-1">Mark placed</button>
                    <button onClick={() => setStatus(r.id, "removed")}
                      className="text-xs uppercase border border-destructive/40 text-destructive px-3 py-1 hover:bg-destructive/10">Remove</button>
                  </>
                ) : (
                  <button onClick={() => setStatus(r.id, "waiting")}
                    className="text-xs uppercase border border-border px-3 py-1">Restore</button>
                )}
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-sm text-muted-foreground">No one matches.</div>}
      </div>
    </div>
  );
};

export default WaitlistTab;
