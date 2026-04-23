import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Window = {
  id: string;
  date: string;
  audience: "everyone" | "waitlist_only" | "tagged_only";
  message: string | null;
  is_open: boolean;
};
type Slot = { id: string; window_id: string; slot_time: string; capacity: number };
type Booking = { id: string; slot_id: string; user_id: string };

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

const ParentBooking = () => {
  const { session } = useAuth();
  const [windows, setWindows] = useState<Window[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    void load();
  }, [session]);

  const load = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const [{ data: w }, { data: s }, { data: b }] = await Promise.all([
      supabase.from("booking_windows").select("*").eq("is_open", true).gte("date", today).order("date"),
      supabase.from("booking_window_slots").select("*"),
      supabase.from("bookings").select("id, slot_id, user_id").eq("user_id", session!.user.id),
    ]);
    setWindows((w ?? []) as Window[]);
    setSlots((s ?? []) as Slot[]);
    setBookings((b ?? []) as Booking[]);
  };

  const book = async (slot: Slot, win: Window) => {
    setBusy(slot.id);
    const { error } = await supabase.from("bookings").insert({
      slot_id: slot.id,
      user_id: session!.user.id,
    });
    setBusy(null);
    if (error) return toast.error(error.message);
    toast.success("Slot booked.");
    // fire-and-forget confirmation email
    void supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "booking-confirmation",
        recipientEmail: session!.user.email,
        idempotencyKey: `booking-confirm-${slot.id}-${session!.user.id}`,
        templateData: { date: fmtDate(win.date), slotTime: slot.slot_time },
      },
    });
    void load();
  };

  const cancel = async (b: Booking) => {
    if (!confirm("Cancel this booking?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", b.id);
    if (error) return toast.error(error.message);
    toast.success("Booking cancelled.");
    void load();
  };

  if (windows.length === 0) return null;

  return (
    <section>
      <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Available bookings</div>
      <h2 className="display-font text-3xl uppercase mt-2 mb-6">Open training slots</h2>
      <div className="space-y-4">
        {windows.map((w) => {
          const ws = slots
            .filter((s) => s.window_id === w.id)
            .sort((a, b) => a.slot_time.localeCompare(b.slot_time));
          return (
            <div key={w.id} className="bg-card border border-border p-5">
              <div className="display-font text-2xl uppercase">{fmtDate(w.date)}</div>
              {w.message && (
                <div className="text-sm text-muted-foreground mt-1 italic">"{w.message}"</div>
              )}
              <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {ws.map((s) => {
                  const myBooking = bookings.find((b) => b.slot_id === s.id);
                  return (
                    <div key={s.id} className="border border-border p-3 flex items-center justify-between">
                      <div className="font-mono text-base">{s.slot_time}</div>
                      {myBooking ? (
                        <button
                          onClick={() => cancel(myBooking)}
                          className="text-[10px] uppercase tracking-widest border border-destructive/40 text-destructive px-3 py-1.5 hover:bg-destructive/10"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          onClick={() => book(s, w)}
                          disabled={busy === s.id}
                          className="text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-3 py-1.5 hover:bg-primary/90 disabled:opacity-50"
                        >
                          {busy === s.id ? "…" : "Book"}
                        </button>
                      )}
                    </div>
                  );
                })}
                {ws.length === 0 && (
                  <div className="text-xs text-muted-foreground">No slots in this window.</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ParentBooking;
