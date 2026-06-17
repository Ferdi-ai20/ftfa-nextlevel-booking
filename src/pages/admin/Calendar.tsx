import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { notify, ADMIN_EMAIL } from "@/lib/notify";
import { LoadingBlock, LoadingTimeoutFallback, useLoadingTimeout } from "@/components/LoadingState";
import {
  TRAINING_TYPES,
  TrainingType,
  SlotVisibility,
  SlotStatus,
  BookingStatus,
  trainingTypeLabel,
  fmtTime,
  fmtDate,
  ACTIVE_BOOKING_STATUSES,
} from "@/lib/slots";

type Slot = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  training_type: TrainingType;
  visibility: SlotVisibility;
  status: SlotStatus;
  max_players: number;
  location: string | null;
  admin_note: string | null;
  player_note: string | null;
};

type Booking = {
  id: string;
  slot_id: string;
  status: BookingStatus;
  guest_name: string | null;
  guest_email: string | null;
  guest_phone: string | null;
  profile_id: string | null;
  player_id: string | null;
};

const VIEWS = ["day", "week", "month"] as const;
type View = (typeof VIEWS)[number];

const startOfWeek = (d: Date) => {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // monday=0
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
};
// Format a local-time Date as YYYY-MM-DD without going through UTC (toISOString shifts the
// date by one in negative-or-positive offset zones — caused Friday slots to render on Saturday).
const isoDay = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
const addDays = (d: Date, n: number) => {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
};

const visibilityColors: Record<SlotVisibility, string> = {
  private: "bg-primary/15 border-primary/40 text-primary",
  public: "bg-emerald-500/15 border-emerald-500/40 text-emerald-400",
  hidden: "bg-muted border-border text-muted-foreground",
};
const statusBadge: Record<SlotStatus, string> = {
  open: "bg-card border-border",
  full: "bg-destructive/10 border-destructive/30",
  cancelled: "bg-muted/40 border-border line-through",
};

const emptyForm = {
  date: "",
  start_time: "10:00",
  end_time: "11:00",
  training_type: "one_on_one" as TrainingType,
  visibility: "private" as SlotVisibility,
  max_players: 1,
  price_per_player: "" as string,
  location: "",
  admin_note: "",
  player_note: "",
};

