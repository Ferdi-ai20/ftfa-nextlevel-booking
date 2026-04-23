import { NavLink, Outlet, useNavigate, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";

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
  const location = useLocation();
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) navigate("/auth?redirect=/admin", { replace: true });
  }, [loading, session, navigate]);

  useEffect(() => {
    if (!isAdmin) return;
    const loadCount = async () => {
      const { data: profiles } = await supabase.from("profiles").select("id");
      const { data: players } = await supabase.from("players").select("parent_user_id");
      if (!profiles) return;
      const linked = new Set((players ?? []).map((p) => p.parent_user_id).filter(Boolean));
      setPendingApprovals(profiles.filter((p) => !linked.has(p.id)).length);
    };
    loadCount();
    const interval = setInterval(loadCount, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  // Auto-close mobile sheet on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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

  const NavList = ({ onNav }: { onNav?: () => void }) => (
    <nav className="flex-1 p-3 space-y-1">
      {links.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          onClick={onNav}
          className={({ isActive }) =>
            `flex items-center justify-between px-4 py-3 text-sm md:text-xs uppercase tracking-widest border-l-2 transition-colors ${
              isActive
                ? "border-primary text-foreground bg-primary/10"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
            }`
          }
        >
          <span>{l.label}</span>
          {l.to === "/admin/approvals" && pendingApprovals > 0 && (
            <span className="ml-2 inline-flex items-center justify-center min-w-[22px] h-[22px] px-1.5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
              {pendingApprovals}
            </span>
          )}
        </NavLink>
      ))}
    </nav>
  );

  return (
    <main className="min-h-screen bg-background text-foreground flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-60 shrink-0 border-r border-border flex-col">
        <div className="p-6 border-b border-border">
          <div className="display-font text-2xl uppercase">FTFA</div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">Admin</div>
        </div>
        <NavList />
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
        {/* Mobile top bar with hamburger */}
        <header className="md:hidden border-b border-border px-4 py-3 flex items-center justify-between gap-3 sticky top-0 bg-background z-30">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                aria-label="Open menu"
                className="relative p-2 -ml-2 border border-border hover:border-foreground/40"
              >
                <Menu className="h-5 w-5" />
                {pendingApprovals > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold inline-flex items-center justify-center">
                    {pendingApprovals}
                  </span>
                )}
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-72 flex flex-col">
              <SheetHeader className="p-6 border-b border-border text-left">
                <SheetTitle className="display-font text-2xl uppercase tracking-wide">FTFA</SheetTitle>
                <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Admin</div>
              </SheetHeader>
              <NavList onNav={() => setMobileOpen(false)} />
              <div className="p-3 border-t border-border">
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    signOut();
                  }}
                  className="w-full text-xs uppercase tracking-widest border border-border px-3 py-2.5 hover:border-foreground/40"
                >
                  Sign out
                </button>
              </div>
            </SheetContent>
          </Sheet>

          <div className="display-font text-lg uppercase tracking-wide truncate">FTFA Admin</div>

          <div className="w-9" aria-hidden /> {/* spacer to balance hamburger */}
        </header>

        {pendingApprovals > 0 && (
          <Link
            to="/admin/approvals"
            className="block bg-primary/10 border-b border-primary/30 px-4 md:px-10 py-2.5 text-xs md:text-sm hover:bg-primary/15 transition-colors"
          >
            <span className="font-semibold">{pendingApprovals}</span>{" "}
            new parent signup{pendingApprovals === 1 ? "" : "s"} waiting for approval{" "}
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
