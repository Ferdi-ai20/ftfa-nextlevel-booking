import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const navigate = useNavigate();
  const { session, isAdmin, profileStatus, loading, accessResolved, accessError } = useAuth();
  const routedSessionRef = useRef<string | null>(null);
  const sessionUserId = session?.user.id ?? null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [routeError, setRouteError] = useState("");

  useEffect(() => {
    if (loading || !session || busy) return;
    if (accessError) {
      setRouteError(accessError);
      return;
    }
    if (!accessResolved) return;
    if (!sessionUserId || routedSessionRef.current === sessionUserId) return;
    routedSessionRef.current = sessionUserId;
    navigate(isAdmin ? "/admin" : profileStatus === "active" ? "/dashboard" : "/wachten", { replace: true });
  }, [session, sessionUserId, isAdmin, profileStatus, loading, accessResolved, accessError, busy, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setRouteError("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) throw error;
      if (!data.user) throw new Error("Geen gebruiker gevonden na inloggen.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Inloggen mislukt.";
      setRouteError(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) toast.error(error.message);
  };

  const reset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Vul eerst je e-mailadres in.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Reset-link verstuurd. Check je inbox.");
    setForgot(false);
  };

  return (
    <main className="min-h-screen bg-background text-foreground grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-10 border-r border-border bg-secondary/30 relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="relative">
          <Link to="/" className="display-font text-3xl">FTFA</Link>
          <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Ferdi Tarhan Football Academy
          </p>
        </div>
        <div className="relative">
          <h1 className="display-font text-6xl uppercase leading-[0.9]">
            Train<br />met <span className="text-primary">doel.</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-md">
            Log in om je trainingen te beheren en private slots te boeken.
          </p>
        </div>
        <div className="relative text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Alleen op uitnodiging
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <motion.form
          onSubmit={forgot ? reset : submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-card border border-border p-8 space-y-5"
        >
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-primary">
              {forgot ? "/ Wachtwoord vergeten" : "/ Inloggen"}
            </div>
            <h2 className="display-font text-4xl uppercase mt-2">
              {forgot ? "Reset wachtwoord" : "Welkom terug"}
            </h2>
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none"
            />
          </div>

          {!forgot && (
            <div>
              <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Wachtwoord</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-primary text-primary-foreground py-3 text-sm uppercase tracking-widest font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {busy ? "..." : forgot ? "Stuur reset-link" : "Inloggen"}
          </button>

          {routeError && !forgot && (
            <div className="border border-border bg-secondary p-4 space-y-3 text-sm text-foreground" role="alert">
              <p>{routeError}</p>
              <button
                type="button"
                onClick={(event) => submit(event as unknown as React.FormEvent)}
                disabled={busy || !email || !password}
                className="bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest font-semibold disabled:opacity-50"
              >
                Probeer opnieuw
              </button>
            </div>
          )}

          {!forgot && (
            <>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">of</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <button
                type="button"
                onClick={google}
                className="w-full border border-border hover:border-foreground/40 py-3 text-sm uppercase tracking-widest font-semibold transition-colors"
              >
                Verder met Google
              </button>
            </>
          )}

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setForgot(!forgot)}
              className="uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              {forgot ? "Terug naar inloggen" : "Wachtwoord vergeten?"}
            </button>
            <Link to="/" className="uppercase tracking-widest text-muted-foreground hover:text-foreground">
              Naar site
            </Link>
          </div>

          <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center pt-2 border-t border-border">
            Account aanmaken? Alleen op uitnodiging van Ferdi.
          </p>
        </motion.form>
      </div>
    </main>
  );
};

export default Auth;
