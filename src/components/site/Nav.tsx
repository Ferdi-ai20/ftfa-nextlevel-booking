import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

const navItems = [
  { href: "#top", label: "Home", n: "01" },
  { href: "#philosophy", label: "Philosophy", n: "02" },
  { href: "#framework", label: "Framework", n: "03" },
  { href: "#services", label: "Services", n: "04" },
  { href: "#players", label: "Players", n: "05" },
  { href: "#results-stats", label: "Results", n: "06" },
  { href: "#testimonials", label: "Testimonials", n: "07" },
  { href: "#apply", label: "Apply", n: "08" },
  { href: "#contact", label: "Contact", n: "09" },
];

const Nav = () => {
  const [open, setOpen] = useState(false);
  const { session, isAdmin } = useAuth();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
        className="fixed top-0 left-0 right-0 z-40 px-6 md:px-12 py-6 md:py-8 flex items-start justify-between pointer-events-none"
      >
        <a
          href="#top"
          className="pointer-events-auto group flex flex-col leading-none"
          aria-label="FTFA — Home"
        >
          <span className="display-font text-3xl md:text-4xl uppercase tracking-tighter text-white transition-opacity group-hover:opacity-70">
            FT
          </span>
          <span className="hidden md:block font-mono text-[9px] uppercase tracking-[0.3em] text-white/50 mt-1">
            Ferdi Tarhan Academy
          </span>
        </a>

        <button
          onClick={() => setOpen(true)}
          className="pointer-events-auto font-mono text-xs md:text-sm uppercase tracking-[0.25em] text-white hover:opacity-60 transition-opacity cursor-pointer"
          aria-label="Open menu"
        >
          [ Menu ]
        </button>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-black/98 backdrop-blur-sm flex flex-col"
          >
            {/* Overlay header */}
            <div className="px-6 md:px-12 py-6 md:py-8 flex items-start justify-between">
              <div className="flex flex-col leading-none">
                <span className="display-font text-3xl md:text-4xl uppercase tracking-tighter text-white">
                  FT
                </span>
                <span className="hidden md:block font-mono text-[9px] uppercase tracking-[0.3em] text-white/50 mt-1">
                  Ferdi Tarhan Academy
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="font-mono text-xs md:text-sm uppercase tracking-[0.25em] text-white hover:opacity-60 transition-opacity cursor-pointer"
                aria-label="Close menu"
              >
                [ Close ]
              </button>
            </div>

            {/* Menu links */}
            <nav className="flex-1 flex flex-col justify-center px-6 md:px-12 -mt-12">
              <ul className="space-y-2 md:space-y-4">
                {navItems.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.6,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.1 + i * 0.07,
                    }}
                  >
                    <a
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="group flex items-baseline gap-4 md:gap-8 py-2 border-b border-white/5 hover:border-white/30 transition-colors"
                    >
                      <span className="font-mono text-[10px] md:text-xs uppercase tracking-[0.3em] text-white/30 w-8">
                        {item.n}
                      </span>
                      <span className="display-font text-5xl md:text-8xl uppercase text-white group-hover:translate-x-2 transition-transform duration-500">
                        {item.label}
                      </span>
                    </a>
                  </motion.li>
                ))}
              </ul>
            </nav>

            {/* Overlay footer */}
            <div className="px-6 md:px-12 py-6 md:py-8 flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-t border-white/10">
              <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-white/40 space-y-1">
                <div>info@ftfaacademy.nl</div>
                <div>+31 6 21275348</div>
              </div>
              <div className="flex items-center gap-4 font-mono text-[10px] uppercase tracking-[0.3em]">
                {isAdmin && (
                  <a
                    href="/admin/approvals"
                    onClick={() => setOpen(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    [ Admin ]
                  </a>
                )}
                {session ? (
                  <a
                    href="/dashboard"
                    onClick={() => setOpen(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    [ My Slot ]
                  </a>
                ) : (
                  <a
                    href="/auth"
                    onClick={() => setOpen(false)}
                    className="text-white/60 hover:text-white transition-colors"
                  >
                    [ Sign in ]
                  </a>
                )}
                <a
                  href="#apply"
                  onClick={() => setOpen(false)}
                  className="bg-white text-black px-5 py-3 font-bold hover:bg-white/85 transition-colors"
                >
                  Apply Now →
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Nav;
