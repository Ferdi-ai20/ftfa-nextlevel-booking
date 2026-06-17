import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LoadingBlock, LoadingTimeoutFallback, useLoadingTimeout } from "@/components/LoadingState";

const PendingApproval = () => {
  const { session, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<string>("pending");
  const [name, setName] = useState("");
  const [checking, setChecking] = useState(true);
  const [retryKey, setRetryKey] = useState(0);
  const { timedOut, resetTimedOut } = useLoadingTimeout(loading || checking);

  useEffect(() => {
    if (!loading && !session) {
      navigate("/auth", { replace: true });
      return;
    }
    if (!loading && session && isAdmin) {
      navigate("/admin", { replace: true });
      return;
    }
    if (session) {
      setChecking(true);
      void (async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name, status")
            .eq("id", session.user.id)
            .maybeSingle();
          if (error) throw error;
          if (data?.status === "active") {
            navigate("/dashboard", { replace: true });
            return;
          }
          setStatus(data?.status ?? "pending");
          setName(data?.full_name ?? "");
        } catch (error) {
          console.error("PendingApproval profile check failed", error);
        } finally {
          setChecking(false);
        }
      })();
    }
  }, [session, isAdmin, loading, navigate, retryKey]);

  const retry = () => {
    resetTimedOut();
    setChecking(true);
    setRetryKey((key) => key + 1);
  };

  if (loading || checking) {
    if (timedOut) return <LoadingTimeoutFallback onRetry={retry} fullScreen />;
    return <LoadingBlock fullScreen />;
  }

  const rejected = status === "rejected";

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 md:px-10 py-4 flex items-center justify-between">
        <Link to="/" className="display-font text-xl uppercase">FTFA</Link>
        <button onClick={signOut} className="text-[10px] uppercase tracking-widest border border-border px-3 py-1.5 hover:border-foreground/40">Uitloggen</button>
      </header>

      <div className="max-w-2xl mx-auto p-6 md:p-12">
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Status</div>
        <h1 className="display-font text-4xl md:text-5xl uppercase mt-2">
          {rejected ? "Aanmelding afgewezen" : "Wachten op goedkeuring"}
        </h1>

        <div className="mt-8 border border-border bg-card p-6 space-y-4">
          {!rejected ? (
            <>
              <p className="text-sm text-muted-foreground">
                Hi{name ? ` ${name}` : ""}, je account is aangemaakt maar nog niet goedgekeurd door Ferdi.
              </p>
              <p className="text-sm text-muted-foreground">
                Zodra Ferdi je profiel heeft goedgekeurd, krijg je toegang tot je dashboard en kun je trainingen boeken. Je ontvangt hierover bericht per e-mail.
              </p>
              <p className="text-sm text-muted-foreground">
                Vragen? Neem contact op met Ferdi via WhatsApp:{" "}
                <a href="https://wa.me/31621275348" target="_blank" rel="noreferrer" className="text-primary underline">
                  +31 6 21 27 53 48
                </a>.
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Helaas is je aanmelding op dit moment niet goedgekeurd. Ferdi neemt contact met je op als er in de toekomst ruimte is.
              </p>
              <p className="text-sm text-muted-foreground">
                Vragen? Neem contact op met Ferdi via WhatsApp:{" "}
                <a href="https://wa.me/31621275348" target="_blank" rel="noreferrer" className="text-primary underline">
                  +31 6 21 27 53 48
                </a>.
              </p>
            </>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={signOut} className="text-xs uppercase tracking-widest border border-border px-4 py-2 hover:border-foreground/40">
            Uitloggen
          </button>
          <Link to="/" className="text-xs uppercase tracking-widest border border-border px-4 py-2 hover:border-foreground/40">
            Naar website
          </Link>
        </div>
      </div>
    </main>
  );
};

export default PendingApproval;
