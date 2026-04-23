import { useEffect, useState } from "react";

const StickyCTA = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-50 flex items-stretch gap-2 transition-all duration-500 md:hidden ${
        show ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      }`}
    >
      <a
        href="/auth"
        aria-label="Sign in"
        className="flex-1 inline-flex items-center justify-center bg-card border border-border text-foreground px-4 py-4 text-xs uppercase tracking-widest font-semibold shadow-elevated"
      >
        Sign in
      </a>
      <a
        href="#booking"
        aria-label="Join waitlist"
        className="flex-[1.4] inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-4 text-xs uppercase tracking-widest font-bold shadow-glow"
      >
        <span className="w-2 h-2 rounded-full bg-primary-foreground ticker-pulse" />
        Join Waitlist
      </a>
    </div>
  );
};

export default StickyCTA;
