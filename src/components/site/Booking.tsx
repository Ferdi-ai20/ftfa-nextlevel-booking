import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

const levels = ["Amateur", "Sub-Top", "Top Amateur", "Pro Club Youth", "Pro Club First Team"];

const defaultSlots = [
  "Sat 10:00", "Sat 11:00", "Sat 14:00", "Sat 16:00",
  "Sun 10:00", "Sun 11:00", "Sun 14:00", "Sun 16:00",
];

const waitlistSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(5).max(20),
  age: z.number().int().min(8).max(40).optional(),
  level: z.string().max(50),
  club: z.string().max(100).optional(),
  preferred_slots: z.array(z.string().max(20)).min(1, "Pick at least one preferred time"),
  other_availability: z.string().max(300).optional(),
});

const Booking = () => {
  const [open, setOpen] = useState(true);
  const [closedMsg, setClosedMsg] = useState("");
  const [form, setForm] = useState({ name: "", age: "", level: levels[0], club: "", phone: "", other: "" });
  const [picked, setPicked] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    supabase.from("app_settings").select("waitlist_open, closed_message").eq("id", 1).maybeSingle()
      .then(({ data }) => {
        if (data) {
          setOpen(data.waitlist_open);
          setClosedMsg(data.closed_message);
        }
      });
  }, []);

  const togglePick = (slot: string) => {
    setPicked((p) => p.includes(slot) ? p.filter((s) => s !== slot) : [...p, slot]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = waitlistSchema.safeParse({
      name: form.name,
      phone: form.phone,
      age: form.age ? Number(form.age) : undefined,
      level: form.level,
      club: form.club || undefined,
      preferred_slots: picked,
      other_availability: form.other || undefined,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Please complete the form.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("waitlist").insert(parsed.data);
    setSubmitting(false);
    if (error) {
      toast.error("Could not join waitlist. Try again.");
      return;
    }
    toast.success("You're on the list.", {
      description: "We'll call you the moment a spot opens.",
    });
    setForm({ name: "", age: "", level: levels[0], club: "", phone: "", other: "" });
    setPicked([]);
  };

  return (
    <section id="booking" className="relative py-24 md:py-32 border-b border-border">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="container relative">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">/ 04 — Waitlist</div>
            <h2 className="display-font text-5xl md:text-7xl uppercase leading-[0.9]">
              Join the<br />Waitlist.
            </h2>
            <p className="mt-6 text-muted-foreground max-w-sm">
              Spots are intentionally limited. Pick the times that work for you — we'll call the moment one opens up.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 border border-primary/40 bg-primary/5 px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-primary ticker-pulse" />
              <span className="text-xs uppercase tracking-widest text-primary">
                {open ? "Waitlist open" : "Waitlist closed"}
              </span>
            </div>
          </div>

          {!open ? (
            <div className="lg:col-span-8 bg-card border border-border p-10 flex items-center justify-center text-center">
              <p className="display-font text-2xl md:text-3xl uppercase max-w-md">{closedMsg}</p>
            </div>
          ) : (
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-8 bg-card border border-border p-6 md:p-10 shadow-elevated"
            >
              {/* Preferred slots */}
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Preferred Time Slots * (pick all that work)</label>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {defaultSlots.map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => togglePick(s)}
                      className={`py-3 text-xs font-medium border transition-colors ${picked.includes(s) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground/40"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Other availability (optional)</label>
                <input
                  type="text"
                  maxLength={300}
                  value={form.other}
                  onChange={(e) => setForm({ ...form, other: e.target.value })}
                  placeholder="e.g. weekday evenings after 18:00"
                  className="mt-3 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none"
                />
              </div>

              {/* Player info */}
              <div className="grid sm:grid-cols-2 gap-6 mt-8">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Full Name *</label>
                  <input type="text" required maxLength={100} value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-3 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Age</label>
                  <input type="number" min={8} max={40} value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    className="mt-3 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Current Level</label>
                  <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="mt-3 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none">
                    {levels.map((l) => <option key={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Current Club</label>
                  <input type="text" maxLength={100} value={form.club}
                    onChange={(e) => setForm({ ...form, club: e.target.value })}
                    className="mt-3 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">WhatsApp Phone *</label>
                  <input type="tel" required maxLength={20} value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+31 6 ..."
                    className="mt-3 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none" />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-10 group w-full inline-flex items-center justify-between gap-6 bg-primary text-primary-foreground px-6 py-5 text-sm uppercase tracking-widest font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
              >
                <span>{submitting ? "Adding you..." : "Join the Waitlist"}</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </motion.form>
          )}
        </div>
      </div>
    </section>
  );
};

export default Booking;
