import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Window = {
  id: string;
  date: string;
  audience: "everyone" | "waitlist_only" | "tagged_only";
  audience_tags: string[];
  message: string | null;
  is_open: boolean;
};

type SlotRow = { id: string; window_id: string; slot_time: string; capacity: number };
type BookingRow = { id: string; slot_id: string; user_id: string; player_id: string | null; created_at: string };

const BookingWindows = () => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [slots, setSlots] = useState<SlotRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    date: "",
    audience: "everyone" as Window["audience"],
    message: "",
    times: "10:00, 11:00, 12:00",
    capacity: 1,
  });

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    const [{ data: w }, { data: s }, { data: b }] = await Promise.all([
      supabase.from("booking_windows").select("*").order("date", { ascending: false }),
      supabase.from("booking_window_slots").select("*"),
      supabase.from("bookings").select("*"),
    ]);
    setWindows((w ?? []) as Window[]);
    setSlots((s ?? []) as SlotRow[]);
    setBookings((b ?? []) as BookingRow[]);
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: w, error } = await supabase
      .from("booking_windows")
      .insert({
        date: form.date,
        audience: form.audience,
        message: form.message || null,
        is_open: true,
      })
      .select()
      .single();
    if (error || !w) return toast.error(error?.message ?? "Failed");
    const times = form.times
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (times.length) {
      await supabase
        .from("booking_window_slots")
        .insert(times.map((t) => ({ window_id: w.id, slot_time: t, capacity: form.capacity })));
    }
    toast.success("Window created");
    setCreating(false);
    setForm({ date: "", audience: "everyone", message: "", times: "10:00, 11:00, 12:00", capacity: 1 });
    void load();
  };

  const toggleOpen = async (w: Window) => {
    await supabase.from("booking_windows").update({ is_open: !w.is_open }).eq("id", w.id);
    void load();
  };

  const remove = async (w: Window) => {
    if (!confirm("Delete this window and all its bookings?")) return;
    await supabase.from("booking_windows").delete().eq("id", w.id);
    void load();
  };

  const removeBooking = async (b: BookingRow) => {
    await supabase.from("bookings").delete().eq("id", b.id);
    void load();
  };

  const [notifying, setNotifying] = useState<string | null>(null);
  const notify = async (w: Window) => {
    if (!confirm(`Send email notification to all eligible users for ${w.date}?`)) return;
    setNotifying(w.id);
    try {
      const { data, error } = await supabase.functions.invoke("notify-booking-window", {
        body: { windowId: w.id },
      });
      if (error) throw error;
      const r = data as { total: number; sent: number; failed: number };
      toast.success(`Notified ${r.sent} of ${r.total} eligible users${r.failed ? ` (${r.failed} failed)` : ""}`);
    } catch (e: any) {
      toast.error(e?.message ?? "Failed to send notifications");
    } finally {
      setNotifying(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div className="min-w-0">
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Booking Windows</div>
          <h1 className="display-font text-2xl md:text-3xl uppercase mt-2">Open booking on demand</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Booking is closed by default. Create a window when you want people to book a slot.
          </p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="bg-primary text-primary-foreground px-4 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90"
        >
          + New window
        </button>
      </header>

      <div className="space-y-4">
        {windows.length === 0 ? (
          <div className="border border-border bg-card p-6 text-sm text-muted-foreground">
            No booking windows yet.
          </div>
        ) : (
          windows.map((w) => {
            const ws = slots.filter((s) => s.window_id === w.id).sort((a, b) => a.slot_time.localeCompare(b.slot_time));
            return (
              <div key={w.id} className="border border-border bg-card p-5">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <div className="display-font text-2xl uppercase">
                      {new Date(w.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
                    </div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">
                      Audience: {w.audience.replace("_", " ")} · {w.is_open ? "open" : "closed"}
                    </div>
                    {w.message && <div className="text-sm mt-2 text-muted-foreground">"{w.message}"</div>}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => toggleOpen(w)}
                      className={`text-[10px] uppercase tracking-widest border px-3 py-1.5 ${w.is_open ? "border-primary text-primary" : "border-border text-muted-foreground"}`}
                    >
                      {w.is_open ? "Open" : "Closed"}
                    </button>
                    <button
                      onClick={() => notify(w)}
                      disabled={notifying === w.id || !w.is_open}
                      className="text-[10px] uppercase tracking-widest border border-primary/60 text-primary px-3 py-1.5 hover:bg-primary/10 disabled:opacity-40"
                      title={w.is_open ? "Email all eligible users" : "Open the window first"}
                    >
                      {notifying === w.id ? "Sending…" : "Notify"}
                    </button>
                    <button
                      onClick={() => remove(w)}
                      className="text-[10px] uppercase tracking-widest border border-destructive/40 text-destructive px-3 py-1.5 hover:bg-destructive/10"
                    >
                      Del
                    </button>
                  </div>
                </div>

                <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {ws.map((s) => {
                    const bs = bookings.filter((b) => b.slot_id === s.id);
                    const full = bs.length >= s.capacity;
                    return (
                      <div key={s.id} className={`border ${full ? "border-destructive/40" : "border-border"} p-3`}>
                        <div className="flex items-center justify-between">
                          <div className="font-mono text-base">{s.slot_time}</div>
                          <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                            {bs.length}/{s.capacity}
                          </div>
                        </div>
                        {bs.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {bs.map((b) => (
                              <div key={b.id} className="text-xs flex items-center justify-between gap-2">
                                <span className="truncate">{b.user_id.slice(0, 8)}…</span>
                                <button
                                  onClick={() => removeBooking(b)}
                                  className="text-[9px] uppercase text-destructive hover:underline"
                                >
                                  remove
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>

      {creating && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-4 overflow-auto">
          <form onSubmit={create} className="bg-card border border-border w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="display-font text-2xl uppercase">New window</div>
              <button type="button" onClick={() => setCreating(false)} className="text-xs uppercase">✕</button>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Date</label>
                <input
                  required
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="mt-2 w-full bg-background border border-border px-3 py-2 [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Audience</label>
                <select
                  value={form.audience}
                  onChange={(e) => setForm({ ...form, audience: e.target.value as any })}
                  className="mt-2 w-full bg-background border border-border px-3 py-2"
                >
                  <option value="everyone">Everyone with account</option>
                  <option value="waitlist_only">Waitlist only</option>
                  <option value="tagged_only">Selected tags only</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Time slots (comma separated)</label>
                <input
                  value={form.times}
                  onChange={(e) => setForm({ ...form, times: e.target.value })}
                  placeholder="10:00, 11:00, 12:00"
                  className="mt-2 w-full bg-background border border-border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Capacity per slot</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={form.capacity}
                  onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
                  className="mt-2 w-full bg-background border border-border px-3 py-2"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Message (optional)</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={2}
                  className="mt-2 w-full bg-background border border-border px-3 py-2"
                />
              </div>
            </div>
            <button className="w-full bg-primary text-primary-foreground py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90">
              Create
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default BookingWindows;
