import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"checking" | "valid" | "already" | "invalid" | "done" | "error">("checking");
  const [busy, setBusy] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    (async () => {
      try {
        const res = await fetch(
          `${supabaseUrl}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`,
          { headers: { apikey: supabaseAnonKey } }
        );
        const json = await res.json();
        if (!res.ok) { setState("invalid"); return; }
        if (json.valid === false && json.reason === "already_unsubscribed") setState("already");
        else if (json.valid) setState("valid");
        else setState("invalid");
      } catch {
        setState("error");
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setBusy(true);
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/handle-email-unsubscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: supabaseAnonKey },
        body: JSON.stringify({ token }),
      });
      const json = await res.json();
      if (json.success) setState("done");
      else if (json.reason === "already_unsubscribed") setState("already");
      else setState("error");
    } catch {
      setState("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center p-6">
      <div className="bg-card border border-border max-w-md w-full p-8">
        <Link to="/" className="display-font text-2xl">FTFA</Link>
        <h1 className="display-font text-3xl uppercase mt-6">Unsubscribe</h1>

        {state === "checking" && (
          <p className="mt-4 text-sm text-muted-foreground">Checking your link…</p>
        )}
        {state === "valid" && (
          <>
            <p className="mt-4 text-sm text-muted-foreground">
              Click below to stop receiving emails from FTFA Academy at this address.
            </p>
            <button
              onClick={confirm}
              disabled={busy}
              className="mt-6 w-full bg-primary text-primary-foreground py-3 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 disabled:opacity-50"
            >
              {busy ? "Working…" : "Confirm unsubscribe"}
            </button>
          </>
        )}
        {state === "already" && (
          <p className="mt-4 text-sm text-muted-foreground">You're already unsubscribed. Nothing to do.</p>
        )}
        {state === "done" && (
          <p className="mt-4 text-sm text-primary">You've been unsubscribed. You won't receive further emails.</p>
        )}
        {state === "invalid" && (
          <p className="mt-4 text-sm text-destructive">This link is invalid or expired.</p>
        )}
        {state === "error" && (
          <p className="mt-4 text-sm text-destructive">Something went wrong. Please try again later.</p>
        )}

        <Link to="/" className="block mt-8 text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
          ← Back to FTFA
        </Link>
      </div>
    </main>
  );
};

export default Unsubscribe;
