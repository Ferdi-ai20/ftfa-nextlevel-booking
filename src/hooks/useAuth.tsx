import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { timedWithTimeout } from "@/lib/timing";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const lastCheckedUserId = useRef<string | null>(null);
  const inFlightAdminCheck = useRef<{ uid: string; promise: Promise<void> } | null>(null);

  const checkAdmin = async (uid: string) => {
    if (inFlightAdminCheck.current?.uid === uid) return inFlightAdminCheck.current.promise;
    const promise = (async () => {
    try {
      const { data } = await timedWithTimeout("useAuth.checkAdmin", supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", uid)
        .eq("role", "admin")
        .maybeSingle(), 3000);
      // Only apply if this is still the current user
      if (lastCheckedUserId.current === uid) {
        setIsAdmin(!!data);
      }
    } catch (e) {
      console.error("checkAdmin failed", e);
      if (lastCheckedUserId.current === uid) setIsAdmin(false);
    } finally {
      if (lastCheckedUserId.current === uid) setLoading(false);
      if (inFlightAdminCheck.current?.uid === uid) inFlightAdminCheck.current = null;
    }
    })();
    inFlightAdminCheck.current = { uid, promise };
    return promise;
  };

  useEffect(() => {
    const handle = (event: string, s: Session | null) => {
      console.info("useAuth.onAuthStateChange", event, s?.user?.id ?? "no-user");
      setSession(s);
      if (s?.user) {
        // New / refreshed session: gate consumers until role resolves
        if (lastCheckedUserId.current !== s.user.id) {
          lastCheckedUserId.current = s.user.id;
          setLoading(true);
          setIsAdmin(false);
          // Defer to avoid deadlocks inside onAuthStateChange
          setTimeout(() => checkAdmin(s.user.id), 0);
        } else {
          // Same user, just a token refresh — make sure loading is false
          setLoading(false);
        }
      } else {
        lastCheckedUserId.current = null;
        setIsAdmin(false);
        setLoading(false);
      }
    };

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => handle(event, s));

    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("signOut error", e);
    }
    // Belt-and-braces: clear any stale supabase keys
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith("sb-") || k.includes("supabase"))
        .forEach((k) => localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    inFlightAdminCheck.current = null;
    lastCheckedUserId.current = null;
    setSession(null);
    setIsAdmin(false);
    setLoading(false);
  };

  return (
    <Ctx.Provider value={{ session, user: session?.user ?? null, isAdmin, loading, signOut }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
