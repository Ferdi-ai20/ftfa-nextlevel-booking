import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import {
  TrainingType,
  trainingTypeLabel,
  fmtDate,
  fmtTime,
} from "@/lib/slots";

type Slot = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  training_type: TrainingType;
  max_players: number;
  price_per_player: number | null;
  location: string | null;
  player_note: string | null;
};

const guestSchema = z.object({
  guest_name: z.string().trim().min(1).max(100),
  guest_email: z.string().trim().email().max(255),
  guest_phone: z.string().trim().min(5).max(30),
  player_name: z.string().trim().min(1).max(100),
  guest_birth_year: z.coerce.number().int().min(1990).max(new Date().getFullYear()).optional().or(z.literal("" as any)),
  guest_club: z.string().trim().max(100).optional().or(z.literal("")),
  guest_team: z.string().trim().max(100).optional().or(z.literal("")),
  guest_position: z.string().trim().max(50).optional().or(z.literal("")),
  guest_goal: z.string().trim().max(800).optional().or(z.literal("")),
  guest_notes: z.string().trim().max(800).optional().or(z.literal("")),
});

const PublicSlots = () => {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [active, setActive] = useState<Slot | null>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("training_slots")
      .select("id, date, start_time, end_time, training_type, max_players, price_per_player, location, player_note")
      .eq("visibility", "public")
      .eq("status", "open")
      .gte("date", today)
      .order("date")
      .order("start_time")
      .then(({ data }) => {
        setSlots((data ?? []) as Slot[]);
        setLoaded(true);
      });
  }, []);

  if (!loaded) return null;

  return (
    <section id="proeftrainingen" className="py-24 md:py-32 border-b border-border">
      <div className="container">
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Proeftrainingen</div>
        <h2 className="display-font text-4xl md:text-5xl uppercase mt-2 mb-8">Open trainingen</h2>

        {slots.length === 0 ? (
          <div className="border border-border bg-card p-10 text-center">
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Er zijn momenteel geen open proeftrainingen beschikbaar. Meld je aan om op de hoogte te blijven van nieuwe plekken.
            </p>
            <a href="#booking" className="inline-block mt-6 bg-primary text-primary-foreground px-6 py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90">
              Meld je aan →
            </a>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {slots.map((s) => (
              <div key={s.id} className="border border-border bg-card p-5">
                <div className="display-font text-xl uppercase">{fmtDate(s.date)}</div>
                <div className="font-mono text-sm mt-1">{fmtTime(s.start_time)} – {fmtTime(s.end_time)}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
                  {trainingTypeLabel(s.training_type)}{s.location ? ` · ${s.location}` : ""}{s.price_per_player ? ` · €${s.price_per_player}` : ""}
                </div>
                {s.player_note && <div className="text-xs text-muted-foreground mt-2 italic">"{s.player_note}"</div>}
                <button
                  onClick={() => setActive(s)}
                  className="mt-4 w-full bg-primary text-primary-foreground px-3 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90"
                >
                  Boek proeftraining
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

const GuestBookingModal = ({ slot, onClose }: { slot: Slot; onClose: () => void }) => {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    guest_name: "",
    guest_email: "",
    guest_phone: "",
    player_name: "",
    guest_birth_year: "",
    guest_club: "",
    guest_team: "",
    guest_position: "",
    guest_goal: "",
    guest_notes: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = guestSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message || "Vul de verplichte velden in.");
      return;
    }
    setBusy(true);
    const d = parsed.data as any;
    const { error } = await supabase.from("bookings").insert({
      slot_id: slot.id,
      status: "pending_review",
      guest_name: `${d.guest_name} (ouder van ${d.player_name})`,
      guest_email: d.guest_email,
      guest_phone: d.guest_phone,
      guest_birth_year: d.guest_birth_year ? Number(d.guest_birth_year) : null,
      guest_club: d.guest_club || null,
      guest_team: d.guest_team || null,
      guest_position: d.guest_position || null,
      guest_goal: d.guest_goal || null,
      guest_notes: d.guest_notes || null,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Aanvraag verzonden! Ferdi neemt contact op.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-4 overflow-auto">
      <form onSubmit={submit} className="bg-card border border-border w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between">
          <div>
            <div className="display-font text-xl uppercase">Proeftraining boeken</div>
            <div className="text-xs text-muted-foreground mt-1">{fmtDate(slot.date)} · {fmtTime(slot.start_time)}</div>
          </div>
          <button type="button" onClick={onClose} className="text-xs uppercase">✕</button>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          <I label="Naam ouder *"><input required value={form.guest_name} onChange={(e) => setForm({ ...form, guest_name: e.target.value })} className={cls} /></I>
          <I label="Naam speler *"><input required value={form.player_name} onChange={(e) => setForm({ ...form, player_name: e.target.value })} className={cls} /></I>
          <I label="E-mail *"><input required type="email" value={form.guest_email} onChange={(e) => setForm({ ...form, guest_email: e.target.value })} className={cls} /></I>
          <I label="Telefoon *"><input required type="tel" value={form.guest_phone} onChange={(e) => setForm({ ...form, guest_phone: e.target.value })} className={cls} /></I>
          <I label="Geboortejaar"><input type="number" value={form.guest_birth_year} onChange={(e) => setForm({ ...form, guest_birth_year: e.target.value })} className={cls} /></I>
          <I label="Positie"><input value={form.guest_position} onChange={(e) => setForm({ ...form, guest_position: e.target.value })} className={cls} /></I>
          <I label="Club"><input value={form.guest_club} onChange={(e) => setForm({ ...form, guest_club: e.target.value })} className={cls} /></I>
          <I label="Team"><input value={form.guest_team} onChange={(e) => setForm({ ...form, guest_team: e.target.value })} className={cls} /></I>
          <I label="Doelstelling" full><textarea rows={2} value={form.guest_goal} onChange={(e) => setForm({ ...form, guest_goal: e.target.value })} className={cls} /></I>
          <I label="Opmerkingen" full><textarea rows={2} value={form.guest_notes} onChange={(e) => setForm({ ...form, guest_notes: e.target.value })} className={cls} /></I>
        </div>

        <p className="text-[11px] text-muted-foreground">
          Je aanvraag wordt door Ferdi beoordeeld. Je krijgt een bevestiging per mail.
        </p>

        <button disabled={busy} className="w-full bg-primary text-primary-foreground py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 disabled:opacity-50">
          {busy ? "Versturen..." : "Verstuur aanvraag"}
        </button>
      </form>
    </div>
  );
};

const cls = "mt-1.5 w-full bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none";
const I = ({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) => (
  <div className={full ? "sm:col-span-2" : ""}>
    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default PublicSlots;
