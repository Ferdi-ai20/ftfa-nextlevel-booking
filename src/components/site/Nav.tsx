import { motion } from "framer-motion";
import logoMark from "@/assets/coach-ferdi.jpg";

const Nav = () => {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/50"
    >
      <div className="container flex items-center justify-between h-16">
        <a href="#top" className="flex items-center gap-2">
          <span className="display-font text-2xl tracking-tight">FTFA</span>
          <span className="hidden sm:inline text-[10px] uppercase tracking-[0.2em] text-muted-foreground border-l border-border pl-2 ml-1">
            Ferdi Tarhan<br/>Football Academy
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8 text-sm uppercase tracking-wider">
          <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">About</a>
          <a href="#programs" className="text-muted-foreground hover:text-foreground transition-colors">Programs</a>
          <a href="#coach" className="text-muted-foreground hover:text-foreground transition-colors">Coach</a>
          <a href="#booking" className="text-muted-foreground hover:text-foreground transition-colors">Booking</a>
          <a href="#contact" className="text-muted-foreground hover:text-foreground transition-colors">Contact</a>
        </nav>
        <a
          href="#booking"
          className="hidden sm:inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 text-xs uppercase tracking-widest font-semibold hover:bg-primary/90 transition-colors"
        >
          Book Training
          <span aria-hidden>→</span>
        </a>
      </div>
    </motion.header>
  );
};

export default Nav;
