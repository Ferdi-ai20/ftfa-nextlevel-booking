import { motion } from "framer-motion";
import heroVideo from "@/assets/hero-training.mp4.asset.json";
import heroPoster from "@/assets/hero-training.jpg";

const Hero = () => {
  return (
    <section
      id="top"
      className="relative h-screen min-h-[640px] w-full overflow-hidden bg-black noise-overlay"
    >
      {/* Full-bleed video */}
      <div className="absolute inset-0">
        <video
          src={heroVideo.url}
          poster={heroPoster}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="w-full h-full object-cover grayscale contrast-125 brightness-90"
        />
        {/* Vignette for legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85" />
        <div className="absolute inset-0 bg-gradient-radial opacity-60" />
      </div>

      {/* Top status microtype */}
      <div className="absolute top-20 md:top-24 left-0 right-0 z-10 px-6 md:px-12">
        <div className="flex items-center justify-between font-mono text-[10px] tracking-[0.3em] uppercase text-white/50">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white ticker-pulse" />
            <span>Now Enrolling — 2025</span>
          </div>
          <div className="hidden md:block">EST. Netherlands · NED</div>
        </div>
      </div>

      {/* Centered hero headline */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          <h1 className="display-font text-[clamp(3.5rem,13vw,12rem)] uppercase leading-[0.82] text-white">
            Elite Training.
            <br />
            <span className="text-stroke">Real</span> Development.
          </h1>
          <p className="mt-8 max-w-xl mx-auto text-sm md:text-base text-white/70 leading-relaxed font-mono uppercase tracking-[0.15em]">
            Built for players chasing pro level.
            <br className="hidden md:block" />
            Football technique and game intelligence — nothing else.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.8 }}
            className="mt-12 flex flex-col sm:flex-row gap-3 justify-center"
          >
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
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom: scroll indicator + microtype rail */}
      <div className="absolute bottom-0 left-0 right-0 z-10 px-6 md:px-12 pb-6 md:pb-8">
        <a
          href="#about"
          aria-label="Scroll down"
          className="group flex flex-col items-center gap-3 mb-8 mx-auto w-fit cursor-pointer"
        >
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/40 to-white/60 group-hover:h-14 transition-all duration-500" />
          <svg
            className="w-3 h-3 text-white/50 group-hover:text-white animate-bounce"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 9l-7 7-7-7" />
          </svg>
        </a>

        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-2 font-mono text-[10px] tracking-[0.25em] uppercase text-white/40 border-t border-white/10 pt-5">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span>200+ Players</span>
            <span className="text-white/20">·</span>
            <span>12 to BVO</span>
            <span className="text-white/20">·</span>
            <span>10–23 Age</span>
            <span className="text-white/20">·</span>
            <span>1:1 Focus</span>
          </div>
          <div className="hidden md:block">[ Scroll ]</div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
