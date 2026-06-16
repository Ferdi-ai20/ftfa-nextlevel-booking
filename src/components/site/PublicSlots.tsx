import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  TrainingType,
  trainingTypeLabel,
  fmtDate,
  fmtTime,
  BOOKING_LEAD_HOURS,
  hoursUntil,
} from "@/lib/slots";
import { notify, ADMIN_EMAIL } from "@/lib/notify";

type Slot = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  training_type: TrainingType;
  max_players: number;
  location: string | null;
  player_note: string | null;
};

const POSITIONS = ["Keeper", "Verdediger", "Middenvelder", "Aanvaller", "Anders"] as const;
const NL_PHONE_RE = /^(?:(?:\+31|0031|0)6\d{8})$/; // 06xxxxxxxx or +316xxxxxxxx

const normalizePhone = (raw: string) => raw.replace(/[\s\-().]/g, "");

const todayISO = () => new Date().toISOString().slice(0, 10);

const ageFromDob = (dob: string) => {
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return -1;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
};

const guestSchema = z.object({
  parent_name: z.string().trim().min(2, "Naam ouder moet minimaal 2 tekens zijn"),
  player_name: z.string().trim().min(2, "Naam speler moet minimaal 2 tekens zijn"),
  player_dob: z
    .string()
    .min(1, "Geboortedatum is verplicht")
    .refine((v) => {
      const a = ageFromDob(v);
      return a >= 5 && a <= 21;
    }, "Speler moet tussen 5 en 21 jaar oud zijn"),
  club: z.string().trim().min(2, "Club is verplicht (minimaal 2 tekens)"),
  team: z.string().trim().min(2, "Team is verplicht (minimaal 2 tekens)"),
  position: z.string().trim().min(1, "Positie is verplicht"),
  email: z.string().trim().email("Geen geldig e-mailadres").max(255),
  phone: z
    .string()
    .trim()
    .transform(normalizePhone)
    .refine((v) => NL_PHONE_RE.test(v), "Geen geldig Nederlands mobiel nummer (06… of +316…)"),
});

type GuestForm = z.input<typeof guestSchema>;
type GuestErrors = Partial<Record<keyof GuestForm, string>>;

