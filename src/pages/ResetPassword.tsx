import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // When user lands here from email recovery link, Supabase auto-creates a session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated.");
    navigate("/dashboard");
  };

  return (
    <main className="min-h-screen bg-background text-foreground grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-card border border-border p-8 space-y-5">
        <div className="text-[11px] uppercase tracking-[0.3em] text-primary">/ Reset password</div>
        <h2 className="display-font text-4xl uppercase">Set a new password</h2>
        {!ready && <p className="text-sm text-muted-foreground">Validating link…</p>}
        <div>
          <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">New password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={busy || !ready}
          className="w-full bg-primary text-primary-foreground py-3 text-sm uppercase tracking-widest font-semibold hover:bg-primary/90 disabled:opacity-50"
        >
          {busy ? "..." : "Update password"}
        </button>
      </form>
    </main>
  );
};

export default ResetPassword;