const Calendar = () => {
  const [view, setView] = useState<View>("week");
  const [cursor, setCursor] = useState<Date>(new Date());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const [creating, setCreating] = useState<null | { date: string }>(null);
  const [editing, setEditing] = useState<Slot | null>(null);
  const [form, setForm] = useState(emptyForm);

  const range = useMemo(() => {
    if (view === "day") return { from: cursor, to: addDays(cursor, 1) };
    if (view === "week") {
      const s = startOfWeek(cursor);
      return { from: s, to: addDays(s, 7) };
    }
    const s = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const e = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    return { from: s, to: e };
  }, [cursor, view]);

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range.from.toISOString(), range.to.toISOString(), retryKey]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: s, error } = await supabase
        .from("training_slots")
        .select("id, date, start_time, end_time, training_type, visibility, status, max_players, location, admin_note, player_note")
        .gte("date", isoDay(range.from))
        .lt("date", isoDay(range.to))
        .order("date")
        .order("start_time");
      if (error) throw error;
      setSlots((s ?? []) as Slot[]);
      if (s && s.length) {
        const ids = s.map((x) => x.id);
        const { data: b, error: bookingError } = await supabase.from("bookings").select("id, slot_id, status, guest_name, guest_email, guest_phone, profile_id, player_id").in("slot_id", ids);
        if (bookingError) throw bookingError;
        setBookings((b ?? []) as Booking[]);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error("Calendar load failed", error);
      toast.error(error instanceof Error ? error.message : "Calendar laden mislukt");
    } finally {
      setLoading(false);
    }
  };

  const { timedOut, resetTimedOut } = useLoadingTimeout(loading);
  const retryLoad = () => {
    resetTimedOut();
    setLoading(true);
    setRetryKey((key) => key + 1);
  };

  const countFor = (slotId: string) =>
    bookings.filter((b) => b.slot_id === slotId && ACTIVE_BOOKING_STATUSES.includes(b.status)).length;

  const openCreate = (date: string) => {
    setEditing(null);
    setForm({ ...emptyForm, date });
    setCreating({ date });
  };
  const openEdit = async (s: Slot) => {
    setCreating(null);
    setEditing(s);
    // Admin-only: fetch price via secure function
    let price = "";
    try {
      const { data } = await supabase.rpc("get_slot_price", { _slot_id: s.id });
      if (data != null) price = String(data);
    } catch { /* ignore */ }
    setForm({
      date: s.date,
      start_time: s.start_time.slice(0, 5),
      end_time: s.end_time.slice(0, 5),
      training_type: s.training_type,
      visibility: s.visibility,
      max_players: s.max_players,
      price_per_player: price,
      location: s.location ?? "",
      admin_note: s.admin_note ?? "",
      player_note: s.player_note ?? "",
    });
  };

  const save = async () => {
    if (!form.date || !form.start_time || !form.end_time) {
      toast.error("Datum en tijden zijn verplicht");
      return;
    }
    const payload = {
      date: form.date,
      start_time: form.start_time,
      end_time: form.end_time,
      training_type: form.training_type,
      visibility: form.visibility,
      max_players: form.max_players,
      location: form.location || null,
      admin_note: form.admin_note || null,
      player_note: form.player_note || null,
    };
    const priceVal = form.price_per_player ? Number(form.price_per_player) : null;
    if (editing) {
      const { error } = await supabase.from("training_slots").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      if (priceVal !== null) {
        await supabase.rpc("admin_set_slot_price", { _slot_id: editing.id, _price: priceVal });
      }
      toast.success("Slot bijgewerkt");
    } else {
      const { data, error } = await supabase.from("training_slots").insert(payload).select("id").single();
      if (error) return toast.error(error.message);
      if (data?.id && priceVal !== null) {
        await supabase.rpc("admin_set_slot_price", { _slot_id: data.id, _price: priceVal });
      }
      toast.success("Slot aangemaakt");
    }
    setCreating(null);
    setEditing(null);
    void load();
  };

  const remove = async (s: Slot) => {
    if (!confirm("Slot verwijderen? Alle boekingen gaan ook weg.")) return;
    const { error } = await supabase.from("training_slots").delete().eq("id", s.id);
    if (error) return toast.error(error.message);
    setEditing(null);
    void load();
  };

  const setVisibility = async (s: Slot, v: SlotVisibility) => {
    const { error } = await supabase.from("training_slots").update({ visibility: v }).eq("id", s.id);
    if (error) return toast.error(error.message);
    void load();
  };

  const cancelBooking = async (b: Booking) => {
    if (!confirm("Boeking annuleren?")) return;
    const { error } = await supabase.from("bookings").update({ status: "cancelled", cancelled_by: "admin" }).eq("id", b.id);
    if (error) return toast.error(error.message);
    const s = slots.find((x) => x.id === b.slot_id);
    const email = b.guest_email ?? (await getProfileEmail(b.profile_id));
    if (email && s) {
      void notify("booking-cancelled", email, {
        recipientName: b.guest_name ?? "",
        date: fmtDate(s.date),
        slotTime: fmtTime(s.start_time),
        byAdmin: true,
      }, `cancel-admin-${b.id}`);
    }
    void load();
  };


  const getProfileEmail = async (_profileId: string | null) => {
    return null;
  };

  const headerLabel = useMemo(() => {
    if (view === "day") return cursor.toLocaleDateString("nl-NL", { weekday: "long", day: "numeric", month: "long" });
    if (view === "week") {
      const s = startOfWeek(cursor);
      const e = addDays(s, 6);
      return `${s.toLocaleDateString("nl-NL", { day: "numeric", month: "short" })} – ${e.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}`;
    }
    return cursor.toLocaleDateString("nl-NL", { month: "long", year: "numeric" });
  }, [view, cursor]);

  const shift = (dir: -1 | 1) => {
    if (view === "day") setCursor(addDays(cursor, dir));
    else if (view === "week") setCursor(addDays(cursor, dir * 7));
    else setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + dir, 1));
  };

  const slotsByDay = useMemo(() => {
    const m = new Map<string, Slot[]>();
    for (const s of slots) {
      const arr = m.get(s.date) ?? [];
      arr.push(s);
      m.set(s.date, arr);
    }
    return m;
  }, [slots]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Calendar</div>
          <h1 className="display-font text-2xl md:text-3xl uppercase mt-2">{headerLabel}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex border border-border">
            {VIEWS.map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-2 text-[11px] uppercase tracking-widest ${view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => shift(-1)} className="border border-border px-3 py-2 text-xs hover:border-foreground/40">←</button>
          <button onClick={() => setCursor(new Date())} className="border border-border px-3 py-2 text-[11px] uppercase tracking-widest hover:border-foreground/40">Today</button>
          <button onClick={() => shift(1)} className="border border-border px-3 py-2 text-xs hover:border-foreground/40">→</button>
          <button
            onClick={() => openCreate(isoDay(view === "month" ? new Date() : cursor))}
            className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90"
          >
            + Slot
          </button>
        </div>
      </header>

      {loading ? (
        timedOut ? <LoadingTimeoutFallback onRetry={retryLoad} /> : <LoadingBlock />
      ) : view === "month" ? (
        <MonthGrid cursor={cursor} slotsByDay={slotsByDay} countFor={countFor} onDay={(d) => openCreate(d)} onSlot={openEdit} />
      ) : view === "week" ? (
        <WeekGrid from={startOfWeek(cursor)} slotsByDay={slotsByDay} countFor={countFor} onDay={openCreate} onSlot={openEdit} />
      ) : (
        <DayList date={isoDay(cursor)} slots={slotsByDay.get(isoDay(cursor)) ?? []} countFor={countFor} onAdd={() => openCreate(isoDay(cursor))} onSlot={openEdit} />
      )}

      {/* Detail / edit drawer */}
      {editing && (
        <SlotDrawer
          slot={editing}
          bookings={bookings.filter((b) => b.slot_id === editing.id)}
          onClose={() => setEditing(null)}
          onDelete={() => remove(editing)}
          onSave={save}
          onVisibility={(v) => setVisibility(editing, v)}
          onCancelBooking={cancelBooking}
          
          form={form}
          setForm={setForm}
        />
      )}

      {creating && (
        <SlotDrawer
          onClose={() => setCreating(null)}
          onSave={save}
          form={form}
          setForm={setForm}
          isNew
        />
      )}
    </div>
  );
};

