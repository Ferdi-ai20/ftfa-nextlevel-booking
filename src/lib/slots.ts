export const TRAINING_TYPES = [
  { value: "one_on_one", label: "1-op-1", defaultMax: 1 },
  { value: "duo", label: "Duo", defaultMax: 2 },
  { value: "small_group", label: "Small Group", defaultMax: 8 },
] as const;

export type TrainingType = "one_on_one" | "duo" | "small_group";

export type SlotVisibility = "private" | "public" | "hidden";
export type SlotStatus = "open" | "full" | "cancelled";
export type BookingStatus = "confirmed" | "cancelled";

export const BOOKING_LEAD_HOURS = 24;
export const CANCEL_LEAD_HOURS = 48;

export const trainingTypeLabel = (t: string) =>
  TRAINING_TYPES.find((x) => x.value === t)?.label ?? t;

export const fmtDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

export const fmtTime = (t: string) => t.slice(0, 5);

export const isFuture = (date: string, start: string) =>
  new Date(`${date}T${start}`) > new Date();

export const hoursUntil = (date: string, start: string) =>
  (new Date(`${date}T${start}`).getTime() - Date.now()) / 36e5;

export const ACTIVE_BOOKING_STATUSES: BookingStatus[] = ["confirmed"];
