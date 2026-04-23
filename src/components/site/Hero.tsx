import { motion } from "framer-motion";
import heroImg from "@/assets/hero-training.jpg";

const Hero = () => {
  return (
    <section id="top" className="relative min-h-screen flex flex-col justify-end overflow-hidden noise-overlay">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Elite football player training intensely at night"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 bg-gradient-radial" />
      </div>

      {/* Top status bar */}
      <div className="absolute top-20 left-0 right-0 z-10">
        <div className="container flex items-center justify-between text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary ticker-pulse" />
            <span>Now Enrolling — 2025 Season</span>
          </div>
          <div className="hidden md:block">EST. Netherlands · NED</div>
        </div>
      </div>

      {/* Hero content */}
      <div className="relative z-10 container pb-16 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        >
          <div className="text-xs uppercase tracking-[0.3em] text-primary mb-6">
            / 01 — The Standard
          </div>
          <h1 className="display-font text-[clamp(3.5rem,12vw,11rem)] uppercase leading-[0.85]">
            Elite Training.
            <br />
            <span className="text-stroke">Real</span> Development.
          </h1>
          <p className="mt-8 max-w-xl text-base md:text-lg text-muted-foreground leading-relaxed">
            Built for players chasing pro level. Elite football technique and game intelligence — nothing else.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-3">
            <a
              href="#booking"
              className="group inline-flex items-center justify-between gap-6 bg-primary text-primary-foreground px-6 py-4 text-sm uppercase tracking-widest font-semibold hover:bg-primary/90 transition-all"
            >
              <span>Book Training</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#apply"
              className="group inline-flex items-center justify-between gap-6 border border-border bg-background/40 backdrop-blur px-6 py-4 text-sm uppercase tracking-widest font-semibold hover:border-foreground transition-all"
            >
              <span>Apply Now</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Stats strip */}
      <div className="relative z-10 border-t border-border/60 bg-background/60 backdrop-blur">
        <div className="container grid grid-cols-2 md:grid-cols-4 divide-x divide-border/60">
          {[
            { k: "200+", v: "Players Trained" },
            { k: "12", v: "Moved to BVO" },
            { k: "10–23", v: "Age Range" },
            { k: "1:1", v: "Premium Focus" },
          ].map((s) => (
            <div key={s.v} className="px-4 py-5 first:pl-0">
              <div className="display-font text-3xl md:text-4xl text-primary">{s.k}</div>
              <div className="text-[10px] md:text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
