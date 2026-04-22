import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const nextSunday = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

type Row = {
  id: string; name: string; phone: string; slot_time: string;
  status?: "confirmed" | "cancelled" | null;
  available_from?: string | null; available_to?: string | null;
};

const ThisSundayTab = () => {
  const sunday = useMemo(nextSunday, []);
  const sessionDate = sunday.toISOString().split("T")[0];
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    (async () => {
      const { data: players } = await supabase.from("fixed_players")
        .select("id, name, phone, slot_time, slot_day").eq("active", true).eq("slot_day", "sunday").order("slot_time");
      const { data: att } = await supabase.from("weekly_attendance")
        .select("fixed_player_id, status, available_from, available_to").eq("session_date", sessionDate);
      const map = new Map((att || []).map((a: any) => [a.fixed_player_id, a]));
      setRows((players || []).map((p: any) => ({
        ...p,
        status: map.get(p.id)?.status ?? null,
        available_from: map.get(p.id)?.available_from ?? null,
        available_to: map.get(p.id)?.available_to ?? null,
      })));
    })();
  }, [sessionDate]);

  const wa = (phone: string, msg: string) =>
    `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`;

  const fmt = sunday.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="bg-card border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground">Next session</div>
          <div className="display-font text-2xl uppercase">{fmt}</div>
        </div>
        <div className="text-sm text-muted-foreground">
          ✅ {rows.filter(r => r.status === "confirmed").length} ·
          ❌ {rows.filter(r => r.status === "cancelled").length} ·
          ⏳ {rows.filter(r => !r.status).length}
        </div>
      </div>

      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between border border-border p-3">
            <div className="flex items-center gap-4">
              <div className="font-mono text-sm w-14">{r.slot_time}</div>
              <div>
                <div className="font-semibold">{r.name}</div>
                {r.status === "cancelled" && (r.available_from || r.available_to) && (
                  <div className="text-xs text-muted-foreground">Available {r.available_from || "?"} – {r.available_to || "?"}</div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-widest">
                {r.status === "confirmed" ? "✅ Confirmed" : r.status === "cancelled" ? "❌ Can't" : "⏳ No response"}
              </span>
              {!r.status && (
                <a target="_blank" rel="noopener noreferrer"
                  href={wa(r.phone, `Hey ${r.name}, kun je laten weten of je zondag ${fmt} om ${r.slot_time} kan?`)}
                  className="text-xs uppercase border border-border px-3 py-1 hover:border-foreground/40">
                  Remind
                </a>
              )}
              <a target="_blank" rel="noopener noreferrer" href={wa(r.phone, "")}
                className="text-xs uppercase border border-border px-3 py-1 hover:border-foreground/40">
                WhatsApp
              </a>
            </div>
          </div>
        ))}
        {rows.length === 0 && <div className="text-sm text-muted-foreground">No fixed Sunday players yet.</div>}
      </div>
    </div>
  );
};

export default ThisSundayTab;
