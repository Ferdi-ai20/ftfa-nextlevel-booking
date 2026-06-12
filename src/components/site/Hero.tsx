import { motion } from "framer-motion";
import heroImage from "@/assets/hero-training.jpg.asset.json";

const Hero = () => {
  return (
    <>
      {/* Full-bleed image — no text overlay */}
      <section
        id="top"
        className="relative h-screen min-h-[640px] w-full overflow-hidden bg-black"
      >
        <div className="absolute inset-0">
          <img
            src={heroImage.url}
            alt="Training"
            className="w-full h-full object-cover"
          />
          {/* subtle bottom vignette only */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />
        </div>

        {/* Scroll indicator */}
        <a
          href="#intro"
          aria-label="Scroll down"
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 group flex flex-col items-center gap-3 cursor-pointer"
        >
          <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/70">Scroll</span>
          <svg
            className="w-4 h-4 text-white/70 group-hover:text-white animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
          </svg>
        </a>
      </section>

      {/* Text section — appears after scrolling */}
      <section
        id="intro"
        className="relative w-full bg-black text-white py-24 md:py-32 px-6 md:px-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-5xl mx-auto text-center"
        >
          <h1 className="display-font text-[clamp(3rem,10vw,9rem)] uppercase leading-[0.85] text-white">
            Elite Training.
            <br />
            <span className="text-stroke">Real</span> Development.
          </h1>
          <p className="mt-8 max-w-xl mx-auto text-sm md:text-base text-white/70 leading-relaxed font-mono uppercase tracking-[0.15em]">
            Built for players chasing pro level.
            <br className="hidden md:block" />
            Football technique and game intelligence — nothing else.
          </p>

          <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="#apply"
              className="group inline-flex items-center justify-center gap-4 bg-white text-black px-8 py-4 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white/85 transition-all"
            >
              <span>Apply Now</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
            <a
              href="#booking"
              className="group inline-flex items-center justify-center gap-4 border border-white/30 text-white px-8 py-4 text-[11px] uppercase tracking-[0.3em] font-bold hover:bg-white hover:text-black transition-all"
            >
              <span>Book Training</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </a>
          </div>

          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-mono text-[10px] tracking-[0.25em] uppercase text-white/40 border-t border-white/10 pt-8">
            <span>200+ Players</span>
            <span className="text-white/20">·</span>
            <span>12 to BVO</span>
            <span className="text-white/20">·</span>
            <span>10–23 Age</span>
            <span className="text-white/20">·</span>
            <span>1:1 Focus</span>
          </div>
        </motion.div>
      </section>
    </>
  );
};

export default Hero;
