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
  guest_parent_name: string | null;
  guest_dob: string | null;
  guest_birth_year: number | null;
  guest_club: string | null;
  guest_team: string | null;
  guest_position: string | null;
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

const parsePlayerName = (guestName: string | null): string | null => {
  if (!guestName) return null;
  const m = guestName.match(/ouder van\s+(.+?)\)?$/i);
  return m ? m[1].trim() : null;
};

const fmtDob = (dob: string | null, year: number | null): string | null => {
  if (dob) {
    const [y, m, d] = dob.split("-");
    if (y && m && d) return `${d}-${m}-${y}`;
    return dob;
  }
  if (year) return String(year);
  return null;
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
        id, status, guest_name, guest_email, guest_phone, guest_parent_name,
        guest_dob, guest_birth_year, guest_club, guest_team, guest_position,
        profile_id, created_at, cancelled_at, cancelled_by,
        training_slots ( id, date, start_time, end_time, training_type, visibility, location ),
        profiles:profile_id ( full_name, phone, sticky_note )
      `)
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) return toast.error(error.message);
    setRows((data ?? []) as any);
  };

  const cancel = async (r: Row) => {
    if (!confirm("Cancel this booking?")) return;
    const { data, error } = await supabase.functions.invoke("cancel-booking", { body: { bookingId: r.id } });
    if (error || (data as any)?.error) return toast.error((data as any)?.error || error?.message || "Cancel failed");
    toast.success("Cancelled");
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
        const playerName = parsePlayerName(r.guest_name);
        const blob = [
          r.guest_name, r.guest_email, r.guest_phone, r.guest_parent_name, playerName,
          r.guest_club, r.guest_team, r.guest_position,
          r.profiles?.full_name, r.profiles?.phone,
        ].filter(Boolean).join(" ").toLowerCase();
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
          <h1 className="display-font text-2xl md:text-3xl uppercase mt-2">Bookings</h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <input placeholder="Search name / email / phone / club" value={search} onChange={(e) => setSearch(e.target.value)} className="bg-background border border-border px-3 py-2 text-sm" />
          <div className="flex border border-border">
            {(["upcoming", "past", "cancelled", "all"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`px-3 py-2 text-[11px] uppercase tracking-widest ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>{f}</button>
            ))}
          </div>
        </div>
      </header>

      {loading ? (
        <div className="border border-border p-6 text-sm text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="border border-border p-6 text-sm text-muted-foreground">No bookings found.</div>
      ) : (
        <div className="border border-border bg-card divide-y divide-border">
          {filtered.map((r) => {
            const s = r.training_slots!;
            const isGuest = !r.profile_id;
            const who = r.guest_name ?? r.profiles?.full_name ?? "—";
            const contact = r.guest_email ?? r.profiles?.phone ?? "";
            const source = r.profile_id ? "Player" : "Guest";
            const sticky = r.profile_id ? r.profiles?.sticky_note?.trim() : null;
            const playerName = parsePlayerName(r.guest_name);
            const dob = fmtDob(r.guest_dob, r.guest_birth_year);
            

            const detailItems: { label: string; value: string | null | undefined }[] = isGuest
              ? [
                  { label: "Parent", value: r.guest_parent_name },
                  { label: "Player", value: playerName },
                  { label: "Date of birth", value: dob },
                  { label: "Phone", value: r.guest_phone },
                  { label: "Club", value: r.guest_club },
                  { label: "Team", value: r.guest_team },
                  { label: "Position", value: r.guest_position },
                  { label: "Email", value: r.guest_email },
                ]
              : [
                  { label: "Phone", value: r.profiles?.phone },
                  { label: "Sticky note", value: r.profiles?.sticky_note },
                ];
            const visibleDetails = detailItems.filter((d) => d.value && String(d.value).trim().length > 0);
            const hasDetails = visibleDetails.length > 0;

            return (
              <div key={r.id} className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
                    {sticky && (
                      <div className="text-[11px] text-muted-foreground italic mt-1">📝 {sticky}</div>
                    )}
                    {r.status === "cancelled" && (
                      <div className="text-[10px] uppercase tracking-widest text-destructive mt-1">
                        Cancelled by {r.cancelled_by ?? "?"}{r.cancelled_at ? ` · ${new Date(r.cancelled_at).toLocaleString("en-GB")}` : ""}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0 items-center">
                    <span className={`text-[10px] uppercase tracking-widest px-2 py-1 border ${r.status === "confirmed" ? "border-primary text-primary" : "border-border text-muted-foreground"}`}>{r.status}</span>
                    {r.status === "confirmed" && (
                      <button onClick={() => cancel(r)} className="text-[10px] uppercase tracking-widest border border-destructive/40 text-destructive px-3 py-1.5 hover:bg-destructive/10">Cancel</button>
                    )}
                  </div>
                </div>

                {hasDetails && (
                  <div className="mt-3 pt-3 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                    {visibleDetails.map((d) => (
                      <div key={d.label} className="text-xs flex gap-2">
                        <span className="text-muted-foreground uppercase tracking-widest text-[10px] w-28 shrink-0 pt-0.5">{d.label}</span>
                        <span className="text-foreground break-words">{d.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Bookings;
