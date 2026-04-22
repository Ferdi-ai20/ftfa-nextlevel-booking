import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const nextSunday = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const fmtDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

type Player = { id: string; name: string; slot_time: string };

const SundaySlot = () => {
  const [phone, setPhone] = useState("");
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const sunday = useMemo(nextSunday, []);
  const sessionDate = sunday.toISOString().split("T")[0];

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = phone.replace(/\s+/g, "");
    if (cleaned.length < 5 || cleaned.length > 20) {
      toast.error("Enter a valid phone number.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("fixed_players")
      .select("id, name, slot_time")
      .eq("phone", cleaned)
      .eq("active", true)
      .maybeSingle();
    setLoading(false);
    if (error || !data) {
      toast.error("No fixed slot found for this number. Join the waitlist below.");
      return;
    }
    setPlayer(data);
  };

  const respond = async (status: "confirmed" | "cancelled") => {
    if (!player) return;
    if (status === "cancelled" && !showCancel) {
      setShowCancel(true);
      return;
    }
    const payload: any = {
      fixed_player_id: player.id,
      session_date: sessionDate,
      status,
    };
    if (status === "cancelled") {
      payload.available_from = from || null;
      payload.available_to = to || null;
    }
    // Upsert by deleting any prior public-mutable record then inserting
    const { error } = await supabase.from("weekly_attendance").insert(payload);
    if (error) {
      // try update if duplicate
      const { error: e2 } = await supabase
        .from("weekly_attendance")
        .update({
          status,
          available_from: payload.available_from ?? null,
          available_to: payload.available_to ?? null,
        })
        .eq("fixed_player_id", player.id)
        .eq("session_date", sessionDate);
      if (e2) {
        toast.error("Could not save your response.");
        return;
      }
    }
    toast.success(status === "confirmed" ? "See you Sunday." : "Thanks — noted.");
    setPlayer(null);
    setPhone("");
    setShowCancel(false);
    setFrom("");
    setTo("");
  };

  return (
    <section id="sunday" className="relative py-24 md:py-32 border-b border-border">
      <div className="container max-w-3xl">
        <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">/ Fixed Players</div>
        <h2 className="display-font text-5xl md:text-7xl uppercase leading-[0.9]">
          My Sunday<br />Slot.
        </h2>
        <p className="mt-6 text-muted-foreground max-w-xl">
          Confirm or cancel your fixed Sunday session. If you can't make it, let us know when you're available so we can swap.
        </p>

        <div className="mt-10 bg-card border border-border p-6 md:p-10 shadow-elevated">
          {!player ? (
            <form onSubmit={lookup} className="space-y-4">
              <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Your WhatsApp number</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="tel"
                  required
                  maxLength={20}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+31 6 ..."
                  className="flex-1 bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-primary text-primary-foreground px-6 py-3 text-sm uppercase tracking-widest font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {loading ? "..." : "Find my slot"}
                </button>
              </div>
            </form>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Hi {player.name},</div>
              <div className="display-font text-3xl md:text-4xl uppercase mt-2">
                Your slot is <span className="text-primary">{fmtDate(sunday)}</span> at <span className="text-primary">{player.slot_time}</span>
              </div>

              {!showCancel ? (
                <div className="grid sm:grid-cols-2 gap-3 mt-8">
                  <button
                    onClick={() => respond("confirmed")}
                    className="bg-primary text-primary-foreground px-6 py-4 text-sm uppercase tracking-widest font-semibold hover:bg-primary/90 transition-colors"
                  >
                    ✅ I'll be there
                  </button>
                  <button
                    onClick={() => respond("cancelled")}
                    className="border border-border hover:border-foreground/40 px-6 py-4 text-sm uppercase tracking-widest font-semibold transition-colors"
                  >
                    ❌ Can't make it
                  </button>
                </div>
              ) : (
                <div className="mt-8 space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Optional — when are you available this Sunday? Helps us swap your slot.
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Available from</label>
                      <input
                        type="time"
                        value={from}
                        onChange={(e) => setFrom(e.target.value)}
                        className="mt-2 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none [color-scheme:dark]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Until</label>
                      <input
                        type="time"
                        value={to}
                        onChange={(e) => setTo(e.target.value)}
                        className="mt-2 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none [color-scheme:dark]"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => respond("cancelled")}
                    className="w-full bg-primary text-primary-foreground px-6 py-4 text-sm uppercase tracking-widest font-semibold hover:bg-primary/90 transition-colors"
                  >
                    Submit cancellation
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SundaySlot;
