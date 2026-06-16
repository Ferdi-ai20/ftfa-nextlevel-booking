import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

const Settings = () => {
  const { user } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("ical_tokens").select("token").eq("user_id", user.id).maybeSingle()
      .then(({ data }) => setToken(data?.token ?? null));
  }, [user]);

  const generate = async () => {
    if (!user) return;
    setBusy(true);
    const newToken = crypto.randomUUID().replace(/-/g, "");
    // Delete old + insert new
    await supabase.from("ical_tokens").delete().eq("user_id", user.id);
    const { error } = await supabase.from("ical_tokens").insert({ user_id: user.id, token: newToken });
    setBusy(false);
    if (error) return toast.error(error.message);
    setToken(newToken);
    toast.success("Nieuwe iCal-link gegenereerd");
  };

  const revoke = async () => {
    if (!user || !confirm("iCal-link intrekken?")) return;
    await supabase.from("ical_tokens").delete().eq("user_id", user.id);
    setToken(null);
    toast.success("Ingetrokken");
  };

  const url = token ? `${SUPABASE_URL}/functions/v1/ical-feed?token=${token}` : "";

  const copy = () => {
    navigator.clipboard.writeText(url);
    toast.success("Gekopieerd");
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <header>
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Settings</div>
        <h1 className="display-font text-2xl md:text-3xl uppercase mt-2">Instellingen</h1>
      </header>

      <div className="bg-card border border-border p-6 space-y-4">
        <div>
          <h2 className="display-font text-xl uppercase">iCal kalender feed</h2>
          <p className="text-xs text-muted-foreground mt-2">
            Abonneer je agenda (Google, Apple, Outlook) op deze link om al je bevestigde trainingen automatisch te zien.
            De link bevat een persoonlijk token — deel hem niet.
          </p>
        </div>

        {token ? (
          <>
            <div className="bg-background border border-border p-3 text-xs font-mono break-all">{url}</div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={copy} className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90">
                Kopieer link
              </button>
              <button onClick={generate} disabled={busy} className="border border-border px-4 py-2 text-xs uppercase tracking-widest hover:border-foreground/40">
                Nieuwe link
              </button>
              <button onClick={revoke} className="border border-destructive/40 text-destructive px-4 py-2 text-xs uppercase tracking-widest hover:bg-destructive/10">
                Intrekken
              </button>
            </div>
          </>
        ) : (
          <button onClick={generate} disabled={busy} className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90">
            {busy ? "Bezig…" : "Genereer iCal-link"}
          </button>
        )}

        <div className="border-t border-border pt-4 space-y-2 text-xs text-muted-foreground">
          <div className="font-semibold text-foreground uppercase tracking-widest text-[10px]">Toevoegen aan je agenda</div>
          <div>
            <strong className="text-foreground">Google Calendar:</strong> Open <em>calendar.google.com</em> →
            naast "Andere agenda's" klik op <em>+</em> → <em>Via URL</em> → plak bovenstaande link → <em>Agenda toevoegen</em>.
          </div>
          <div>
            <strong className="text-foreground">Apple Agenda (iPhone / Mac):</strong> Instellingen → <em>Agenda</em> →
            <em> Accounts</em> → <em>Nieuwe Account</em> → <em>Anders</em> → <em>Voeg Agenda-abonnement toe</em> → plak de link.
          </div>
          <div>
            <strong className="text-foreground">Outlook:</strong> <em>Agenda toevoegen</em> → <em>Vanuit web</em> → plak de link.
          </div>
          <div className="italic">Updates worden meestal binnen 1–24 uur automatisch gesynchroniseerd.</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
