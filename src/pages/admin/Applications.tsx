import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { notify } from "@/lib/notify";

type Application = {
  id: string;
  parent_name: string;
  player_name: string;
  birth_year: number | null;
  email: string;
  phone: string | null;
  club: string | null;
  team: string | null;
  position: string | null;
  goal: string | null;
  notes: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const Applications = () => {
  const [apps, setApps] = useState<Application[]>([]);
  const [filter, setFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    const { data } = await supabase.from("applications").select("*").order("created_at", { ascending: false });
    setApps((data ?? []) as Application[]);
  };

  const approve = async (a: Application) => {
    // Mark application approved. If user with this email already has profile, also activate it.
    const { data: prof } = await supabase
      .from("profiles")
      .select("id")
      .eq("phone", a.phone ?? "___none___")
      .maybeSingle();
    await supabase.from("applications").update({ status: "approved" }).eq("id", a.id);
    if (prof) {
      await supabase.from("profiles").update({ status: "active" }).eq("id", prof.id);
      await supabase.from("players").insert({
        parent_profile_id: prof.id,
        player_name: a.player_name,
        birth_year: a.birth_year,
        club: a.club,
        team: a.team,
        position: a.position,
      });
    }
    toast.success(prof ? "Goedgekeurd + speler aangemaakt" : "Goedgekeurd. Ouder moet nog account aanmaken met dit telefoonnummer.");
    void notify("application-decision", a.email, {
      parentName: a.parent_name,
      playerName: a.player_name,
      approved: true,
    }, `app-approve-${a.id}`);
    void load();
  };

  const reject = async (a: Application) => {
    if (!confirm("Aanmelding afwijzen?")) return;
    await supabase.from("applications").update({ status: "rejected" }).eq("id", a.id);
    void notify("application-decision", a.email, {
      parentName: a.parent_name,
      playerName: a.player_name,
      approved: false,
    }, `app-reject-${a.id}`);
    void load();
  };

  const remove = async (a: Application) => {
    if (!confirm("Verwijderen?")) return;
    await supabase.from("applications").delete().eq("id", a.id);
    void load();
  };

  const filtered = apps.filter((a) => filter === "all" || a.status === filter);

  return (
    <div className="space-y-6">
      <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Applications</div>
          <h1 className="display-font text-2xl md:text-3xl uppercase mt-2">Aanmeldingen</h1>
        </div>
        <div className="flex border border-border">
          {(["pending", "approved", "rejected", "all"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 text-[11px] uppercase tracking-widest ${filter === f ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-3">
        {filtered.length === 0 && <div className="border border-border bg-card p-6 text-sm text-muted-foreground">Geen aanmeldingen.</div>}
        {filtered.map((a) => (
          <div key={a.id} className="border border-border bg-card p-5">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="min-w-0">
                <div className="display-font text-xl uppercase">{a.player_name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Ouder: {a.parent_name} · {a.email}{a.phone ? ` · ${a.phone}` : ""}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {a.birth_year ? `${a.birth_year} · ` : ""}{a.club ?? "—"}{a.team ? ` · ${a.team}` : ""}{a.position ? ` · ${a.position}` : ""}
                </div>
                {a.goal && <div className="text-sm mt-2 italic">"{a.goal}"</div>}
                {a.notes && <div className="text-xs text-muted-foreground mt-1">{a.notes}</div>}
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-2">
                  {new Date(a.created_at).toLocaleDateString("nl-NL")} · status: {a.status}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap shrink-0">
                {a.status === "pending" && (
                  <>
                    <button onClick={() => approve(a)} className="text-[10px] uppercase tracking-widest bg-primary text-primary-foreground px-3 py-1.5 hover:bg-primary/90 font-semibold">Approve</button>
                    <button onClick={() => reject(a)} className="text-[10px] uppercase tracking-widest border border-destructive/40 text-destructive px-3 py-1.5 hover:bg-destructive/10">Reject</button>
                  </>
                )}
                <button onClick={() => remove(a)} className="text-[10px] uppercase tracking-widest border border-border text-muted-foreground px-3 py-1.5 hover:border-foreground/40">Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Applications;
