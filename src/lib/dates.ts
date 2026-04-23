export const nextSunday = (from = new Date()): Date => {
  const d = new Date(from);
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const addWeeks = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n * 7);
  return r;
};

export const fmtSunday = (d: Date) =>
  d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

export const isoDate = (d: Date) => d.toISOString().split("T")[0];

/**
 * Deadline = Wednesday 20:00 of the week before the upcoming Sunday.
 * Sunday is at end of week. Wednesday before = Sunday - 4 days @ 20:00.
 */
export const deadlineFor = (sunday: Date) => {
  const d = new Date(sunday);
  d.setDate(d.getDate() - 4);
  d.setHours(20, 0, 0, 0);
  return d;
};

export const isPastDeadline = (sunday: Date, now = new Date()) =>
  now > deadlineFor(sunday);

export const ageFromBirthdate = (birthdate: string | null | undefined): number | null => {
  if (!birthdate) return null;
  const b = new Date(birthdate);
  if (isNaN(b.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  const m = now.getMonth() - b.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < b.getDate())) age--;
  return age;
};
