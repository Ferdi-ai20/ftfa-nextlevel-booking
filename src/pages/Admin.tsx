import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FixedPlayersTab from "@/components/admin/FixedPlayersTab";
import ThisSundayTab from "@/components/admin/ThisSundayTab";
import WaitlistTab from "@/components/admin/WaitlistTab";
import SettingsTab from "@/components/admin/SettingsTab";

const Admin = () => {
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s?.user) checkAdmin(s.user.id);
      else { setIsAdmin(false); setChecking(false); }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) checkAdmin(data.session.user.id);
      else setChecking(false);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const checkAdmin = async (uid: string) => {
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle();
    setIsAdmin(!!data);
    setChecking(false);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      if (error) return toast.error(error.message);
      toast.success("Account created. You can sign in.");
      setMode("signin");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return toast.error(error.message);
    }
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  if (checking) {
    return <div className="min-h-screen grid place-items-center bg-background text-foreground">Loading...</div>;
  }

  if (!session) {
    return (
      <main className="min-h-screen grid place-items-center bg-background text-foreground p-6">
        <form onSubmit={submit} className="w-full max-w-sm bg-card border border-border p-8 space-y-4">
          <div className="display-font text-3xl uppercase">Admin {mode === "signup" ? "Sign up" : "Sign in"}</div>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email"
            className="w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none" />
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password"
            className="w-full bg-background border border-border px-4 py-3 focus:border-primary focus:outline-none" />
          <button className="w-full bg-primary text-primary-foreground px-6 py-3 text-sm uppercase tracking-widest font-semibold hover:bg-primary/90">
            {mode === "signup" ? "Create account" : "Sign in"}
          </button>
          <button type="button" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="w-full text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">
            {mode === "signup" ? "Have an account? Sign in" : "First time? Create account"}
          </button>
        </form>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen grid place-items-center bg-background text-foreground p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="display-font text-3xl uppercase">Not authorized</div>
          <p className="text-muted-foreground text-sm">
            Your account ({session.user.email}) is not an admin. Ask the system owner to grant you the admin role, then refresh.
          </p>
          <p className="text-xs text-muted-foreground">
            Tip: in the Lovable Cloud dashboard, insert a row in <code>user_roles</code> with your user id and role = <code>admin</code>.
          </p>
          <button onClick={signOut} className="text-xs uppercase tracking-widest border border-border px-4 py-2 hover:border-foreground/40">Sign out</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="display-font text-2xl uppercase">FTFA Admin</div>
          <button onClick={signOut} className="text-xs uppercase tracking-widest border border-border px-4 py-2 hover:border-foreground/40">Sign out</button>
        </div>
      </header>
      <div className="container py-8">
        <Tabs defaultValue="sunday">
          <TabsList className="mb-6">
            <TabsTrigger value="sunday">This Sunday</TabsTrigger>
            <TabsTrigger value="waitlist">Waitlist</TabsTrigger>
            <TabsTrigger value="players">Fixed Players</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="sunday"><ThisSundayTab /></TabsContent>
          <TabsContent value="waitlist"><WaitlistTab /></TabsContent>
          <TabsContent value="players"><FixedPlayersTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
        </Tabs>
      </div>
    </main>
  );
};

export default Admin;
