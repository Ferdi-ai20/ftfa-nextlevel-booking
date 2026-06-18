import { useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { LoadingBlock, LoadingTimeoutFallback, useLoadingTimeout } from "@/components/LoadingState";

const PendingApproval = () => {
  const { session, isAdmin, profileStatus, profileName, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const redirectKeyRef = useRef<string | null>(null);
  const sessionUserId = session?.user.id ?? null;
  const { timedOut, resetTimedOut } = useLoadingTimeout(loading || (!!session && !isAdmin && !profileStatus));

  useEffect(() => {
    if (loading) return;
    const redirect = (to: string) => {
      const key = `${sessionUserId ?? "anon"}:${to}`;
      if (redirectKeyRef.current === key) return;
      redirectKeyRef.current = key;
      navigate(to, { replace: true });
    };
    if (!session) { redirect("/auth"); return; }
    if (isAdmin) { redirect("/admin"); return; }
    if (profileStatus === "active") { redirect("/dashboard"); }
  }, [session, sessionUserId, isAdmin, profileStatus, loading, navigate]);

  const retry = () => {
    resetTimedOut();
    window.location.reload();
  };

  if (loading || (!!session && !isAdmin && !profileStatus)) {
    if (timedOut) return <LoadingTimeoutFallback onRetry={retry} fullScreen />;
    return <LoadingBlock fullScreen />;
  }

  if (!session || isAdmin || profileStatus === "active") return null;

  const rejected = profileStatus === "rejected" || profileStatus === "archived";

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
                Hi{profileName ? ` ${profileName}` : ""}, je account is aangemaakt maar nog niet goedgekeurd door Ferdi.
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