const PublicSlots = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<Slot | null>(null);

  useEffect(() => {
    supabase
      .from("training_slots")
      .select("id, date, start_time, end_time, training_type, max_players, location, player_note")
      .eq("visibility", "public")
      .eq("status", "open")
      .gte("date", todayISO())
      .order("date")
      .order("start_time")
      .then(({ data }) => {
        const futureWithLead = (data ?? []).filter(
          (s) => hoursUntil(s.date, s.start_time) >= BOOKING_LEAD_HOURS,
        );
        setSlots(futureWithLead as Slot[]);
        setLoaded(true);
      });
  }, []);

  if (!loaded) return null;

  return (
    <section id="proeftrainingen" className="py-24 md:py-32 border-b border-border">
      <div className="container">
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Open trainingen</div>
        <h2 className="display-font text-4xl md:text-5xl uppercase mt-2 mb-8">Boek een open training</h2>

        {slots.length === 0 ? (
          <div className="border border-border bg-card p-10 text-center">
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Er zijn momenteel geen open trainingen beschikbaar. Meld je aan om op de hoogte te blijven van nieuwe plekken.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((s) => (
              <div key={s.id} className="border border-border bg-card p-5">
                <div className="display-font text-xl uppercase">{fmtDate(s.date)}</div>
                <div className="font-mono text-sm mt-1">{fmtTime(s.start_time)} – {fmtTime(s.end_time)}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
                  {trainingTypeLabel(s.training_type)}{s.location ? ` · ${s.location}` : ""}
                </div>
                {s.player_note && <div className="text-xs text-muted-foreground mt-2 italic">"{s.player_note}"</div>}
                <button
                  onClick={() => setActive(s)}
                  className="mt-4 w-full bg-primary text-primary-foreground px-3 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90"
                >
                  Boek deze training
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {active && <GuestBookingModal slot={active} onClose={() => setActive(null)} />}
    </section>
  );
};

const initialForm: GuestForm = {
  parent_name: "",
  player_name: "",
  player_dob: "",
  club: "",
  team: "",
  position: "",
  email: "",
  phone: "",
};

const GuestBookingModal = ({ slot, onClose }: { slot: Slot; onClose: () => void }) => {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState<GuestForm>(initialForm);
  const [errors, setErrors] = useState<GuestErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const maxDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 5);
    return d.toISOString().slice(0, 10);
  }, []);
  const minDob = useMemo(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 21);
    return d.toISOString().slice(0, 10);
  }, []);

  const setField = <K extends keyof GuestForm>(k: K, v: GuestForm[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    const parsed = guestSchema.safeParse(form);
    if (!parsed.success) {
      const next: GuestErrors = {};
      for (const issue of parsed.error.issues) {
        const k = issue.path[0] as keyof GuestForm;
        if (!next[k]) next[k] = issue.message;
      }
      setErrors(next);
      toast.error("Controleer de gemarkeerde velden");
      return;
    }
    const d = parsed.data;
    setBusy(true);

    const dobYear = Number(d.player_dob.slice(0, 4));
    const { error } = await supabase.from("bookings").insert({
      slot_id: slot.id,
      status: "confirmed",
      guest_parent_name: d.parent_name,
      guest_name: `${d.parent_name} (ouder van ${d.player_name})`,
      guest_email: d.email,
      guest_phone: d.phone,
      guest_dob: d.player_dob,
      guest_birth_year: dobYear,
      guest_club: d.club,
      guest_team: d.team,
      guest_position: d.position,
    } as any);

    if (error) {
      setBusy(false);
      const msg = /24 hours/i.test(error.message)
        ? "Te veel boekingen vanaf dit e-mailadres in de afgelopen 24 uur."
        : /closed/i.test(error.message)
        ? "Online boeken is gesloten voor deze training (start binnen 24 uur)."
        : error.message;
      toast.error(msg);
      return;
    }

    // Show success screen FIRST, then fire emails + auto-application (best-effort)
    setSubmitted(true);
    setBusy(false);

    void supabase.rpc("ensure_application_for_guest", {
      _email: d.email,
      _parent_name: d.parent_name,
      _player_name: d.player_name,
      _dob: d.player_dob,
      _club: d.club,
      _team: d.team,
      _position: d.position,
      _phone: d.phone,
      _notes: `Auto-aangemaakt vanuit open boeking ${fmtDate(slot.date)} ${fmtTime(slot.start_time)}`,
    });

    void notify(
      "booking-confirmed",
      d.email,
      {
        parentName: d.parent_name,
        playerName: d.player_name,
        date: fmtDate(slot.date),
        slotTime: `${fmtTime(slot.start_time)}–${fmtTime(slot.end_time)}`,
        trainingType: trainingTypeLabel(slot.training_type),
        location: slot.location ?? "",
      },
      `booking-${slot.id}-${d.email}`,
    );
    void notify(
      "admin-new-booking",
      ADMIN_EMAIL,
      {
        who: `${d.parent_name} (parent of ${d.player_name})`,
        date: fmtDate(slot.date),
        slotTime: `${fmtTime(slot.start_time)}–${fmtTime(slot.end_time)}`,
        trainingType: trainingTypeLabel(slot.training_type),
        location: slot.location ?? "",
        contact: d.email,
        phone: d.phone,
        birthYear: dobYear,
        club: d.club,
        team: d.team,
        position: d.position,
        visibility: slot.visibility,
        bookingType: "guest",
      },
      `admin-booking-${slot.id}-${d.email}`,
    );
    void notify(
      "application-submitted",
      ADMIN_EMAIL,
      {
        parentName: d.parent_name,
        playerName: d.player_name,
        email: d.email,
        phone: d.phone,
        birthYear: dobYear,
        club: d.club,
        team: d.team,
        position: d.position,
        notes: `Auto from guest booking ${fmtDate(slot.date)} ${fmtTime(slot.start_time)}`,
      },
      `app-sub-${slot.id}-${d.email}`,
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-4 overflow-auto">
      <div className="bg-card border border-border w-full max-w-lg max-h-[92vh] overflow-auto">
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="display-font text-2xl uppercase">Boeking bevestigd ✓</div>
            <p className="text-sm text-muted-foreground">
              Bedankt! Je hebt {slot.location ? `bij ${slot.location} ` : ""}een plek geboekt voor{" "}
              <strong>{fmtDate(slot.date)}</strong> om <strong>{fmtTime(slot.start_time)}</strong>.
            </p>
            <p className="text-sm text-muted-foreground">
              Je ontvangt binnen enkele minuten een bevestigingsmail op <strong>{form.email}</strong>.
            </p>
            <div className="text-xs text-muted-foreground border-t border-border pt-4">
              Voor vragen of last-minute wijzigingen, neem contact op met Ferdi via WhatsApp:{" "}
              <a
                href="https://wa.me/31621275348"
                target="_blank"
                rel="noreferrer"
                className="text-primary font-semibold"
              >
                +31 6 21 27 53 48
              </a>
            </div>
            <button
              onClick={onClose}
              className="mt-2 bg-primary text-primary-foreground px-6 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90"
            >
              Sluiten
            </button>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="display-font text-xl uppercase">Open training boeken</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {fmtDate(slot.date)} · {fmtTime(slot.start_time)}–{fmtTime(slot.end_time)} · {trainingTypeLabel(slot.training_type)}
                </div>
              </div>
              <button type="button" onClick={onClose} className="text-xs uppercase">✕</button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Naam ouder *" error={errors.parent_name}>
                <input value={form.parent_name} onChange={(e) => setField("parent_name", e.target.value)} className={inputCls} placeholder="Voor- en achternaam" />
              </Field>
              <Field label="Naam speler *" error={errors.player_name}>
                <input value={form.player_name} onChange={(e) => setField("player_name", e.target.value)} className={inputCls} placeholder="Voor- en achternaam" />
              </Field>
              <Field label="Geboortedatum speler *" error={errors.player_dob}>
                <input type="date" value={form.player_dob} min={minDob} max={maxDob} onChange={(e) => setField("player_dob", e.target.value)} className={inputCls} />
              </Field>
              <Field label="Positie *" error={errors.position}>
                <select value={form.position} onChange={(e) => setField("position", e.target.value)} className={inputCls}>
                  <option value="">Kies een positie</option>
                  {POSITIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Club *" error={errors.club}>
                <input value={form.club} onChange={(e) => setField("club", e.target.value)} className={inputCls} placeholder="Huidige club" />
              </Field>
              <Field label="Team *" error={errors.team}>
                <input value={form.team} onChange={(e) => setField("team", e.target.value)} className={inputCls} placeholder="Bijv. JO13-1" />
              </Field>
              <Field label="E-mailadres *" error={errors.email} full>
                <input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} className={inputCls} placeholder="naam@voorbeeld.nl" />
              </Field>
              <Field label="Telefoonnummer *" error={errors.phone} full>
                <input type="tel" value={form.phone} onChange={(e) => setField("phone", e.target.value)} className={inputCls} placeholder="06 12345678 of +316 12345678" />
              </Field>
            </div>

            <p className="text-[11px] text-muted-foreground">
              Je boeking wordt direct bevestigd. Je krijgt een bevestigingsmail.
            </p>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-primary text-primary-foreground py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? "Bezig met boeken..." : "Bevestig boeking"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

const inputCls = "mt-1.5 w-full bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";

const Field = ({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) => (
  <div className={full ? "sm:col-span-2" : ""}>
    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
    {children}
    {error && <div className="text-[11px] text-destructive mt-1">{error}</div>}
  </div>
);

export default PublicSlots;
