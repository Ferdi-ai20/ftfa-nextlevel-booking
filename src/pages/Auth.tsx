import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") || "/dashboard";
  const { session, isAdmin, loading } = useAuth();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && session) {
      navigate(isAdmin ? "/admin" : redirect, { replace: true });
    }
  }, [session, isAdmin, loading, navigate, redirect]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: fullName, phone },
          },
        });
        if (error) throw error;
        toast.success("Account created. Check your inbox to verify.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message || "Something went wrong.");
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

  const reset = async () => {
    if (!email) {
      toast.error("Enter your email first.");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    toast.success("Reset link sent. Check your inbox.");
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
            Train<br />with <span className="text-primary">purpose.</span>
          </h1>
          <p className="mt-6 text-muted-foreground max-w-md">
            Manage your fixed Sunday slot, confirm attendance and book sessions when windows open.
          </p>
        </div>
        <div className="relative text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Players · Parents · Coaches
        </div>
      </div>

      <div className="flex items-center justify-center p-6 md:p-10">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md bg-card border border-border p-8 space-y-5"
        >
          <div>
            <div className="text-[11px] uppercase tracking-[0.3em] text-primary">
              {mode === "signup" ? "/ Create account" : "/ Sign in"}
            </div>
            <h2 className="display-font text-4xl uppercase mt-2">
              {mode === "signup" ? "Join FTFA" : "Welcome back"}
            </h2>
          </div>

          {mode === "signup" && (
            <>
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Full name</label>
                <input
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Phone (optional)</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-2 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Password</label>
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
            disabled={busy}
            className="w-full bg-primary text-primary-foreground py-3 text-sm uppercase tracking-widest font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {busy ? "..." : mode === "signup" ? "Create account" : "Sign in"}
          </button>

          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <button
            type="button"
            onClick={google}
            className="w-full border border-border hover:border-foreground/40 py-3 text-sm uppercase tracking-widest font-semibold transition-colors"
          >
            Continue with Google
          </button>

          <div className="flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="uppercase tracking-widest text-muted-foreground hover:text-foreground"
            >
              {mode === "signup" ? "Have an account? Sign in" : "New here? Create account"}
            </button>
            {mode === "signin" && (
              <button
                type="button"
                onClick={reset}
                className="uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                Forgot?
              </button>
            )}
          </div>
        </motion.form>
      </div>
    </main>
  );
};

export default Auth;
