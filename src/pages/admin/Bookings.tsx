import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { fmtDate, fmtTime, trainingTypeLabel, TrainingType, BookingStatus } from "@/lib/slots";

type Row = {
  id: string;
  status: BookingStatus;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  profile_id: string | null;
  created_at: string;
  cancelled_at: string | null;
  cancelled_by: string | null;
  training_slots: {
    id: string;
    date: string;
    start_time: string;
    end_time: string;
    training_type: TrainingType;
    visibility: string;
    location: string | null;
  } | null;
  profiles: { full_name: string | null; phone: string | null; sticky_note: string | null } | null;
};

const Bookings = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [filter, setFilter] = useState<"upcoming" | "past" | "cancelled" | "all">("upcoming");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { void load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("bookings")
      .select(`
        id, status, guest_name, guest_email, guest_phone, profile_id, created_at, cancelled_at, cancelled_by,
        training_slots ( id, date, start_time, end_time, training_type, visibility, location ),
        profiles:profile_id ( full_name, phone, sticky_note )
      `)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast.error(error.message);
    setRows((data ?? []) as any);
  };

  const cancel = async (r: Row) => {
    if (!confirm("Boeking annuleren?")) return;
    const { error } = await supabase.from("bookings").update({ status: "cancelled", cancelled_by: "admin" }).eq("id", r.id);
    if (error) return toast.error(error.message);
    toast.success("Geannuleerd");
    void load();
  };

  const filtered = useMemo(() => {
    const now = Date.now();
    const q = search.trim().toLowerCase();
    return rows.filter((r) => {
      if (!r.training_slots) return false;
      const t = new Date(`${r.training_slots.date}T${r.training_slots.start_time}`).getTime();
      if (filter === "upcoming" && !(r.status === "confirmed" && t > now)) return false;
      if (filter === "past" && !(r.status === "confirmed" && t <= now)) return false;
      if (filter === "cancelled" && r.status !== "cancelled") return false;
      if (q) {
        const blob = `${r.guest_name ?? ""} ${r.guest_email ?? ""} ${r.profiles?.full_name ?? ""} ${r.profiles?.phone ?? ""}`.toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    }).sort((a, b) => {
      const ta = new Date(`${a.training_slots!.date}T${a.training_slots!.start_time}`).getTime();
      const tb = new Date(`${b.training_slots!.date}T${b.training_slots!.start_time}`).getTime();
      return filter === "upcoming" ? ta - tb : tb - ta;
    });
  }, [rows, filter, search]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Bookings</div>
          <h1 className="display-font text-2xl md:text-3xl uppercase mt-2">Boekingen</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input placeholder="Zoek naam/email" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-background border border-border px-3 py-2 text-sm" />
          <div className="flex border border-border">
            {(["upcoming", "past", "cancelled", "all"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 text-[11px] uppercase tracking-widest ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f}</button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="border border-border p-6 text-sm text-muted-foreground">Laden…</div>
      ) : filtered.length === 0 ? (
        <div className="border border-border p-6 text-sm text-muted-foreground">Geen boekingen.</div>
      ) : (
        <div className="border border-border bg-card divide-y divide-border">
          {filtered.map((r) => {
            const s = r.training_slots!;
            const who = r.guest_name ?? r.profiles?.full_name ?? "—";
            const contact = r.guest_email ?? r.profiles?.phone ?? "";
            const source = r.profile_id ? "Speler" : "Gast";
            return (
              <div key={r.id} className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="display-font text-lg uppercase">{fmtDate(s.date)} · {fmtTime(s.start_time)}–{fmtTime(s.end_time)}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {trainingTypeLabel(s.training_type)} · {s.visibility}{s.location ? ` · ${s.location}` : ""}
                  </div>
                  <div className="text-xs mt-1">
                    <span className="font-medium">{who}</span>
                    {contact && <span className="text-muted-foreground"> · {contact}</span>}
                    <span className="text-muted-foreground"> · {source}</span>
                  </div>
                  {r.status === "cancelled" && (
                    <div className="text-[10px] uppercase tracking-widest text-destructive mt-1">
                      Geannuleerd door {r.cancelled_by ?? "?"}{r.cancelled_at ? ` · ${new Date(r.cancelled_at).toLocaleString("nl-NL")}` : ""}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <span className={`text-[10px] uppercase tracking-widest px-2 py-1 border ${r.status === "confirmed" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{r.status}</span>
                  {r.status === "confirmed" && (
                    <button onClick={() => cancel(r)} className="text-[10px] uppercase tracking-widest border border-destructive/40 text-destructive px-3 py-1.5 hover:bg-destructive/10">Annuleer</button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookings;
