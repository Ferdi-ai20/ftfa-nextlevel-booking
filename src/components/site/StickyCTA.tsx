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
    <a
      href="#booking"
      aria-label="Book training"
      className={`fixed bottom-5 right-5 z-50 inline-flex items-center gap-3 bg-primary text-primary-foreground px-5 py-4 text-xs uppercase tracking-widest font-bold shadow-glow transition-all duration-500 md:hidden ${
        show ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0 pointer-events-none"
      }`}
    >
      <span className="w-2 h-2 rounded-full bg-primary-foreground ticker-pulse" />
      Book Training
    </a>
  );
};

export default StickyCTA;
