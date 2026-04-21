import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const trainingTypes = [
  { id: "1on1", label: "1-on-1 Training", note: "Premium" },
  { id: "group", label: "Small Group", note: "Max 6" },
  { id: "bvo", label: "BVO Preparation", note: "Selective" },
];

const levels = ["Amateur", "Sub-Top", "Top Amateur", "BVO Youth", "BVO First"];

const timeSlots = ["09:00", "11:00", "14:00", "16:00", "18:00", "20:00"];

const Booking = () => {
  const [type, setType] = useState("1on1");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [form, setForm] = useState({ name: "", age: "", level: levels[0], club: "", phone: "" });

  const minDate = useMemo(() => new Date().toISOString().split("T")[0], []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !form.name || !form.age || !form.phone) {
      toast.error("Please complete all required fields.");
      return;
    }
    if (form.name.length > 100 || form.club.length > 100) {
      toast.error("Input too long.");
      return;
    }
    toast.success("Spot reserved.", {
      description: `${trainingTypes.find(t => t.id === type)?.label} · ${date} at ${time}. We'll contact you on WhatsApp shortly.`,
    });
    setForm({ name: "", age: "", level: levels[0], club: "", phone: "" });
    setDate(""); setTime("");
  };

  return (
    <section id="booking" className="relative py-24 md:py-32 border-b border-border">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="container relative">
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4">
            <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">/ 04 — Reserve</div>
            <h2 className="display-font text-5xl md:text-7xl uppercase leading-[0.9]">
              Book Your<br/>Session.
            </h2>
            <p className="mt-6 text-muted-foreground max-w-sm">
              Spots are intentionally limited. We work only with players ready to commit.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 border border-primary/40 bg-primary/5 px-4 py-3">
              <span className="w-2 h-2 rounded-full bg-primary ticker-pulse" />
              <span className="text-xs uppercase tracking-widest text-primary">Limited Availability — 4 spots left this month</span>
            </div>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-8 bg-card border border-border p-6 md:p-10 shadow-elevated"
          >
            {/* Training type */}
            <div>
              <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Training Type</label>
              <div className="grid sm:grid-cols-3 gap-2 mt-3">
                {trainingTypes.map((t) => (
                  <button
                    type="button"
                    key={t.id}
                    onClick={() => setType(t.id)}
                    className={`text-left p-4 border transition-all ${type === t.id ? "border-primary bg-primary/10" : "border-border hover:border-foreground/40"}`}
                  >
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{t.note}</div>
                    <div className="display-font text-xl uppercase mt-1">{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Date & time */}
            <div className="grid sm:grid-cols-2 gap-6 mt-8">
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Date</label>
                <input
                  type="date"
                  min={minDate}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-3 w-full bg-background border border-border px-4 py-3 text-foreground focus:border-primary focus:outline-none [color-scheme:dark]"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Time Slot</label>
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-1">
                  {timeSlots.map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setTime(t)}
                      className={`py-3 text-xs font-medium border transition-colors ${time === t ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground/40"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Player info */}
            <div className="grid sm:grid-cols-2 gap-6 mt-8">
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Full Name *</label>
                <input
                  type="text"
                  required
                  maxLength={100}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="mt-3 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Age *</label>
                <input
                  type="number"
                  required
                  min={8}
                  max={30}
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  className="mt-3 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Current Level</label>
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value })}
                  className="mt-3 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none"
                >
                  {levels.map((l) => <option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Current Club</label>
                <input
                  type="text"
                  maxLength={100}
                  value={form.club}
                  onChange={(e) => setForm({ ...form, club: e.target.value })}
                  className="mt-3 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">WhatsApp Phone *</label>
                <input
                  type="tel"
                  required
                  maxLength={20}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+31 6 ..."
                  className="mt-3 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-10 group w-full inline-flex items-center justify-between gap-6 bg-primary text-primary-foreground px-6 py-5 text-sm uppercase tracking-widest font-semibold hover:bg-primary/90 transition-all"
            >
              <span>Reserve Your Spot</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Booking;
