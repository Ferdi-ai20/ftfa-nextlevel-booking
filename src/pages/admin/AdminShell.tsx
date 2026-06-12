import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const links = [
  { to: "/admin", end: true, label: "Calendar" },
  { to: "/admin/applications", label: "Applications" },
  { to: "/admin/players", label: "Players" },
  { to: "/admin/feedback", label: "Feedback" },
  { to: "/admin/settings", label: "Settings" },
];

const AdminShell = () => {
  const { session, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [pendingApps, setPendingApps] = useState(0);

  useEffect(() => {
    if (!loading && !session) navigate("/auth?redirect=/admin", { replace: true });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const loadCount = async () => {
      const { count } = await supabase
        .from("applications")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");
      setPendingApps(count ?? 0);
    };
    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  if (loading) return <div className="min-h-screen grid place-items-center bg-background">Loading…</div>;
  if (!session) return null;

  if (!isAdmin) {
    return (
      <main className="min-h-screen grid place-items-center bg-background text-foreground p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="display-font text-3xl uppercase">Not authorized</div>
          <p className="text-muted-foreground text-sm">
            {session.user.email} is not an admin.
          </p>
          <button
            onClick={signOut}
            className="text-xs uppercase tracking-widest border border-border px-4 py-2 hover:border-foreground/40"
          >
            Sign out
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex">
      <aside className="hidden md:flex w-60 shrink-0 border-r border-border flex-col">
        <div className="p-6 border-b border-border">
          <div className="display-font text-2xl uppercase">FTFA</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">Admin</div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center justify-between px-4 py-3 text-xs uppercase tracking-widest border-l-2 transition-colors ${
                  isActive
                    ? "border-primary text-foreground bg-primary/10"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`
              }
            >
              <span>{l.label}</span>
              {l.to === "/admin/applications" && pendingApps > 0 && (
                <span className="ml-2 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {pendingApps}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <button
            onClick={signOut}
            className="w-full text-xs uppercase tracking-widest border border-border px-3 py-2 hover:border-foreground/40"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="md:hidden border-b border-border px-4 py-3 flex items-center justify-between gap-3 sticky top-0 bg-background z-30">
          <div className="display-font text-lg uppercase tracking-wide truncate">FTFA Admin</div>
          <button
            onClick={signOut}
            className="text-[10px] uppercase tracking-widest border border-border px-2.5 py-1.5 hover:border-foreground/40 whitespace-nowrap"
          >
            Sign out
          </button>
        </header>

        <nav className="md:hidden border-b border-border bg-background sticky top-[57px] z-20 overflow-x-auto scrollbar-none">
          <div className="flex min-w-max">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `relative flex items-center gap-1.5 px-4 py-3 text-[11px] uppercase tracking-widest whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`
                }
              >
                <span>{l.label}</span>
                {l.to === "/admin/applications" && pendingApps > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                    {pendingApps}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {pendingApps > 0 && (
          <Link
            to="/admin/applications"
            className="block bg-primary/10 border-b border-primary/30 px-4 md:px-10 py-2.5 text-xs md:text-sm hover:bg-primary/15 transition-colors"
          >
            <span className="font-semibold">{pendingApps}</span>{" "}
            new application{pendingApps === 1 ? "" : "s"} waiting{" "}
            <span className="text-primary font-semibold ml-1">→ Review</span>
          </Link>
        )}

        <div className="p-4 md:p-10">
          <Outlet />
        </div>
      </div>
    </main>
  );
};

export default AdminShell;