const MonthGrid = ({
  cursor,
  slotsByDay,
  countFor,
  onDay,
  onSlot,
}: {
  cursor: Date;
  slotsByDay: Map<string, Slot[]>;
  countFor: (id: string) => number;
  onDay: (d: string) => void;
  onSlot: (s: Slot) => void;
}) => {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const start = startOfWeek(first);
  const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
  return (
    <div className="grid grid-cols-7 gap-px bg-border border border-border">
      {["Ma", "Di", "Wo", "Do", "Vr", "Za", "Zo"].map((d) => (
        <div key={d} className="bg-background text-[10px] uppercase tracking-widest text-muted-foreground p-2 text-center">{d}</div>
      ))}
      {days.map((d) => {
        const iso = isoDay(d);
        const inMonth = d.getMonth() === cursor.getMonth();
        const daySlots = slotsByDay.get(iso) ?? [];
        return (
          <div
            key={iso}
            className={`bg-background min-h-[100px] p-1.5 ${inMonth ? "" : "opacity-40"} cursor-pointer hover:bg-muted/30`}
            onClick={() => onDay(iso)}
          >
            <div className="text-[11px] font-mono mb-1">{d.getDate()}</div>
            <div className="space-y-1">
              {daySlots.slice(0, 3).map((s) => (
                <div
                  key={s.id}
                  onClick={(e) => { e.stopPropagation(); onSlot(s); }}
                  className={`text-[10px] px-1.5 py-0.5 border truncate ${visibilityColors[s.visibility]}`}
                >
                  {fmtTime(s.start_time)} {trainingTypeLabel(s.training_type)} {countFor(s.id)}/{s.max_players}
                </div>
              ))}
              {daySlots.length > 3 && <div className="text-[10px] text-muted-foreground">+{daySlots.length - 3} meer</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const WeekGrid = ({
  from,
  slotsByDay,
  countFor,
  onDay,
  onSlot,
}: {
  from: Date;
  slotsByDay: Map<string, Slot[]>;
  countFor: (id: string) => number;
  onDay: (d: string) => void;
  onSlot: (s: Slot) => void;
}) => {
  const days = Array.from({ length: 7 }, (_, i) => addDays(from, i));
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
      {days.map((d) => {
        const iso = isoDay(d);
        const daySlots = (slotsByDay.get(iso) ?? []).sort((a, b) => a.start_time.localeCompare(b.start_time));
        return (
          <div key={iso} className="border border-border bg-card flex flex-col">
            <button onClick={() => onDay(iso)} className="text-left p-3 border-b border-border hover:bg-muted/30">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {d.toLocaleDateString("nl-NL", { weekday: "short" })}
              </div>
              <div className="display-font text-xl uppercase">{d.getDate()}</div>
            </button>
            <div className="p-2 space-y-1.5 min-h-[120px]">
              {daySlots.map((s) => (
                <button
                  key={s.id}
                  onClick={() => onSlot(s)}
                  className={`w-full text-left border px-2 py-1.5 ${visibilityColors[s.visibility]} ${statusBadge[s.status]}`}
                >
                  <div className="flex justify-between text-[11px] font-mono">
                    <span>{fmtTime(s.start_time)}–{fmtTime(s.end_time)}</span>
                    <span>{countFor(s.id)}/{s.max_players}</span>
                  </div>
                  <div className="text-[10px] uppercase tracking-wider opacity-80">{trainingTypeLabel(s.training_type)}</div>
                </button>
              ))}
              <button onClick={() => onDay(iso)} className="w-full text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground py-1">+ slot</button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const DayList = ({
  date,
  slots,
  countFor,
  onAdd,
  onSlot,
}: {
  date: string;
  slots: Slot[];
  countFor: (id: string) => number;
  onAdd: () => void;
  onSlot: (s: Slot) => void;
}) => (
  <div className="space-y-2">
    {slots.length === 0 && <div className="text-sm text-muted-foreground border border-border p-6">Geen slots op {date}.</div>}
    {slots.sort((a, b) => a.start_time.localeCompare(b.start_time)).map((s) => (
      <button
        key={s.id}
        onClick={() => onSlot(s)}
        className={`w-full flex items-center justify-between border ${visibilityColors[s.visibility]} ${statusBadge[s.status]} p-4 text-left hover:opacity-80`}
      >
        <div>
          <div className="font-mono text-base">{fmtTime(s.start_time)} – {fmtTime(s.end_time)}</div>
          <div className="text-xs uppercase tracking-widest opacity-80">{trainingTypeLabel(s.training_type)} · {s.visibility} · {s.status}</div>
        </div>
        <div className="text-sm font-mono">{countFor(s.id)}/{s.max_players}</div>
      </button>
    ))}
    <button onClick={onAdd} className="w-full border border-dashed border-border p-4 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground hover:border-foreground/40">
      + slot toevoegen
    </button>
  </div>
);

const SlotDrawer = ({
  slot,
  bookings = [],
  onClose,
  onDelete,
  onSave,
  onVisibility,
  onCancelBooking,
  
  form,
  setForm,
  isNew = false,
}: {
  slot?: Slot;
  bookings?: Booking[];
  onClose: () => void;
  onDelete?: () => void;
  onSave: () => void;
  onVisibility?: (v: SlotVisibility) => void;
  onCancelBooking?: (b: Booking) => void;
  
  form: typeof emptyForm;
  setForm: (f: typeof emptyForm) => void;
  isNew?: boolean;
}) => (
  <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur grid place-items-center p-4 overflow-auto">
    <div className="bg-card border border-border w-full max-w-2xl p-6 space-y-5 max-h-[90vh] overflow-auto">
      <div className="flex items-center justify-between">
        <div className="display-font text-2xl uppercase">{isNew ? "Nieuw slot" : "Slot bewerken"}</div>
        <button onClick={onClose} className="text-xs uppercase">✕</button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <L label="Datum"><input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className={inputCls} /></L>
        <L label="Type">
          <select value={form.training_type} onChange={(e) => {
            const t = e.target.value as TrainingType;
            const def = TRAINING_TYPES.find((x) => x.value === t)!;
            setForm({ ...form, training_type: t, max_players: def.defaultMax });
          }} className={inputCls}>
            {TRAINING_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </L>
        <L label="Start"><input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} className={inputCls} /></L>
        <L label="Einde"><input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} className={inputCls} /></L>
        <L label="Zichtbaarheid">
          <select value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value as SlotVisibility })} className={inputCls}>
            <option value="private">Private (active players)</option>
            <option value="public">Public (iedereen)</option>
            <option value="hidden">Hidden (alleen admin)</option>
          </select>
        </L>
        <L label="Max spelers"><input type="number" min={1} max={50} value={form.max_players} onChange={(e) => setForm({ ...form, max_players: Number(e.target.value) })} className={inputCls} /></L>
        <L label="Prijs per speler (€)"><input type="number" step="0.01" value={form.price_per_player} onChange={(e) => setForm({ ...form, price_per_player: e.target.value })} className={inputCls} /></L>
        <L label="Locatie"><input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputCls} /></L>
        <L label="Notitie (admin)" full><textarea rows={2} value={form.admin_note} onChange={(e) => setForm({ ...form, admin_note: e.target.value })} className={inputCls} /></L>
        <L label="Notitie (zichtbaar voor speler)" full><textarea rows={2} value={form.player_note} onChange={(e) => setForm({ ...form, player_note: e.target.value })} className={inputCls} /></L>
      </div>


      {!isNew && slot && (
        <>
          <div className="flex gap-2 flex-wrap">
            {(["private", "public", "hidden"] as SlotVisibility[]).map((v) => (
              <button key={v} onClick={() => onVisibility?.(v)} className={`text-[10px] uppercase tracking-widest border px-3 py-1.5 ${slot.visibility === v ? "border-primary text-primary bg-primary/10" : "border-border text-muted-foreground"}`}>
                {v}
              </button>
            ))}
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Boekingen ({bookings.length})</div>
            <div className="space-y-1.5">
              {bookings.length === 0 && <div className="text-xs text-muted-foreground">Geen boekingen.</div>}
              {bookings.map((b) => (
                <div key={b.id} className="border border-border p-2 text-xs space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="truncate">
                      <div className="font-medium">{b.guest_name ?? (b.profile_id ? b.profile_id.slice(0, 8) : "—")}</div>
                      <div className="text-muted-foreground">{b.guest_email ?? ""} · {b.status}</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {b.status === "confirmed" && (
                        <button onClick={() => onCancelBooking?.(b)} className="text-[9px] uppercase border border-destructive/40 text-destructive px-2 py-1 hover:bg-destructive/10">Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex gap-2 justify-end pt-2 border-t border-border">
        {!isNew && onDelete && (
          <button onClick={onDelete} className="text-xs uppercase tracking-widest border border-destructive/40 text-destructive px-4 py-2 hover:bg-destructive/10 mr-auto">Verwijder</button>
        )}
        <button onClick={onClose} className="text-xs uppercase tracking-widest border border-border px-4 py-2 hover:border-foreground/40">Sluit</button>
        <button onClick={onSave} className="text-xs uppercase tracking-widest bg-primary text-primary-foreground px-4 py-2 hover:bg-primary/90 font-semibold">Opslaan</button>
      </div>
    </div>
  </div>
);

const inputCls = "mt-1.5 w-full bg-background border border-border px-3 py-2 text-sm focus:border-primary focus:outline-none [color-scheme:dark]";
const L = ({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) => (
  <div className={full ? "sm:col-span-2" : ""}>
    <label className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</label>
    {children}
  </div>
);

export default Calendar;
