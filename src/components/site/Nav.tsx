import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X, LogIn, ShieldCheck } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "#about", label: "About" },
  { href: "#programs", label: "Programs" },
  { href: "#coach", label: "Coach" },
  { href: "#booking", label: "Waitlist" },
  { href: "/dashboard", label: "My Slot" },
  { href: "#contact", label: "Contact" },
];

const Nav = () => {
  const [open, setOpen] = useState(false);
  const { session, isAdmin } = useAuth();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50"
    >
      <div className="container flex items-center justify-between h-16">
        <a href="#top" className="flex items-center gap-2 min-w-0">
          <span className="display-font text-2xl tracking-tight">FTFA</span>
          <span className="hidden xl:inline text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-l border-border pl-2 ml-1 leading-tight">
            Ferdi Tarhan<br />Football Academy
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-wider">
          {navItems.map((i) => (
            <a key={i.href} href={i.href} className="text-muted-foreground hover:text-foreground transition-colors">
              {i.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <a
              href="/admin/approvals"
              className="hidden sm:inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-primary hover:text-foreground px-2 py-1.5 border border-primary/40 hover:border-primary"
            >
              <ShieldCheck className="h-3 w-3" />
              Approvals
            </a>
          )}
          {!session && (
            <a
              href="/auth"
              className="hidden sm:inline-flex items-center text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground px-3 py-2"
            >
              Sign in
            </a>
          )}
          <a
            href="#booking"
            className="hidden sm:inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 transition-colors"
          >
            Join Waitlist
            <span aria-hidden>→</span>
          </a>

          {/* Mobile sign-in icon button */}
          <a
            href="/auth"
            aria-label="Sign in"
            className="sm:hidden inline-flex items-center justify-center h-9 w-9 text-muted-foreground hover:text-foreground"
          >
            <LogIn className="h-5 w-5" />
          </a>
          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="md:hidden inline-flex items-center justify-center h-9 w-9 text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-background/90 backdrop-blur-md animate-fade-in"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-[72%] max-w-[280px] bg-card border-l border-border flex flex-col animate-slide-in-right shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="display-font text-xl">FTFA</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-muted/40 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
              {navItems.map((i, idx) => (
                <a
                  key={i.href}
                  href={i.href}
                  onClick={() => setOpen(false)}
                  style={{ animationDelay: `${idx * 40}ms`, animationFillMode: "both" }}
                  className="px-3 py-2.5 text-sm uppercase tracking-widest text-foreground hover:bg-muted/50 hover:translate-x-1 rounded-md transition-all duration-200 animate-fade-in"
                >
                  {i.label}
                </a>
              ))}
            </nav>
            <div className="p-3 border-t border-border space-y-2">
              {isAdmin && (
                <a
                  href="/admin/approvals"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center bg-primary/15 border border-primary/50 text-primary px-3 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-primary/25 transition-colors rounded-md"
                >
                  → Approvals
                </a>
              )}
              {!session && (
                <a
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="block w-full text-center bg-secondary text-secondary-foreground px-3 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-secondary/80 transition-colors rounded-md"
                >
                  Sign in
                </a>
              )}
              <a
                href="#booking"
                onClick={() => setOpen(false)}
                className="block w-full text-center bg-primary text-primary-foreground px-3 py-2.5 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 transition-colors rounded-md"
              >
                Join Waitlist →
              </a>
            </div>
          </div>
        </div>
      )}
    </motion.header>
  );
};

export default Nav;
