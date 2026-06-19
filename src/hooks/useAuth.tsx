import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { timedWithTimeout } from "@/lib/timing";

type AuthCtx = {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  profileStatus: string | null;
  profileName: string;
  loading: boolean;
  accessResolved: boolean;
  accessError: string | null;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  session: null,
  user: null,
  isAdmin: false,
  profileStatus: null,
  profileName: "",
  loading: true,
  accessResolved: false,
  accessError: null,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [accessResolved, setAccessResolved] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const accessResolvedRef = useRef(false);
  const inFlightAccessCheck = useRef<{ uid: string; promise: Promise<void> } | null>(null);

  const resolveAccess = async (uid: string) => {
    if (inFlightAccessCheck.current?.uid === uid) return inFlightAccessCheck.current.promise;
    const promise = (async () => {
      try {
        const [roleRes, profileRes] = await Promise.all([
          timedWithTimeout("useAuth.role", supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", uid)
            .eq("role", "admin")
            .maybeSingle(), 3000),
          timedWithTimeout("useAuth.profile", supabase
            .from("profiles")
            .select("full_name, status")
            .eq("id", uid)
            .maybeSingle(), 3000),
        ]);

        if (roleRes.error) throw roleRes.error;
        if (profileRes.error) throw profileRes.error;
        if (!profileRes.data?.status) throw new Error("Profielstatus kon niet worden bepaald.");

        if (currentUserIdRef.current === uid) {
          setIsAdmin(roleRes.data?.role === "admin");
          setProfileStatus(profileRes.data.status);
          setProfileName(profileRes.data?.full_name ?? "");
          accessResolvedRef.current = true;
          setAccessResolved(true);
          setAccessError(null);
        }
      } catch (e) {
        console.error("resolveAccess failed", e);
        if (currentUserIdRef.current === uid) {
          setIsAdmin(false);
          setProfileStatus(null);
          setProfileName("");
          accessResolvedRef.current = false;
          setAccessResolved(false);
          setAccessError("Je toegang kon niet worden gecontroleerd. Probeer opnieuw.");
        }
      } finally {
        if (currentUserIdRef.current === uid) {
          setLoading(false);
        }
        if (inFlightAccessCheck.current?.uid === uid) {
          inFlightAccessCheck.current = null;
        }
      }
    })();
    inFlightAccessCheck.current = { uid, promise };
    return promise;
  };

  useEffect(() => {
    const handle = (event: string, s: Session | null) => {
      console.info("useAuth.onAuthStateChange", event, s?.user?.id ?? "no-user");
      setSession(s);
      if (s?.user) {
        const uid = s.user.id;
        const isSameResolvedUser = currentUserIdRef.current === uid && accessResolvedRef.current;
        currentUserIdRef.current = uid;

        // Gate consumers until role and profile status are both resolved.
        if (!isSameResolvedUser) {
          accessResolvedRef.current = false;
          setAccessResolved(false);
          setAccessError(null);
          setLoading(true);
          setIsAdmin(false);
          setProfileStatus(null);
          setProfileName("");
          setTimeout(() => resolveAccess(uid), 0);
        } else {
          setLoading(false);
        }
      } else {
        currentUserIdRef.current = null;
        accessResolvedRef.current = false;
        setAccessResolved(false);
        setAccessError(null);
        setIsAdmin(false);
        setProfileStatus(null);
        setProfileName("");
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
    inFlightAccessCheck.current = null;
    currentUserIdRef.current = null;
    accessResolvedRef.current = false;
    setAccessResolved(false);
    setAccessError(null);
    setSession(null);
    setIsAdmin(false);
    setProfileStatus(null);
    setProfileName("");
    setLoading(false);
  };

  return (
    <Ctx.Provider value={{ session, user: session?.user ?? null, isAdmin, profileStatus, profileName, loading, accessResolved, accessError, signOut }}>
      {children}
    </Ctx.Provider>
  );
};

export const useAuth = () => useContext(Ctx);
