import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

const links = [
  { to: "/admin", end: true, label: "Sunday Planning" },
  { to: "/admin/players", label: "Players" },
  { to: "/admin/approvals", label: "Approvals" },
  { to: "/admin/fixed", label: "Fixed Players" },
  { to: "/admin/waitlist", label: "Waitlist" },
  { to: "/admin/bookings", label: "Booking Windows" },
  { to: "/admin/settings", label: "Settings" },
];

const AdminShell = () => {
  const { session, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !session) navigate("/auth?redirect=/admin", { replace: true });
  }, [loading, session, navigate]);

  if (loading) return <div className="min-h-screen grid place-items-center bg-background">Loading…</div>;
  if (!session) return null;

  if (!isAdmin) {
    return (
      <main className="min-h-screen grid place-items-center bg-background text-foreground p-6">
        <div className="max-w-md text-center space-y-4">
          <div className="display-font text-3xl uppercase">Not authorized</div>
          <p className="text-muted-foreground text-sm">
            {session.user.email} is not an admin. Contact the system owner to grant access.
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
                `block px-4 py-2.5 text-xs uppercase tracking-widest border-l-2 transition-colors ${
                  isActive
                    ? "border-primary text-foreground bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                }`
              }
            >
              {l.label}
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
        {/* Mobile top nav */}
        <header className="md:hidden border-b border-border px-4 py-3 flex items-center justify-between">
          <div className="display-font text-xl uppercase">FTFA Admin</div>
          <button onClick={signOut} className="text-[10px] uppercase tracking-widest border border-border px-3 py-1.5">
            Sign out
          </button>
        </header>
        <div className="md:hidden border-b border-border overflow-x-auto">
          <nav className="flex gap-1 p-2 min-w-max">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3 py-2 text-[10px] uppercase tracking-widest whitespace-nowrap border ${
                    isActive
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-6 md:p-10">
          <Outlet />
        </div>
      </div>
    </main>
  );
};

export default AdminShell;
