import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const LEVELS = ["BVO", "Divisie", "Hoofdklasse", "Eerste klasse", "Recreatief"] as const;
export const TRAINING_TYPES = ["1-on-1", "Duo", "Group"] as const;
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
export const TIME_PRESETS = [
  "Weekday mornings",
  "Weekday afternoons",
  "Weekday evenings 18:00–20:00",
  "Saturday mornings",
  "Saturday afternoons",
  "Sunday mornings",
  "Sunday afternoons",
];

const schema = z.object({
  player_name: z.string().trim().min(1).max(100),
  parent_name: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().min(5).max(30),
  email: z.string().trim().email().max(255).optional().or(z.literal("")),
  birthdate: z.string().optional().or(z.literal("")),
  club: z.string().trim().max(100).optional().or(z.literal("")),
  team: z.string().trim().max(100).optional().or(z.literal("")),
  position: z.string().trim().max(50).optional().or(z.literal("")),
  level: z.enum(LEVELS).optional(),
  training_type: z.enum(TRAINING_TYPES).optional(),
  available_days: z.array(z.string()),
  available_times: z.string().max(500).optional().or(z.literal("")),
  notes: z.string().max(800).optional().or(z.literal("")),
});

type Props = { variant?: "section" | "page" };

const WaitlistForm = ({ variant = "section" }: Props) => {
  const [open, setOpen] = useState(true);
  const [closedMsg, setClosedMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const [form, setForm] = useState({
    player_name: "",
    parent_name: "",
    phone: "",
    email: "",
    birthdate: "",
    club: "",
    team: "",
    position: "",
    level: "" as (typeof LEVELS)[number] | "",
    training_type: "" as (typeof TRAINING_TYPES)[number] | "",
    available_times: "",
    notes: "",
  });
  const [days, setDays] = useState<string[]>([]);
  const [presets, setPresets] = useState<string[]>([]);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("waitlist_open, closed_message")
      .eq("id", 1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setOpen(data.waitlist_open);
          setClosedMsg(data.closed_message);
        }
      });
  }, []);

  const toggle = (arr: string[], setter: (v: string[]) => void, val: string) =>
    setter(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const merged = {
      ...form,
      level: form.level || undefined,
      training_type: form.training_type || undefined,
      available_days: days,
      available_times: [presets.join(", "), form.available_times].filter(Boolean).join(" · "),
    };
    const parsed = schema.safeParse(merged);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Please complete the required fields.");
      return;
    }
    setBusy(true);
    const payload: any = { ...parsed.data };
    Object.keys(payload).forEach((k) => payload[k] === "" && delete payload[k]);
    const { error } = await supabase.from("waitlist_entries").insert(payload);
    setBusy(false);
    if (error) {
      toast.error("Could not submit. Try again.");
      return;
    }
    toast.success("You're on the list.", { description: "We'll call the moment a spot opens." });
    setDone(true);
  };

  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    variant === "page" ? (
      <main className="min-h-screen bg-background text-foreground py-16">
        <div className="container max-w-4xl">{children}</div>
      </main>
    ) : (
      <section id="booking" className="relative py-24 md:py-32 border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="container relative">{children}</div>
      </section>
    );

  if (done) {
    return (
      <Wrapper>
        <div className="bg-card border border-border p-10 text-center">
          <div className="display-font text-5xl uppercase">You're on the list.</div>
          <p className="mt-4 text-muted-foreground">We'll call the moment a spot opens.</p>
          <Link
            to="/"
            className="inline-block mt-8 border border-border hover:border-foreground/40 px-6 py-3 text-xs uppercase tracking-widest"
          >
            Back to home
          </Link>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {variant === "page" && (
        <div className="mb-8">
          <Link to="/" className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
            ← Back
          </Link>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">/ Waitlist</div>
          <h2 className="display-font text-5xl md:text-7xl uppercase leading-[0.9]">
            Join the<br />Waitlist.
          </h2>
          <p className="mt-6 text-muted-foreground max-w-sm">
            Spots are limited and awarded on fit. Tell us when you're available — we'll call the moment a spot matches.
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
            onSubmit={submit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-8 bg-card border border-border p-6 md:p-10 shadow-elevated space-y-8"
          >
            {/* Player info */}
            <div className="grid sm:grid-cols-2 gap-5">
              <Field label="Player name *">
                <input
                  required
                  maxLength={100}
                  value={form.player_name}
                  onChange={(e) => setForm({ ...form, player_name: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Parent name">
                <input
                  maxLength={100}
                  value={form.parent_name}
                  onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Phone *">
                <input
                  required
                  type="tel"
                  maxLength={30}
                  placeholder="+31 6 ..."
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Birthdate">
                <input
                  type="date"
                  value={form.birthdate}
                  onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
                  className={`${inputCls} [color-scheme:dark]`}
                />
              </Field>
              <Field label="Position">
                <input
                  maxLength={50}
                  value={form.position}
                  onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. Striker, CDM"
                />
              </Field>
              <Field label="Club">
                <input
                  maxLength={100}
                  value={form.club}
                  onChange={(e) => setForm({ ...form, club: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Team">
                <input
                  maxLength={100}
                  value={form.team}
                  onChange={(e) => setForm({ ...form, team: e.target.value })}
                  className={inputCls}
                  placeholder="e.g. JO15-1"
                />
              </Field>
              <Field label="Level">
                <select
                  value={form.level}
                  onChange={(e) => setForm({ ...form, level: e.target.value as any })}
                  className={inputCls}
                >
                  <option value="">Select…</option>
                  {LEVELS.map((l) => (
                    <option key={l}>{l}</option>
                  ))}
                </select>
              </Field>
              <Field label="Preferred training type">
                <select
                  value={form.training_type}
                  onChange={(e) => setForm({ ...form, training_type: e.target.value as any })}
                  className={inputCls}
                >
                  <option value="">Select…</option>
                  {TRAINING_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </Field>
            </div>

            {/* Days */}
            <div>
              <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Available days</label>
              <div className="mt-3 grid grid-cols-4 sm:grid-cols-7 gap-2">
                {DAYS.map((d) => (
                  <button
                    type="button"
                    key={d}
                    onClick={() => toggle(days, setDays, d)}
                    className={`py-3 text-xs font-medium border ${days.includes(d) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground/40"}`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Time presets */}
            <div>
              <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Available times</label>
              <div className="mt-3 flex flex-wrap gap-2">
                {TIME_PRESETS.map((p) => (
                  <button
                    type="button"
                    key={p}
                    onClick={() => toggle(presets, setPresets, p)}
                    className={`px-3 py-2 text-xs border ${presets.includes(p) ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-foreground/40"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <input
                placeholder="Other availability (optional)"
                maxLength={500}
                value={form.available_times}
                onChange={(e) => setForm({ ...form, available_times: e.target.value })}
                className={`${inputCls} mt-3`}
              />
            </div>

            <Field label="Notes (optional)">
              <textarea
                rows={3}
                maxLength={800}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className={inputCls}
              />
            </Field>

            <button
              type="submit"
              disabled={busy}
              className="group w-full inline-flex items-center justify-between gap-6 bg-primary text-primary-foreground px-6 py-5 text-sm uppercase tracking-widest font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
            >
              <span>{busy ? "Adding you..." : "Join the Waitlist"}</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </button>
          </motion.form>
        )}
      </div>
    </Wrapper>
  );
};

const inputCls =
  "mt-2 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default WaitlistForm;
