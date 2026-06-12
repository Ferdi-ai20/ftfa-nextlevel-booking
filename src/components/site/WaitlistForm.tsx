import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

// Kept the file name "WaitlistForm" for backwards-compat with imports.
// This is now the public application form (writes to `applications` table).

const schema = z.object({
  parent_name: z.string().trim().min(1, "Naam ouder is verplicht").max(100),
  player_name: z.string().trim().min(1, "Naam speler is verplicht").max(100),
  birth_year: z.coerce.number().int().min(1990).max(new Date().getFullYear()).optional().or(z.literal("" as any)),
  email: z.string().trim().email("Ongeldig e-mailadres").max(255),
  phone: z.string().trim().min(5, "Telefoonnummer is verplicht").max(30),
  club: z.string().trim().max(100).optional().or(z.literal("")),
  team: z.string().trim().max(100).optional().or(z.literal("")),
  position: z.string().trim().max(50).optional().or(z.literal("")),
  goal: z.string().trim().max(800).optional().or(z.literal("")),
  notes: z.string().trim().max(800).optional().or(z.literal("")),
});

type Props = { variant?: "section" | "page" };

const WaitlistForm = ({ variant = "section" }: Props) => {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    parent_name: "",
    player_name: "",
    birth_year: "",
    email: "",
    phone: "",
    club: "",
    team: "",
    position: "",
    goal: "",
    notes: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Vul de verplichte velden in.");
      return;
    }
    setBusy(true);
    const data = parsed.data as any;
    const payload: any = {
      parent_name: data.parent_name,
      player_name: data.player_name,
      birth_year: data.birth_year ? Number(data.birth_year) : null,
      email: data.email,
      phone: data.phone,
      club: data.club || null,
      team: data.team || null,
      position: data.position || null,
      goal: data.goal || null,
      notes: data.notes || null,
      status: "pending",
    };
    const { error } = await supabase.from("applications").insert(payload);
    setBusy(false);
    if (error) {
      toast.error("Kon niet versturen. Probeer opnieuw.");
      return;
    }
    toast.success("Aanmelding ontvangen!");
    setDone(true);
  };

  if (done) {
    return (
      <Wrapper variant={variant}>
        <div className="bg-card border border-border p-10 text-center">
          <div className="display-font text-5xl uppercase">Aanmelding ontvangen.</div>
          <p className="mt-4 text-muted-foreground">Ferdi neemt zo snel mogelijk contact met je op.</p>
        </div>
      </Wrapper>
    );
  }

  return (
    <Wrapper variant={variant}>
      <div className="grid lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4">
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-4">/ Aanmelden</div>
          <h2 className="display-font text-5xl md:text-7xl uppercase leading-[0.9]">Meld je<br />aan.</h2>
          <p className="mt-6 text-muted-foreground max-w-sm">
            Vul het formulier in. Ferdi beoordeelt elke aanmelding persoonlijk en neemt contact op.
          </p>
        </div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="lg:col-span-8 bg-card border border-border p-6 md:p-10 shadow-elevated space-y-8"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Naam ouder *">
              <input required maxLength={100} value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Naam speler *">
              <input required maxLength={100} value={form.player_name} onChange={(e) => setForm({ ...form, player_name: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Geboortejaar">
              <input type="number" min={1990} max={new Date().getFullYear()} value={form.birth_year} onChange={(e) => setForm({ ...form, birth_year: e.target.value })} className={inputCls} />
            </Field>
            <Field label="E-mail *">
              <input required type="email" maxLength={255} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Telefoon *">
              <input required type="tel" maxLength={30} placeholder="+31 6 ..." value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Positie">
              <input maxLength={50} value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className={inputCls} placeholder="bv. Spits, CDM" />
            </Field>
            <Field label="Club">
              <input maxLength={100} value={form.club} onChange={(e) => setForm({ ...form, club: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Team">
              <input maxLength={100} value={form.team} onChange={(e) => setForm({ ...form, team: e.target.value })} className={inputCls} placeholder="bv. JO15-1" />
            </Field>
          </div>

          <Field label="Doelstelling">
            <textarea rows={3} maxLength={800} value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} className={inputCls} placeholder="Wat wil je bereiken?" />
          </Field>
          <Field label="Opmerkingen">
            <textarea rows={2} maxLength={800} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} />
          </Field>

          <button
            type="submit"
            disabled={busy}
            className="group w-full inline-flex items-center justify-between gap-6 bg-primary text-primary-foreground px-6 py-5 text-sm uppercase tracking-widest font-semibold hover:bg-primary/90 transition-all disabled:opacity-50"
          >
            <span>{busy ? "Versturen..." : "Verstuur aanmelding"}</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </motion.form>
      </div>
    </Wrapper>
  );
};

const inputCls = "mt-2 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{label}</label>
    {children}
  </div>
);

const Wrapper = ({ variant, children }: { variant: "section" | "page"; children: React.ReactNode }) =>
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

export default WaitlistForm;
